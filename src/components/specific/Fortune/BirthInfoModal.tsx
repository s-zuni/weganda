import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useFortuneStore } from '../../../store/useFortuneStore';
import { CalendarIcon, ClockIcon } from '../../common/Icon';

export interface BirthInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

import { SajuTimeSlot } from '../../../types/fortune';
import { SAJU_TIME_SLOTS } from '../../../constants/saju';
export type { SajuTimeSlot };
export { SAJU_TIME_SLOTS };

export const BirthInfoModal: React.FC<BirthInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const { birthInfo, setBirthInfo } = useFortuneStore();

  const [date, setDate] = useState(birthInfo.birthDate || '1998-05-14');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(birthInfo.calendarType || 'solar');
  const [gender, setGender] = useState<'female' | 'male'>(birthInfo.gender || 'female');

  // 날짜 입력 모드: 'calendar' (달력 선택) vs 'text' (직접 입력)
  const [dateInputMode, setDateInputMode] = useState<'calendar' | 'text'>('calendar');

  // 달력 내부 네비게이션 상태 (년, 월)
  const initialDateParts = useMemo(() => {
    const parts = (birthInfo.birthDate || '1998-05-14').split('-');
    return {
      year: parseInt(parts[0], 10) || 1998,
      month: parseInt(parts[1], 10) || 5,
      day: parseInt(parts[2], 10) || 14,
    };
  }, [birthInfo.birthDate]);

  const [calYear, setCalYear] = useState(initialDateParts.year);
  const [calMonth, setCalMonth] = useState(initialDateParts.month);
  const [selectedDay, setSelectedDay] = useState(initialDateParts.day);

  // 시간 상태: 사주 12지시 선택 또는 직접 기입
  const [selectedSajuCode, setSelectedSajuCode] = useState<string>(() => {
    if (birthInfo.birthTime === '미상') return 'unknown';
    // 매칭 확인
    const found = SAJU_TIME_SLOTS.find((s) => s.representativeTime === birthInfo.birthTime);
    return found ? found.code : 'o'; // 기본 오시
  });
  const [timeInputMode, setTimeInputMode] = useState<'saju' | 'direct'>('saju');
  const [directTime, setDirectTime] = useState(
    birthInfo.birthTime && birthInfo.birthTime !== '미상' ? birthInfo.birthTime : '12:00'
  );

  // 직접 기입 시 YYYY-MM-DD 형식 자동 변환
  const handleDateTextChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    setDate(formatted);

    // 유효한 8자리 완성 시 캘린더 상태도 동기화
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

  // 시간 직접 기입 시 HH:mm 형식 자동 변환
  const handleTimeTextChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }
    setDirectTime(formatted);
  };

  // 캘린더에서 날짜 선택 시 동기화
  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const mStr = String(calMonth).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    setDate(`${calYear}-${mStr}-${dStr}`);
  };

  const handleYearChange = (delta: number) => {
    const nextYear = calYear + delta;
    if (nextYear >= 1940 && nextYear <= 2026) {
      setCalYear(nextYear);
      const mStr = String(calMonth).padStart(2, '0');
      const dStr = String(selectedDay).padStart(2, '0');
      setDate(`${nextYear}-${mStr}-${dStr}`);
    }
  };

  const handleMonthChange = (month: number) => {
    setCalMonth(month);
    const mStr = String(month).padStart(2, '0');
    const dStr = String(selectedDay).padStart(2, '0');
    setDate(`${calYear}-${mStr}-${dStr}`);
  };

  // 해당 월의 일수 및 시작 요일 계산
  const daysInMonth = useMemo(() => {
    return new Date(calYear, calMonth, 0).getDate();
  }, [calYear, calMonth]);

  const startDayOfWeek = useMemo(() => {
    return new Date(calYear, calMonth - 1, 1).getDay(); // 0(일) ~ 6(토)
  }, [calYear, calMonth]);

  const handleSave = () => {
    if (!date.trim() || date.length < 10) {
      Alert.alert('알림', '생년월일을 올바른 형식(YYYY-MM-DD)으로 입력해주세요.');
      return;
    }

    let finalTime = '12:00';
    if (timeInputMode === 'saju') {
      if (selectedSajuCode === 'unknown') {
        finalTime = '미상';
      } else {
        const slot = SAJU_TIME_SLOTS.find((s) => s.code === selectedSajuCode);
        finalTime = slot ? slot.representativeTime : '12:00';
      }
    } else {
      finalTime = directTime.trim() || '12:00';
    }

    setBirthInfo({
      birthDate: date.trim(),
      birthTime: finalTime,
      calendarType,
      gender,
    });

    Alert.alert('저장 완료', '사주 탄생 정보가 성공적으로 등록되었습니다. 운세가 정밀 분석됩니다!');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* 핸들바 */}
          <View style={styles.handleBar} />

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>사주 탄생 정보 입력</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.bannerNotice}>
              ✨ 태어난 날짜와 시각을 정확히 입력할수록 더욱 정밀한 간호 사주 및 오행 분석 결과를 받아보실 수 있습니다.
            </Text>

            {/* 양력 / 음력 선택 */}
            <Text style={styles.inputLabel}>양력 / 음력</Text>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[styles.segmentBtn, calendarType === 'solar' && styles.segmentBtnActive]}
                onPress={() => setCalendarType('solar')}
              >
                <Text style={[styles.segmentText, calendarType === 'solar' && styles.segmentTextActive]}>
                  양력 (Solar)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, calendarType === 'lunar' && styles.segmentBtnActive]}
                onPress={() => setCalendarType('lunar')}
              >
                <Text style={[styles.segmentText, calendarType === 'lunar' && styles.segmentTextActive]}>
                  음력 (Lunar)
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── 1. 생년월일 섹션 (달력 선택 & 직접 기입 지원) ── */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.inputLabel}>생년월일 선택</Text>
              <View style={styles.modeToggleGroup}>
                <TouchableOpacity
                  style={[styles.modeToggleBtn, dateInputMode === 'calendar' && styles.modeToggleBtnActive]}
                  onPress={() => setDateInputMode('calendar')}
                >
                  <CalendarIcon size={12} color={dateInputMode === 'calendar' ? '#FFFFFF' : COLORS.textSecondary} />
                  <Text style={[styles.modeToggleText, dateInputMode === 'calendar' && styles.modeToggleTextActive]}>
                    달력 선택
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeToggleBtn, dateInputMode === 'text' && styles.modeToggleBtnActive]}
                  onPress={() => setDateInputMode('text')}
                >
                  <Text style={[styles.modeToggleText, dateInputMode === 'text' && styles.modeToggleTextActive]}>
                    직접 기입
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 현재 선택된 생년월일 하이라이트 박스 */}
            <View style={styles.selectedDateBadge}>
              <Text style={styles.selectedDateLabel}>선택된 생일:</Text>
              <Text style={styles.selectedDateValue}>{date || '선택 안 됨'}</Text>
            </View>

            {/* ── A. 달력 피커 모드 ── */}
            {dateInputMode === 'calendar' && (
              <View style={styles.calendarPickerCard}>
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

                {/* 월 가로 칩 스크롤 */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.monthChip, calMonth === m && styles.monthChipActive]}
                      onPress={() => handleMonthChange(m)}
                    >
                      <Text style={[styles.monthChipText, calMonth === m && styles.monthChipTextActive]}>
                        {m}월
                      </Text>
                    </TouchableOpacity>
                  ))}
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
                  {/* 시작 요일 공백 패딩 */}
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
                        style={[styles.dayCell, isSelected && styles.dayCellActive]}
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

            {/* ── B. 직접 기입 모드 (자동 하이픈 변환) ── */}
            {dateInputMode === 'text' && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={handleDateTextChange}
                  placeholder="예: 19980514 입력 시 자동 변환"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text style={styles.fieldHelpText}>
                  💡 숫자 8자리(예: 19980514)만 입력하면 자동으로 YYYY-MM-DD 형태로 변환됩니다.
                </Text>
              </View>
            )}

            {/* ── 2. 태어난 시각 섹션 (사주 12간지 시 선택) ── */}
            <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
              <Text style={styles.inputLabel}>태어난 시각 (사주 12지시)</Text>
              <View style={styles.modeToggleGroup}>
                <TouchableOpacity
                  style={[styles.modeToggleBtn, timeInputMode === 'saju' && styles.modeToggleBtnActive]}
                  onPress={() => setTimeInputMode('saju')}
                >
                  <Text style={[styles.modeToggleText, timeInputMode === 'saju' && styles.modeToggleTextActive]}>
                    12지시 선택
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeToggleBtn, timeInputMode === 'direct' && styles.modeToggleBtnActive]}
                  onPress={() => setTimeInputMode('direct')}
                >
                  <Text style={[styles.modeToggleText, timeInputMode === 'direct' && styles.modeToggleTextActive]}>
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
                        style={[styles.sajuCard, isSelected && styles.sajuCardActive]}
                        onPress={() => setSelectedSajuCode(slot.code)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.sajuCardTitleRow}>
                          <Text style={[styles.sajuName, isSelected && styles.sajuNameActive]}>
                            {slot.name}
                          </Text>
                          <Text style={[styles.sajuHanja, isSelected && styles.sajuHanjaActive]}>
                            {slot.hanja}
                          </Text>
                        </View>
                        <Text style={[styles.sajuRange, isSelected && styles.sajuRangeActive]}>
                          {slot.range}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 시간 모름 선택 버튼 */}
                <TouchableOpacity
                  style={[styles.unknownSlotBtn, selectedSajuCode === 'unknown' && styles.unknownSlotBtnActive]}
                  onPress={() => setSelectedSajuCode('unknown')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.unknownSlotText, selectedSajuCode === 'unknown' && styles.unknownSlotTextActive]}
                  >
                    태어난 시간을 정확히 모릅니다 (시간 미상)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* B. 직접 시간 기입 모드 */}
            {timeInputMode === 'direct' && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={directTime}
                  onChangeText={handleTimeTextChange}
                  placeholder="예: 1430 입력 시 14:30 자동 변환"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Text style={styles.fieldHelpText}>
                  💡 24시간제 기준 숫자 4자리(예: 1430)를 입력하면 HH:mm 형태로 자동 변환됩니다.
                </Text>
              </View>
            )}

            {/* ── 3. 성별 선택 ── */}
            <Text style={[styles.inputLabel, { marginTop: 18 }]}>성별</Text>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[styles.segmentBtn, gender === 'female' && styles.segmentBtnActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>
                  여성 (Female)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, gender === 'male' && styles.segmentBtnActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>
                  남성 (Male)
                </Text>
              </TouchableOpacity>
            </View>

            {/* 저장 버튼 */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>사주 정보 저장 및 정밀 분석하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bannerNotice: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: '#FFF1F4',
    padding: 12,
    borderRadius: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDateLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  selectedDateValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  calendarPickerCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  yearControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  yearNavBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearNavText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  currentYearText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  monthScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  monthChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  monthChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  weekHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    marginVertical: 1,
  },
  dayCellActive: {
    backgroundColor: COLORS.primary,
  },
  dayCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dayCellTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldHelpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  sajuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  sajuCard: {
    width: '31.5%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sajuCardActive: {
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primary,
  },
  sajuCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 2,
  },
  sajuName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sajuNameActive: {
    color: COLORS.primary,
  },
  sajuHanja: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  sajuHanjaActive: {
    color: COLORS.primary,
  },
  sajuRange: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  sajuRangeActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  unknownSlotBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  unknownSlotBtnActive: {
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primary,
  },
  unknownSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  unknownSlotTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default BirthInfoModal;
