import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const CHUNK_SIZE = 2000;

const AuthStorageAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return typeof window === 'undefined' ? null : window.localStorage.getItem(key)
        }
        const numberOfChunksStr = await SecureStore.getItemAsync(`${key}_chunks`)
        if (numberOfChunksStr) {
            const numberOfChunks = parseInt(numberOfChunksStr, 10)
            let result = ''
            for (let i = 0; i < numberOfChunks; i++) {
                const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`)
                if (!chunk) return null
                result += chunk
            }
            return result
        }
        return SecureStore.getItemAsync(key)
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
            return
        }

        await AuthStorageAdapter.removeItem(key)

        if (value.length > CHUNK_SIZE) {
            const numberOfChunks = Math.ceil(value.length / CHUNK_SIZE)
            await SecureStore.setItemAsync(`${key}_chunks`, numberOfChunks.toString())
            for (let i = 0; i < numberOfChunks; i++) {
                const chunk = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
                await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk)
            }
        } else {
            await SecureStore.setItemAsync(key, value)
        }
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') window.localStorage.removeItem(key)
            return
        }
        const numberOfChunksStr = await SecureStore.getItemAsync(`${key}_chunks`)
        if (numberOfChunksStr) {
            const numberOfChunks = parseInt(numberOfChunksStr, 10)
            for (let i = 0; i < numberOfChunks; i++) {
                await SecureStore.deleteItemAsync(`${key}_chunk_${i}`)
            }
            await SecureStore.deleteItemAsync(`${key}_chunks`)
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
