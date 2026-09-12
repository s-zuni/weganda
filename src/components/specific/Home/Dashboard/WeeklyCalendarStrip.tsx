import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { SHIFT_TYPES } from '../../../../constants/shiftTypes';
import { ShiftCode, ShiftInfo } from '../../../../types/shift';

export interface WeekDayItem {
  day: string;
  date: number;
  month?: number;
  dateKey: string;
  shift: ShiftCode | string | null;
  shiftInfo?: ShiftInfo | null;
  isToday: boolean;
}

interface WeeklyCalendarStripProps {
  weekData: WeekDayItem[];
}

export const WeeklyCalendarStrip: React.FC<WeeklyCalendarStripProps> = ({ weekData }) => {
  const theme = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isScrolledAway, setIsScrolledAway] = useState(false);

  // 오늘 인덱스 탐색
  const todayIndex = useMemo(() => {
    const idx = weekData.findIndex((item) => item.isToday);
    return idx >= 0 ? idx : Math.floor(weekData.length / 2);
  }, [weekData]);

  // 카드 내부 좌우 패딩: 12 * 2 = 24
  const innerWidth = containerWidth > 0 ? containerWidth - 24 : Dimensions.get('window').width - 64;
  // 항상 정확히 7일이 한 화면에 꼭 맞게 보이도록 너비 계산
  const itemWidth = Math.floor(innerWidth / 7);

  // 오늘이 정중앙(7개 중 4번째인 index 3)에 위치하도록 스크롤 오프셋 산출
  const getTodayScrollX = () => {
    return Math.max(0, (todayIndex - 3) * itemWidth);
  };

  const scrollToToday = (animated = true) => {
    scrollViewRef.current?.scrollTo({ x: getTodayScrollX(), animated });
  };

  // 컴포넌트 마운트 및 카드 너비 측정 시 오늘이 정중앙에 오도록 즉각 스크롤
  useEffect(() => {
    if (containerWidth > 0 && itemWidth > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: getTodayScrollX(), animated: false });
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [containerWidth, itemWidth, todayIndex]);

  // 스와이프하여 오늘 위치에서 벗어났는지 감지
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentX = e.nativeEvent.contentOffset.x;
    const targetX = getTodayScrollX();
    const diff = Math.abs(currentX - targetX);
    const away = diff > itemWidth * 1.5;
    if (away !== isScrolledAway) {
      setIsScrolledAway(away);
    }
  };

  return (
    <View
      style={styles.weekCard}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - containerWidth) > 1) {
          setContainerWidth(w);
        }
      }}
    >
      {/* 사용자가 이전/이후 스케줄로 쓸어 넘겼을 때 원터치로 오늘 복귀하는 플로팅 복귀 칩 */}
      {isScrolledAway && (
        <View style={styles.todayHeaderRow}>
          <TouchableOpacity
            style={[styles.todayResetBtn, { backgroundColor: theme.primaryTint }]}
            onPress={() => scrollToToday(true)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.todayResetText, { color: theme.primary }]}>‹ 오늘로 이동</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={itemWidth}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {weekData.map((item) => {
          const shiftInfo = item.shiftInfo || (item.shift ? (SHIFT_TYPES as any)[item.shift] : null);
          const isSunday = item.day === '일';
          const isSaturday = item.day === '토';

          return (
            <View key={item.dateKey} style={[styles.dayColumn, { width: itemWidth }]}>
              {/* 요일 */}
              <Text
                style={[
                  styles.dayLabel,
                  isSunday && styles.sundayLabel,
                  isSaturday && styles.saturdayLabel,
                ]}
              >
                {item.day}
              </Text>

              {/* 날짜 또는 오늘 원형 뱃지 (높이를 36px로 완벽 통일) */}
              <View style={styles.dateSlot}>
                {item.isToday ? (
                  <View style={[styles.todayCircle, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.todaySubText, { color: theme.onPrimaryText }]}>오늘</Text>
                    <Text style={[styles.todayDateText, { color: theme.onPrimaryText }]}>
                      {item.date}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.dateText,
                      isSunday && styles.sundayLabel,
                      isSaturday && styles.saturdayLabel,
                    ]}
                  >
                    {item.date === 1 && item.month ? `${item.month}.1` : item.date}
                  </Text>
                )}
              </View>

              {/* 근무 코드 뱃지 (D, E, N, OFF 등) */}
              {item.shift && shiftInfo ? (
                <View style={[styles.shiftBadge, { backgroundColor: shiftInfo.color }]}>
                  <Text
                    style={[
                      styles.shiftBadgeText,
                      { color: shiftInfo.textColor || '#FFFFFF' },
                    ]}
                  >
                    {item.shift === 'O' || shiftInfo.isOff ? 'OFF' : (shiftInfo.shortName || item.shift)}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyShiftSpace} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  weekCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  todayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  todayResetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayResetText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  sundayLabel: {
    color: COLORS.status.error,
  },
  saturdayLabel: {
    color: COLORS.status.info,
  },
  dateSlot: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  todayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todaySubText: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 10,
  },
  todayDateText: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 15,
  },
  shiftBadge: {
    width: 38,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftBadgeText: {
    fontSize: 13,
    fontWeight: '900',
  },
  emptyShiftSpace: {
    height: 28,
  },
});
