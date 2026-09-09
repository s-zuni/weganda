import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';

export type AdminTabKey = 'users' | 'community' | 'analytics';

interface AdminTabBarProps {
  activeTab: AdminTabKey;
  onSelectTab: (tab: AdminTabKey) => void;
  reportCount?: number;
}

export const AdminTabBar: React.FC<AdminTabBarProps> = ({
  activeTab,
  onSelectTab,
  reportCount = 0,
}) => {
  const tabs: { key: AdminTabKey; label: string; badge?: number }[] = [
    { key: 'users', label: '1. 유저 관리' },
    { key: 'community', label: '2. 커뮤니티 관리', badge: reportCount > 0 ? reportCount : undefined },
    { key: 'analytics', label: '3. 서비스 지표' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tabItem, isActive && styles.activeTabItem]}
            activeOpacity={0.7}
          >
            <View style={styles.labelRow}>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              {tab.badge !== undefined && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 6,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTabItem: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
