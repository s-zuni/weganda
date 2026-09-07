import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

interface AdminContentHeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AdminContentHeader: React.FC<AdminContentHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
}) => {
  const currentTime = new Date().toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.rightGroup}>
        <Text style={styles.updateTime}>🕒 마지막 업데이트: {currentTime}</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Text style={styles.refreshText}>🔄 새로고침</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  updateTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
