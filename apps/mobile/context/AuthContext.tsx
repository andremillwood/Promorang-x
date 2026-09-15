import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { AppState, Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/secureStore'
import * as Crypto from 'expo-crypto'

WebBrowser.maybeCompleteAuthSession()

const ALLOW_DEMO_LOGIN = __DEV__ || process.env.EXPO_PUBLIC_ENABLE_DEMO_LOGIN === 'true'
const ACTIVE_ROLE_KEY = 'promorang_active_role'
const ACTIVE_ORG_KEY = 'promorang_active_org_id'
const MANAGING_AGENCY_KEY = 'promorang_managing_agency_org_id'

function extractParamsFromUrl(url: string) {
    const params: Record<string, string> = {}
    let queryString = url.split('#')[1]
    if (!queryString) queryString = url.split('?')[1]

    if (queryString) {
        queryString.split('&').forEach(param => {
            const parts = param.split('=')
            const key = parts[0]
            const value = parts.length > 1 ? decodeURIComponent(parts[1]) : ''
            params[key] = value
        })
    }
    return params
}

export type UserRole = 'participant' | 'creator' | 'host' | 'brand' | 'merchant' | 'agency' | 'admin'
export const ALL_WORKSPACE_ROLES: UserRole[] = ['participant', 'creator', 'host', 'brand', 'merchant', 'agency', 'admin']

type Organization = {
    id: string
    name: string
    slug?: string | null
    type?: string | null
    avatar_url?: string | null
    user_role?: string
}

type AgencyClient = Organization & {
    relationship_type?: string
    managing_agency_id: string
}

type AuthContextType = {
    session: Session | null
    user: User | null
    roles: UserRole[]
    activeRole: UserRole | null
    setActiveRole: (role: UserRole) => Promise<void>
    chooseRole: (role: UserRole) => Promise<{ error: Error | null }>
    organizations: Organization[]
    agencyClients: AgencyClient[]
    activeOrgId: string | null
    managingAgencyOrgId: string | null
    setActiveOrgId: (id: string | null) => Promise<void>
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
    setActiveRole: async () => { },
    chooseRole: async () => ({ error: null }),
    organizations: [],
    agencyClients: [],
    activeOrgId: null,
    managingAgencyOrgId: null,
    setActiveOrgId: async () => { },
    signInWithGoogle: async () => { },
    signInWithApple: async () => ({ error: null }),
    demoSignIn: async () => ({ error: null }),
    signOut: async () => { },
    isLoading: true,
})

export function useAuth() {
    return useContext(AuthContext)
}

const mapRole = (r: string): UserRole => {
    const role = r.toLowerCase().trim()
    if (role === 'master_admin' || role === 'super_admin' || role === 'admin') return 'admin'
    if (role === 'advertiser' || role === 'sponsor') return 'brand'
    if (role === 'organizer') return 'host'
    if (role === 'user' || role === 'consumer') return 'participant'
    if (ALL_WORKSPACE_ROLES.includes(role as UserRole)) return role as UserRole
    return 'participant'
}

