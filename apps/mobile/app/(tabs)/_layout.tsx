import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import { PROMORANG_DESTINATIONS } from '@promorang/shared';

import { Colors as DesignColors } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { AppHeader } from '@/components/AppHeader';
import { useReduceTransparency } from '@/hooks/useReduceTransparency';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const reduceTransparency = useReduceTransparency();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DesignColors.primary,
        tabBarInactiveTintColor: DesignColors.gray[500],
        headerShown: true,
        header: () => <AppHeader />,
        headerStyle: {
          backgroundColor: isDark ? DesignColors.black : DesignColors.white,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
          fontWeight: 'bold',
          fontSize: 18,
          color: isDark ? DesignColors.white : DesignColors.black,
        },
        tabBarStyle: {
          backgroundColor: DesignColors.darkGlass,
          position: 'absolute',
          elevation: 0,
          height: 78,
          paddingBottom: 18,
          paddingTop: 8,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: DesignColors.border,
        },
        tabBarBackground: () => reduceTransparency ? null : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: DesignColors.darkGlass }]} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: PROMORANG_DESTINATIONS.today.label,
          headerTitle: PROMORANG_DESTINATIONS.today.label,
          headerShown: false,
          tabBarAccessibilityLabel: `${PROMORANG_DESTINATIONS.today.label}: ${PROMORANG_DESTINATIONS.today.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: PROMORANG_DESTINATIONS.discover.label,
          headerTitle: PROMORANG_DESTINATIONS.discover.label,
          tabBarAccessibilityLabel: `${PROMORANG_DESTINATIONS.discover.label}: ${PROMORANG_DESTINATIONS.discover.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
      <Tabs.Screen name="shop" options={{ href: null }} />
      <Tabs.Screen name="propose" options={{ href: null }} />
      <Tabs.Screen
        name="post"
        options={{
          title: PROMORANG_DESTINATIONS.create.label,
          headerTitle: PROMORANG_DESTINATIONS.create.label,
          tabBarAccessibilityLabel: `${PROMORANG_DESTINATIONS.create.label}: ${PROMORANG_DESTINATIONS.create.humanQuestion}`,
          tabBarIcon: () => (
            <Ionicons name="add-circle" size={34} color={DesignColors.primary} />
          ),
        }}
      />
      <Tabs.Screen name="rewards" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen
        name="promoshare"
        options={{
          title: PROMORANG_DESTINATIONS.progress.label,
          headerTitle: PROMORANG_DESTINATIONS.progress.label,
          tabBarAccessibilityLabel: `${PROMORANG_DESTINATIONS.progress.label}: ${PROMORANG_DESTINATIONS.progress.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="analytics" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: PROMORANG_DESTINATIONS.vault.label,
          headerTitle: PROMORANG_DESTINATIONS.vault.label,
          tabBarAccessibilityLabel: `${PROMORANG_DESTINATIONS.vault.label}: ${PROMORANG_DESTINATIONS.vault.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />,
        }}
      />
    </Tabs>
  );
}
