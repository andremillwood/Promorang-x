import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { isPlaceholderDisplayName, readIntendedStakeholderRole, rememberIntendedStakeholder } from "@promorang/shared";
import { supabase } from "@/integrations/supabase/client";
import { clearDemoSession, DemoRole, readDemoSession, writeDemoSession } from "@/lib/demo-session";
import { getGrowthSignupMetadata } from "@/lib/marketing-attribution";
import { ensureAccountProfile, fetchProfileRow, identityFromAuthUser, mergeAccountProfile } from "@/lib/account-profile";
import {
  isConsumerPostAuthNext,
  isFullOperatorIdentity,
  mapWorkspaceRole,
  resolvePreferredWorkspaceRole,
  type WorkspaceRole,
} from "@/lib/auth-roles";

type UserRole = WorkspaceRole;

type Organization = {
  id: string;
  name: string;
  slug?: string | null;
  type?: string | null;
  avatar_url?: string | null;
  user_role?: string;
};

type AgencyClient = Organization & {
  relationship_type?: string;
  managing_agency_id: string;
};

const ACTIVE_ROLE_KEY = "promorang_active_role";
const ACTIVE_ORG_KEY = "promorang_active_org_id";
const MANAGING_AGENCY_KEY = "promorang_managing_agency_org_id";

const MASTER_ADMIN_WORKSPACE_ROLES: UserRole[] = [
  "admin",
  "host",
  "brand",
  "merchant",
  "agency",
  "creator",
  "promoter",
  "marketing",
  "participant",
];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: UserRole[];
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (intent?: { role?: string | null; next?: string | null }) => Promise<{ error: Error | null }>;
  applyIntendedRole: (userId: string, role?: string | null) => Promise<UserRole | null>;
  signOut: () => Promise<void>;
  demoSignIn: (role: UserRole, demoEmailRecipient?: string) => Promise<{ error: Error | null }>;
  organizations: Organization[];
  activeOrgId: string | null;
  managingAgencyOrgId: string | null;
  setActiveOrgId: (id: string | null) => void;
  agencyClients: AgencyClient[];
  profile: any | null;
  refreshWorkspaceContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleToOrgType: Partial<Record<UserRole, string>> = {
  brand: "brand",
  merchant: "merchant",
  agency: "agency",
};

