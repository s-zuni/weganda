import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUserStore } from '../../../store/useUserStore';

export type AdminMenuKey =
  | 'dashboard'
  | 'waitlist'
  | 'users'
  | 'inquiries'
  | 'verification'
  | 'community'
  | 'analytics'
  | 'payments'
  | 'settings';

interface AdminSidebarProps {
  activeMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  pendingReportsCount?: number;
  pendingVerificationsCount?: number;
  pendingInquiriesCount?: number;
  onGoMain: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeMenu,
  onSelectMenu,
  pendingReportsCount = 0,
  pendingVerificationsCount = 0,
  pendingInquiriesCount = 0,
  onGoMain,
}) => {
  const menuItems: {
    key: AdminMenuKey;
    label: string;
    icon: string;
    badge?: number;
    isPending?: boolean;
  }[] = [
    { key: 'dashboard', label: '대시보드', icon: '⊞' },
    { key: 'waitlist', label: '사전예약 대기자 (Waitlist)', icon: '📬' },
    { key: 'users', label: '회원 관리', icon: '👥' },
    {
      key: 'inquiries',
      label: '고객 문의 센터',
      icon: '🎧',
      badge: pendingInquiriesCount > 0 ? pendingInquiriesCount : undefined,
    },
    {
      key: 'verification',
      label: '간호 서류 인증 심사',
      icon: '📋',
      badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
    },
    {
      key: 'community',
      label: '커뮤니티 관리',
      icon: '💬',
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
    },
    { key: 'analytics', label: '서비스 활성도 & 체류시간', icon: '📈' },
    { key: 'payments', label: '멤버십 & 이벤트 결제 관리', icon: '💳' },
    { key: 'settings', label: '시스템 설정', icon: '⚙️' },
  ];

  return (
    <View style={styles.sidebar}>
      {/* ── 상단 브랜드 로고 ── */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🩺</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>WEGANDA</Text>
          <Text style={styles.brandSub}>ADMIN CONSOLE</Text>
        </View>
      </View>

      {/* ── 네비게이션 메뉴 리스트 ── */}
      <View style={styles.menuList}>
        {menuItems.map((item) => {
          const isActive = activeMenu === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => onSelectMenu(item.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuIcon, isActive && styles.menuIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>

              {item.isPending && (
                <View style={styles.pendingTag}>
                  <Text style={styles.pendingTagText}>준비중</Text>
                </View>
              )}

              {item.badge !== undefined && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── 하단 메인 사이트 복귀 / 로그아웃 ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={onGoMain} activeOpacity={0.7}>
          <Text style={styles.footerIcon}>🏠</Text>
          <Text style={styles.footerText}>메인 사이트 (weganda.kr)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, { marginTop: 6 }]}
          onPress={() => {
            useUserStore.getState().setUser({ role: 'user', isAuthenticated: false });
            onGoMain();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.footerIcon}>🔒</Text>
          <Text style={styles.footerText}>관리자 로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: '#0F172A', // 다크 네이비 Slate 900
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    paddingVertical: 24,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FF507C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  menuList: {
    marginTop: 20,
    gap: 6,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#FFFFFF', // 예시 사진과 동일한 화이트 알약형 활성 배경
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 16,
    color: '#94A3B8',
  },
  menuIconActive: {
    color: '#0F172A',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    flex: 1,
  },
  menuLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  pendingTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingTagText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  footerIcon: {
    color: '#64748B',
    fontSize: 14,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
