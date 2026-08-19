import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import { Platform } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

const ALLOW_DEMO_LOGIN = __DEV__ || process.env.EXPO_PUBLIC_ENABLE_DEMO_LOGIN === 'true'

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

export type UserRole = "participant" | "creator" | "host" | "brand" | "merchant" | "agency" | "admin";

export const ALL_WORKSPACE_ROLES: UserRole[] = ["participant", "creator", "host", "brand", "merchant", "agency", "admin"];

type AuthContextType = {
    session: Session | null
    user: User | null
    roles: UserRole[]
    activeRole: UserRole | null
    setActiveRole: (role: UserRole) => void
    chooseRole: (role: UserRole) => Promise<{ error: Error | null }>
    organizations: any[]
    agencyClients: Array<{
        id: string
        name: string
        type: string
        relationship_type?: string
    }>
    activeOrgId: string | null
    setActiveOrgId: (id: string | null) => void
    signInWithGoogle: () => Promise<void>
    signInWithApple: () => Promise<{ error: Error | null }>
    demoSignIn: (role: UserRole) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    roles: [],
    activeRole: null,
    setActiveRole: () => { },
    chooseRole: async () => ({ error: null }),
    organizations: [],
    agencyClients: [],
    activeOrgId: null,
    setActiveOrgId: () => { },
    signInWithGoogle: async () => { },
    signInWithApple: async () => ({ error: null }),
    demoSignIn: async () => ({ error: null }),
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

const mapRole = (r: string): UserRole => {
    const role = r.toLowerCase().trim();
    if (role === 'master_admin' || role === 'super_admin' || role === 'admin') return 'admin';
    if (role === 'advertiser' || role === 'sponsor') return 'brand';
    if (role === 'organizer') return 'host';
    if (role === 'user' || role === 'consumer') return 'participant';
    if (ALL_WORKSPACE_ROLES.includes(role as UserRole)) {
        return role as UserRole;
    }
    return 'participant';
};

    const fetchUserRoles = async (userId: string, sessionUser?: User | null) => {
        const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching roles:", error);
        }

        const rawRoles = (data || []).map((r) => String(r.role || '').toLowerCase().trim());

        if (
            rawRoles.includes("admin") ||
            rawRoles.includes("master_admin") ||
            (sessionUser?.app_metadata as any)?.role === "master_admin" ||
            (sessionUser?.user_metadata as any)?.role === "master_admin" ||
            sessionUser?.email?.trim().toLowerCase() === "andremillwood@gmail.com"
        ) {
            return ALL_WORKSPACE_ROLES;
        }

        const mappedRoles = Array.from(new Set(rawRoles.map(mapRole)));
        if (!mappedRoles.includes("participant")) {
            mappedRoles.unshift("participant");
        }
        return mappedRoles;
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

    const chooseRole = async (role: UserRole) => {
        if (!user) return { error: new Error('Sign in before choosing a role.') };
        const { error } = await supabase
            .from('user_roles')
            .upsert({ user_id: user.id, role }, { onConflict: 'user_id,role' });
        if (error) return { error };
        setRoles((current) => current.includes(role) ? current : [...current, role]);
        await setActiveRole(role);
        return { error: null };
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
        const appStateSubscription = AppState.addEventListener('change', (state) => {
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
                const fetchedRoles = await fetchUserRoles(session.user.id, session.user);
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
                const fetchedRoles = await fetchUserRoles(session.user.id, session.user);
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

        return () => {
            appStateSubscription.remove()
            subscription.unsubscribe()
        }
    }, [])

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = makeRedirectUri({
                scheme: 'promorang',
                path: 'auth/callback',
                native: 'promorang://auth/callback',
            })
            if (__DEV__) {
                console.info('[Auth] Add this exact URL to Supabase Redirect URLs:', redirectUrl)
            }

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

            const authorizationUrl = new URL(data.url)
            if (__DEV__) {
                console.info('[Auth] Supabase project:', authorizationUrl.host)
                console.info(
                    '[Auth] Callback sent to Supabase:',
                    authorizationUrl.searchParams.get('redirect_to')
                )
            }

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

    const signInWithApple = async () => {
        if (Platform.OS !== 'ios') {
            return { error: new Error('Sign in with Apple is available on iPhone and iPad.') }
        }

        try {
            setIsLoading(true)
            const rawNonce = Crypto.randomUUID()
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                rawNonce
            )
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            })

            if (!credential.identityToken) {
                throw new Error('Apple did not return a valid identity token.')
            }

            const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
                .filter(Boolean)
                .join(' ')
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
                nonce: rawNonce,
            })
            if (error) throw error

            if (fullName) {
                await supabase.auth.updateUser({ data: { full_name: fullName, name: fullName } })
            }
            return { error: null }
        } catch (error: any) {
            if (error?.code === 'ERR_REQUEST_CANCELED') return { error: null }
            const appleError = error instanceof Error ? error : new Error('Apple sign-in failed')
            console.error('Apple Sign-In Error:', appleError)
            return { error: appleError }
        } finally {
            setIsLoading(false)
        }
    }

    const demoSignIn = async (role: UserRole) => {
        if (!ALLOW_DEMO_LOGIN) {
            return { error: new Error('Demo login is disabled for this build') }
        }

        try {
            setIsLoading(true)
            const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.promorang.co/api'
            const response = await fetch(`${apiBaseUrl}/auth/demo/${role}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
            const payload = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(payload?.details || payload?.error || 'Failed to prepare demo account')
            }
            if (!payload?.email || !payload?.password) {
                throw new Error('Demo account response was missing credentials')
            }

            const { error } = await supabase.auth.signInWithPassword({
                email: payload.email,
                password: payload.password,
            })
            if (error) throw error

            return { error: null }
        } catch (error) {
            const demoError = error instanceof Error ? error : new Error('Demo login failed')
            console.error('Demo Sign-In Error:', demoError)
            return { error: demoError }
        } finally {
            setIsLoading(false)
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
            chooseRole,
            organizations,
            activeOrgId,
            setActiveOrgId,
            agencyClients,
            signInWithGoogle,
            signInWithApple,
            demoSignIn,
            signOut,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}
