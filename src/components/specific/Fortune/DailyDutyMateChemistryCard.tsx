import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFortuneStore } from '../../../store/useFortuneStore';

interface DailyDutyMateChemistryCardProps {
  onPressFullSaju?: () => void;
}

const PRESET_COLLEAGUES = [
  { name: '김민지 간호사', role: '동기 · 이브닝 콤비', score: 96, grade: '최고' },
  { name: '이수현 차지', role: '인차지 · 시니어', score: 89, grade: '양호' },
  { name: '박지원 간호사', role: '후배 · 프리셉티', score: 92, grade: '우수' },
];

export const DailyDutyMateChemistryCard: React.FC<DailyDutyMateChemistryCardProps> = ({
  onPressFullSaju,
}) => {
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [currentPartner, setCurrentPartner] = useState(PRESET_COLLEAGUES[0]);
  const [inputName, setInputName] = useState('');
  const [inputRole, setInputRole] = useState('');

  const handleSavePartner = () => {
    if (inputName.trim()) {
      setCurrentPartner({
        name: inputName.trim(),
        role: inputRole.trim() || '듀티 파트너',
        score: Math.floor(Math.random() * 10) + 88, // 88~97점
        grade: '우수',
      });
    }
    setPartnerModalVisible(false);
  };

  return (
    <View style={styles.cardContainer}>
      {/* 카드 헤더 */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={16} color="#10B981" />
          </View>
          <View>
            <Text style={styles.headerTitle}>오늘의 듀티 메이트 궁합</Text>
            <Text style={styles.headerSub}>오늘 같은 조 동료와의 당일 일진 호흡</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.changeBtn}
          onPress={() => setPartnerModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.changeBtnText}>파트너 변경</Text>
        </TouchableOpacity>
      </View>

      {/* 파트너 정보 및 호흡 점수 박스 */}
      <View style={styles.partnerInfoBox}>
        <View style={styles.partnerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={18} color="#059669" />
          </View>
          <View>
            <Text style={styles.partnerName}>{currentPartner.name}</Text>
            <Text style={styles.partnerRole}>{currentPartner.role}</Text>
          </View>
        </View>

        <View style={styles.scoreBadgeWrap}>
          <Text style={styles.scoreNumber}>{currentPartner.score}</Text>
          <Text style={styles.scoreUnit}>점</Text>
          <View style={styles.scoreGradeTag}>
            <Text style={styles.scoreGradeText}>{currentPartner.score >= 95 ? '환상 콤비' : '손발 척척'}</Text>
          </View>
        </View>
      </View>

      {/* 오늘 두 사람의 케미 & 처세 비결 */}
      <View style={styles.chemistryDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="checkmark-circle" size={15} color="#10B981" />
          <Text style={styles.detailText}>
            <Text style={styles.detailBold}>오늘의 시너지:</Text> 처치와 투약 인수인계 시 손발이 착착 맞아 펑크 위험 제로
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="chatbubble-ellipses" size={15} color="#3B82F6" />
          <Text style={styles.detailText}>
            <Text style={styles.detailBold}>소통 비책:</Text> "오늘 바쁘셨죠? 시원한 커피 드세요" 한마디가 최고의 윤활유
          </Text>
        </View>
      </View>

      {/* 하단 전체 궁합 보기 유도 */}
      {onPressFullSaju && (
        <TouchableOpacity
          style={styles.fullSajuLink}
          onPress={onPressFullSaju}
          activeOpacity={0.7}
        >
          <Text style={styles.fullSajuLinkText}>정밀 사주 궁합 1,000자 리포트 보기</Text>
          <Ionicons name="arrow-forward" size={14} color="#059669" />
        </TouchableOpacity>
      )}

      {/* 파트너 변경 팝업 모달 */}
      <Modal
        visible={partnerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPartnerModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>오늘의 듀티 메이트 설정</Text>
              <TouchableOpacity onPress={() => setPartnerModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              오늘 함께 일하는 동료를 선택하거나 이름을 입력해 주세요.
            </Text>

            {/* 빠른 선택 프리셋 */}
            <View style={styles.presetList}>
              {PRESET_COLLEAGUES.map((colleague) => (
                <TouchableOpacity
                  key={colleague.name}
                  style={[
                    styles.presetItem,
                    currentPartner.name === colleague.name && styles.presetItemActive,
                  ]}
                  onPress={() => {
                    setCurrentPartner(colleague);
                    setPartnerModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.presetItemText,
                      currentPartner.name === colleague.name && styles.presetItemTextActive,
                    ]}
                  >
                    {colleague.name} ({colleague.role})
                  </Text>
                  {currentPartner.name === colleague.name && (
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 직접 입력 */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>직접 입력 (이름 또는 호칭)</Text>
              <TextInput
                style={styles.input}
                value={inputName}
                onChangeText={setInputName}
                placeholder="예: 최하은 선생님, 박차지"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={inputRole}
                onChangeText={setInputRole}
                placeholder="예: 나이트 콤비, 프리셉터"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSavePartner}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>오늘의 궁합 확인하기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  changeBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  partnerInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  partnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
  partnerRole: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    marginTop: 2,
  },
  scoreBadgeWrap: {
    alignItems: 'flex-end',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
  },
  scoreUnit: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    marginTop: -4,
  },
  scoreGradeTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  scoreGradeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chemistryDetails: {
    gap: 8,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  detailBold: {
    fontWeight: '800',
    color: '#111827',
  },
  fullSajuLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 4,
  },
  fullSajuLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  presetList: {
    gap: 8,
    marginBottom: 16,
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetItemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  presetItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  presetItemTextActive: {
    color: '#065F46',
    fontWeight: '800',
  },
  inputWrap: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

