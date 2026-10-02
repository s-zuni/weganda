import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS, useAppTheme, type ThemeColors } from '../../../../constants/theme';
import { useSalaryStore } from '../../../../store/useSalaryStore';
import { useShiftScheduleStore } from '../../../../store/useShiftScheduleStore';
import { ChartBarIcon } from '../../../common/Icon';
import { SwipeableBottomSheet, BottomSheetScrollView } from '../../../common/SwipeableBottomSheet';
import { MonthlySalaryForm } from './MonthlySalaryForm';
import { NextMonthSalaryPreview } from './NextMonthSalaryPreview';

interface SalaryCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'forecast' | 'record' | 'settings';
}

export const SalaryCalculatorModal: React.FC<SalaryCalculatorModalProps> = ({
  visible,
  onClose,
  initialTab = 'forecast',
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<'forecast' | 'record' | 'settings'>(initialTab);

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

  // 단가 설정 탭 로컬 상태
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

  // 해당 달의 나이트(N) 일수 자동 계산
  const nightCount = useMemo(() => {
    return Object.entries(schedules).filter(([dateKey, code]) => {
      if (!dateKey.startsWith(currentYm)) return false;
      if (code === 'N') return true;
      const custom = customCodes[code];
      return custom && custom.name && custom.name.includes('나이트');
    }).length;
  }, [schedules, currentYm, customCodes]);

  // 해당 달의 주말/휴일 근무 일수 계산
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

  const handleSaveSettings = () => {
    if (parsedBase <= 0) {
      Alert.alert('입력 확인', '올바른 기본급을 입력해 주세요.');
      return;
    }
    setBaseSalary(parsedBase);
    setCustomNightAllowance(parsedNightRate);
    setCustomHolidayAllowance(parsedHolidayRate);
    Alert.alert('저장 완료', '기본 단가 설정이 성공적으로 반영되었습니다.');
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height="90%">
      {/* 바텀시트 헤더 */}
      <View style={styles.modalHeader}>
        <View style={styles.headerTitleGroup}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.primaryTint }]}>
            <ChartBarIcon size={18} color={theme.primary} />
          </View>
          <Text style={styles.modalTitle}>간호사 급여 & 수당 관리</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 3대 서브 탭 네비게이션 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'forecast' && styles.tabItemActive]}
          onPress={() => setActiveTab('forecast')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'forecast' && [styles.tabTextActive, { color: theme.primary }],
            ]}
          >
            다음 달 월급 예측
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'record' && styles.tabItemActive]}
          onPress={() => setActiveTab('record')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'record' && [styles.tabTextActive, { color: theme.primary }],
            ]}
          >
            월별 급여 기록
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && [styles.tabTextActive, { color: theme.primary }],
            ]}
          >
            단가 설정
          </Text>
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        style={styles.bodyScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 탭 1: 다음 달 월급 예측 */}
        {activeTab === 'forecast' && (
          <NextMonthSalaryPreview onGoToRecordTab={() => setActiveTab('record')} />
        )}

        {/* 탭 2: 월별 급여 기록 */}
        {activeTab === 'record' && (
          <MonthlySalaryForm onSaveSuccess={() => setActiveTab('forecast')} />
        )}

        {/* 탭 3: 단가 설정 */}
        {activeTab === 'settings' && (
          <View style={styles.settingsSection}>
            {/* 근무표 요약 뱃지 */}
            <View style={styles.scheduleBadgeCard}>
              <Text style={styles.scheduleBadgeTitle}>
                {monthLabel} 캘린더 근무 현황
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeLabel}>나이트(N)</Text>
                  <Text style={[styles.badgeValue, { color: theme.primary }]}>{nightCount}일</Text>
                </View>
                <View style={styles.badgeDivider} />
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeLabel}>주말 근무</Text>
                  <Text style={[styles.badgeValue, { color: '#F59E0B' }]}>{holidayWorkCount}일</Text>
                </View>
              </View>
            </View>

            {/* 1. 월 기본급 */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                월 기본급 (본봉) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                returnKeyType="next"
                value={parsedBase ? parsedBase.toLocaleString() : ''}
                placeholder="예: 2,800,000"
                placeholderTextColor={COLORS.textMuted}
                onChangeText={(val) => setInputBase(val.replace(/[^0-9]/g, ''))}
              />
              <Text style={styles.inputHint}>
                급여명세서 상의 기본급을 입력하세요. 야간/휴일 수당 유추의 기준 통상임금이 됩니다.
              </Text>
            </View>

            {/* 2. 회당 야간수당 (선택) */}
            <View style={styles.inputSection}>
              <View style={styles.labelWithBadgeRow}>
                <Text style={styles.inputLabel}>야간수당 / 회당 (선택)</Text>
                {!inputNightRate && (
                  <View style={styles.inferredTag}>
                    <Text style={styles.inferredTagText}>유추 적용 중</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                returnKeyType="next"
                value={parsedNightRate ? parsedNightRate.toLocaleString() : ''}
                placeholder={`미입력 시 기본급 기준 약 ${inferredNightRate.toLocaleString()}원 유추`}
                placeholderTextColor={COLORS.textMuted}
                onChangeText={(val) => setInputNightRate(val.replace(/[^0-9]/g, ''))}
              />
              <Text style={styles.inputHint}>
                {inputNightRate
                  ? `직접 입력하신 1회당 ${parsedNightRate?.toLocaleString()}원으로 계산합니다.`
                  : `기본급 기반 통상시급(50% 가산) + 간호관리료 평균 기준 회당 약 ${inferredNightRate.toLocaleString()}원으로 자동 유추됩니다.`}
              </Text>
            </View>

            {/* 3. 회당 주말/휴일수당 (선택) */}
            <View style={styles.inputSection}>
              <View style={styles.labelWithBadgeRow}>
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
                returnKeyType="done"
                value={parsedHolidayRate ? parsedHolidayRate.toLocaleString() : ''}
                placeholder={`미입력 시 기본급 기준 약 ${inferredHolidayRate.toLocaleString()}원 유추`}
                placeholderTextColor={COLORS.textMuted}
                onChangeText={(val) => setInputHolidayRate(val.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* 실시간 계산 결과 프리뷰 카드 */}
            <View style={styles.resultCard}>
              <Text style={styles.resultHeader}>{monthLabel} 기준 설정 결과</Text>
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

            {/* 저장 버튼 */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSaveSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>설정 저장 및 반영</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetScrollView>
    </SwipeableBottomSheet>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 17,
    fontWeight: '800',
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    fontWeight: '800',
  },
  bodyScroll: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  settingsSection: {
    paddingBottom: 20,
  },
  scheduleBadgeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scheduleBadgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
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
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgeDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
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
    height: 46,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 15,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  resultHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 6,
  },
  breakdownList: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    gap: 6,
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
  saveBtn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
