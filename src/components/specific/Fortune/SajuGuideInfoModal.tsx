import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SAJU_ANALYSIS_GUIDE_MD,
  SAJU_GUIDE_METADATA,
} from '../../../constants/sajuAnalysisGuide';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

export interface SajuGuideInfoModalProps {
  visible: boolean;
  appliedGuideVersion?: string;
  guideRuleRef?: string;
  totalCharCount: number;
  onClose: () => void;
}

export const SajuGuideInfoModal: React.FC<SajuGuideInfoModalProps> = ({
  visible,
  appliedGuideVersion,
  guideRuleRef,
  totalCharCount,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.status.success} />
              <Text style={styles.modalTitle}>우간다 표준 사주 분석 가이드</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.guideMetaBox}>
              <Text style={styles.guideMetaTitle}>
                {SAJU_GUIDE_METADATA.title} ({appliedGuideVersion || SAJU_GUIDE_METADATA.version})
              </Text>
              <Text style={styles.guideMetaDesc}>
                본 사주 분석은 『{guideRuleRef || SAJU_GUIDE_METADATA.filename}』의 8대 거버넌스 규격에 따라 50년 명인 페르소나 및 14대 임상 사주 알고리즘을 거쳐 정밀 산출되었습니다.
              </Text>
            </View>

            <Text style={styles.guideSectionHeading}>적용된 핵심 원칙 및 거버넌스</Text>
            <View style={styles.guideRuleItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.guideRuleText}>
                <Text style={styles.guideRuleBold}>최소 1,000자 이상 심층 분석:</Text> 단편적 풀이를 배제하고 5대 정밀 섹션 체계 준수 (현재 {totalCharCount}자).
              </Text>
            </View>
            <View style={styles.guideRuleItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.guideRuleText}>
                <Text style={styles.guideRuleBold}>간호 임상 십신·신살 매트릭스:</Text> 비견(동기애), 상관(직언/돌발상황), 귀문관살(예민한 관찰력/임상 촉) 등 병원 현장 맞춤 해석.
              </Text>
            </View>
            <View style={styles.guideRuleItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.guideRuleText}>
                <Text style={styles.guideRuleBold}>객관적 대운 & 금기/행동 직언:</Text> 뜬구름 잡는 위로 대신 실질적인 태움 방어, 이직 타이밍, 나이트 근무 행동 수칙 명시.
              </Text>
            </View>
            <View style={styles.guideRuleItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.guideRuleText}>
                <Text style={styles.guideRuleBold}>인포그래픽 시각화 연동:</Text> 텍스트뿐만 아니라 스펙트럼 게이지, 밸런스 차트 등 시각 지표 동시 제공.
              </Text>
            </View>

            <View style={styles.guideExcerptBox}>
              <Text style={styles.guideExcerptTitle}>가이드 규격 전문 (발췌 요약)</Text>
              <Text style={styles.guideExcerptText} numberOfLines={14}>
                {SAJU_ANALYSIS_GUIDE_MD.slice(0, 750)}...
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.modalConfirmBtn}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="확인 및 감정서 계속 읽기"
          >
            <Text style={styles.modalConfirmBtnText}>확인 및 감정서 계속 읽기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NEUTRAL.gray900,
  },
  modalCloseBtn: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    marginVertical: 14,
  },
  guideMetaBox: {
    backgroundColor: TINT_COLORS.greenTint,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: TINT_COLORS.greenTintBorder,
    marginBottom: 16,
  },
  guideMetaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TINT_COLORS.greenTextMid,
    marginBottom: 6,
  },
  guideMetaDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: TINT_COLORS.greenIcon,
    lineHeight: 18,
  },
  guideSectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: NEUTRAL.gray800,
    marginBottom: 10,
  },
  guideRuleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  guideRuleText: {
    flex: 1,
    fontSize: 13,
    color: NEUTRAL.gray700,
    lineHeight: 18,
  },
  guideRuleBold: {
    fontWeight: '700',
    color: NEUTRAL.gray900,
  },
  guideExcerptBox: {
    backgroundColor: NEUTRAL.gray50,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 12,
    marginBottom: 8,
  },
  guideExcerptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  guideExcerptText: {
    fontSize: 11,
    color: NEUTRAL.gray600,
    lineHeight: 16,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onPrimaryText,
  },
});

