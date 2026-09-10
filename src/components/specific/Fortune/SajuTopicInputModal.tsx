import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFortuneStore, BirthInfo, PartnerBirthData } from '../../../store/useFortuneStore';
import { SajuTopicItem } from '../../../mocks/sajuCategories';
import { SajuBirthPicker } from './SajuBirthPicker';

interface SajuTopicInputModalProps {
  visible: boolean;
  topic?: SajuTopicItem;
  onClose: () => void;
  onSubmit: (data: {
    birthInfo: BirthInfo;
    partnerData?: PartnerBirthData;
  }) => void;
  isLoading?: boolean;
}

export const SajuTopicInputModal: React.FC<SajuTopicInputModalProps> = ({
  visible,
  topic,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const storeBirthInfo = useFortuneStore((state) => state.birthInfo);

  // 본인 정보
  const [birthDate, setBirthDate] = useState(storeBirthInfo.birthDate || '1996-05-18');
  const [birthTime, setBirthTime] = useState(storeBirthInfo.birthTime || '07:30');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(
    storeBirthInfo.calendarType || 'solar'
  );
  const [gender, setGender] = useState<'female' | 'male'>(storeBirthInfo.gender || 'female');

  // 상대방 정보 (동료 / 프리셉터 / 연인)
  const [partnerName, setPartnerName] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState('1995-10-24');
  const [partnerBirthTime, setPartnerBirthTime] = useState('12:00');
  const [partnerCalendarType, setPartnerCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [partnerGender, setPartnerGender] = useState<'female' | 'male'>(
    topic?.partnerType === 'partner' ? 'male' : 'female'
  );

  useEffect(() => {
    if (storeBirthInfo.birthDate) {
      setBirthDate(storeBirthInfo.birthDate);
      setBirthTime(storeBirthInfo.birthTime || '07:30');
      setCalendarType(storeBirthInfo.calendarType || 'solar');
      setGender(storeBirthInfo.gender || 'female');
    }
  }, [storeBirthInfo, visible]);

  if (!topic) return null;

  const handleSubmit = () => {
    const formattedBirthInfo: BirthInfo = {
      birthDate: birthDate.trim() || '1996-05-18',
      birthTime: birthTime.trim() || '12:00',
      calendarType,
      gender,
      isRegistered: true,
    };

    const partnerData: PartnerBirthData | undefined = topic.requiresPartner
      ? {
          name: partnerName.trim() || (topic.partnerType === 'preceptor' ? '프리셉터' : '동료 간호사'),
          birthDate: partnerBirthDate.trim() || '1995-10-24',
          birthTime: partnerBirthTime.trim() || '12:00',
          calendarType: partnerCalendarType,
          gender: partnerGender,
        }
      : undefined;

    onSubmit({
      birthInfo: formattedBirthInfo,
      partnerData,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* 핸들 바 */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <View style={styles.badgeRow}>
                <View style={[styles.topicBadge, { backgroundColor: topic.badgeColor }]}>
                  <Text style={styles.topicBadgeText}>{topic.badge}</Text>
                </View>
                <Text style={styles.readTimeText}>{topic.estimatedReadTime}</Text>
              </View>
              <Text style={styles.title}>{topic.title}</Text>
              <Text style={styles.subtitle}>
                50년 명리학 명인의 정밀 만세력 감정을 위한 탄생 정보를 입력하세요.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 섹션 1: 본인 탄생 정보 (인터랙티브 캘린더 + 12시진 선택기) */}
            <SajuBirthPicker
              title="본인 사주 정보"
              birthDate={birthDate}
              birthTime={birthTime}
              calendarType={calendarType}
              gender={gender}
              onDateChange={setBirthDate}
              onTimeChange={setBirthTime}
              onCalendarTypeChange={setCalendarType}
              onGenderChange={setGender}
              accentColor="#FF507C"
              isRegistered={storeBirthInfo.isRegistered}
            />

            {/* 섹션 2: 상대방 정보 (궁합 관련 주제 — 호칭 입력 + 인터랙티브 캘린더 + 12시진 선택기) */}
            {topic.requiresPartner && (
              <View style={{ marginTop: 16 }}>
                <View style={styles.partnerNameCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="people" size={18} color="#10B981" />
                    <Text style={styles.sectionTitle}>
                      {topic.partnerLabel || '상대방 정보 입력'}
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>이름 또는 호칭</Text>
                    <TextInput
                      style={styles.input}
                      value={partnerName}
                      onChangeText={setPartnerName}
                      placeholder="예: 김민지 선생님, 3년차 차지, 연인"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <SajuBirthPicker
                    title={`${partnerName ? `${partnerName}님의` : '상대방'} 탄생일시 (달력/시진)`}
                    birthDate={partnerBirthDate}
                    birthTime={partnerBirthTime}
                    calendarType={partnerCalendarType}
                    gender={partnerGender}
                    onDateChange={setPartnerBirthDate}
                    onTimeChange={setPartnerBirthTime}
                    onCalendarTypeChange={setPartnerCalendarType}
                    onGenderChange={setPartnerGender}
                    accentColor="#10B981"
                  />
                </View>
              </View>
            )}

            {/* 신뢰성 안내 */}
            <View style={styles.noticeBox}>
              <Ionicons name="shield-checkmark" size={16} color="#4B5563" />
              <Text style={styles.noticeText}>
                한국천문연구원(KASI) 정본 만세력 데이터를 기반으로 분 단위 절입 시각과 음양오행·신살을 오차 없이 계산합니다.
              </Text>
            </View>
          </ScrollView>

          {/* 하단 액션 버튼 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>만세력 정밀 분석 중...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>50년 명인의 만세력 정밀 사주 보기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 42,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  topicBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  readTimeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  partnerNameCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 6,
    flex: 1,
  },
  autoFilledBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoFilledText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleBtnTextActive: {
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
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
  timeSelectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSelectBtnText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  slotPickerContainer: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    maxHeight: 160,
    overflow: 'hidden',
  },
  slotPickerScroll: {
    padding: 6,
  },
  slotItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  slotItemActive: {
    backgroundColor: '#FFF1F4',
  },
  slotItemText: {
    fontSize: 13,
    color: '#4B5563',
  },
  slotItemTextActive: {
    color: '#FF507C',
    fontWeight: '700',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginVertical: 14,
  },
  noticeText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: '#FF507C', // Viva Coral Pink
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

