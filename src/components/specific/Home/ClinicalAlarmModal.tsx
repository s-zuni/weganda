import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { ClockIcon, PencilIcon } from '../../common/Icon';
import { useAlarmStore } from '../../../store/useAlarmStore';
import { localNotificationService } from '../../../services/localNotificationService';

interface ClinicalAlarmModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUICK_PRESETS = [
  { label: '+5분', minutes: 5, hint: '수액 확인' },
  { label: '+15분', minutes: 15, hint: 'AST 알러지' },
  { label: '+30분', minutes: 30, hint: '수혈 모니터링' },
  { label: '+60분', minutes: 60, hint: '투약 후 재평가' },
];

export const ClinicalAlarmModal: React.FC<ClinicalAlarmModalProps> = ({
  visible,
  onClose,
}) => {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm } = useAlarmStore();

  const [patient, setPatient] = useState('');
  const [content, setContent] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [customTime, setCustomTime] = useState('');
  const [isPresetMode, setIsPresetMode] = useState(true);

  const handleQuickPreset = (minutes: number, hint: string) => {
    setSelectedMinutes(minutes);
    setIsPresetMode(true);
    if (!content) {
      setContent(`${hint} 알람`);
    }
  };

  const handleAddAlarm = () => {
    if (!patient.trim()) {
      Alert.alert('알림', '환자명 또는 병실 번호를 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '알람 내용을 입력해주세요.');
      return;
    }

    let triggerTimeStr = '';
    if (isPresetMode) {
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

    const minutesToSchedule = isPresetMode ? selectedMinutes : 45;

    addAlarm({
      patient: patient.trim(),
      content: content.trim(),
      triggerTime: triggerTimeStr,
      remainingMinutes: minutesToSchedule,
    });

    // 실제 스마트폰 시스템 푸시 알림 스케줄링
    localNotificationService.scheduleClinicalAlarm({
      patient: patient.trim(),
      content: content.trim(),
      minutes: minutesToSchedule,
    });

    // 초기화
    setPatient('');
    setContent('');
    setCustomTime('');
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
        <View style={styles.bottomSheet}>
          {/* 핸들바 */}
          <View style={styles.handleBar} />

          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ClockIcon size={20} color={COLORS.primary} />
              <Text style={styles.headerTitle}>임상 알람 맞추기</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── 1. 퀵 프리셋 버튼 ── */}
            <Text style={styles.sectionSubtitle}>빠른 알람 설정 (임상 퀵 프리셋)</Text>
            <View style={styles.presetRow}>
              {QUICK_PRESETS.map((preset) => {
                const isSelected = isPresetMode && selectedMinutes === preset.minutes;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    onPress={() => handleQuickPreset(preset.minutes, preset.hint)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                      {preset.label}
                    </Text>
                    <Text style={[styles.presetChipHint, isSelected && styles.presetChipHintActive]}>
                      {preset.hint}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
              alarms.map((alarm) => (
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
                  </View>

                  <View style={styles.alarmCardAction}>
                    <Switch
                      value={alarm.isActive}
                      onValueChange={() => toggleAlarm(alarm.id)}
                      trackColor={{ false: '#E5E7EB', true: COLORS.primaryLight }}
                      thumbColor={alarm.isActive ? COLORS.primary : '#9CA3AF'}
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
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 24,
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
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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

