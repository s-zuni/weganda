import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BUSINESS_INFO } from '../../../types/support';

interface MyPageFooterSectionProps {
  onOpenSupport: () => void;
  onOpenBusinessInfo: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const MyPageFooterSection: React.FC<MyPageFooterSectionProps> = ({
  onOpenSupport,
  onOpenBusinessInfo,
  onLogout,
  onDeleteAccount,
}) => {
  return (
    <View style={styles.footerSection}>
      <TouchableOpacity
        style={styles.bottomSupportBtn}
        onPress={onOpenSupport}
        activeOpacity={0.7}
      >
        <Text style={styles.bottomSupportBtnText}>고객센터 1:1 문의하기</Text>
      </TouchableOpacity>

      <View style={styles.footerActionsRow}>
        {/* 사업자 정보 버튼 */}
        <TouchableOpacity
          style={styles.footerTextBtn}
          onPress={onOpenBusinessInfo}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="사업자 정보 확인"
        >
          <Text style={styles.footerBusinessText}>사업자 정보</Text>
        </TouchableOpacity>

        <Text style={styles.footerDot}>•</Text>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={styles.footerTextBtn}
          onPress={onLogout}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="로그아웃"
        >
          <Text style={styles.footerLogoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={styles.footerDot}>•</Text>

        {/* ⚠️ 회원 탈퇴 버튼 (Apple Guideline 5.1.1(v) 필수 요건) */}
        <TouchableOpacity
          style={styles.footerTextBtn}
          onPress={onDeleteAccount}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="회원 탈퇴"
        >
          <Text style={styles.footerDeleteText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copyrightText}>
        © 2026 {BUSINESS_INFO.companyName} (우간다). All rights reserved.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerSection: {
    marginTop: 16,
    marginBottom: 48,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bottomSupportBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bottomSupportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  footerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  footerTextBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  footerBusinessText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  footerLogoutText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  footerDeleteText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  footerDot: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  copyrightText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
