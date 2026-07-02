import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearDemoSession, DemoRole, readDemoSession, writeDemoSession } from "@/lib/demo-session";

type UserRole = "participant" | "creator" | "host" | "brand" | "merchant" | "agency" | "promoter" | "marketing" | "admin";

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
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoSignIn: (role: UserRole, demoEmailRecipient?: string) => Promise<{ error: Error | null }>;
  organizations: any[];
  activeOrgId: string | null;
  setActiveOrgId: (id: string | null) => void;
  agencyClients: any[];
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
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [agencyClients, setAgencyClients] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // ROLE VERNACULAR MAPPER: Translates legacy DB roles to modern human-centric ones
  const mapRole = (role: string): UserRole => {
    if (!role) return 'participant';
    const r = role.toLowerCase().trim();
    if (r === 'creator') return 'creator';
    if (r === 'promoter' || r === 'street_activation_promoter') return 'promoter';
    if (r === 'marketing') return 'marketing';
    if (r === 'host') return 'host';
    if (r === 'agency') return 'agency';
    if (r === 'advertiser' || r === 'brand') return 'brand';
    if (r === 'merchant' || r === 'vendor') return 'merchant';
    if (r === 'admin' || r === 'administrator' || r === 'master_admin' || r === 'moderator') return 'admin';
    return 'participant';
  };

  const resolvePreferredRole = (availableRoles: UserRole[]) => {
    const demoRole = readDemoSession()?.role;
    const savedRole = localStorage.getItem("promorang_active_role");
    const preferredCandidates = [demoRole, savedRole]
      .map((role) => (role ? mapRole(role) : null))
      .filter((role): role is UserRole => !!role);

    for (const candidate of preferredCandidates) {
      if (availableRoles.includes(candidate)) {
        return candidate;
      }
    }

    return availableRoles[0] ?? null;
  };

  const isMasterAdminAccount = (sessionUser: User, userProfile?: any) => {
    const metadataRoles = [
      (sessionUser.app_metadata as any)?.role,
      (sessionUser.user_metadata as any)?.role,
      userProfile?.role,
      userProfile?.user_type,
    ]
      .map((role) => String(role || "").toLowerCase().trim());

    return metadataRoles.includes("master_admin") ||
      sessionUser.email?.trim().toLowerCase() === "andremillwood@gmail.com";
  };

  // Sync activeRole with storage-backed preference whenever the available role
  // set changes.
  useEffect(() => {
    if (roles.length > 0) {
      const preferredRole = resolvePreferredRole(roles);
      if (preferredRole && preferredRole !== activeRole) {
        setActiveRoleState(preferredRole);
      }
    }
  }, [roles, activeRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem("promorang_active_role", role);

    if (organizations.length > 0) {
      const currentOrg = organizations.find((org) => org.id === activeOrgId);
      const desiredType = roleToOrgType[role];
      if (desiredType && currentOrg?.type !== desiredType) {
        const matchingOrg = organizations.find((org) => org.type === desiredType);
        if (matchingOrg) {
          setActiveOrgIdState(matchingOrg.id);
          localStorage.setItem("promorang_active_org_id", matchingOrg.id);
          if (matchingOrg.type === "agency") {
            fetchAgencyClients(matchingOrg.id);
          } else {
            setAgencyClients([]);
          }
        }
      }
    }
  };

  const setActiveOrgId = (id: string | null) => {
    setActiveOrgIdState(id);
    if (id) {
      localStorage.setItem("promorang_active_org_id", id);
      const org = organizations.find(o => o.id === id);
      const roleForOrg = org?.type ? orgTypeToRole[org.type] : null;
      if (roleForOrg && roles.includes(roleForOrg) && roleForOrg !== activeRole) {
        setActiveRoleState(roleForOrg);
        localStorage.setItem("promorang_active_role", roleForOrg);
      }

      if (org?.type === 'agency') {
        fetchAgencyClients(id);
      } else {
        setAgencyClients([]);
      }
    } else {
      localStorage.removeItem("promorang_active_org_id");
      setAgencyClients([]);
    }
  };

  const fetchAgencyClients = async (agencyId: string) => {
    const { data, error } = await supabase
      .from('agency_clients')
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
      .eq('agency_id', agencyId)
      .eq('status', 'active');

    if (error) {
      console.error("Error fetching agency clients:", error);
      return [];
    }

    const clients = data.map((d: any) => ({
      ...d.organizations,
      relationship_type: d.relationship_type
    }));

    setAgencyClients(clients);
    return clients;
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

    const orgs = data.map((m: any) => ({
      ...m.organizations,
      user_role: m.role
    }));

    setOrganizations(orgs);

    const savedOrgId = localStorage.getItem("promorang_active_org_id");
    const savedOrg = savedOrgId ? orgs.find((org) => org.id === savedOrgId) : null;
    const effectiveRole = preferredRole || resolvePreferredRole(roles);
    const desiredOrgType = effectiveRole ? roleToOrgType[effectiveRole] : null;
    const matchingOrg = desiredOrgType
      ? orgs.find((org) => org.type === desiredOrgType)
      : null;

    const nextActiveOrg =
      (savedOrg && (!desiredOrgType || savedOrg.type === desiredOrgType) ? savedOrg : null) ||
      matchingOrg ||
      savedOrg ||
      orgs[0] ||
      null;

    if (nextActiveOrg) {
      setActiveOrgIdState(nextActiveOrg.id);
      localStorage.setItem("promorang_active_org_id", nextActiveOrg.id);
      if (nextActiveOrg.type === 'agency') {
        fetchAgencyClients(nextActiveOrg.id);
      } else {
        setAgencyClients([]);
      }
    } else {
      setActiveOrgIdState(null);
      localStorage.removeItem("promorang_active_org_id");
      setAgencyClients([]);
    }

    return orgs;
  };

  const refreshWorkspaceContext = async () => {
    if (!user) return;

    const preferredRole = activeRole || resolvePreferredRole(roles);
    const refreshedOrganizations = await fetchUserOrganizations(user.id, preferredRole);

    const effectiveOrgId = localStorage.getItem("promorang_active_org_id") || activeOrgId;
    const currentOrg = refreshedOrganizations.find((org) => org.id === effectiveOrgId);
    if (currentOrg?.type === "agency" && effectiveOrgId) {
      await fetchAgencyClients(effectiveOrgId);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // 1. Fetch from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // 2. Fetch from users table (for maturity_state)
      // Note: We use any here because users table might not be in the generated types
      const { data: userData, error: userError } = await (supabase as any)
        .from("users")
        .select("maturity_state, last_used_surface, verified_actions_count, role, user_type")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) console.error("Error fetching profile:", profileError);
      if (userError) console.error("Error fetching user maturity:", userError);

      const mergedProfile = {
        ...(profileData || {}),
        ...(userData || {}),
        // Fallback for full_name if missing from profile but in user_metadata
        full_name: profileData?.full_name || (user?.user_metadata as any)?.full_name,
      };

      setProfile(mergedProfile);
      return mergedProfile;
    } catch (err) {
      console.error("fetchUserProfile failed:", err);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string, sessionUser?: User | null): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.warn(`[AuthContext] Get user roles failed:`, error.message);
      }

      const inferredRole = mapRole(
        (sessionUser?.user_metadata as any)?.role ||
        (sessionUser?.user_metadata as any)?.user_type ||
        (sessionUser?.app_metadata as any)?.role ||
        ""
      );

      const rawRoles = (data || [])
        .map((r: any) => String(r.role || "").toLowerCase().trim())
        .filter(Boolean);

      if (
        rawRoles.includes("master_admin") ||
        (sessionUser?.app_metadata as any)?.role === "master_admin" ||
        (sessionUser?.user_metadata as any)?.role === "master_admin" ||
        sessionUser?.email?.trim().toLowerCase() === "andremillwood@gmail.com"
      ) {
        return MASTER_ADMIN_WORKSPACE_ROLES;
      }

      // Map roles and filter out duplicates
      const mappedRoles = rawRoles.map((role) => mapRole(role));
      const uniqueRoles = Array.from(new Set(mappedRoles));

      if (inferredRole && !uniqueRoles.includes(inferredRole)) {
        uniqueRoles.push(inferredRole);
      }

      // CORE RULE: Every user is at least a participant.
      if (!uniqueRoles.includes('participant')) {
        uniqueRoles.push('participant');
      }
      
      return uniqueRoles;
    } catch (e) {
      console.error(`[AuthContext] Exception in fetchUserRoles:`, e);
      return ['participant'];
    }
  };

  // The auth listener should be registered once; the inner sync function reads
  // the current session user and explicitly reconciles role + org state.
  useEffect(() => {
    const syncSessionContext = async (sessionUser: User) => {
      const [fetchedRoles, fetchedProfile] = await Promise.all([
        fetchUserRoles(sessionUser.id, sessionUser),
        fetchUserProfile(sessionUser.id),
      ]);

      setRoles(fetchedRoles);
      // A stale role preference must never make a platform owner land in an
      // ordinary user workspace after signing in. They can still switch roles
      // explicitly once the admin workspace has loaded.
      const masterAdmin = isMasterAdminAccount(sessionUser, fetchedProfile);
      const preferredRole = masterAdmin && fetchedRoles.includes("admin")
        ? "admin"
        : resolvePreferredRole(fetchedRoles);
      if (preferredRole) {
        setActiveRoleState(preferredRole);
        localStorage.setItem("promorang_active_role", preferredRole);
      }
      await fetchUserOrganizations(sessionUser.id, preferredRole);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer role fetching with setTimeout
        if (session?.user) {
          setTimeout(() => {
            syncSessionContext(session.user).catch((error) => {
              console.error("[AuthContext] Failed to sync session context:", error);
            });
          }, 0);
        } else {
          setRoles([]);
          setOrganizations([]);
          setActiveOrgIdState(null);
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        syncSessionContext(session.user).then(() => {
          setLoading(false);
        }).catch((error) => {
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error };
    }

    // Add role after signup
    if (data.user) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role: role as any });

      if (roleError) {
        console.error("Error adding role:", roleError);
      }

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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
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
        body: JSON.stringify({
          demo_email: normalizedDemoRecipient,
        }),
      });

      const prepPayload = await prepResponse.json().catch(() => null);
      if (!prepResponse.ok) {
        throw new Error(prepPayload?.details || prepPayload?.error || "Failed to prepare demo account");
      }

      const targetEmail = prepPayload?.email;
      const targetPassword = prepPayload?.password;
      if (!targetEmail || !targetPassword) {
        throw new Error("Demo account response was missing credentials");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });

      if (signInError) throw signInError;

      // Store the visitor email used for demo email simulations.
      if (normalizedDemoRecipient) {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user?.id) {
          const { error: updateError } = await supabase
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

      // Success
      if (normalizedDemoRecipient) {
        writeDemoSession({
          role: role as DemoRole,
          recipientEmail: normalizedDemoRecipient,
          startedAt: new Date().toISOString(),
          source: "auth-demo",
        });
      }
      localStorage.setItem("promorang_active_role", role);
      setActiveRole(role);
      return { error: null };
    } catch (err: any) {
      console.error("[AuthContext] Direct Demo login failed:", err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    clearDemoSession();
    const redirectUrl = `${window.location.origin}/auth/callback`;

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
        signOut,
        demoSignIn,
        organizations,
        activeOrgId,
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
