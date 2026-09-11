import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { CommonScheduleItem, CommonScheduleFilterType } from '../../../hooks/useCommonSchedules';

interface CommonScheduleListProps {
  commonSchedules: CommonScheduleItem[];
  filteredCommonSchedules: CommonScheduleItem[];
  filter: CommonScheduleFilterType;
  onFilterChange: (filter: CommonScheduleFilterType) => void;
  onShareSchedule: (item: CommonScheduleItem) => void;
}

export const CommonScheduleList: React.FC<CommonScheduleListProps> = ({
  commonSchedules,
  filteredCommonSchedules,
  filter,
  onFilterChange,
  onShareSchedule,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.commonSection}>
      <View style={styles.commonHeaderRow}>
        <Text style={styles.commonSectionTitle}>📌 구성원 공통 스케줄</Text>
        <Text style={styles.commonSectionSub}>
          단원들이 함께 쉬는 날과 같은 근무로 만나는 날을 모았어요
        </Text>
      </View>

      {/* 필터 칩 */}
      <View style={styles.commonFilterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'all' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
          onPress={() => onFilterChange('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'all' && { color: theme.onPrimaryText },
            ]}
          >
            전체 ({commonSchedules.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'off' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
          onPress={() => onFilterChange('off')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'off' && { color: theme.onPrimaryText },
            ]}
          >
            함께 쉬는 날 (OFF)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'work' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
          onPress={() => onFilterChange('work')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'work' && { color: theme.onPrimaryText },
            ]}
          >
            함께 일하는 날 (D/E/N)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 공통 스케줄 카드 리스트 */}
      <View style={styles.commonList}>
        {filteredCommonSchedules.length === 0 ? (
          <View style={styles.commonEmptyBox}>
            <Text style={styles.commonEmptyText}>해당하는 공통 스케줄이 없습니다.</Text>
          </View>
        ) : (
          filteredCommonSchedules.map((item) => (
            <View key={item.id} style={styles.commonCard}>
              {/* 날짜 블록 */}
              <View
                style={[
                  styles.commonDateBox,
                  item.isSunday && styles.sundayDateBox,
                  item.isSaturday && styles.saturdayDateBox,
                ]}
              >
                <Text
                  style={[
                    styles.commonDateDay,
                    item.isSunday && styles.sundayText,
                    item.isSaturday && styles.saturdayText,
                  ]}
                >
                  {item.day}일
                </Text>
                <Text
                  style={[
                    styles.commonDateWeek,
                    item.isSunday && styles.sundayText,
                    item.isSaturday && styles.saturdayText,
                  ]}
                >
                  {item.dayOfWeek}
                </Text>
              </View>

              {/* 정보 영역 */}
              <View style={styles.commonCardInfo}>
                <View style={styles.commonCardTop}>
                  <View style={[styles.commonTypeBadge, { backgroundColor: item.badgeBg }]}>
                    <Text style={[styles.commonTypeBadgeText, { color: item.badgeColor }]}>
                      {item.title}
                    </Text>
                  </View>
                </View>

                <Text style={styles.commonDescText}>{item.desc}</Text>

                {/* 멤버 태그 */}
                <View style={styles.commonMemberPillRow}>
                  {item.memberNames.map((name) => (
                    <View key={name} style={styles.commonMemberPill}>
                      <Text style={styles.commonMemberPillText}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 공유 버튼 */}
              <TouchableOpacity
                style={[
                  styles.commonShareBtn,
                  { backgroundColor: theme.primaryTint, borderColor: theme.primaryLight },
                ]}
                onPress={() => onShareSchedule(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.commonShareBtnText, { color: theme.primary }]}>
                  톡방 공유
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commonSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 8,
    borderBottomColor: '#F4F5F7',
  },
  commonHeaderRow: {
    marginBottom: 12,
  },
  commonSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  commonSectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  commonFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  commonList: {
    gap: 10,
  },
  commonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  commonDateBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  sundayDateBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  saturdayDateBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  commonDateDay: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  commonDateWeek: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  sundayText: {
    color: '#EF4444',
  },
  saturdayText: {
    color: '#3B82F6',
  },
  commonCardInfo: {
    flex: 1,
    gap: 4,
  },
  commonCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commonTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  commonTypeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  commonDescText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  commonMemberPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  commonMemberPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  commonMemberPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  commonShareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
  commonShareBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  commonEmptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  commonEmptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
