import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../common/Card';
import { COLORS } from '../../../constants/theme';
import {
  FlaskIcon,
  ZapIcon,
  ActivityIcon,
  BookOpenIcon,
  BookmarkIcon,
} from '../../common/Icon';
import { StudyGuideItem } from '../../../types/study';

interface StudyGuideCardProps {
  guide: StudyGuideItem;
  onOpenDetail: (guide: StudyGuideItem) => void;
  onToggleBookmark: (id: string) => void;
}

export const StudyGuideCard: React.FC<StudyGuideCardProps> = ({
  guide,
  onOpenDetail,
  onToggleBookmark,
}) => {
  const renderIcon = (type: StudyGuideItem['iconType'], color = COLORS.primary) => {
    switch (type) {
      case 'flask':
        return <FlaskIcon size={20} color={color} />;
      case 'zap':
        return <ZapIcon size={20} color="#F59E0B" />;
      case 'activity':
        return <ActivityIcon size={20} color="#E11D48" />;
      default:
        return <BookOpenIcon size={20} color="#4F98CA" />;
    }
  };

  return (
    <Card style={styles.guideCard}>
      <TouchableOpacity
        style={styles.guideCardInner}
        onPress={() => onOpenDetail(guide)}
        activeOpacity={0.85}
      >
        <View style={[styles.guideIconWrapper, { backgroundColor: guide.iconBg }]}>
          {renderIcon(guide.iconType)}
        </View>

        <View style={styles.guideTexts}>
          <View style={styles.guideTopMeta}>
            <View style={styles.miniCategoryBadge}>
              <Text style={styles.miniCategoryText}>{guide.category}</Text>
            </View>
            <Text style={styles.guideMeta}>{guide.meta}</Text>
          </View>

          <Text style={styles.guideTitle} numberOfLines={1}>
            {guide.title}
          </Text>
          <Text style={styles.guideSummary} numberOfLines={2}>
            {guide.summary}
          </Text>
        </View>

        {/* 북마크 토글 버튼 */}
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => onToggleBookmark(guide.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BookmarkIcon
            size={18}
            color={guide.isBookmarked ? COLORS.primary : COLORS.textMuted}
            filled={guide.isBookmarked}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  guideCard: {
    padding: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guideCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  guideIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideTexts: {
    flex: 1,
  },
  guideTopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  miniCategoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  guideMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  guideTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  guideSummary: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bookmarkBtn: {
    padding: 4,
  },
});