const orgTypeToRole: Partial<Record<string, UserRole>> = {
  brand: "brand",
  merchant: "merchant",
  agency: "agency",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [agencyClients, setAgencyClients] = useState<AgencyClient[]>([]);
  const [managingAgencyOrgId, setManagingAgencyOrgId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const mapRole = (role: string): UserRole => mapWorkspaceRole(role);

  const resolvePreferredRole = (availableRoles: UserRole[]) => {
    const intendedRole = readIntendedStakeholderRole(typeof sessionStorage === "undefined" ? null : sessionStorage);
    if (intendedRole && intendedRole !== "admin" && availableRoles.includes(intendedRole as UserRole)) {
      return intendedRole as UserRole;
    }
    return resolvePreferredWorkspaceRole(availableRoles, {
      demoRole: readDemoSession()?.role,
      savedRole: localStorage.getItem(ACTIVE_ROLE_KEY),
    });
  };

  const loadAgencyClients = async (agencyId: string): Promise<AgencyClient[]> => {
    const { data, error } = await supabase
      .from("agency_clients")
      .select(`
        client_id,
        relationship_type,
        organizations:client_id (
          id,
          name,
          slug,
          type,
          avatar_url
        )
      `)
      .eq("agency_id", agencyId)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching agency clients:", error);
      return [];
    }

    return (data || []).map((d: any) => ({
      ...d.organizations,
      relationship_type: d.relationship_type,
      managing_agency_id: agencyId,
    }));
  };

  const fetchAgencyClients = async (agencyId: string) => {
    const clients = await loadAgencyClients(agencyId);
    setAgencyClients(clients);
    setManagingAgencyOrgId(agencyId);
    localStorage.setItem(MANAGING_AGENCY_KEY, agencyId);
    return clients;
  };

  const activateDirectOrg = (org: Organization, syncRole = true) => {
    setActiveOrgIdState(org.id);
    localStorage.setItem(ACTIVE_ORG_KEY, org.id);

    const roleForOrg = org.type ? orgTypeToRole[org.type] : null;
    if (syncRole && roleForOrg) {
      setActiveRoleState(roleForOrg);
      localStorage.setItem(ACTIVE_ROLE_KEY, roleForOrg);
    }

    if (org.type === "agency") {
      void fetchAgencyClients(org.id);
    } else {
      setAgencyClients([]);
      setManagingAgencyOrgId(null);
      localStorage.removeItem(MANAGING_AGENCY_KEY);
    }
  };

  const activateManagedClient = (client: AgencyClient) => {
    setActiveOrgIdState(client.id);
    localStorage.setItem(ACTIVE_ORG_KEY, client.id);
    setManagingAgencyOrgId(client.managing_agency_id);
    localStorage.setItem(MANAGING_AGENCY_KEY, client.managing_agency_id);

    const roleForOrg = client.type ? orgTypeToRole[client.type] : null;
    if (roleForOrg === "brand" || roleForOrg === "merchant") {
      setActiveRoleState(roleForOrg);
      localStorage.setItem(ACTIVE_ROLE_KEY, roleForOrg);
    }
  };

  useEffect(() => {
    if (roles.length === 0) return;

    const activeManagedClient = agencyClients.find((client) => client.id === activeOrgId);
    const managedRole = activeManagedClient?.type ? orgTypeToRole[activeManagedClient.type] : null;
    if (activeManagedClient && managedRole === activeRole) return;

    const preferredRole = resolvePreferredRole(roles);
    if (preferredRole && preferredRole !== activeRole) {
      setActiveRoleState(preferredRole);
    }
  }, [roles, activeRole, activeOrgId, agencyClients]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem(ACTIVE_ROLE_KEY, role);

    const activeManagedClient = agencyClients.find((client) => client.id === activeOrgId);
    const currentDirectOrg = organizations.find((org) => org.id === activeOrgId);

    if (role === "agency") {
      const recordedAgency = managingAgencyOrgId
        ? organizations.find((org) => org.id === managingAgencyOrgId && org.type === "agency")
        : null;
      const agencies = organizations.filter((org) => org.type === "agency");
      const agency = recordedAgency || (agencies.length === 1 ? agencies[0] : null);
      if (agency) activateDirectOrg(agency, true);
      return;
    }

    if ((role === "brand" || role === "merchant") && activeManagedClient?.type === role) return;
    if (currentDirectOrg?.type === role) return;

    const desiredType = roleToOrgType[role];
    if (desiredType) {
      const matchingOrg = organizations.find((org) => org.type === desiredType);
      if (matchingOrg) activateDirectOrg(matchingOrg, true);
    }
  };

  const setActiveOrgId = (id: string | null) => {
    if (!id) {
      setActiveOrgIdState(null);
      localStorage.removeItem(ACTIVE_ORG_KEY);
      setAgencyClients([]);
      setManagingAgencyOrgId(null);
      localStorage.removeItem(MANAGING_AGENCY_KEY);
      return;
    }

    const directOrg = organizations.find((org) => org.id === id);
    if (directOrg) {
      activateDirectOrg(directOrg, true);
      return;
    }

    const managedClient = agencyClients.find((client) => client.id === id);
    if (managedClient) {
      activateManagedClient(managedClient);
      return;
    }

    const recordedAgency = managingAgencyOrgId
      ? organizations.find((org) => org.id === managingAgencyOrgId && org.type === "agency")
      : null;
    if (recordedAgency) {
      activateDirectOrg(recordedAgency, true);
    } else {
      setActiveOrgIdState(null);
      localStorage.removeItem(ACTIVE_ORG_KEY);
    }
  };

  const fetchUserOrganizations = async (userId: string, preferredRole?: UserRole | null) => {
    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          slug,
          type,
          avatar_url
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }

    const orgs: Organization[] = (data || []).map((m: any) => ({
      ...m.organizations,
      user_role: m.role,
    }));
    setOrganizations(orgs);

    const savedOrgId = localStorage.getItem(ACTIVE_ORG_KEY);
    const savedManagingAgencyId = localStorage.getItem(MANAGING_AGENCY_KEY);
    const directSavedOrg = savedOrgId ? orgs.find((org) => org.id === savedOrgId) : null;
    const agencyOrgs = orgs.filter((org) => org.type === "agency");
    const effectiveRole = preferredRole || resolvePreferredRole(roles);
    const desiredOrgType = effectiveRole ? roleToOrgType[effectiveRole] : null;

    if (directSavedOrg) {
      if (desiredOrgType && directSavedOrg.type !== desiredOrgType) {
        const matchingDirect = orgs.find((org) => org.type === desiredOrgType);
        if (matchingDirect) activateDirectOrg(matchingDirect, true);
        else activateDirectOrg(directSavedOrg, false);
      } else {
        activateDirectOrg(directSavedOrg, Boolean(desiredOrgType));
      }
      return orgs;
    }

    if (savedOrgId) {
      const preferredAgency = savedManagingAgencyId
        ? agencyOrgs.find((org) => org.id === savedManagingAgencyId)
        : null;

      if (preferredAgency) {
        const clients = await loadAgencyClients(preferredAgency.id);
        const savedClient = clients.find((client) => client.id === savedOrgId);
        if (savedClient) {
          setAgencyClients(clients);
          activateManagedClient(savedClient);
          return orgs;
        }

        setAgencyClients(clients);
        activateDirectOrg(preferredAgency, true);
        return orgs;
      }

      const matches: Array<{ agency: Organization; clients: AgencyClient[]; client: AgencyClient }> = [];
      for (const agency of agencyOrgs) {
        const clients = await loadAgencyClients(agency.id);
        const client = clients.find((candidate) => candidate.id === savedOrgId);
        if (client) matches.push({ agency, clients, client });
      }

      if (matches.length === 1) {
        setAgencyClients(matches[0].clients);
        activateManagedClient(matches[0].client);
        return orgs;
      }

      if (agencyOrgs.length > 0) {
        if (agencyOrgs.length === 1) {
          activateDirectOrg(agencyOrgs[0], true);
        } else {
          setActiveRoleState("agency");
          localStorage.setItem(ACTIVE_ROLE_KEY, "agency");
          setActiveOrgIdState(null);
          localStorage.removeItem(ACTIVE_ORG_KEY);
          setAgencyClients([]);
          setManagingAgencyOrgId(null);
          localStorage.removeItem(MANAGING_AGENCY_KEY);
        }
        return orgs;
      }
    }

    if (desiredOrgType === "agency") {
      if (agencyOrgs.length === 1) {
        activateDirectOrg(agencyOrgs[0], true);
      } else if (agencyOrgs.length > 1) {
        setActiveRoleState("agency");
        localStorage.setItem(ACTIVE_ROLE_KEY, "agency");
        setActiveOrgIdState(null);
        localStorage.removeItem(ACTIVE_ORG_KEY);
        setAgencyClients([]);
      }
      return orgs;
    }

    const matchingOrg = desiredOrgType
      ? orgs.find((org) => org.type === desiredOrgType)
      : null;
    const nextActiveOrg = matchingOrg || orgs[0] || null;

    if (nextActiveOrg) {
      activateDirectOrg(nextActiveOrg, Boolean(desiredOrgType));
    } else {
      setActiveOrgIdState(null);
      localStorage.removeItem(ACTIVE_ORG_KEY);
      setAgencyClients([]);
      setManagingAgencyOrgId(null);
      localStorage.removeItem(MANAGING_AGENCY_KEY);
    }

    return orgs;
  };

  const refreshWorkspaceContext = async () => {
    if (!user) return;
    const preferredRole = activeRole || resolvePreferredRole(roles);
    await fetchUserOrganizations(user.id, preferredRole);
  };

  const fetchUserProfile = async (sessionUser: User) => {
    try {
      const [{ data: profileData, error: profileError }, userResult] = await Promise.all([
        fetchProfileRow(supabase, sessionUser.id),
        (supabase as any)
          .from("users")
          .select("maturity_state, last_used_surface, verified_actions_count, role, user_type, display_name, username, avatar_url")
          .eq("id", sessionUser.id)
          .maybeSingle(),
      ]);
      let userData = userResult.data;
      let userError = userResult.error;
      if (userError) {
        const fallback = await (supabase as any)
          .from("users")
          .select("maturity_state, last_used_surface, verified_actions_count, role, user_type")
          .eq("id", sessionUser.id)
          .maybeSingle();
        userData = fallback.data;
        userError = fallback.error;
      }

      if (profileError) console.error("Error fetching profile:", profileError);
      if (userError) console.error("Error fetching user maturity:", userError);

      let row = profileData;
      if (!row || (isPlaceholderDisplayName(row.full_name) && isPlaceholderDisplayName(row.display_name))) {
        const ensured = await ensureAccountProfile(supabase, sessionUser.id, identityFromAuthUser(sessionUser));
        if (ensured) row = ensured;
      }

      const mergedProfile = mergeAccountProfile({
        profile: row,
        userRow: userData,
        authUser: sessionUser,
      });

      setProfile(mergedProfile);
      return mergedProfile;
    } catch (err) {
      console.error("fetchUserProfile failed:", err);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string, sessionUser?: User | null): Promise<UserRole[]> => {
    try {
      const [{ data, error }, { count: hostedMomentCount, error: hostedMomentError }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("moments").select("id", { count: "exact", head: true }).eq("host_id", userId),
      ]);

      if (error) console.warn("[AuthContext] Get user roles failed:", error.message);
      if (hostedMomentError) console.warn("[AuthContext] Host role inference failed:", hostedMomentError.message);

      const inferredRole = mapRole(
        (sessionUser?.user_metadata as any)?.role ||
        (sessionUser?.user_metadata as any)?.user_type ||
        (sessionUser?.app_metadata as any)?.role ||
        "",
      );

      const rawRoles = (data || [])
        .map((r: any) => String(r.role || "").toLowerCase().trim())
        .filter(Boolean);

      if (
        isFullOperatorIdentity({
          rawRoles,
          metadataRole: String((sessionUser?.app_metadata as any)?.role || (sessionUser?.user_metadata as any)?.role || ""),
          email: sessionUser?.email,
        })
      ) {
        return MASTER_ADMIN_WORKSPACE_ROLES;
      }

      const uniqueRoles = Array.from(new Set(rawRoles.map((role) => mapRole(role))));
      if (inferredRole && !uniqueRoles.includes(inferredRole)) uniqueRoles.push(inferredRole);
      if ((hostedMomentCount || 0) > 0 && !uniqueRoles.includes("host")) uniqueRoles.push("host");
      if (!uniqueRoles.includes("participant")) uniqueRoles.push("participant");

      const intendedRole = readIntendedStakeholderRole(typeof sessionStorage === "undefined" ? null : sessionStorage);
      if (intendedRole && intendedRole !== "admin" && !uniqueRoles.includes(intendedRole as UserRole)) {
        uniqueRoles.push(intendedRole as UserRole);
      }

      return uniqueRoles;
    } catch (e) {
      console.error("[AuthContext] Exception in fetchUserRoles:", e);
      return ["participant"];
    }
  };

  useEffect(() => {
    const syncSessionContext = async (sessionUser: User, event?: string) => {
      const [fetchedRoles] = await Promise.all([
        fetchUserRoles(sessionUser.id, sessionUser),
        fetchUserProfile(sessionUser),
      ]);

      setRoles(fetchedRoles);
      const consumerNext = isConsumerPostAuthNext(
        sessionStorage.getItem("promorang_post_auth_next") || localStorage.getItem("promorang_post_auth_next"),
      );
      const preferredRole =
        event === "SIGNED_IN" && fetchedRoles.includes("admin") && !consumerNext
          ? "admin"
          : resolvePreferredRole(fetchedRoles);

      if (preferredRole) {
        setActiveRoleState(preferredRole);
        localStorage.setItem(ACTIVE_ROLE_KEY, preferredRole);
      }
      await fetchUserOrganizations(sessionUser.id, preferredRole);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setTimeout(() => {
          syncSessionContext(nextSession.user, event).catch((error) => {
            console.error("[AuthContext] Failed to sync session context:", error);
          });
        }, 0);
      } else {
        setRoles([]);
        setOrganizations([]);
        setActiveOrgIdState(null);
        setAgencyClients([]);
        setManagingAgencyOrgId(null);
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        syncSessionContext(existingSession.user)
          .then(() => setLoading(false))
          .catch((error) => {
            console.error("[AuthContext] Failed to hydrate session context:", error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    clearDemoSession();
    const redirectUrl = `${window.location.origin}/`;
    const growth = getGrowthSignupMetadata();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role,
          user_type: role,
          referral_code: growth.referral_code,
          anonymous_id: growth.anonymous_id,
          acquisition: growth.first_touch,
        },
      },
    });

    if (error) return { error };

    if (data.user) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role: role as any });
      if (roleError) console.error("Error adding role:", roleError);

      localStorage.setItem(ACTIVE_ROLE_KEY, role);
      setActiveRoleState(role);

      fetch(`${import.meta.env.VITE_API_URL || "https://api.promorang.co"}/api/email/welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user.id,
          email,
          name: fullName,
          user_type: role,
        }),
      }).catch((welcomeError) => {
        console.warn("[AuthContext] Failed to trigger welcome email:", welcomeError);
      });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    clearDemoSession();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setOrganizations([]);
    setAgencyClients([]);
    setManagingAgencyOrgId(null);
    setActiveRoleState(null);
    setActiveOrgIdState(null);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
    localStorage.removeItem(ACTIVE_ORG_KEY);
    localStorage.removeItem(MANAGING_AGENCY_KEY);
    clearDemoSession();
  };

  const demoSignIn = async (role: UserRole, demoEmailRecipient?: string) => {
    try {
      setLoading(true);
      const normalizedDemoRecipient = demoEmailRecipient?.trim().toLowerCase();
      const apiBaseUrl = import.meta.env.VITE_API_URL || "https://api.promorang.co/api";
      const prepResponse = await fetch(`${apiBaseUrl}/auth/demo/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo_email: normalizedDemoRecipient }),
      });

      const prepPayload = await prepResponse.json().catch(() => null);
      if (!prepResponse.ok) {
        throw new Error(prepPayload?.details || prepPayload?.error || "Failed to prepare demo account");
      }

      const targetEmail = prepPayload?.email;
      const targetPassword = prepPayload?.password;
      if (!targetEmail || !targetPassword) throw new Error("Demo account response was missing credentials");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });
      if (signInError) throw signInError;

      if (normalizedDemoRecipient) {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user?.id) {
          const { error: updateError } = await (supabase as any)
            .from("users")
            .update({ demo_email_recipient: normalizedDemoRecipient })
            .eq("id", authUser.user.id);
          if (updateError) {
            console.warn("[AuthContext] Failed to store demo email recipient:", updateError.message);
          }
        }
        localStorage.setItem("promorang_demo_email_recipient", normalizedDemoRecipient);
      } else {
        localStorage.removeItem("promorang_demo_email_recipient");
      }

      if (normalizedDemoRecipient) {
        writeDemoSession({
          role: role as DemoRole,
          recipientEmail: normalizedDemoRecipient,
          startedAt: new Date().toISOString(),
          source: "auth-demo",
        });
      }
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
      setActiveRole(role);
      return { error: null };
    } catch (err: any) {
      console.error("[AuthContext] Direct Demo login failed:", err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const applyIntendedRole = async (userId: string, role?: string | null) => {
    const intended = (role || readIntendedStakeholderRole(typeof sessionStorage === "undefined" ? null : sessionStorage)) as UserRole | null;
    if (!intended || intended === "admin") return null;

    setRoles((current) => (current.includes(intended) ? current : [...current, intended]));
    setActiveRole(intended);

    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: intended as any });
    if (error && !/duplicate|unique/i.test(error.message)) {
      console.warn("[AuthContext] Could not register intended role:", error.message);
    }

    return intended;
  };

  const signInWithGoogle = async (intent?: { role?: string | null; next?: string | null }) => {
    clearDemoSession();
    rememberIntendedStakeholder(typeof sessionStorage === "undefined" ? null : sessionStorage, intent || {});
    const params = new URLSearchParams();
    if (intent?.role) params.set("role", intent.role);
    if (intent?.next?.startsWith("/") && !intent.next.startsWith("//")) params.set("next", intent.next);
    const qs = params.toString();
    const redirectUrl = `${window.location.origin}/auth/callback${qs ? `?${qs}` : ""}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        activeRole,
        setActiveRole,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        applyIntendedRole,
        signOut,
        demoSignIn,
        organizations,
        activeOrgId,
        managingAgencyOrgId,
        setActiveOrgId,
        agencyClients,
        profile,
        refreshWorkspaceContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
