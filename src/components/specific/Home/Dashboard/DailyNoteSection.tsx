import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { useDailyNoteStore } from '../../../../store/useDailyNoteStore';
import { useUserStore } from '../../../../store/useUserStore';
import { todayKey } from '../../../../utils/dateKind';
import Svg, { Path, Rect } from 'react-native-svg';

interface DailyNoteSectionProps {
  onOpenDailyNoteModal: () => void;
}

export const DailyNoteSection: React.FC<DailyNoteSectionProps> = ({
  onOpenDailyNoteModal,
}) => {
  const theme = useAppTheme();
  const userId = useUserStore((s) => s.id);
  const allNotes = useDailyNoteStore((s) => s.notes);
  const fetchNotes = useDailyNoteStore((s) => s.fetchNotes);

  useEffect(() => {
    if (userId) fetchNotes(userId);
  }, [userId, fetchNotes]);

  // 오늘 날짜의 메모만 노출 — 지난 메모는 삭제되지 않고 모달에서 날짜별로 조회
  const today = todayKey();
  const todayNotes = allNotes.filter((n) => n.date === today);
  const upcomingCount = allNotes.filter((n) => n.date > today).length;
  const latestNote = todayNotes.length > 0 ? todayNotes[todayNotes.length - 1] : null;

  const hasNote = Boolean(latestNote && latestNote.note && latestNote.note.trim().length > 0);
  const emptyText = upcomingCount > 0
    ? `오늘 메모는 없어요 · 예정된 메모 ${upcomingCount}건`
    : '오늘 등록된 인수인계 메모가 없어요';
  const notePreviewText = hasNote
    ? `${todayNotes.length > 1 ? `(${todayNotes.length}건) ` : ''}${latestNote!.patient ? `${latestNote!.patient} ` : ''}${latestNote!.note}`
    : emptyText;

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
        <Text
          style={[
            styles.memoPreview,
            !hasNote && styles.memoEmptyPreview,
          ]}
          numberOfLines={1}
        >
          {notePreviewText}
        </Text>
      </View>

      {/* 우측 수정/작성 뱃지 버튼 */}
      <View style={[styles.editBadge, { backgroundColor: theme.primaryTint }]}>
        <Text style={[styles.editText, { color: theme.primary }]}>
          {hasNote ? '수정 ›' : '작성 ›'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  memoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  memoPreview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  memoEmptyPreview: {
    color: COLORS.textMuted,
  },
  editBadge: {
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
  },
});