const orgRole = (type?: string | null): UserRole | null => {
    if (type === 'brand') return 'brand'
    if (type === 'merchant') return 'merchant'
    if (type === 'agency') return 'agency'
    return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [roles, setRoles] = useState<UserRole[]>([])
    const [activeRole, setActiveRoleState] = useState<UserRole | null>(null)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null)
    const [agencyClients, setAgencyClients] = useState<AgencyClient[]>([])
    const [managingAgencyOrgId, setManagingAgencyOrgId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const managedClientSelectionRef = useRef<string | null>(null)

    const loadAgencyClients = async (agencyId: string): Promise<AgencyClient[]> => {
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
            .eq('status', 'active')

        if (error) {
            console.error('Error fetching agency clients:', error)
            return []
        }

        return (data || []).map((d: any) => ({
            ...d.organizations,
            relationship_type: d.relationship_type,
            managing_agency_id: agencyId,
        }))
    }

    const fetchAgencyClients = async (agencyId: string) => {
        const clients = await loadAgencyClients(agencyId)
        setAgencyClients(clients)
        setManagingAgencyOrgId(agencyId)
        await setSecureItem(MANAGING_AGENCY_KEY, agencyId)
        return clients
    }

    const fetchUserRoles = async (userId: string, sessionUser?: User | null) => {
        const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId)
        if (error) console.error('Error fetching roles:', error)

        const rawRoles = (data || []).map((r) => String(r.role || '').toLowerCase().trim())
        if (
            rawRoles.includes('admin') || rawRoles.includes('master_admin') ||
            (sessionUser?.app_metadata as any)?.role === 'master_admin' ||
            (sessionUser?.user_metadata as any)?.role === 'master_admin' ||
            sessionUser?.email?.trim().toLowerCase() === 'andremillwood@gmail.com'
        ) return ALL_WORKSPACE_ROLES

        const mappedRoles = Array.from(new Set(rawRoles.map(mapRole)))
        if (!mappedRoles.includes('participant')) mappedRoles.unshift('participant')
        return mappedRoles
    }

    const activateDirectOrg = async (org: Organization, syncRole = true) => {
        managedClientSelectionRef.current = null
        setActiveOrgIdState(org.id)
        await setSecureItem(ACTIVE_ORG_KEY, org.id)
        const role = orgRole(org.type)
        if (syncRole && role) {
            setActiveRoleState(role)
            await setSecureItem(ACTIVE_ROLE_KEY, role)
        }
        if (org.type === 'agency') {
            await fetchAgencyClients(org.id)
        } else {
            setAgencyClients([])
            setManagingAgencyOrgId(null)
            await deleteSecureItem(MANAGING_AGENCY_KEY)
        }
    }

    const activateManagedClient = async (client: AgencyClient) => {
        managedClientSelectionRef.current = client.id
        setActiveOrgIdState(client.id)
        await setSecureItem(ACTIVE_ORG_KEY, client.id)
        setManagingAgencyOrgId(client.managing_agency_id)
        await setSecureItem(MANAGING_AGENCY_KEY, client.managing_agency_id)
        const role = orgRole(client.type)
        if (role === 'brand' || role === 'merchant') {
            setActiveRoleState(role)
            await setSecureItem(ACTIVE_ROLE_KEY, role)
        }
    }

    const fetchUserOrganizations = async (userId: string) => {
        const { data, error } = await supabase
            .from('organization_members')
            .select(`organization_id, role, organizations (id, name, slug, type, avatar_url)`)
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching organizations:', error)
            return []
        }

        const orgs: Organization[] = (data || []).map((m: any) => ({ ...m.organizations, user_role: m.role }))
        setOrganizations(orgs)

        const savedOrgId = await getSecureItem(ACTIVE_ORG_KEY)
        const savedRole = await getSecureItem(ACTIVE_ROLE_KEY) as UserRole | null
        const savedManagingAgencyId = await getSecureItem(MANAGING_AGENCY_KEY)
        const directSavedOrg = savedOrgId ? orgs.find(o => o.id === savedOrgId) : null
        const agencyOrgs = orgs.filter(o => o.type === 'agency')
        const desiredType = savedRole === 'brand' || savedRole === 'merchant' || savedRole === 'agency' ? savedRole : null

        if (directSavedOrg) {
            if (desiredType && directSavedOrg.type !== desiredType) {
                const matchingDirect = orgs.find(org => org.type === desiredType)
                if (matchingDirect) await activateDirectOrg(matchingDirect, true)
                else await activateDirectOrg(directSavedOrg, false)
            } else {
                await activateDirectOrg(directSavedOrg, Boolean(desiredType))
            }
            return orgs
        }

        if (savedOrgId) {
            const preferredAgency = savedManagingAgencyId ? agencyOrgs.find(o => o.id === savedManagingAgencyId) : null
            if (preferredAgency) {
                const clients = await loadAgencyClients(preferredAgency.id)
                const savedClient = clients.find(client => client.id === savedOrgId)
                if (savedClient) {
                    setAgencyClients(clients)
                    await activateManagedClient(savedClient)
                    return orgs
                }
                await activateDirectOrg(preferredAgency, true)
                return orgs
            }

            const matches: Array<{ agency: Organization; clients: AgencyClient[]; client: AgencyClient }> = []
            for (const agency of agencyOrgs) {
                const clients = await loadAgencyClients(agency.id)
                const client = clients.find(candidate => candidate.id === savedOrgId)
                if (client) matches.push({ agency, clients, client })
            }
            if (matches.length === 1) {
                setAgencyClients(matches[0].clients)
                await activateManagedClient(matches[0].client)
                return orgs
            }
            if (agencyOrgs.length > 0) {
                if (agencyOrgs.length === 1) await activateDirectOrg(agencyOrgs[0], true)
                else {
                    managedClientSelectionRef.current = null
                    setActiveRoleState('agency')
                    await setSecureItem(ACTIVE_ROLE_KEY, 'agency')
                    setActiveOrgIdState(null)
                    await deleteSecureItem(ACTIVE_ORG_KEY)
                    setAgencyClients([])
                    setManagingAgencyOrgId(null)
                    await deleteSecureItem(MANAGING_AGENCY_KEY)
                }
                return orgs
            }
        }

        if (savedRole === 'agency') {
            if (agencyOrgs.length === 1) await activateDirectOrg(agencyOrgs[0], true)
            else if (agencyOrgs.length > 1) {
                managedClientSelectionRef.current = null
                setActiveRoleState('agency')
                setActiveOrgIdState(null)
                setAgencyClients([])
            }
            return orgs
        }

        if (savedRole === 'brand' || savedRole === 'merchant') {
            const matchingDirect = orgs.find(org => org.type === savedRole)
            if (matchingDirect) {
                await activateDirectOrg(matchingDirect, true)
                return orgs
            }
        }

        if (orgs.length > 0) await activateDirectOrg(orgs[0], false)
        return orgs
    }

    const setActiveRole = async (role: UserRole) => {
        setActiveRoleState(role)
        await setSecureItem(ACTIVE_ROLE_KEY, role)

        const selectedManagedId = managedClientSelectionRef.current || activeOrgId
        const activeManagedClient = agencyClients.find(client => client.id === selectedManagedId)
        const currentDirectOrg = organizations.find(org => org.id === activeOrgId)

        if (role === 'agency') {
            const recordedAgency = managingAgencyOrgId
                ? organizations.find(org => org.id === managingAgencyOrgId && org.type === 'agency')
                : null
            const agencies = organizations.filter(org => org.type === 'agency')
            const agency = recordedAgency || (agencies.length === 1 ? agencies[0] : null)
            if (agency) await activateDirectOrg(agency, true)
            return
        }

        if ((role === 'brand' || role === 'merchant') && activeManagedClient?.type === role) return
        if (currentDirectOrg?.type === role) return

        if (role === 'brand' || role === 'merchant') {
            const matchingDirect = organizations.find(org => org.type === role)
            if (matchingDirect) await activateDirectOrg(matchingDirect, true)
        }
    }

    const chooseRole = async (role: UserRole) => {
        if (!user) return { error: new Error('Sign in before choosing a role.') }
        const { error } = await supabase.from('user_roles').upsert({ user_id: user.id, role }, { onConflict: 'user_id,role' })
        if (error) return { error }
        setRoles(current => current.includes(role) ? current : [...current, role])
        await setActiveRole(role)
        return { error: null }
    }

    const setActiveOrgId = async (id: string | null) => {
        if (!id) {
            managedClientSelectionRef.current = null
            setActiveOrgIdState(null)
            await deleteSecureItem(ACTIVE_ORG_KEY)
            setAgencyClients([])
            setManagingAgencyOrgId(null)
            await deleteSecureItem(MANAGING_AGENCY_KEY)
            return
        }

        const directOrg = organizations.find(org => org.id === id)
        if (directOrg) {
            await activateDirectOrg(directOrg, true)
            return
        }

        const managedClient = agencyClients.find(client => client.id === id)
        if (managedClient) {
            managedClientSelectionRef.current = managedClient.id
            await activateManagedClient(managedClient)
            return
        }

        const agency = managingAgencyOrgId ? organizations.find(org => org.id === managingAgencyOrgId && org.type === 'agency') : null
        if (agency) await activateDirectOrg(agency, true)
        else {
            managedClientSelectionRef.current = null
            setActiveOrgIdState(null)
            await deleteSecureItem(ACTIVE_ORG_KEY)
        }
    }

    useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', state => {
            if (state === 'active') supabase.auth.startAutoRefresh()
            else supabase.auth.stopAutoRefresh()
        })

        const syncSessionContext = async (sessionUser: User) => {
            const fetchedRoles = await fetchUserRoles(sessionUser.id, sessionUser)
            setRoles(fetchedRoles)
            await fetchUserOrganizations(sessionUser.id)

            const savedRole = await getSecureItem(ACTIVE_ROLE_KEY) as UserRole | null
            const hydratedOrgId = await getSecureItem(ACTIVE_ORG_KEY)
            const hydratedManagingAgencyId = await getSecureItem(MANAGING_AGENCY_KEY)
            const managedRoleIsAuthorized = Boolean(
                hydratedOrgId && hydratedManagingAgencyId && (savedRole === 'brand' || savedRole === 'merchant')
            )

            if (savedRole && (fetchedRoles.includes(savedRole) || managedRoleIsAuthorized)) setActiveRoleState(savedRole)
            else setActiveRoleState(fetchedRoles[0] || 'participant')
        }

        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) await syncSessionContext(session.user)
            setIsLoading(false)
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            setSession(nextSession)
            setUser(nextSession?.user ?? null)
            if (nextSession?.user) await syncSessionContext(nextSession.user)
            else {
                managedClientSelectionRef.current = null
                setRoles([])
                setOrganizations([])
                setActiveRoleState(null)
                setActiveOrgIdState(null)
                setAgencyClients([])
                setManagingAgencyOrgId(null)
            }
            setIsLoading(false)
        })

        return () => {
            appStateSubscription.remove()
            subscription.unsubscribe()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = makeRedirectUri({ scheme: 'promorang', path: 'auth/callback', native: 'promorang://auth/callback' })
            if (__DEV__) console.info('[Auth] Add this exact URL to Supabase Redirect URLs:', redirectUrl)
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: redirectUrl, skipBrowserRedirect: true, queryParams: { access_type: 'offline', prompt: 'consent' } },
            })
            if (error) throw error
            if (!data?.url) throw new Error('No auth URL returned from Supabase')
            const authorizationUrl = new URL(data.url)
            if (__DEV__) {
                console.info('[Auth] Supabase project:', authorizationUrl.host)
                console.info('[Auth] Callback sent to Supabase:', authorizationUrl.searchParams.get('redirect_to'))
            }
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)
            if (result.type === 'success' && result.url) {
                const params = extractParamsFromUrl(result.url)
                if (params.access_token && params.refresh_token) {
                    const { error } = await supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token })
                    if (error) throw error
                }
            }
        } catch (e) {
            console.error('Google Sign-In Error:', e)
        }
    }

    const signInWithApple = async () => {
        if (Platform.OS !== 'ios') return { error: new Error('Sign in with Apple is available on iPhone and iPad.') }
        try {
            setIsLoading(true)
            const rawNonce = Crypto.randomUUID()
            const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce)
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
                nonce: hashedNonce,
            })
            if (!credential.identityToken) throw new Error('Apple did not return a valid identity token.')
            const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ')
            const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken, nonce: rawNonce })
            if (error) throw error
            if (fullName) await supabase.auth.updateUser({ data: { full_name: fullName, name: fullName } })
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
        if (!ALLOW_DEMO_LOGIN) return { error: new Error('Demo login is disabled for this build') }
        try {
            setIsLoading(true)
            const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://api.promorang.co').replace(/\/$/, '')
            const response = await fetch(`${apiBaseUrl}/api/auth/demo/${role}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
            const payload = await response.json().catch(() => null)
            if (!response.ok) throw new Error(payload?.details || payload?.error || 'Failed to prepare demo account')
            if (!payload?.email || !payload?.password) throw new Error('Demo account response was missing credentials')
            const { error } = await supabase.auth.signInWithPassword({ email: payload.email, password: payload.password })
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
        managedClientSelectionRef.current = null
        setRoles([])
        setOrganizations([])
        setAgencyClients([])
        setManagingAgencyOrgId(null)
        setActiveRoleState(null)
        setActiveOrgIdState(null)
        await Promise.all([deleteSecureItem(ACTIVE_ROLE_KEY), deleteSecureItem(ACTIVE_ORG_KEY), deleteSecureItem(MANAGING_AGENCY_KEY)])
    }

    return (
        <AuthContext.Provider value={{
            session, user, roles, activeRole, setActiveRole, chooseRole, organizations, activeOrgId,
            managingAgencyOrgId, setActiveOrgId, agencyClients, signInWithGoogle, signInWithApple,
            demoSignIn, signOut, isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
