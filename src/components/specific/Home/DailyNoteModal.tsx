import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { PencilIcon } from '../../common/Icon';
import { useDailyNoteStore } from '../../../store/useDailyNoteStore';

interface DailyNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DailyNoteModal: React.FC<DailyNoteModalProps> = ({
  visible,
  onClose,
}) => {
  const { notes, addNote, deleteNote } = useDailyNoteStore();

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(defaultDate);
  const [patient, setPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleSaveNote = () => {
    if (!patient.trim()) {
      Alert.alert('알림', '환자명 또는 병실 번호를 입력해주세요.');
      return;
    }
    if (!noteContent.trim()) {
      Alert.alert('알림', '특이사항 메모를 입력해주세요.');
      return;
    }

    addNote({
      date: date.trim(),
      patient: patient.trim(),
      diagnosis: diagnosis.trim() || '미지정',
      note: noteContent.trim(),
    });

    setPatient('');
    setDiagnosis('');
    setNoteContent('');
    Alert.alert('등록 완료', '환자 특이사항이 저장되었습니다.');
  };

  const handleDateChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    setDate(formatted);
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
            <View style={styles.headerTitleRow}>
              <PencilIcon size={20} color={COLORS.primary} />
              <Text style={styles.headerTitle}>특이사항 기록하기 (인수인계)</Text>
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
            {/* ── 1. 신규 특이사항 입력 폼 ── */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>새 특이사항 작성</Text>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>일자</Text>
                  <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={handleDateChange}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1.2 }]}>
                  <Text style={styles.inputLabel}>환자명 / 병실</Text>
                  <TextInput
                    style={styles.input}
                    value={patient}
                    onChangeText={setPatient}
                    placeholder="예: 503호 정환자"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>진단명 / 주호소(CC)</Text>
                <TextInput
                  style={styles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="예: Acute Appendicitis s/p Op, Pneumonia"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>특이사항 및 인수인계 내용</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  placeholder="투약, 드레싱 삼출물, 바이탈 변화, 검사 결과 등 다음 듀티를 위해 전달할 특이사항을 기록하세요."
                  placeholderTextColor={COLORS.textMuted}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveNote} activeOpacity={0.85}>
                <Text style={styles.submitBtnText}>특이사항 등록하기</Text>
              </TouchableOpacity>
            </View>

            {/* ── 2. 등록된 특이사항 목록 ── */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionSubtitle}>기록된 특이사항 목록 ({notes.length}건)</Text>
              <Text style={styles.listHeaderHint}>자유롭게 추가 및 삭제 가능</Text>
            </View>

            {notes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>등록된 환자 특이사항이 없습니다.</Text>
              </View>
            ) : (
              notes.map((item) => (
                <View key={item.id} style={styles.noteCard}>
                  <View style={styles.noteCardHeader}>
                    <View style={styles.patientInfoRow}>
                      <View style={styles.patientBadge}>
                        <Text style={styles.patientBadgeText}>{item.patient}</Text>
                      </View>
                      <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => deleteNote(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>삭제</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.noteContentText}>{item.note}</Text>

                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDateText}>{item.date}</Text>
                    <Text style={styles.noteTimeText}>작성: {item.createdAt}</Text>
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
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
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
    fontSize: 17,
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
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
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
  textArea: {
    minHeight: 80,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
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
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listHeaderHint: {
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
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  patientBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  patientBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  diagnosisText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
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
  noteContentText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  noteDateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  noteTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});

export default DailyNoteModal;

