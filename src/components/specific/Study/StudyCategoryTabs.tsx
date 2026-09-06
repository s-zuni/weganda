import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { BookmarkIcon } from '../../common/Icon';

interface StudyCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

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
            {isBookmarkTab && (
              <BookmarkIcon
                size={13}
                color={isSelected ? '#FFFFFF' : COLORS.primary}
                filled={true}
              />
            )}
            <Text
              style={[
                styles.categoryTabText,
                isSelected && styles.categoryTabTextActive,
                isBookmarkTab && !isSelected && { color: COLORS.primary },
              ]}
            >
              {cat}
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

