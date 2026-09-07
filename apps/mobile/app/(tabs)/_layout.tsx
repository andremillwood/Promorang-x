import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import { PEOPLE_EXPERIENCE_CHROME } from '@promorang/shared';

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
          title: PEOPLE_EXPERIENCE_CHROME.today.label,
          headerTitle: PEOPLE_EXPERIENCE_CHROME.today.label,
          headerShown: false,
          tabBarAccessibilityLabel: `${PEOPLE_EXPERIENCE_CHROME.today.label}: ${PEOPLE_EXPERIENCE_CHROME.today.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: PEOPLE_EXPERIENCE_CHROME.people.label,
          headerTitle: PEOPLE_EXPERIENCE_CHROME.people.label,
          headerShown: false,
          tabBarAccessibilityLabel: `${PEOPLE_EXPERIENCE_CHROME.people.label}: ${PEOPLE_EXPERIENCE_CHROME.people.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="people" color={color} />,
        }}
      />
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="shop" options={{ href: null }} />
      <Tabs.Screen name="propose" options={{ href: null }} />
      <Tabs.Screen
        name="post"
        options={{
          title: PEOPLE_EXPERIENCE_CHROME.create.label,
          headerTitle: PEOPLE_EXPERIENCE_CHROME.create.label,
          tabBarAccessibilityLabel: `${PEOPLE_EXPERIENCE_CHROME.create.label}: ${PEOPLE_EXPERIENCE_CHROME.create.humanQuestion}`,
          tabBarIcon: () => (
            <Ionicons name="add-circle" size={34} color={DesignColors.primary} />
          ),
        }}
      />
      <Tabs.Screen name="rewards" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen
        name="earn"
        options={{
          title: PEOPLE_EXPERIENCE_CHROME.earn.label,
          headerTitle: PEOPLE_EXPERIENCE_CHROME.earn.label,
          headerShown: false,
          tabBarAccessibilityLabel: `${PEOPLE_EXPERIENCE_CHROME.earn.label}: ${PEOPLE_EXPERIENCE_CHROME.earn.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen name="promoshare" options={{ href: null }} />
      <Tabs.Screen
        name="card"
        options={{
          title: PEOPLE_EXPERIENCE_CHROME.card.label,
          headerTitle: 'PromoCard',
          headerShown: false,
          tabBarAccessibilityLabel: `${PEOPLE_EXPERIENCE_CHROME.card.label}: ${PEOPLE_EXPERIENCE_CHROME.card.humanQuestion}`,
          tabBarIcon: ({ color }) => <TabBarIcon name="card" color={color} />,
        }}
      />
      <Tabs.Screen name="vault" options={{ href: null }} />
    </Tabs>
  );
}
