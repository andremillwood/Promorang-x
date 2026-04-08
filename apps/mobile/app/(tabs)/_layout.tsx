import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';

import { Colors as DesignColors } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DesignColors.primary,
        tabBarInactiveTintColor: isDark ? DesignColors.gray[600] : DesignColors.gray[400],
        headerShown: true,
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
          backgroundColor: 'transparent',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
          paddingBottom: 25,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={isDark ? 80 : 100}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerTitle: 'Today',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-clear" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          headerTitle: 'Explore Moments',
          tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          headerTitle: 'Marketplace',
          tabBarIcon: ({ color }) => <TabBarIcon name="storefront" color={color} />,
        }}
      />
      <Tabs.Screen
        name="propose"
        options={{
          title: 'Propose',
          headerTitle: 'Get Funded',
          tabBarIcon: ({ color }) => <TabBarIcon name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          headerTitle: 'Share Moment',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="add-circle"
              size={48}
              color={DesignColors.primary}
              style={{ marginTop: -10 }}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          headerTitle: 'My Perks',
          tabBarIcon: ({ color }) => <TabBarIcon name="gift" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'My Canon',
          tabBarIcon: ({ color }) => <TabBarIcon name="stats-chart" color={color} />,
        }}
      />
      {/* Hiding legacy tabs */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
