import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import colors from '@/constants/colors';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  scrollable?: boolean;
  variant?: 'default' | 'pills' | 'underlined';
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  labelStyle?: TextStyle;
  activeLabelStyle?: TextStyle;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  scrollable = false,
  variant = 'default',
  containerStyle,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
}) => {
  const getVariantStyles = (isActive: boolean) => {
    switch (variant) {
      case 'pills':
        return {
          tab: isActive ? styles.pillActiveTab : styles.pillTab,
          label: isActive ? styles.pillActiveLabel : styles.pillLabel,
        };
      case 'underlined':
        return {
          tab: isActive ? styles.underlinedActiveTab : styles.underlinedTab,
          label: isActive ? styles.underlinedActiveLabel : styles.underlinedLabel,
        };
      case 'default':
      default:
        return {
          tab: isActive ? styles.defaultActiveTab : styles.defaultTab,
          label: isActive ? styles.defaultActiveLabel : styles.defaultLabel,
        };
    }
  };

  const TabComponent = scrollable ? ScrollView : View;
  const tabComponentProps = scrollable
    ? {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: styles.scrollableContent,
      }
    : {};

  return (
    <TabComponent
      style={[styles.container, containerStyle]}
      {...tabComponentProps}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const variantStyles = getVariantStyles(isActive);

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              variantStyles.tab,
              tabStyle,
              isActive && activeTabStyle,
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            {tab.icon && <View style={styles.icon}>{tab.icon}</View>}
            <Text
              style={[
                styles.label,
                variantStyles.label,
                labelStyle,
                isActive && activeLabelStyle,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </TabComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  scrollableContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Default variant
  defaultTab: {
    flex: 1,
  },
  defaultActiveTab: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  defaultLabel: {
    color: colors.darkGray,
  },
  defaultActiveLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Pills variant
  pillTab: {
    borderRadius: 20,
    marginHorizontal: 4,
  },
  pillActiveTab: {
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.primary,
  },
  pillLabel: {
    color: colors.darkGray,
  },
  pillActiveLabel: {
    color: colors.white,
    fontWeight: '600',
  },
  // Underlined variant
  underlinedTab: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  underlinedActiveTab: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  underlinedLabel: {
    color: colors.darkGray,
  },
  underlinedActiveLabel: {
    color: colors.black,
    fontWeight: '600',
  },
});