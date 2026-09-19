import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { ShiftCode, ShiftInfo, SHIFT_TYPES } from '../../../../constants/shiftTypes';
import { nativeCalendarService } from '../../../../services/nativeCalendarService';
import Svg, { Path } from 'react-native-svg';

interface HomeMonthlyCalendarProps {
  currentDate: Date;
  schedules: Record<string, string>;
  customCodes: Record<string, any>;
  onMonthChange: (offset: number) => void;
  onSelectDate?: (dateKey: string) => void;
  selectedDateKey?: string | null;
}

export const HomeMonthlyCalendar: React.FC<HomeMonthlyCalendarProps> = ({
  currentDate,
  schedules,
  customCodes,
  onMonthChange,
  onSelectDate,
  selectedDateKey: propSelectedDateKey,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(
    () =>
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`,
    [today]
  );

  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(todayKey);
  const selectedDateKey = propSelectedDateKey !== undefined ? propSelectedDateKey : internalSelectedDate;

  // 기기 기본 캘린더 개인 일정 개수 (YYYY-MM-DD -> count)
  const [nativeEventsMap, setNativeEventsMap] = useState<Record<string, number>>({});
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (0: 1월)

  // 월 변경 시 스마트폰 기본 캘린더 일정 카운트 조회
  useEffect(() => {
    let isMounted = true;
    setIsLoadingEvents(true);
    nativeCalendarService
      .getMonthlyNativeEventsCount(year, month)
      .then((counts) => {
        if (isMounted) {
          setNativeEventsMap(counts);
          setIsLoadingEvents(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingEvents(false);
      });
    return () => {
      isMounted = false;
    };
  }, [year, month]);

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // 당월 1일의 요일 인덱스 (0: 일요일 ~ 6: 토요일)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // 당월 총 일수
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getShiftDisplay = (dateKey: string) => {
    const code = schedules[dateKey];
    const nativeCount = nativeEventsMap[dateKey] || 0;

    let shiftInfo: ShiftInfo | null = null;
    if (code) {
      if (customCodes[code]) {
        shiftInfo = customCodes[code];
      } else if (code in SHIFT_TYPES) {
        shiftInfo = SHIFT_TYPES[code];
      } else {
        shiftInfo = {
          code,
          name: code,
          shortName: code,
          color: COLORS.primary,
          textColor: '#FFFFFF',
          description: code,
        };
      }
    }

    return {
      code,
      shiftInfo,
      nativeCount,
    };
  };

  const handleCellPress = (dateKey: string) => {
    setInternalSelectedDate(dateKey);
    onSelectDate?.(dateKey);
  };

  const renderCells = () => {
    const cells = [];

    // 1일 이전 빈칸 패딩
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // 1일 ~ 말일 셀
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      const isToday = dateKey === todayKey;
      const isSelected = dateKey === selectedDateKey;
      const { code, shiftInfo, nativeCount } = getShiftDisplay(dateKey);

      // 근무 코드 색상 결정 (D: 파랑, E: 초록, N: 네이비, O: 핑크)
      const codeColor = shiftInfo ? shiftInfo.color : COLORS.textMuted;

      cells.push(
        <TouchableOpacity
          key={dateKey}
          style={styles.dayCell}
          onPress={() => handleCellPress(dateKey)}
          activeOpacity={0.7}
        >
          {/* 날짜 숫자 컨테이너 (오늘 또는 선택일일 때 시안 13일 형태의 라운드 박스 하이라이트) */}
          <View
            style={[
              styles.dateNumberBox,
              (isToday || isSelected) && styles.todayNumberBox,
            ]}
          >
            <Text
              style={[
                styles.dayNumberText,
                (isToday || isSelected) && styles.todayNumberText,
              ]}
            >
              {day}
            </Text>
          </View>

          {/* 날짜 하단 근무 코드 및 개인 일정 카운트 표기 (예: D, E+1, O) */}
          <View style={styles.dutyContainer}>
            {code ? (
              <View style={styles.dutyBadgeRow}>
                <Text style={[styles.dutyCodeText, { color: codeColor }]}>
                  {code}
                </Text>
                {nativeCount > 0 && (
                  <Text style={[styles.nativeCountText, { color: codeColor }]}>
                    +{nativeCount}
                  </Text>
                )}
              </View>
            ) : nativeCount > 0 ? (
              <Text style={styles.standaloneCountText}>+{nativeCount}</Text>
            ) : (
              <View style={styles.emptyDutyPlaceholder} />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      {/* 캘린더 상단 월 헤더 & 이전/다음 네비게이션 */}
      <View style={styles.headerRow}>
        <Text style={styles.monthTitle}>
          {year}년 {month + 1}월
        </Text>

        <View style={styles.navBtnRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => onMonthChange(-1)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="이전 달"
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19L8 12L15 5" stroke="#3182F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => onMonthChange(1)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="다음 달"
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M9 5L16 12L9 19" stroke="#3182F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* 요일 헤더 행 (일 월 화 수 목 금 토) */}
      <View style={styles.weekRow}>
        {daysOfWeek.map((dayName, idx) => (
          <View key={dayName} style={styles.weekDayHeader}>
            <Text
              style={[
                styles.weekDayHeaderText,
                idx === 0 && styles.sundayHeaderText,
              ]}
            >
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.gridContainer}>{renderCells()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#191F28',
    letterSpacing: -0.3,
  },
  navBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekDayHeaderText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B95A1',
  },
  sundayHeaderText: {
    color: '#8B95A1',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 52,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dateNumberBox: {
    width: 32,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayNumberBox: {
    backgroundColor: '#E8F3FF', // 시안 13일의 연한 하늘색 라운드 박스
  },
  dayNumberText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191F28',
    letterSpacing: -0.2,
  },
  todayNumberText: {
    color: '#191F28',
    fontWeight: '700',
  },
  dutyContainer: {
    minHeight: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  dutyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dutyCodeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  nativeCountText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 1,
  },
  standaloneCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3182F6',
  },
  emptyDutyPlaceholder: {
    height: 14,
  },
});

export default HomeMonthlyCalendar;
