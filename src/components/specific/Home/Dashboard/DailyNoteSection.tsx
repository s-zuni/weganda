import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { useDailyNoteStore } from '../../../../store/useDailyNoteStore';
import Svg, { Path, Rect } from 'react-native-svg';

interface DailyNoteSectionProps {
  onOpenDailyNoteModal: () => void;
}

export const DailyNoteSection: React.FC<DailyNoteSectionProps> = ({
  onOpenDailyNoteModal,
}) => {
  const notes = useDailyNoteStore((s) => s.notes);
  const latestNote = notes.length > 0 ? notes[0] : null;

  const notePreviewText = latestNote
    ? `${latestNote.patient ? `${latestNote.patient} ` : ''}${latestNote.note}`
    : '302호 Foley 교체 완료, BST 140 체크';

  return (
    <TouchableOpacity
      style={styles.memoCard}
      onPress={onOpenDailyNoteModal}
      activeOpacity={0.8}
    >
      {/* 좌측 메모 아이콘 */}
      <View style={styles.iconContainer}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="3" width="16" height="18" rx="3" fill="#FFF9E6" stroke="#FDE68A" strokeWidth="1.5" />
          <Path d="M8 8H16M8 12H14M8 16H12" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
          <Path d="M14.5 14L18 17.5M18 17.5L16.5 19L13 15.5L14.5 14Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        </Svg>
      </View>

      {/* 중앙 텍스트 */}
      <View style={styles.textCol}>
        <Text style={styles.memoTitle}>오늘의 인수인계 메모</Text>
        <Text style={styles.memoPreview} numberOfLines={1}>
          {notePreviewText}
        </Text>
      </View>

      {/* 우측 수정 뱃지 버튼 */}
      <View style={styles.editBadge}>
        <Text style={styles.editText}>수정 ›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  memoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF9EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  memoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#191F28',
    letterSpacing: -0.3,
  },
  memoPreview: {
    fontSize: 13,
    color: '#8B95A1',
    marginTop: 3,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  editBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary, // #FF507C
  },
});

