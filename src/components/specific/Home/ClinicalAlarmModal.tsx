import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';
import { ClockIcon, PencilIcon } from '../../common/Icon';
import { SwipeableBottomSheet, BottomSheetScrollView } from '../../common/SwipeableBottomSheet';
import { useAlarmStore, CustomAlarmPreset } from '../../../store/useAlarmStore';
import { ClinicalAlarm, AlarmRepeatMode } from '../../../types/alarm';
import { useUserStore } from '../../../store/useUserStore';

interface ClinicalAlarmModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ClinicalAlarmModal: React.FC<ClinicalAlarmModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const userId = useUserStore((s) => s.id);
  const {
    alarms,
    customPresets,
    fetchAlarms,
    addAlarm,
    toggleAlarm,
    deleteAlarm,
    addCustomPreset,
    deleteCustomPreset,
    togglePinPreset,
  } = useAlarmStore();

  useEffect(() => {
    if (visible && userId) {
      fetchAlarms(userId);
    }
  }, [visible, userId, fetchAlarms]);

  const [patient, setPatient] = useState('');
  const [content, setContent] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [customTime, setCustomTime] = useState('');
  const [isPresetMode, setIsPresetMode] = useState(true);

  // 반복 설정: 1회 / 일정 간격 반복(예: 15분마다 4회) / 커스텀 순차 간격(예: 15,20,25분)
  const [repeatMode, setRepeatMode] = useState<AlarmRepeatMode>('once');
  const [intervalMinutesText, setIntervalMinutesText] = useState('15');
  const [repeatCountText, setRepeatCountText] = useState('4');
  const [customIntervalsText, setCustomIntervalsText] = useState('15, 20, 25');

  // 커스텀 프리셋 추가 모드 상태
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetMinutes, setNewPresetMinutes] = useState('');
  const [newPresetHint, setNewPresetHint] = useState('');
  const [newPresetPinned, setNewPresetPinned] = useState(true);

  // 핀 고정된 항목을 우선 정렬
  const sortedPresets = useMemo(() => {
    return [...customPresets].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });
  }, [customPresets]);

  const handleQuickPreset = (minutes: number, hint: string) => {
    setSelectedMinutes(minutes);
    setIsPresetMode(true);
    if (!content) {
      setContent(hint);
    }
  };

  const handleSaveCustomPreset = () => {
    const mins = parseInt(newPresetMinutes, 10);
    if (!newPresetLabel.trim() || isNaN(mins) || mins <= 0) {
      Alert.alert('알림', '라벨(예: +20분)과 유효한 시간(분 단위)을 입력해주세요.');
      return;
    }
    if (!newPresetHint.trim()) {
      Alert.alert('알림', '알람 내용 힌트를 입력해주세요.');
      return;
    }

    addCustomPreset({
      label: newPresetLabel.trim(),
      minutes: mins,
      hint: newPresetHint.trim(),
      isPinned: newPresetPinned,
    });

    setIsAddingPreset(false);
    setNewPresetLabel('');
    setNewPresetMinutes('');
    setNewPresetHint('');
    Alert.alert('등록 완료', '내 병동 맞춤 프리셋이 추가되었습니다.');
  };

  // 커스텀 순차 간격 텍스트("15, 20, 25") → 분 단위 배열 파싱
  const parseCustomIntervals = (text: string): number[] =>
    text
      .split(/[,\s/]+/)
      .map((v) => parseInt(v, 10))
      .filter((v) => !isNaN(v) && v > 0);

  const handleAddAlarm = () => {
    if (!patient.trim()) {
      Alert.alert('알림', '환자명 또는 병실 번호를 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '알람 내용을 입력해주세요.');
      return;
    }

    const minutesToSchedule = isPresetMode ? selectedMinutes : 45;
    const intervalMinutes = parseInt(intervalMinutesText, 10);
    const repeatCount = parseInt(repeatCountText, 10);
    const customIntervals = parseCustomIntervals(customIntervalsText);

    if (repeatMode === 'interval' && (isNaN(intervalMinutes) || intervalMinutes <= 0)) {
      Alert.alert('알림', '반복 간격(분)을 올바르게 입력해주세요.');
      return;
    }
    if (repeatMode === 'interval' && (isNaN(repeatCount) || repeatCount <= 0)) {
      Alert.alert('알림', '반복 횟수를 올바르게 입력해주세요.');
      return;
    }
    if (repeatMode === 'custom' && customIntervals.length === 0) {
      Alert.alert('알림', '커스텀 간격을 "15, 20, 25"처럼 쉼표로 구분해 입력해주세요.');
      return;
    }

    let triggerTimeStr = '';
    if (repeatMode === 'interval') {
      triggerTimeStr = `${intervalMinutes}분마다 · ${repeatCount}회 반복`;
    } else if (repeatMode === 'custom') {
      triggerTimeStr = `${customIntervals.join('→')}분 순차 반복`;
    } else if (isPresetMode) {
      const targetDate = new Date(Date.now() + selectedMinutes * 60 * 1000);
      const timeStr = targetDate.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      triggerTimeStr = `${selectedMinutes}분 후 (${timeStr})`;
    } else {
      triggerTimeStr = customTime || '18:30';
    }

    addAlarm(
      {
        patient: patient.trim(),
        content: content.trim(),
        triggerTime: triggerTimeStr,
        remainingMinutes: minutesToSchedule,
        repeatMode,
        intervalMinutes: repeatMode === 'interval' ? intervalMinutes : undefined,
        repeatCount: repeatMode === 'interval' ? repeatCount : undefined,
        customIntervals: repeatMode === 'custom' ? customIntervals : undefined,
      },
      userId || undefined
    );

    // 초기화
    setPatient('');
    setContent('');
    setCustomTime('');
    Alert.alert('알람 설정 완료', `${patient} 환자 알람이 ${triggerTimeStr}로 설정되었습니다.`);
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ClockIcon size={20} color={theme.primary} />
          <Text style={styles.headerTitle}>⏰ 임상 알람 맞추기</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 1. 병동 맞춤 퀵 프리셋 섹션 ── */}
        <View style={styles.presetHeaderRow}>
          <Text style={styles.sectionSubtitle}>내 병동 맞춤 빠른 알람 📌</Text>
          <TouchableOpacity
            style={styles.addPresetToggleBtn}
            onPress={() => setIsAddingPreset((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.addPresetToggleText}>
              {isAddingPreset ? '닫기' : '+ 직접 프리셋 등록'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 직접 프리셋 등록 폼 */}
        {isAddingPreset && (
          <View style={styles.addPresetCard}>
            <Text style={styles.addPresetCardTitle}>새 병동 알람 프리셋 등록</Text>
            <View style={styles.addPresetRow}>
              <TextInput
                style={[styles.addPresetInput, { flex: 1 }]}
                placeholder="라벨 (예: +20분)"
                placeholderTextColor={COLORS.textMuted}
                value={newPresetLabel}
                onChangeText={setNewPresetLabel}
              />
              <TextInput
                style={[styles.addPresetInput, { flex: 0.8 }]}
                placeholder="시간(분) 예: 20"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={newPresetMinutes}
                onChangeText={setNewPresetMinutes}
              />
            </View>
            <TextInput
              style={[styles.addPresetInput, { marginTop: 8 }]}
              placeholder="알람 내용 힌트 (예: 진통제 20분 후 통증 재평가 💉)"
              placeholderTextColor={COLORS.textMuted}
              value={newPresetHint}
              onChangeText={setNewPresetHint}
            />
            <View style={styles.pinToggleRow}>
              <TouchableOpacity
                style={styles.pinCheckBtn}
                onPress={() => setNewPresetPinned((p) => !p)}
              >
                <Text style={styles.pinCheckIcon}>{newPresetPinned ? '📌' : '▫️'}</Text>
                <Text style={styles.pinCheckLabel}>상단에 고정하기 (Pin)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.savePresetBtn}
                onPress={handleSaveCustomPreset}
                activeOpacity={0.85}
              >
                <Text style={styles.savePresetBtnText}>프리셋 저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 프리셋 가로 스크롤 칩 목록 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScrollContainer}
        >
          {sortedPresets.map((preset) => {
            const isSelected = isPresetMode && selectedMinutes === preset.minutes;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
                onPress={() => handleQuickPreset(preset.minutes, preset.hint)}
                onLongPress={() => {
                  Alert.alert(
                    `${preset.label} (${preset.hint})`,
                    '프리셋을 관리하시겠습니까?',
                    [
                      {
                        text: preset.isPinned ? '📌 고정 해제' : '📌 상단 고정',
                        onPress: () => togglePinPreset(preset.id),
                      },
                      {
                        text: '삭제',
                        style: 'destructive',
                        onPress: () => deleteCustomPreset(preset.id),
                      },
                      { text: '취소', style: 'cancel' },
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={styles.presetChipTop}>
                  <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                    {preset.label}
                  </Text>
                  {preset.isPinned && <Text style={styles.pinBadge}>📌</Text>}
                </View>
                <Text
                  style={[styles.presetChipHint, isSelected && styles.presetChipHintActive]}
                  numberOfLines={1}
                >
                  {preset.hint}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>


            {/* ── 2. 알람 등록 입력 폼 ── */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>새 알람 등록</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>환자명 / 병상</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 502호 김환자"
                  placeholderTextColor={COLORS.textMuted}
                  value={patient}
                  onChangeText={setPatient}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>알람 내용</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: AST 알러지 테스트 판독, 수혈 바이탈"
                  placeholderTextColor={COLORS.textMuted}
                  value={content}
                  onChangeText={setContent}
                />
              </View>

              <View style={styles.modeSwitchRow}>
                <TouchableOpacity
                  style={[styles.modeTab, isPresetMode && styles.modeTabActive]}
                  onPress={() => setIsPresetMode(true)}
                >
                  <Text style={[styles.modeTabText, isPresetMode && styles.modeTabTextActive]}>
                    지금으로부터 {selectedMinutes}분 후
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, !isPresetMode && styles.modeTabActive]}
                  onPress={() => setIsPresetMode(false)}
                >
                  <Text style={[styles.modeTabText, !isPresetMode && styles.modeTabTextActive]}>
                    지정 시간 입력
                  </Text>
                </TouchableOpacity>
              </View>

              {!isPresetMode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>지정 시각 (HH:mm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="예: 18:30"
                    placeholderTextColor={COLORS.textMuted}
                    value={customTime}
                    onChangeText={setCustomTime}
                  />
                </View>
              )}

              {/* 반복 설정: 1회 / 일정 간격 반복 / 커스텀 순차 간격 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>반복 설정 🔁</Text>
                <View style={styles.modeSwitchRow}>
                  <TouchableOpacity
                    style={[styles.modeTab, repeatMode === 'once' && styles.modeTabActive]}
                    onPress={() => setRepeatMode('once')}
                  >
                    <Text style={[styles.modeTabText, repeatMode === 'once' && styles.modeTabTextActive]}>
                      1회만
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeTab, repeatMode === 'interval' && styles.modeTabActive]}
                    onPress={() => setRepeatMode('interval')}
                  >
                    <Text style={[styles.modeTabText, repeatMode === 'interval' && styles.modeTabTextActive]}>
                      일정 간격 반복
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeTab, repeatMode === 'custom' && styles.modeTabActive]}
                    onPress={() => setRepeatMode('custom')}
                  >
                    <Text style={[styles.modeTabText, repeatMode === 'custom' && styles.modeTabTextActive]}>
                      커스텀 순차
                    </Text>
                  </TouchableOpacity>
                </View>

                {repeatMode === 'interval' && (
                  <View style={styles.addPresetRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.repeatSubLabel}>간격(분)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="예: 15"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={intervalMinutesText}
                        onChangeText={setIntervalMinutesText}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.repeatSubLabel}>반복 횟수</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="예: 4"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={repeatCountText}
                        onChangeText={setRepeatCountText}
                      />
                    </View>
                  </View>
                )}

                {repeatMode === 'custom' && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.repeatSubLabel}>순차 간격(분, 쉼표로 구분)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="예: 15, 20, 25"
                      placeholderTextColor={COLORS.textMuted}
                      value={customIntervalsText}
                      onChangeText={setCustomIntervalsText}
                    />
                    <Text style={styles.repeatHintText}>
                      입력 순서대로 이어서 울려요 (예: 15분 후 → 그로부터 20분 후 → 그로부터 25분 후)
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddAlarm} activeOpacity={0.85}>
                <Text style={styles.submitBtnText}>알람 등록하기</Text>
              </TouchableOpacity>
            </View>

            {/* ── 3. 등록된 알람 목록 ── */}
            <View style={styles.alarmListHeader}>
              <Text style={styles.sectionSubtitle}>현재 설정된 알람 ({alarms.length}개)</Text>
              <Text style={styles.alarmListHint}>여러 명을 동시에 맞출 수 있어요</Text>
            </View>

            {alarms.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>현재 등록된 알람이 없습니다.</Text>
              </View>
            ) : (
              alarms.map((alarm: ClinicalAlarm) => (
                <View key={alarm.id} style={[styles.alarmCard, !alarm.isActive && styles.alarmCardDisabled]}>
                  <View style={styles.alarmCardMain}>
                    <View style={styles.alarmMetaRow}>
                      <View style={styles.patientBadge}>
                        <Text style={styles.patientBadgeText}>{alarm.patient}</Text>
                      </View>
                      <Text style={styles.triggerTimeText}>{alarm.triggerTime}</Text>
                    </View>

                    <Text style={[styles.alarmContentText, !alarm.isActive && styles.textDisabled]}>
                      {alarm.content}
                    </Text>

                    {alarm.repeatMode && alarm.repeatMode !== 'once' && (
                      <View style={styles.repeatBadge}>
                        <Text style={styles.repeatBadgeText}>
                          🔁{' '}
                          {alarm.repeatMode === 'interval'
                            ? `${alarm.intervalMinutes}분마다 · ${alarm.repeatCount}회`
                            : `${(alarm.customIntervals || []).join('→')}분 순차`}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.alarmCardAction}>
                    <Switch
                      value={alarm.isActive}
                      onValueChange={() => toggleAlarm(alarm.id)}
                      trackColor={{ false: '#E5E7EB', true: theme.primaryLight }}
                      thumbColor={alarm.isActive ? theme.primary : '#9CA3AF'}
                    />
                    <TouchableOpacity
                      onPress={() => deleteAlarm(alarm.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </BottomSheetScrollView>
    </SwipeableBottomSheet>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    paddingBottom: 30,
  },
  presetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addPresetToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addPresetToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  addPresetCard: {
    backgroundColor: theme.primaryTint,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.primaryTintBorder,
  },
  addPresetCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 8,
  },
  addPresetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addPresetInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: COLORS.textPrimary,
  },
  pinToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pinCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinCheckIcon: {
    fontSize: 14,
  },
  pinCheckLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  savePresetBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  savePresetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  presetScrollContainer: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 88,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  presetChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  pinBadge: {
    fontSize: 11,
  },

  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  presetChipHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  presetChipHintActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  modeTabActive: {
    backgroundColor: theme.primary,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  repeatSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  repeatHintText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 15,
  },
  repeatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  repeatBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
  },
  submitBtn: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  alarmListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  alarmListHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyCard: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  alarmCardDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.65,
  },
  alarmCardMain: {
    flex: 1,
    paddingRight: 10,
  },
  alarmMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  patientBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  patientBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  triggerTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  alarmContentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  textDisabled: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  alarmCardAction: {
    alignItems: 'flex-end',
    gap: 6,
  },
  deleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default ClinicalAlarmModal;

