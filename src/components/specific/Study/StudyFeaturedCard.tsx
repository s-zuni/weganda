import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { StudyGuideItem } from '../../../types/study';

interface StudyFeaturedCardProps {
  guide?: StudyGuideItem;
  onPress: () => void;
}

export const StudyFeaturedCard: React.FC<StudyFeaturedCardProps> = ({
  guide,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.featuredSection}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.featuredHeader}>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>PICK</Text>
        </View>
        <Text style={styles.featuredSub}>오늘의 추천 학습 프로토콜</Text>
      </View>

      <Text style={styles.featuredHeading}>
        {guide?.title || '한국형 전문심장소생술 (K-ACLS) 퀵 레퍼런스'}
      </Text>
      <Text style={styles.featuredDesc}>
        {guide?.summary ||
          '제세동 가능 리듬(VF/pVT)과 불가능 리듬(PEA/Asystole) 에피네프린 투여 타이밍 완벽 가이드'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredSection: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  newBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  featuredSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  featuredHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 22,
  },
  featuredDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
});

