import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface AdminHeaderProps {
  onClose: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onClose,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.closeBtn}
        >
          <Text style={styles.closeText}>‹ 닫기</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>관리자 콘솔</Text>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>SUPER ADMIN</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>우간다 시스템 및 커뮤니티 통합 관리</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onRefresh}
        disabled={isLoading}
        style={styles.refreshBtn}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.refreshText}>새로고침</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  left: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  closeBtn: {
    marginBottom: 4,
  },
  closeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  titleContainer: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  adminBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
});
