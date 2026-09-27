import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LegalArticle } from '../../../constants/legal/types';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

interface LegalSectionCardProps {
  article: LegalArticle;
  index: number;
}

export const LegalSectionCard: React.FC<LegalSectionCardProps> = ({ article }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header / Article Title */}
      <View style={styles.titleRow}>
        <Text style={styles.articleTitle}>
          {article.articleNumber ? `${article.articleNumber}` : article.title}
        </Text>
      </View>

      {/* Paragraphs */}
      {article.paragraphs.map((para, pIdx) => (
        <Text key={pIdx} style={styles.paragraphText}>
          {para}
        </Text>
      ))}

      {/* Sub Lists */}
      {article.subList && article.subList.length > 0 && (
        <View style={styles.subListContainer}>
          {article.subList.map((sub, sIdx) => (
            <View key={sIdx} style={styles.subGroupBox}>
              {sub.subTitle && <Text style={styles.subTitleText}>{sub.subTitle}</Text>}
              {sub.items.map((item, iIdx) => (
                <Text key={iIdx} style={styles.subItemText}>
                  {item}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Highlight Box if present */}
      {article.highlightBox && (
        <View
          style={[
            styles.highlightBox,
            article.highlightBox.variant === 'warning' && styles.boxWarning,
            article.highlightBox.variant === 'coral' && styles.boxCoral,
            article.highlightBox.variant === 'info' && styles.boxInfo,
          ]}
        >
          <Text
            style={[
              styles.highlightTitle,
              article.highlightBox.variant === 'coral' && styles.titleCoral,
              article.highlightBox.variant === 'warning' && styles.titleWarning,
            ]}
          >
            {article.highlightBox.title}
          </Text>
          <Text style={styles.highlightDesc}>{article.highlightBox.description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.gray100,
  },
  titleRow: {
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NEUTRAL.gray800,
    lineHeight: 24,
  },
  paragraphText: {
    fontSize: 14,
    color: NEUTRAL.gray600,
    lineHeight: 22,
    marginBottom: 8,
  },
  subListContainer: {
    marginTop: 6,
    marginBottom: 8,
  },
  subGroupBox: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: NEUTRAL.gray700,
    marginBottom: 6,
  },
  subItemText: {
    fontSize: 13,
    color: NEUTRAL.gray600,
    lineHeight: 20,
    marginBottom: 4,
  },
  highlightBox: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
  },
  boxInfo: {
    backgroundColor: TINT_COLORS.greenTint,
    borderColor: TINT_COLORS.greenTintStrong,
  },
  boxWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  boxCoral: {
    backgroundColor: TINT_COLORS.pinkTint,
    borderColor: TINT_COLORS.pinkTintBorder,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 4,
  },
  titleWarning: {
    color: '#B45309',
  },
  titleCoral: {
    color: COLORS.primary,
  },
  highlightDesc: {
    fontSize: 13,
    color: NEUTRAL.gray700,
    lineHeight: 20,
  },
});

