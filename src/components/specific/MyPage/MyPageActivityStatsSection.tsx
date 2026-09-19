import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../constants/theme';
import { CalendarIcon, BookmarkIcon } from '../../common/Icon';
import { useShiftScheduleStore } from '../../../store/useShiftScheduleStore';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { useUserStore } from '../../../store/useUserStore';

export const MyPageActivityStatsSection: React.FC = () => {
  const theme = useAppTheme();
  const currentDate = useShiftScheduleStore((s) => s.currentDate);
  const schedules = useShiftScheduleStore((s) => s.schedules);
  const customCodes = useShiftScheduleStore((s) => s.customCodes);

  const userId = useUserStore((s) => s.id);
  const userNickname = useUserStore((s) => s.nickname);
  const posts = useCommunityStore((s) => s.posts);

  // 현재 월 3교대 현황 계산
  const shiftStats = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const prefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    let day = 0;
    let evening = 0;
    let night = 0;
    let off = 0;

    Object.entries(schedules).forEach(([dateStr, code]) => {
      if (!dateStr.startsWith(prefix)) return;
      if (code === 'D') day += 1;
      else if (code === 'E') evening += 1;
      else if (code === 'N') night += 1;
      else if (
        code === 'O' ||
        code === '/' ||
        code === 'OFF' ||
        code === 'V' ||
        code === 'F' ||
        Boolean(customCodes[code]?.isOff)
      ) {
        off += 1;
      }
    });

    return { month: currentMonth, day, evening, night, off };
  }, [currentDate, schedules, customCodes]);

  // 내 활동 기록 계산
  const activityStats = useMemo(() => {
    let myPostCount = 0;
    let myCommentCount = 0;
    let bookmarkedCount = 0;

    posts.forEach((p) => {
      if (p.isBookmarked) bookmarkedCount += 1;
      if (userId && p.authorId === userId) {
        myPostCount += 1;
      } else if (userNickname && p.authorName === userNickname) {
        myPostCount += 1;
      }
      p.comments?.forEach((c) => {
        if (
          (userId && (c as { authorId?: string }).authorId === userId) ||
          (userNickname && c.authorName === userNickname)
        ) {
          myCommentCount += 1;
        }
      });
    });

    return {
      posts: myPostCount,
      comments: myCommentCount,
      bookmarks: bookmarkedCount,
    };
  }, [posts, userId, userNickname]);

  return (
    <>
      {/* ── 나의 월간 3교대 근무 현황 ── */}
      <View style={[styles.sectionCard, { borderColor: theme.border }]}>
        <View style={styles.sectionTitleGroup}>
          <CalendarIcon size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {shiftStats.month}월 나의 3교대 현황
          </Text>
        </View>

        <View style={styles.shiftStatsRow}>
          <View style={styles.shiftStatItem}>
            <View style={[styles.statDot, { backgroundColor: theme.shift.day }]} />
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Day</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{shiftStats.day}회</Text>
          </View>
          <View style={styles.shiftStatItem}>
            <View style={[styles.statDot, { backgroundColor: theme.shift.evening }]} />
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Evening</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{shiftStats.evening}회</Text>
          </View>
          <View style={styles.shiftStatItem}>
            <View style={[styles.statDot, { backgroundColor: theme.shift.night }]} />
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Night</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{shiftStats.night}회</Text>
          </View>
          <View style={styles.shiftStatItem}>
            <View style={[styles.statDot, { backgroundColor: theme.shift.off }]} />
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Off</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{shiftStats.off}회</Text>
          </View>
        </View>
      </View>

      {/* ── 내 활동 기록 ── */}
      <View style={[styles.sectionCard, { borderColor: theme.border }]}>
        <View style={styles.sectionTitleGroup}>
          <BookmarkIcon size={18} color={theme.primary} filled={true} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>내 활동 기록</Text>
        </View>

        <View style={styles.activityRow}>
          <View style={styles.activityCol}>
            <Text style={[styles.activityCount, { color: theme.primary }]}>{activityStats.posts}</Text>
            <Text style={[styles.activityLabel, { color: theme.textMuted }]}>작성한 글</Text>
          </View>
          <View style={[styles.activityDivider, { backgroundColor: theme.border }]} />
          <View style={styles.activityCol}>
            <Text style={[styles.activityCount, { color: theme.primary }]}>{activityStats.comments}</Text>
            <Text style={[styles.activityLabel, { color: theme.textMuted }]}>작성한 댓글</Text>
          </View>
          <View style={[styles.activityDivider, { backgroundColor: theme.border }]} />
          <View style={styles.activityCol}>
            <Text style={[styles.activityCount, { color: theme.primary }]}>{activityStats.bookmarks}</Text>
            <Text style={[styles.activityLabel, { color: theme.textMuted }]}>보관한 글</Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  shiftStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  shiftStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  activityCol: {
    alignItems: 'center',
  },
  activityCount: {
    fontSize: 22,
    fontWeight: '900',
  },
  activityLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  activityDivider: {
    width: 1,
    height: 24,
    alignSelf: 'center',
  },
});

