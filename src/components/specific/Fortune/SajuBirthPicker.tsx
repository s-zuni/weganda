import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SAJU_TIME_SLOTS } from '../../../constants/saju';

export interface SajuBirthPickerProps {
  title?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm or '미상'
  calendarType: 'solar' | 'lunar';
  gender?: 'female' | 'male';
  showGender?: boolean;
  onChangeDate?: (date: string) => void;
  onChangeTime?: (time: string) => void;
  onChangeCalendarType?: (type: 'solar' | 'lunar') => void;
  onChangeGender?: (gender: 'female' | 'male') => void;
  onDateChange?: (date: string) => void;
  onTimeChange?: (time: string) => void;
  onCalendarTypeChange?: (type: 'solar' | 'lunar') => void;
  onGenderChange?: (gender: 'female' | 'male') => void;
  accentColor?: string;
  titlePrefix?: string;
  isRegistered?: boolean;
}

export const SajuBirthPicker: React.FC<SajuBirthPickerProps> = ({
  title,
  birthDate,
  birthTime,
  calendarType,
  gender = 'female',
  showGender = true,
  onChangeDate,
  onChangeTime,
  onChangeCalendarType,
  onChangeGender,
  onDateChange,
  onTimeChange,
  onCalendarTypeChange,
  onGenderChange,
  accentColor = '#FF507C',
  titlePrefix = '',
  isRegistered = false,
}) => {
  const triggerDateChange = onChangeDate || onDateChange || (() => {});
  const triggerTimeChange = onChangeTime || onTimeChange || (() => {});
  const triggerCalendarChange = onChangeCalendarType || onCalendarTypeChange || (() => {});
  const triggerGenderChange = onChangeGender || onGenderChange;

  // 날짜 입력 모드: 'calendar' (달력) vs 'text' (직접 기입)
  const [dateInputMode, setDateInputMode] = useState<'calendar' | 'text'>('calendar');

  // 시간 입력 모드: 'saju' (12지시) vs 'direct' (직접 입력)
  const [timeInputMode, setTimeInputMode] = useState<'saju' | 'direct'>('saju');

  // 날짜 파싱 및 캘린더 상태
  const parsedDate = useMemo(() => {
    const parts = (birthDate || '1996-05-18').split('-');
    return {
      year: parseInt(parts[0], 10) || 1996,
      month: parseInt(parts[1], 10) || 5,
      day: parseInt(parts[2], 10) || 18,
    };
  }, [birthDate]);

  const [calYear, setCalYear] = useState(parsedDate.year);
  const [calMonth, setCalMonth] = useState(parsedDate.month);
  const [selectedDay, setSelectedDay] = useState(parsedDate.day);

  useEffect(() => {
    setCalYear(parsedDate.year);
    setCalMonth(parsedDate.month);
    setSelectedDay(parsedDate.day);
  }, [parsedDate]);

  // 달력 계산 (해당 월의 일수 및 1일의 요일)
  const daysInMonth = useMemo(() => {
    return new Date(calYear, calMonth, 0).getDate();
  }, [calYear, calMonth]);

  const startDayOfWeek = useMemo(() => {
    return new Date(calYear, calMonth - 1, 1).getDay();
  }, [calYear, calMonth]);

  // 연도 변경 핸들러
  const handleYearChange = (delta: number) => {
    const newYear = Math.max(1930, Math.min(2026, calYear + delta));
    setCalYear(newYear);
    const maxDayInNewMonth = new Date(newYear, calMonth, 0).getDate();
    const newDay = Math.min(selectedDay, maxDayInNewMonth);
    setSelectedDay(newDay);
    const formatted = `${newYear}-${String(calMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
    triggerDateChange(formatted);
  };

  // 월 변경 핸들러
  const handleMonthChange = (month: number) => {
    setCalMonth(month);
    const maxDayInNewMonth = new Date(calYear, month, 0).getDate();
    const newDay = Math.min(selectedDay, maxDayInNewMonth);
    setSelectedDay(newDay);
    const formatted = `${calYear}-${String(month).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
    triggerDateChange(formatted);
  };

  // 일자 선택 핸들러
  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const formatted = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    triggerDateChange(formatted);
  };

  // 날짜 직접 입력 핸들러 (8자리 숫자 입력 시 YYYY-MM-DD 자동 변환)
  const handleDateTextChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    triggerDateChange(formatted);

    if (digits.length === 8) {
      const y = parseInt(digits.slice(0, 4), 10);
      const m = parseInt(digits.slice(4, 6), 10);
      const d = parseInt(digits.slice(6, 8), 10);
      if (y >= 1930 && y <= 2026 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        setCalYear(y);
        setCalMonth(m);
        setSelectedDay(d);
      }
    }
  };

  // 12지시 선택 코드 매칭
  const selectedSajuCode = useMemo(() => {
    if (birthTime === '미상') return 'unknown';
    const found = SAJU_TIME_SLOTS.find(
      (s) => s.representativeTime === birthTime || birthTime.includes(s.name)
    );
    return found ? found.code : 'o'; // 기본 오시
  }, [birthTime]);

  const handleSelectSajuSlot = (code: string) => {
    if (code === 'unknown') {
      triggerTimeChange('미상');
      return;
    }
    const slot = SAJU_TIME_SLOTS.find((s) => s.code === code);
    if (slot) {
      triggerTimeChange(slot.representativeTime);
    }
  };

  // 시간 직접 입력 핸들러
  const handleDirectTimeChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }
    triggerTimeChange(formatted);
  };

  return (
    <View style={styles.container}>
      {/* ── 제목 및 자동 연동 뱃지 ── */}
      {Boolean(title) && (
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: '#1F2937' }]}>{title}</Text>
          {isRegistered && (
            <View style={styles.autoFilledBadge}>
              <Text style={styles.autoFilledText}>자동 연동됨</Text>
            </View>
          )}
        </View>
      )}

      {/* ── 상단 탭: 양력/음력 및 성별 ── */}
      <View style={styles.topControlRow}>
        {/* 양력 / 음력 토글 */}
        <View style={styles.segmentGroup}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              calendarType === 'solar' && { backgroundColor: accentColor },
            ]}
            onPress={() => triggerCalendarChange('solar')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                calendarType === 'solar' && styles.segmentTextActive,
              ]}
            >
              양력 (Solar)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              calendarType === 'lunar' && { backgroundColor: accentColor },
            ]}
            onPress={() => triggerCalendarChange('lunar')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                calendarType === 'lunar' && styles.segmentTextActive,
              ]}
            >
              음력 (Lunar)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 성별 선택 (필요 시) */}
        {showGender && Boolean(triggerGenderChange) && (
          <View style={styles.segmentGroup}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                gender === 'female' && { backgroundColor: accentColor },
              ]}
              onPress={() => triggerGenderChange && triggerGenderChange('female')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  gender === 'female' && styles.segmentTextActive,
                ]}
              >
                여성
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                gender === 'male' && { backgroundColor: accentColor },
              ]}
              onPress={() => triggerGenderChange && triggerGenderChange('male')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  gender === 'male' && styles.segmentTextActive,
                ]}
              >
                남성
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── 1. 생년월일 섹션 (달력 모드 & 직접 기입 지원) ── */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.labelWrap}>
          <Ionicons name="calendar-outline" size={16} color={accentColor} />
          <Text style={styles.sectionTitle}>
            {titlePrefix ? `${titlePrefix} 생년월일` : '생년월일 선택'}
          </Text>
        </View>

        <View style={styles.modeToggleGroup}>
          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              dateInputMode === 'calendar' && { backgroundColor: accentColor },
            ]}
            onPress={() => setDateInputMode('calendar')}
          >
            <Text
              style={[
                styles.modeToggleText,
                dateInputMode === 'calendar' && styles.modeToggleTextActive,
              ]}
            >
              달력 선택
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              dateInputMode === 'text' && { backgroundColor: accentColor },
            ]}
            onPress={() => setDateInputMode('text')}
          >
            <Text
              style={[
                styles.modeToggleText,
                dateInputMode === 'text' && styles.modeToggleTextActive,
              ]}
            >
              직접 기입
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 현재 선택된 날짜 하이라이트 배지 */}
      <View style={[styles.selectedDateBadge, { borderColor: `${accentColor}30` }]}>
        <Text style={styles.selectedDateLabel}>선택 일자:</Text>
        <Text style={[styles.selectedDateValue, { color: accentColor }]}>
          {birthDate || '선택 안 됨'}
        </Text>
      </View>

      {/* A. 달력 피커 모드 */}
      {dateInputMode === 'calendar' && (
        <View style={styles.calendarCard}>
          {/* 연도 변경 컨트롤 */}
          <View style={styles.yearControlRow}>
            <TouchableOpacity
              style={styles.yearNavBtn}
              onPress={() => handleYearChange(-5)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.yearNavText}>« -5년</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.yearNavBtn}
              onPress={() => handleYearChange(-1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.yearNavText}>‹ -1년</Text>
            </TouchableOpacity>

            <Text style={styles.currentYearText}>{calYear}년</Text>

            <TouchableOpacity
              style={styles.yearNavBtn}
              onPress={() => handleYearChange(1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.yearNavText}>+1년 ›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.yearNavBtn}
              onPress={() => handleYearChange(5)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.yearNavText}>+5년 »</Text>
            </TouchableOpacity>
          </View>

          {/* 월 가로 스크롤 칩 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthScroll}
            contentContainerStyle={styles.monthScrollContent}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
              const isActive = calMonth === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.monthChip,
                    isActive && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => handleMonthChange(m)}
                >
                  <Text
                    style={[
                      styles.monthChipText,
                      isActive && styles.monthChipTextActive,
                    ]}
                  >
                    {m}월
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 요일 헤더 */}
          <View style={styles.weekHeaderRow}>
            {['일', '월', '화', '수', '목', '금', '토'].map((w, idx) => (
              <Text
                key={w}
                style={[
                  styles.weekHeaderText,
                  idx === 0 && { color: '#EF4444' },
                  idx === 6 && { color: '#3B82F6' },
                ]}
              >
                {w}
              </Text>
            ))}
          </View>

          {/* 날짜 그리드 */}
          <View style={styles.daysGrid}>
            {/* 시작 요일 공백 */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <View key={`empty_${idx}`} style={styles.dayCell} />
            ))}

            {/* 일자 셀 */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              const dayOfWeek = (startDayOfWeek + idx) % 7;
              return (
                <TouchableOpacity
                  key={`day_${dayNum}`}
                  style={[
                    styles.dayCell,
                    isSelected && [styles.dayCellActive, { backgroundColor: accentColor }],
                  ]}
                  onPress={() => handleSelectDay(dayNum)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      isSelected && styles.dayCellTextActive,
                      !isSelected && dayOfWeek === 0 && { color: '#EF4444' },
                      !isSelected && dayOfWeek === 6 && { color: '#3B82F6' },
                    ]}
                  >
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* B. 직접 기입 모드 */}
      {dateInputMode === 'text' && (
        <View style={styles.textInputBox}>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={handleDateTextChange}
            placeholder="예: 19960518 입력 시 자동 변환"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.helpText}>
            💡 숫자 8자리(예: 19960518)만 입력하면 자동으로 YYYY-MM-DD 형태로 변환됩니다.
          </Text>
        </View>
      )}

      {/* ── 2. 태어난 시각 섹션 (사주 12지시 선택) ── */}
      <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
        <View style={styles.labelWrap}>
          <Ionicons name="time-outline" size={16} color={accentColor} />
          <Text style={styles.sectionTitle}>
            {titlePrefix ? `${titlePrefix} 태어난 시각` : '태어난 시각 (12지시)'}
          </Text>
        </View>

        <View style={styles.modeToggleGroup}>
          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              timeInputMode === 'saju' && { backgroundColor: accentColor },
            ]}
            onPress={() => setTimeInputMode('saju')}
          >
            <Text
              style={[
                styles.modeToggleText,
                timeInputMode === 'saju' && styles.modeToggleTextActive,
              ]}
            >
              12지시 선택
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              timeInputMode === 'direct' && { backgroundColor: accentColor },
            ]}
            onPress={() => setTimeInputMode('direct')}
          >
            <Text
              style={[
                styles.modeToggleText,
                timeInputMode === 'direct' && styles.modeToggleTextActive,
              ]}
            >
              직접 입력
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* A. 12간지 시 선택 그리드 */}
      {timeInputMode === 'saju' && (
        <View>
          <View style={styles.sajuGrid}>
            {SAJU_TIME_SLOTS.map((slot) => {
              const isSelected = selectedSajuCode === slot.code;
              return (
                <TouchableOpacity
                  key={slot.code}
                  style={[
                    styles.sajuCard,
                    isSelected && [
                      styles.sajuCardActive,
                      { borderColor: accentColor, backgroundColor: `${accentColor}12` },
                    ],
                  ]}
                  onPress={() => handleSelectSajuSlot(slot.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.sajuCardTitleRow}>
                    <Text
                      style={[
                        styles.sajuName,
                        isSelected && { color: accentColor, fontWeight: '800' },
                      ]}
                    >
                      {slot.name}
                    </Text>
                    <Text
                      style={[
                        styles.sajuHanja,
                        isSelected && { color: accentColor },
                      ]}
                    >
                      {slot.hanja}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.sajuRange,
                      isSelected && { color: accentColor, fontWeight: '700' },
                    ]}
                  >
                    {slot.range}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 시간 모름 선택 버튼 */}
          <TouchableOpacity
            style={[
              styles.unknownSlotBtn,
              selectedSajuCode === 'unknown' && [
                styles.unknownSlotBtnActive,
                { borderColor: accentColor, backgroundColor: `${accentColor}15` },
              ],
            ]}
            onPress={() => handleSelectSajuSlot('unknown')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="help-circle-outline"
              size={16}
              color={selectedSajuCode === 'unknown' ? accentColor : '#6B7280'}
            />
            <Text
              style={[
                styles.unknownSlotText,
                selectedSajuCode === 'unknown' && { color: accentColor, fontWeight: '800' },
              ]}
            >
              태어난 시간을 정확히 모릅니다 (시간 미상)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* B. 직접 시간 기입 모드 */}
      {timeInputMode === 'direct' && (
        <View style={styles.textInputBox}>
          <TextInput
            style={styles.input}
            value={birthTime === '미상' ? '' : birthTime}
            onChangeText={handleDirectTimeChange}
            placeholder="예: 1430 입력 시 14:30 자동 변환"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.helpText}>
            💡 숫자 4자리(예: 1430)만 입력하면 자동으로 14:30 형태로 변환됩니다.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  topControlRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  segmentGroup: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  modeToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  selectedDateLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDateValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  calendarCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  yearControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  yearNavBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearNavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  currentYearText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  monthScroll: {
    marginBottom: 10,
  },
  monthScrollContent: {
    gap: 6,
  },
  monthChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  monthChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
    marginBottom: 6,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
  },
  dayCellActive: {
    borderRadius: 8,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  dayCellTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  textInputBox: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  helpText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sajuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  sajuCard: {
    width: '23.5%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  sajuCardActive: {
    borderWidth: 1.5,
  },
  sajuCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  sajuName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  sajuHanja: {
    fontSize: 10,
    color: '#6B7280',
  },
  sajuRange: {
    fontSize: 8.5,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  unknownSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 8,
  },
  unknownSlotBtnActive: {
    borderWidth: 1.5,
  },
  unknownSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  autoFilledBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  autoFilledText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
});
