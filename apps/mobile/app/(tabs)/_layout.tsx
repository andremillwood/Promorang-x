import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Home, Compass, Coins, User, Settings } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

export default function TabLayout() {
  const router = useRouter();
  const theme = useThemeColors();

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.surface,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: theme.text,
        },
        headerTintColor: theme.text,
      }}
    >
      {/* Main 4 Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Compass size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Earn',
          tabBarLabel: 'Earn',
          tabBarIcon: ({ color, size }) => (
            <Coins size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={{ marginRight: 16 }}
            >
              <Settings size={22} color={colors.primary} />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />

      {/* Hidden tabs - still accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="growth"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="forecasts"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
        }}
      />
    </Tabs>
    <FloatingActionButton />
    </View>
  );
}