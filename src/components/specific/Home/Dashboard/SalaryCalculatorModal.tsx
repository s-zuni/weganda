import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { useSalaryStore } from '../../../../store/useSalaryStore';
import { useShiftScheduleStore } from '../../../../store/useShiftScheduleStore';
import { ChartBarIcon } from '../../../common/Icon';

interface SalaryCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SalaryCalculatorModal: React.FC<SalaryCalculatorModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useAppTheme();
  const {
    baseSalary,
    customNightAllowance,
    customHolidayAllowance,
    setBaseSalary,
    setCustomNightAllowance,
    setCustomHolidayAllowance,
    getInferredNightRate,
    getInferredHolidayRate,
  } = useSalaryStore();

  const { schedules, currentDate, customCodes } = useShiftScheduleStore();

  // 입력 폼 로컬 상태
  const [inputBase, setInputBase] = useState<string>(baseSalary ? String(baseSalary) : '2800000');
  const [inputNightRate, setInputNightRate] = useState<string>(
    customNightAllowance ? String(customNightAllowance) : ''
  );
  const [inputHolidayRate, setInputHolidayRate] = useState<string>(
    customHolidayAllowance ? String(customHolidayAllowance) : ''
  );

  // 현재 월의 YYYY-MM
  const currentYm = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  const monthLabel = `${currentDate.getMonth() + 1}월`;

  // 1. 해당 달의 나이트(N) 일수 자동 계산
  const nightCount = useMemo(() => {
    return Object.entries(schedules).filter(([dateKey, code]) => {
      if (!dateKey.startsWith(currentYm)) return false;
      if (code === 'N') return true;
      const custom = customCodes[code];
      return custom && custom.name && custom.name.includes('나이트');
    }).length;
  }, [schedules, currentYm, customCodes]);

  // 2. 해당 달의 주말/휴일 근무 일수 계산 (토, 일요일 근무)
  const holidayWorkCount = useMemo(() => {
    return Object.entries(schedules).filter(([dateKey, code]) => {
      if (!dateKey.startsWith(currentYm)) return false;
      const d = new Date(dateKey);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (!isWeekend) return false;
      if (code === 'O' || code === 'V' || code === '/' || code === 'OFF') return false;
      const custom = customCodes[code];
      if (custom && custom.isOff) return false;
      return true;
    }).length;
  }, [schedules, currentYm, customCodes]);

  // 숫자 파싱
  const parsedBase = parseInt(inputBase.replace(/[^0-9]/g, ''), 10) || 0;
  const parsedNightRate = inputNightRate ? parseInt(inputNightRate.replace(/[^0-9]/g, ''), 10) : null;
  const parsedHolidayRate = inputHolidayRate ? parseInt(inputHolidayRate.replace(/[^0-9]/g, ''), 10) : null;

  // 유추 단가 계산
  const inferredNightRate = useMemo(() => getInferredNightRate(parsedBase), [getInferredNightRate, parsedBase]);
  const inferredHolidayRate = useMemo(() => getInferredHolidayRate(parsedBase), [getInferredHolidayRate, parsedBase]);

  // 실제 적용 단가
  const effectiveNightRate = parsedNightRate !== null && parsedNightRate > 0 ? parsedNightRate : inferredNightRate;
  const effectiveHolidayRate = parsedHolidayRate !== null && parsedHolidayRate > 0 ? parsedHolidayRate : inferredHolidayRate;

  // 총 예상 수당 및 급여
  const totalNightPay = nightCount * effectiveNightRate;
  const totalHolidayPay = holidayWorkCount * effectiveHolidayRate;
  const totalEstimatedSalary = parsedBase + totalNightPay + totalHolidayPay;

  const handleSave = () => {
    setBaseSalary(parsedBase);
    setCustomNightAllowance(parsedNightRate);
    setCustomHolidayAllowance(parsedHolidayRate);
    Alert.alert('설정 완료', `${monthLabel} 예상 급여 및 수당 설정이 저장되었습니다.`, [
      { text: '확인', onPress: onClose },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.headerIconCircle, { backgroundColor: theme.primary }]}>
                <ChartBarIcon size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>{monthLabel} 수당 및 월급 예측기</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* 이번 달 스케줄 자동 연동 요약 */}
            <View style={styles.scheduleBadgeCard}>
              <Text style={styles.scheduleBadgeTitle}>📅 {monthLabel} 근무표 자동 연동 결과</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeLabel}>나이트 (N)</Text>
                  <Text style={[styles.badgeValue, { color: theme.primary }]}>{nightCount}일</Text>
                </View>
                <View style={styles.badgeDivider} />
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeLabel}>주말/휴일 근무</Text>
                  <Text style={[styles.badgeValue, { color: '#F59E0B' }]}>{holidayWorkCount}일</Text>
                </View>
              </View>
            </View>

            {/* 입력 폼 */}
            <View style={styles.inputSection}>
              {/* 1. 기본급 */}
              <Text style={styles.inputLabel}>월 기본급 (원) <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={parsedBase ? parsedBase.toLocaleString() : ''}
                placeholder="예: 2,800,000"
                placeholderTextColor={COLORS.textMuted}
                onChangeText={(val) => setInputBase(val.replace(/[^0-9]/g, ''))}
              />

              {/* 2. 회당 야간수당 (선택) */}
              <View style={styles.labelWithBadgeRow}>
                <Text style={styles.inputLabel}>나이트 수당 / 회당 (선택)</Text>
                {!inputNightRate && (
                  <View style={styles.inferredTag}>
                    <Text style={styles.inferredTagText}>유추 적용 중</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={parsedNightRate ? parsedNightRate.toLocaleString() : ''}
                placeholder={`미입력 시 기본급 기준 약 ${inferredNightRate.toLocaleString()}원 유추`}
                placeholderTextColor={COLORS.textMuted}
                onChangeText={(val) => setInputNightRate(val.replace(/[^0-9]/g, ''))}
              />
              <Text style={styles.inputHint}>
                {parsedNightRate
                  ? `직접 입력하신 1회당 ${parsedNightRate.toLocaleString()}원으로 계산합니다.`
                  : `기본급 기반 통상시급(50% 가산) + 야간간호관리료 평균 기준 회당 약 ${inferredNightRate.toLocaleString()}원으로 자동 유추됩니다.`}
              </Text>

              {/* 3. 회당 휴일수당 (선택) */}
              <View style={[styles.labelWithBadgeRow, { marginTop: 14 }]}>
                <Text style={styles.inputLabel}>주말/휴일 수당 / 회당 (선택)</Text>
                {!inputHolidayRate && (
                  <View style={styles.inferredTag}>
                    <Text style={styles.inferredTagText}>유추 적용 중</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={parsedHolidayRate ? parsedHolidayRate.toLocaleString() : ''}
                placeholder={`미입력 시 기본급 기준 약 ${inferredHolidayRate.toLocaleString()}원 유추`}
                placeholderTextColor={COLORS.textMuted}
                onChangeText={(val) => setInputHolidayRate(val.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* 실시간 계산 결과 프리뷰 카드 */}
            <View style={styles.resultCard}>
              <Text style={styles.resultHeader}>{monthLabel} 예상 실수령 급여</Text>
              <Text style={[styles.totalAmount, { color: theme.primary }]}>
                {totalEstimatedSalary.toLocaleString()}원
              </Text>

              <View style={styles.breakdownList}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownName}>기본급</Text>
                  <Text style={styles.breakdownVal}>{parsedBase.toLocaleString()}원</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownName}>
                    야간수당 ({nightCount}회 × {effectiveNightRate.toLocaleString()}원)
                  </Text>
                  <Text style={[styles.breakdownVal, { color: theme.primary }]}>
                    +{totalNightPay.toLocaleString()}원
                  </Text>
                </View>
                {holidayWorkCount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownName}>
                      휴일수당 ({holidayWorkCount}회 × {effectiveHolidayRate.toLocaleString()}원)
                    </Text>
                    <Text style={[styles.breakdownVal, { color: '#F59E0B' }]}>
                      +{totalHolidayPay.toLocaleString()}원
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 안내 문구 (안내 지침) */}
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                💡 병원 및 병동마다 수당 지침과 산정 방식(통상임금 기준, 야간간호관리료 지급 기준 등)이 상이합니다. 입력된 근무 및 급여 데이터가 적을수록 오차범위가 커지며, 데이터가 누적되고 실제 급여명세서를 반영할수록 예측 정확도는 높아집니다.
              </Text>
            </View>
          </ScrollView>

          {/* 하단 저장 버튼 */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>설정 저장 및 예측 반영</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bodyScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scheduleBadgeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scheduleBadgeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  badgeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inferredTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inferredTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  textInput: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  resultHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    marginVertical: 8,
  },
  breakdownList: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownName: {
    fontSize: 13,
    color: '#4B5563',
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  disclaimerBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
