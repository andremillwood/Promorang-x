import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const AuthStorageAdapter = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return typeof window === 'undefined' ? null : window.localStorage.getItem(key)
        }
        return SecureStore.getItemAsync(key)
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
            return
        }
        await SecureStore.setItemAsync(key, value)
    },
    removeItem: async (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') window.localStorage.removeItem(key)
            return
        }
        await SecureStore.deleteItemAsync(key)
    },
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AuthStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})
