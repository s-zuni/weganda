import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { BookmarkIcon } from '../../common/Icon';

interface StudyCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  '전체': '📚 전체',
  '약물계산/투약': '💊 약물/투약',
  '응급/ACLS': '⚡ 응급/ACLS',
  '간호술기': '🩺 간호술기',
  '바이탈/중재': '📊 바이탈/중재',
  '북마크 보관함': '⭐️ 북마크 보관함',
};

export const StudyCategoryTabs: React.FC<StudyCategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScroll}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const isBookmarkTab = cat === '북마크 보관함';
        const displayLabel = CATEGORY_EMOJI[cat] || cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryTab,
              isSelected && styles.categoryTabActive,
              isBookmarkTab && !isSelected && styles.categoryTabBookmark,
            ]}
            onPress={() => onSelectCategory(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryTabText,
                isSelected && styles.categoryTabTextActive,
                isBookmarkTab && !isSelected && { color: COLORS.primary },
              ]}
            >
              {displayLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryScroll: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryTabBookmark: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

