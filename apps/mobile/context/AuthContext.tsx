import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// Helper to extract params from URL (hash or query)
function extractParamsFromUrl(url: string) {
    const params: Record<string, string> = {}
    // Handle has params first (typical for implicit flow)
    let queryString = url.split('#')[1]
    if (!queryString) {
        queryString = url.split('?')[1]
    }

    if (queryString) {
        queryString.split('&').forEach(param => {
            const parts = param.split('=')
            const key = parts[0]
            const value = parts.length > 1 ? decodeURIComponent(parts[1]) : ''
            params[key] = value
        })
    }
    return params;
}

export type UserRole = "participant" | "host" | "brand" | "merchant" | "admin";

type AuthContextType = {
    session: Session | null
    user: User | null
    roles: UserRole[]
    activeRole: UserRole | null
    setActiveRole: (role: UserRole) => void
    organizations: any[]
    activeOrgId: string | null
    setActiveOrgId: (id: string | null) => void
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    roles: [],
    activeRole: null,
    setActiveRole: () => { },
    organizations: [],
    activeOrgId: null,
    setActiveOrgId: () => { },
    signInWithGoogle: async () => { },
    signOut: async () => { },
    isLoading: true,
})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [roles, setRoles] = useState<UserRole[]>([])
    const [activeRole, setActiveRoleState] = useState<UserRole | null>(null)
    const [organizations, setOrganizations] = useState<any[]>([])
    const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null)
    const [agencyClients, setAgencyClients] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

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

    const fetchUserRoles = async (userId: string) => {
        const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching roles:", error);
            return [];
        }

        return data.map((r) => r.role as UserRole);
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

        const savedOrgId = await SecureStore.getItemAsync("promorang_active_org_id");
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

    const setActiveRole = async (role: UserRole) => {
        setActiveRoleState(role);
        await SecureStore.setItemAsync("promorang_active_role", role);
    };

    const setActiveOrgId = async (id: string | null) => {
        setActiveOrgIdState(id);
        if (id) {
            await SecureStore.setItemAsync("promorang_active_org_id", id);
            // If the new org is in our organizations list and is an agency, fetch clients
            const org = organizations.find(o => o.id === id);
            if (org?.type === 'agency') {
                fetchAgencyClients(id);
            } else if (!org) {
                // If not in standard orgs, it might be a client impersonation - clear clients list or keep as is?
                // For now, if switching to a client, we technically leave the agency context but might want to keep the "back" button logic or similar.
                // In this simple implementation, we just clear if it's not an agency.
                setAgencyClients([]);
            } else {
                setAgencyClients([]);
            }
        } else {
            await SecureStore.deleteItemAsync("promorang_active_org_id");
            setAgencyClients([]);
        }
    };

    useEffect(() => {
        AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                supabase.auth.startAutoRefresh()
            } else {
                supabase.auth.stopAutoRefresh()
            }
        })

        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const fetchedRoles = await fetchUserRoles(session.user.id);
                setRoles(fetchedRoles);
                await fetchUserOrganizations(session.user.id);

                const savedRole = await SecureStore.getItemAsync("promorang_active_role") as UserRole;
                if (savedRole && fetchedRoles.includes(savedRole)) {
                    setActiveRoleState(savedRole);
                } else if (fetchedRoles.length > 0) {
                    setActiveRoleState(fetchedRoles[0]);
                } else {
                    setActiveRoleState("participant");
                }
            }
            setIsLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                const fetchedRoles = await fetchUserRoles(session.user.id);
                setRoles(fetchedRoles);
                await fetchUserOrganizations(session.user.id);

                const savedRole = await SecureStore.getItemAsync("promorang_active_role") as UserRole;
                if (savedRole && fetchedRoles.includes(savedRole)) {
                    setActiveRoleState(savedRole);
                } else if (fetchedRoles.length > 0) {
                    setActiveRoleState(fetchedRoles[0]);
                }
            } else {
                setRoles([]);
                setOrganizations([]);
                setActiveRoleState(null);
                setActiveOrgIdState(null);
                setAgencyClients([]);
            }
            setIsLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = makeRedirectUri({
                scheme: 'mobile',
                path: 'auth/callback',
            })

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            if (error) throw error
            if (!data?.url) throw new Error('No auth URL returned from Supabase')

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)

            if (result.type === 'success' && result.url) {
                const params = extractParamsFromUrl(result.url)

                if (params.access_token && params.refresh_token) {
                    const { error } = await supabase.auth.setSession({
                        access_token: params.access_token,
                        refresh_token: params.refresh_token,
                    })
                    if (error) throw error
                }
            }
        } catch (e) {
            console.error('Google Sign-In Error:', e)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setRoles([])
        setOrganizations([])
        setAgencyClients([])
        setActiveRoleState(null)
        setActiveOrgIdState(null)
    }

    return (
        <AuthContext.Provider value={{
            session,
            user,
            roles,
            activeRole,
            setActiveRole,
            organizations,
            activeOrgId,
            setActiveOrgId,
            agencyClients,
            signInWithGoogle,
            signOut,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}
