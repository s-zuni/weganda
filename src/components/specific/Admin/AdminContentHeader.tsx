import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, NEUTRAL } from '../../../constants/theme';
import { RepeatIcon } from '../../common/Icon';

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
        <Text style={styles.updateTime}>마지막 업데이트: {currentTime}</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={NEUTRAL.gray900} />
          ) : (
            <View style={styles.refreshBtnContent}>
              <RepeatIcon size={12} color={NEUTRAL.gray700} />
              <Text style={styles.refreshText}>새로고침</Text>
            </View>
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
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: NEUTRAL.gray900,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: NEUTRAL.gray500,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  updateTime: {
    fontSize: 12,
    color: NEUTRAL.gray400,
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: NEUTRAL.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  refreshBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: NEUTRAL.gray700,
  },
});
