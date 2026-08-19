import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';

import { Colors as DesignColors } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { AppHeader } from '@/components/AppHeader';
import { STAKEHOLDER_EXPERIENCES, isStakeholderRole } from '@/constants/StakeholderExperience';
import { useAuth } from '@/context/AuthContext';
import { useReduceTransparency } from '@/hooks/useReduceTransparency';

/**
 * Premium Tab Bar Icon using Ionicons
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { activeRole } = useAuth();
  const reduceTransparency = useReduceTransparency();
  const role = isStakeholderRole(activeRole) ? activeRole : 'participant';
  const experience = STAKEHOLDER_EXPERIENCES[role];

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
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerTitle: 'Today',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: experience.tabs.discover,
          headerTitle: experience.tabs.discover,
          tabBarAccessibilityLabel: `${experience.tabs.discover}: discover what is worth joining, watching, supporting, or creating`,
          tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="propose"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: experience.tabs.create,
          headerTitle: experience.tabs.create,
          tabBarAccessibilityLabel: `${experience.tabs.create}: create or capture the next useful move`,
          tabBarIcon: () => (
            <Ionicons name="add-circle" size={34} color={experience.color || DesignColors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: experience.tabs.grow,
          headerTitle: experience.tabs.grow,
          href: role === 'participant' || role === 'creator' ? null : undefined,
          tabBarAccessibilityLabel: `${experience.tabs.grow}: operational console and metrics`,
          tabBarIcon: ({ color }) => <TabBarIcon name="analytics" color={color} />,
        }}
      />
      <Tabs.Screen
        name="promoshare"
        options={{
          title: experience.tabs.grow,
          headerTitle: experience.tabs.grow,
          href: role === 'participant' || role === 'creator' ? undefined : null,
          tabBarAccessibilityLabel: `${experience.tabs.grow}: see what happened because of you`,
          tabBarIcon: ({ color }) => <TabBarIcon name="analytics" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: experience.tabs.vault,
          headerTitle: experience.tabs.vault,
          tabBarAccessibilityLabel: `${experience.tabs.vault}: proof, rewards, earnings, access, memories, and assets kept`,
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />,
        }}
      />
    </Tabs>
  );
}
