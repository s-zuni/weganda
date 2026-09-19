import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { StudyGuideItem } from '../../../mocks/studyData';
import { useStudyStore } from '../../../store/useStudyStore';
import { BookmarkIcon, ShareIcon } from '../../common/Icon';

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
  const { studyGuides, toggleBookmarkGuide } = useStudyStore();

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
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
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
                color={currentGuide.isBookmarked ? COLORS.primary : COLORS.textMuted}
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

          {/* 출처 */}
          <View style={styles.authorFooter}>
            <Text style={styles.authorFooterText}>출처: {currentGuide.author}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
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
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: '#FFF1F4',
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

