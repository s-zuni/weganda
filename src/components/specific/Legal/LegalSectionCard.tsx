import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LegalArticle } from '../../../constants/legal/types';
import { COLORS } from '../../../constants/theme';

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
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
  },
  paragraphText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
  },
  subListContainer: {
    marginTop: 6,
    marginBottom: 8,
  },
  subGroupBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  subItemText: {
    fontSize: 13,
    color: '#475569',
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
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  boxWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  boxCoral: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6',
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
    color: COLORS.primary || '#FF507C',
  },
  highlightDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
});

