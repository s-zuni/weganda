import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { COLORS, TINT_COLORS } from '../../../../constants/theme';
import { ShiftCode, ShiftInfo, SHIFT_TYPES } from '../../../../constants/shiftTypes';
import { CustomShiftCode } from '../../../../types/shift';
import { nativeCalendarService } from '../../../../services/nativeCalendarService';

interface HomeMonthlyCalendarProps {
  currentDate: Date;
  schedules: Record<string, string>;
  customCodes: Record<string, CustomShiftCode>;
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

  // 해당 달(year, month)의 데이/이브닝/나이트/오프 개수 집계
  const monthlyShiftCounts = useMemo(() => {
    let d = 0;
    let e = 0;
    let n = 0;
    let o = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      const code = schedules[dateKey];

      if (code) {
        if (code === 'D') d++;
        else if (code === 'E') e++;
        else if (code === 'N') n++;
        else if (code === 'O') o++;
        else if (customCodes[code]) {
          if (customCodes[code].isOff) o++;
          else if (customCodes[code].code === 'D') d++;
          else if (customCodes[code].code === 'E') e++;
          else if (customCodes[code].code === 'N') n++;
        }
      }
    }

    return { D: d, E: e, N: n, O: o };
  }, [schedules, customCodes, year, month, daysInMonth]);

  // 좌우 스와이프로 자유롭게 이전/다음 달 이동 제스처
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // 세로 스크롤을 방해하지 않도록 가로 이동이 세로 이동보다 크고 최소 12px 이상 움직였을 때만 캡처
          return (
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5 &&
            Math.abs(gestureState.dx) > 12
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -35 || gestureState.vx < -0.3) {
            // 왼쪽으로 스와이프 -> 다음 달로 이동
            onMonthChange(1);
          } else if (gestureState.dx > 35 || gestureState.vx > 0.3) {
            // 오른쪽으로 스와이프 -> 이전 달로 이동
            onMonthChange(-1);
          }
        },
      }),
    [onMonthChange]
  );

  const getShiftDisplay = (dateKey: string) => {
    const code = schedules[dateKey];
    const nativeCount = nativeEventsMap[dateKey] || 0;

    let shiftInfo: ShiftInfo | CustomShiftCode | null = null;
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

  const renderCalendarWeeks = () => {
    const allCells: React.ReactNode[] = [];

    // 1일 이전 빈칸 패딩
    for (let i = 0; i < firstDayIndex; i++) {
      allCells.push(<View key={`empty-start-${i}`} style={styles.dayCell} />);
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

      allCells.push(
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

    // 마지막 주 빈칸 패딩 (7의 배수로 맞추기)
    const remainder = allCells.length % 7;
    if (remainder > 0) {
      const emptyCount = 7 - remainder;
      for (let i = 0; i < emptyCount; i++) {
        allCells.push(<View key={`empty-end-${i}`} style={styles.dayCell} />);
      }
    }

    // 7개씩 행 단위(weekRow)로 묶기
    const weekRows = [];
    for (let i = 0; i < allCells.length; i += 7) {
      const weekCells = allCells.slice(i, i + 7);
      weekRows.push(
        <View key={`week-${i / 7}`} style={styles.calendarWeekRow}>
          {weekCells}
        </View>
      );
    }

    return weekRows;
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* 캘린더 상단 월 헤더 & 해당 달 스케줄 카운트 (텍스트/스케줄별 색상 표시) */}
      <View style={styles.headerRow}>
        <Text style={styles.monthTitle}>
          {year}년 {month + 1}월
        </Text>

        <View style={styles.shiftCountsRow}>
          <Text style={[styles.shiftCountItem, { color: SHIFT_TYPES.D.color }]}>
            D <Text style={styles.shiftCountNum}>{monthlyShiftCounts.D}</Text>
          </Text>
          <Text style={styles.countDivider}>·</Text>
          <Text style={[styles.shiftCountItem, { color: SHIFT_TYPES.E.color }]}>
            E <Text style={styles.shiftCountNum}>{monthlyShiftCounts.E}</Text>
          </Text>
          <Text style={styles.countDivider}>·</Text>
          <Text style={[styles.shiftCountItem, { color: SHIFT_TYPES.N.color }]}>
            N <Text style={styles.shiftCountNum}>{monthlyShiftCounts.N}</Text>
          </Text>
          <Text style={styles.countDivider}>·</Text>
          <Text style={[styles.shiftCountItem, { color: SHIFT_TYPES.O.color }]}>
            OFF <Text style={styles.shiftCountNum}>{monthlyShiftCounts.O}</Text>
          </Text>
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

      {/* 날짜 그리드 (주 단위 행 묶음) */}
      <View style={styles.gridContainer}>{renderCalendarWeeks()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  shiftCountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftCountItem: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  shiftCountNum: {
    fontWeight: '800',
  },
  countDivider: {
    fontSize: 11,
    color: '#D1D5DB',
    fontWeight: '400',
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
    color: COLORS.textMuted,
  },
  sundayHeaderText: {
    color: COLORS.textMuted,
  },
  gridContainer: {
    width: '100%',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dayCell: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    backgroundColor: TINT_COLORS.blueTint, // 시안 13일의 연한 하늘색 라운드 박스
  },
  dayNumberText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  todayNumberText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  dutyContainer: {
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dutyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dutyCodeText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  nativeCountText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 1,
  },
  standaloneCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.shift.day,
  },
  emptyDutyPlaceholder: {
    height: 14,
  },
});

export default HomeMonthlyCalendar;
