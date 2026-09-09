import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { PencilIcon, BriefcaseIcon } from '../../../common/Icon';

interface DailyNoteSectionProps {
  onOpenDailyNoteModal: () => void;
}

export const DailyNoteSection: React.FC<DailyNoteSectionProps> = ({
  onOpenDailyNoteModal,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>데일리 노트</Text>
      <View style={styles.noteRow}>
        {/* 특이사항 기록하기 */}
        <TouchableOpacity
          style={styles.noteCard}
          onPress={onOpenDailyNoteModal}
          activeOpacity={0.8}
        >
          <View style={styles.noteIconWrapper}>
            <PencilIcon size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.noteCardText}>특이사항 기록하기</Text>
        </TouchableOpacity>

        {/* 업무 가이드 */}
        <TouchableOpacity
          style={styles.noteCard}
          onPress={() =>
            Alert.alert(
              '업무 가이드',
              '병동 주요 프로토콜, 투약 계산식 및 검사 전 처치 가이드가 수록되어 있습니다.'
            )
          }
          activeOpacity={0.8}
        >
          <View style={styles.noteIconWrapper}>
            <BriefcaseIcon size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.noteCardText}>업무 가이드</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  noteRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  noteCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 110,
    gap: 10,
  },
  noteIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCardText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

