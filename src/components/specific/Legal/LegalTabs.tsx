import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, NEUTRAL } from '../../../constants/theme';
import { LegalTabKey } from '../../../constants/legal/types';
import { LEGAL_TABS } from '../../../constants/legal';
import { useResponsive } from '../../../utils/useResponsive';

interface LegalTabsProps {
  activeTab: LegalTabKey;
  onSelectTab: (tab: LegalTabKey) => void;
}

export const LegalTabs: React.FC<LegalTabsProps> = ({ activeTab, onSelectTab }) => {
  const { isMobile } = useResponsive();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
      >
        {LEGAL_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.gray200,
    alignItems: 'center',
  },
  scrollContent: {
    maxWidth: 960,
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  scrollContentMobile: {
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: NEUTRAL.gray500,
  },
  tabTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

