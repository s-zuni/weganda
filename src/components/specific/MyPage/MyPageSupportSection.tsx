import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { InquiryCategory } from '../../../types/support';

interface MyPageSupportSectionProps {
  onOpenSupport: (category: InquiryCategory) => void;
}

export const MyPageSupportSection: React.FC<MyPageSupportSectionProps> = ({ onOpenSupport }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>고객센터</Text>

      <TouchableOpacity
        style={styles.supportBannerCard}
        onPress={() => onOpenSupport('서비스 문의')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="1:1 문의하기"
      >
        <View style={styles.supportBannerLeft}>
          <Text style={styles.supportBannerEmoji}>🎧</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportBannerTitle}>무엇을 도와드릴까요?</Text>
            <Text style={styles.supportBannerSubtitle}>
              서비스 문의 · 버그 신고 · 멤버십/결제 오류 · 건의사항
            </Text>
          </View>
        </View>
        <Text style={[styles.supportBannerArrow, { color: theme.primary }]}>1:1 문의 ›</Text>
      </TouchableOpacity>

      <View style={styles.policyDivider} />

      <TouchableOpacity
        style={styles.policyRow}
        onPress={() => onOpenSupport('결제 오류')}
        activeOpacity={0.7}
      >
        <Text style={styles.policyLabel}>결제 및 멤버십 오류 접수</Text>
        <Text style={styles.policyArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.policyDivider} />

      <TouchableOpacity
        style={styles.policyRow}
        onPress={() => onOpenSupport('버그 신고')}
        activeOpacity={0.7}
      >
        <Text style={styles.policyLabel}>버그 제보 및 기능 건의</Text>
        <Text style={styles.policyArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  supportBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  supportBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  supportBannerEmoji: {
    fontSize: 24,
  },
  supportBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  supportBannerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  supportBannerArrow: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  policyDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  policyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  policyArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
});
