import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Card } from '../common/Card';

interface FortuneCardProps {
  title?: string;
  fortuneText: string;
  luckyItem?: string;
  luckyColor?: string;
  score?: number; // 0 ~ 100
}

export const FortuneCard: React.FC<FortuneCardProps> = ({
  title = "오늘의 총평 운세",
  fortuneText,
  luckyItem,
  luckyColor,
  score = 92,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>🔮</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}점</Text>
        </View>
      </View>
      
      <Text style={styles.fortuneText}>{fortuneText}</Text>
      
      {(luckyItem || luckyColor) && (
        <View style={styles.footer}>
          {luckyItem && (
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>행운 아이템: </Text>
              <Text style={styles.tagValue}>{luckyItem}</Text>
            </View>
          )}
          {luckyColor && (
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>행운 컬러: </Text>
              <Text style={styles.tagValue}>{luckyColor}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreBadge: {
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  fortuneText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.95,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  tagValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

