import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { FireIcon, HeartIcon, CommentIcon } from '../../common/Icon';
import { HotTopic, PostItem } from '../../../types/community';

interface HotTopicsBannerProps {
  hotTopics: HotTopic[];
  posts: PostItem[];
  onOpenDetail: (post: PostItem) => void;
}

export const HotTopicsBanner: React.FC<HotTopicsBannerProps> = ({
  hotTopics,
  posts,
  onOpenDetail,
}) => {
  return (
    <View style={styles.hotSection}>
      <View style={styles.hotHeaderRow}>
        <View style={styles.hotTitleGroup}>
          <FireIcon size={18} color={COLORS.primary} />
          <Text style={styles.hotSectionTitle}>실시간 간호 HOT 토픽</Text>
        </View>
        <Text style={styles.hotSectionSub}>오늘 추천수 급상승</Text>
      </View>

      {hotTopics.length === 0 ? (
        <View style={styles.hotEmptyCard}>
          <Text style={styles.hotEmptyTitle}>아직 등록된 실시간 인기글이 없어요 🔥</Text>
          <Text style={styles.hotEmptySub}>
            동료들에게 도움이 되는 임상 팁이나 교대근무 일상을 공유해보세요!
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hotScroll}
        >
          {hotTopics.map((hot) => {
            const matchedPost = posts.find((p) => p.id === hot.id);
            return (
              <TouchableOpacity
                key={hot.id}
                style={styles.hotCard}
                onPress={() => matchedPost && onOpenDetail(matchedPost)}
                activeOpacity={0.85}
              >
                <View style={styles.hotCardTop}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>{hot.rank}위</Text>
                  </View>
                  <Text style={styles.hotCategoryText}>{hot.category}</Text>
                </View>

                <Text style={styles.hotCardTitle} numberOfLines={2}>
                  {hot.title}
                </Text>

                <View style={styles.hotStatsRow}>
                  <View style={styles.hotStatItem}>
                    <HeartIcon size={12} color={COLORS.primary} />
                    <Text style={styles.hotStatText}>{hot.likes}</Text>
                  </View>
                  <View style={styles.hotStatItem}>
                    <CommentIcon size={12} color={COLORS.textMuted} />
                    <Text style={styles.hotStatText}>{hot.comments}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hotSection: {
    marginBottom: 20,
  },
  hotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hotTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hotSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  hotSectionSub: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  hotScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  hotCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 115,
  },
  hotCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  hotCategoryText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  hotCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 21,
    marginBottom: 8,
  },
  hotStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hotStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotStatText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  hotEmptyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hotEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  hotEmptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

