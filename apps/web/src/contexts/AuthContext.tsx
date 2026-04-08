import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "participant" | "host" | "brand" | "merchant" | "admin";

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
  demoSignIn: (role: UserRole) => Promise<{ error: Error | null }>;
  organizations: any[];
  activeOrgId: string | null;
  setActiveOrgId: (id: string | null) => void;
  agencyClients: any[];
  profile: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const r = role.toLowerCase();
    if (r === 'creator') return 'host';
    if (r === 'advertiser') return 'brand';
    // Fallback to participant for any unknown role to prevent crashes
    return (['participant', 'host', 'brand', 'merchant', 'admin'].includes(r) ? r : 'participant') as UserRole;
  };

  // Sync activeRole with localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("promorang_active_role") as UserRole;
    const mappedSavedRole = savedRole ? mapRole(savedRole) : null;
    
    if (mappedSavedRole && roles.includes(mappedSavedRole)) {
      setActiveRoleState(mappedSavedRole);
    } else if (roles.length > 0 && !activeRole) {
      setActiveRoleState(roles[0]);
    }
  }, [roles]);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem("promorang_active_role", role);
  };

  const setActiveOrgId = (id: string | null) => {
    setActiveOrgIdState(id);
    if (id) {
      localStorage.setItem("promorang_active_org_id", id);
      // If the new org is an agency, fetch its clients
      const org = organizations.find(o => o.id === id);
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

  const fetchUserOrganizations = async (userId: string) => {
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

    // Set initial active org from localStorage or first in list
    const savedOrgId = localStorage.getItem("promorang_active_org_id");
    if (savedOrgId && orgs.find(o => o.id === savedOrgId)) {
      setActiveOrgIdState(savedOrgId);
      const activeOrg = orgs.find(o => o.id === savedOrgId);
      if (activeOrg?.type === 'agency') {
        fetchAgencyClients(savedOrgId);
      }
    } else if (orgs.length > 0) {
      setActiveOrgIdState(orgs[0].id);
      if (orgs[0].type === 'agency') {
        fetchAgencyClients(orgs[0].id);
      }
    }

    return orgs;
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
        .select("maturity_state, last_used_surface, verified_actions_count")
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

  const userHasRole = async (userId: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: role });
      if (error) {
        console.warn(`[AuthContext] Role check failed for ${role}:`, error.message);
        return false;
      }
      return !!data;
    } catch (e) {
      console.error(`[AuthContext] Exception in has_role ${role}:`, e);
      return false;
    }
  };

  const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.warn(`[AuthContext] Get user roles failed:`, error.message);
      }

      const fetchedRoles = (data || []).map((r: any) => mapRole(r.role));

      // CORE RULE: Every user is at least a participant.
      // If the DB has no roles, default to participant.
      if (fetchedRoles.length === 0) {
        console.info('[AuthContext] No roles found in DB, defaulting to participant');
        return ['participant'];
      }
      return fetchedRoles;
    } catch (e) {
      console.error(`[AuthContext] Exception in fetchUserRoles:`, e);
      return ['participant'];
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer role fetching with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id).then(fetchedRoles => {
              setRoles(fetchedRoles);
              // Auto-set activeRole if not already set
              if (!activeRole && fetchedRoles.length > 0) {
                setActiveRoleState(fetchedRoles[0]);
              }
            });
            fetchUserOrganizations(session.user.id);
            fetchUserProfile(session.user.id);
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
        Promise.all([
          fetchUserRoles(session.user.id),
          fetchUserOrganizations(session.user.id),
          fetchUserProfile(session.user.id)
        ]).then(([fetchedRoles]) => {
          setRoles(fetchedRoles);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
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
        .insert({ user_id: data.user.id, role });

      if (roleError) {
        console.error("Error adding role:", roleError);
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const demoSignIn = async (role: UserRole) => {
    try {
      // Direct Auth v1.1.0-Stabilized (Cache-Busting Stamp)
      setLoading(true);
      
      // 1. Direct Role-to-Email Mapping (Synchronized with DEMO_SEED.sql)
      const roleMap: Record<string, string> = {
        'participant': 'demo.participant@promorang.co',
        'host': 'demo.host@promorang.co',
        'brand': 'demo.brand@promorang.co',
        'merchant': 'demo.merchant@promorang.co'
      };

      const targetEmail = roleMap[role];
      if (!targetEmail) throw new Error(`Unsupported demo role: ${role}`);

      // 2. Direct Sign-In (Bypasses backend bridge and CORS)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: 'Promorang2025!',
      });

      if (signInError) throw signInError;

      // 3. Success
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
    // Determine the redirect URL based on environment
    // For production, we use the backend bridge to ensure 'api.promorang.co' branding at Google
    const isProduction = window.location.hostname === 'promorang.co' || window.location.hostname === 'www.promorang.co';
    const redirectUrl = isProduction
      ? 'https://api.promorang.co/auth/callback'
      : `${window.location.origin}/auth/callback`;

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
