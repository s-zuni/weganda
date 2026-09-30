import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { useSalaryStore, MonthlySalaryRecord } from '../../../../store/useSalaryStore';
import { useShiftScheduleStore } from '../../../../store/useShiftScheduleStore';

interface MonthlySalaryFormProps {
  onSaveSuccess?: () => void;
}

export const MonthlySalaryForm: React.FC<MonthlySalaryFormProps> = ({ onSaveSuccess }) => {
  const theme = useAppTheme();
  const {
    monthlyRecords,
    saveMonthlyRecord,
    deleteMonthlyRecord,
    baseSalary,
  } = useSalaryStore();
  const { currentDate, schedules, customCodes } = useShiftScheduleStore();

  // 현재 선택된 기록 대상 연월 (기본: currentDate의 YYYY-MM)
  const defaultYm = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  const [selectedYm, setSelectedYm] = useState<string>(defaultYm);

  // 입력 필드 상태 (숫자 문자열)
  const [totalSalary, setTotalSalary] = useState<string>('');
  const [baseAllowance, setBaseAllowance] = useState<string>('');
  const [nightAllowance, setNightAllowance] = useState<string>('');
  const [extraAllowance, setExtraAllowance] = useState<string>('');
  const [holidayAllowance, setHolidayAllowance] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  // 선택된 달의 기존 기록이 있으면 필드에 채우기
  useEffect(() => {
    const existing = monthlyRecords[selectedYm];
    if (existing) {
      setTotalSalary(existing.totalSalary ? String(existing.totalSalary) : '');
      setBaseAllowance(existing.baseAllowance ? String(existing.baseAllowance) : '');
      setNightAllowance(existing.nightAllowance ? String(existing.nightAllowance) : '');
      setExtraAllowance(existing.extraAllowance ? String(existing.extraAllowance) : '');
      setHolidayAllowance(existing.holidayAllowance ? String(existing.holidayAllowance) : '');
      setMemo(existing.memo || '');
    } else {
      // 기존 기록이 없으면 현재 설정된 baseSalary를 본수당 기본값으로 제안
      setTotalSalary('');
      setBaseAllowance(baseSalary > 0 ? String(baseSalary) : '');
      setNightAllowance('');
      setExtraAllowance('');
      setHolidayAllowance('');
      setMemo('');
    }
  }, [selectedYm, monthlyRecords, baseSalary]);

  // 선택된 월의 실제 나이트 근무 횟수 (도움 힌트용)
  const shiftNightCount = useMemo(() => {
    return Object.entries(schedules).filter(([dateKey, code]) => {
      if (!dateKey.startsWith(selectedYm)) return false;
      if (code === 'N') return true;
      return customCodes[code]?.name?.includes('나이트');
    }).length;
  }, [schedules, selectedYm, customCodes]);

  // 월 전환 핸들러
  const handlePrevMonth = () => {
    const [yStr, mStr] = selectedYm.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedYm(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = selectedYm.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedYm(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleSave = () => {
    const numTotal = parseInt(totalSalary.replace(/[^0-9]/g, ''), 10) || 0;
    const numBase = parseInt(baseAllowance.replace(/[^0-9]/g, ''), 10) || 0;
    const numNight = parseInt(nightAllowance.replace(/[^0-9]/g, ''), 10) || 0;
    const numExtra = parseInt(extraAllowance.replace(/[^0-9]/g, ''), 10) || 0;
    const numHoliday = parseInt(holidayAllowance.replace(/[^0-9]/g, ''), 10) || 0;

    if (numTotal <= 0 && numBase <= 0) {
      Alert.alert('입력 확인', '전체 임금 또는 본수당(기본급)을 입력해 주세요.');
      return;
    }

    const record: MonthlySalaryRecord = {
      yearMonth: selectedYm,
      totalSalary: numTotal > 0 ? numTotal : (numBase + numNight + numExtra + numHoliday),
      baseAllowance: numBase,
      nightAllowance: numNight,
      extraAllowance: numExtra > 0 ? numExtra : undefined,
      holidayAllowance: numHoliday > 0 ? numHoliday : undefined,
      memo: memo.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    saveMonthlyRecord(record);
    Alert.alert('저장 완료', `${selectedYm} 급여 명세 기록이 성공적으로 저장되었습니다.`);
    onSaveSuccess?.();
  };

  const handleDelete = (ym: string) => {
    Alert.alert('기록 삭제', `${ym} 급여 기록을 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteMonthlyRecord(ym),
      },
    ]);
  };

  const parseNumDisplay = (val: string) => {
    const n = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? '' : n.toLocaleString();
  };

  const [y, m] = selectedYm.split('-');
  const monthDisplayTitle = `${y}년 ${parseInt(m, 10)}월`;

  // 저장된 모든 기록 리스트 정렬 (최신순)
  const savedRecordsList = Object.values(monthlyRecords).sort((a, b) =>
    b.yearMonth.localeCompare(a.yearMonth)
  );

  return (
    <View style={styles.container}>
      {/* ── 1. 대상 월 선택 네비게이터 ── */}
      <View style={styles.monthSelectorRow}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.arrowBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.monthTitleBox}>
          <Text style={styles.monthTitleText}>{monthDisplayTitle} 급여 기록</Text>
          <Text style={styles.monthSubText}>
            {monthlyRecords[selectedYm] ? '기록 저장됨' : '신규 기록 작성 중'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.arrowBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. 입력 폼 카드 ── */}
      <View style={styles.formCard}>
        {/* 전체 임금 */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              전체 임금 (실수령/총지급액) <Text style={styles.req}>*</Text>
            </Text>
          </View>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="예: 3,500,000"
            placeholderTextColor={COLORS.textMuted}
            value={parseNumDisplay(totalSalary)}
            onChangeText={(text) => setTotalSalary(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* 본수당 (기본급) */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              본수당 (기본급/본봉) <Text style={styles.req}>*</Text>
            </Text>
          </View>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="예: 2,800,000"
            placeholderTextColor={COLORS.textMuted}
            value={parseNumDisplay(baseAllowance)}
            onChangeText={(text) => setBaseAllowance(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* 야간수당 */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              야간수당 <Text style={styles.req}>*</Text>
            </Text>
            {shiftNightCount > 0 && (
              <View style={styles.helperChip}>
                <Text style={styles.helperChipText}>근무표상 N {shiftNightCount}회</Text>
              </View>
            )}
          </View>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="예: 490,000"
            placeholderTextColor={COLORS.textMuted}
            value={parseNumDisplay(nightAllowance)}
            onChangeText={(text) => setNightAllowance(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* 기타수당 (선택) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>기타수당 (선택: 식대, 직무/면허수당 등)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="예: 200,000"
            placeholderTextColor={COLORS.textMuted}
            value={parseNumDisplay(extraAllowance)}
            onChangeText={(text) => setExtraAllowance(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* 명절수당 (선택) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>명절수당 / 상여금 (선택)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="예: 500,000"
            placeholderTextColor={COLORS.textMuted}
            value={parseNumDisplay(holidayAllowance)}
            onChangeText={(text) => setHolidayAllowance(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* 메모 (선택) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>메모 (선택)</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            placeholder="예: 추석 효도상여금 포함, 나이트 1회 대타"
            placeholderTextColor={COLORS.textMuted}
            value={memo}
            onChangeText={setMemo}
            maxLength={60}
          />
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>
            {monthlyRecords[selectedYm] ? `${monthDisplayTitle} 기록 수정하기` : `${monthDisplayTitle} 급여 기록 저장`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 3. 저장된 지난 급여 기록 히스토리 ── */}
      {savedRecordsList.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>저장된 월별 급여 이력</Text>
          {savedRecordsList.map((rec) => {
            const [recY, recM] = rec.yearMonth.split('-');
            const isCurrentSelected = rec.yearMonth === selectedYm;
            return (
              <View
                key={rec.yearMonth}
                style={[
                  styles.historyCard,
                  isCurrentSelected && { borderColor: theme.primary, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.historyCardHeader}>
                  <View>
                    <Text style={styles.historyMonthText}>
                      {recY}년 {parseInt(recM, 10)}월
                    </Text>
                    <Text style={[styles.historyTotalText, { color: theme.primary }]}>
                      {rec.totalSalary.toLocaleString()}원
                    </Text>
                  </View>
                  <View style={styles.historyActionRow}>
                    <TouchableOpacity
                      onPress={() => setSelectedYm(rec.yearMonth)}
                      style={styles.editBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editBtnText}>불러오기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(rec.yearMonth)}
                      style={styles.delBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.delBtnText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 세부 수당 칩 */}
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipLabel}>본수당</Text>
                    <Text style={styles.chipVal}>{rec.baseAllowance.toLocaleString()}원</Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipLabel}>야간수당</Text>
                    <Text style={styles.chipVal}>{rec.nightAllowance.toLocaleString()}원</Text>
                  </View>
                  {rec.extraAllowance && rec.extraAllowance > 0 && (
                    <View style={styles.chip}>
                      <Text style={styles.chipLabel}>기타</Text>
                      <Text style={styles.chipVal}>{rec.extraAllowance.toLocaleString()}원</Text>
                    </View>
                  )}
                  {rec.holidayAllowance && rec.holidayAllowance > 0 && (
                    <View style={styles.chip}>
                      <Text style={styles.chipLabel}>명절/휴일</Text>
                      <Text style={styles.chipVal}>{rec.holidayAllowance.toLocaleString()}원</Text>
                    </View>
                  )}
                </View>

                {rec.memo && (
                  <Text style={styles.historyMemoText}>💬 {rec.memo}</Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  arrowBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  monthTitleBox: {
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  monthSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  req: {
    color: '#EF4444',
  },
  helperChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  helperChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  input: {
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
  memoInput: {
    fontWeight: '400',
    fontSize: 14,
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historySection: {
    marginTop: 10,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  historyMonthText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  historyTotalText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  historyActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  delBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  delBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chipLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  chipVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 1,
  },
  historyMemoText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
});
