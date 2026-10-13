import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';
import { StudyGuideItem } from '../../../mocks/studyData';
import { useStudyStore } from '../../../store/useStudyStore';
import { BookmarkIcon, ShareIcon } from '../../common/Icon';
import { SwipeDismissModal } from '../../common/SwipeDismissModal';
import { OFFICIAL_MEDICAL_CITATIONS, MEDICAL_DISCLAIMER_TEXT } from '../../../constants/medicalCitations';

interface StudyDetailModalProps {
  visible: boolean;
  guide: StudyGuideItem | null;
  onClose: () => void;
}

export const StudyDetailModal: React.FC<StudyDetailModalProps> = ({
  visible,
  guide,
  onClose,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { studyGuides, toggleBookmarkGuide } = useStudyStore();
  const insets = useSafeAreaInsets();

  if (!guide) return null;

  const currentGuide = studyGuides.find((g) => g.id === guide.id) || guide;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `[우간다 임상 족보] ${currentGuide.title}\nhttps://weganda.kr/study/${currentGuide.id}`,
      });
    } catch {
      Alert.alert('공유 완료', '프로토콜 링크가 복사되었습니다.');
    }
  };

  return (
    <SwipeDismissModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 14 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>‹ 닫기</Text>
          </TouchableOpacity>

          <View style={styles.headerActionRow}>
            <TouchableOpacity
              onPress={() => toggleBookmarkGuide(currentGuide.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BookmarkIcon
                size={20}
                color={currentGuide.isBookmarked ? theme.primary : COLORS.textMuted}
                filled={currentGuide.isBookmarked}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ShareIcon size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* 카테고리 뱃지 & 메타 */}
          <View style={styles.topMetaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{currentGuide.category}</Text>
            </View>
            <Text style={styles.metaText}>{currentGuide.meta} • 조회 {currentGuide.views}</Text>
          </View>

          {/* 제목 & 요약 */}
          <Text style={styles.guideTitle}>{currentGuide.title}</Text>
          <Text style={styles.guideSummary}>{currentGuide.summary}</Text>

          {/* 핵심 포인트 카드 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>핵심 체크포인트 (Key Points)</Text>
          </View>
          <View style={styles.keyPointsCard}>
            {currentGuide.keyPoints.map((pt, idx) => (
              <View key={idx} style={styles.pointRow}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <Text style={styles.pointText}>{pt}</Text>
              </View>
            ))}
          </View>

          {/* 주의사항 배너 */}
          {currentGuide.dangerAlert && (
            <View style={styles.dangerCard}>
              <Text style={styles.dangerTitle}>임상 주의사항 (Clinical Caution)</Text>
              <Text style={styles.dangerText}>{currentGuide.dangerAlert}</Text>
            </View>
          )}

          {/* 상세 프로토콜 절차 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>표준 실무 절차 (SOP)</Text>
          </View>
          <View style={styles.sopCard}>
            {currentGuide.fullContent.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* 공식 의학 출처 및 표준 가이드라인 링크 (Guideline 1.4.1 준수) */}
          <View style={styles.citationSection}>
            <Text style={styles.citationSectionTitle}>공식 의학 출처 및 표준 가이드라인 링크</Text>
            <Text style={styles.disclaimerText}>{MEDICAL_DISCLAIMER_TEXT}</Text>

            <View style={styles.citationList}>
              {OFFICIAL_MEDICAL_CITATIONS.map((cit) => (
                <TouchableOpacity
                  key={cit.id}
                  style={styles.citationCard}
                  onPress={() => Linking.openURL(cit.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.citationBadge}>
                    <Text style={styles.citationBadgeText}>{cit.agency}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.citationItemTitle}>{cit.title}</Text>
                    <Text style={styles.citationItemDesc}>{cit.description}</Text>
                    <Text style={styles.citationItemUrl}>{cit.url} ↗</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 출처 */}
          <View style={styles.authorFooter}>
            <Text style={styles.authorFooterText}>작성 및 실무 검수: {currentGuide.author}</Text>
          </View>
        </ScrollView>
      </View>
    </SwipeDismissModal>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: theme.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 32,
    marginBottom: 10,
  },
  guideSummary: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  keyPointsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
    marginBottom: 18,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pointText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  dangerCard: {
    backgroundColor: theme.primaryTint,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#E11D48',
    marginBottom: 18,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E11D48',
    marginBottom: 4,
  },
  dangerText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 21,
  },
  sopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 20,
  },
  stepRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  stepText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  citationSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  citationSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  citationList: {
    gap: 10,
  },
  citationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  citationBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  citationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  citationItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  citationItemDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginBottom: 4,
  },
  citationItemUrl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  authorFooter: {
    alignItems: 'center',
    marginTop: 10,
  },
  authorFooterText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

export default StudyDetailModal;

