import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFortuneStore } from '../../store/useFortuneStore';
import {
  SajuTopicInfographic,
  SajuHeaderBar,
  SajuPillarsCard,
  SajuFiveElementsCard,
  SajuShinsalCard,
  SajuDaewoonTimeline,
  SajuReportContentCard,
  SajuGuideInfoModal,
  SajuChatModal,
} from '../../components/specific/Fortune';
import { SparklesIcon } from '../../components/common/Icon';
import { COLORS, NEUTRAL, useAppTheme, type ThemeColors } from '../../constants/theme';

export const SajuDetailResultScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const {
    currentManseryeokAnalysis,
    currentPartnerAnalysis,
    currentManseryeokReport,
    selectedTopic,
    birthInfo: userBirthInfo,
  } = useFortuneStore();

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  if (!currentManseryeokAnalysis || !currentManseryeokReport) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.status.error} />
          <Text style={styles.errorTitle}>분석 결과가 없습니다</Text>
          <Text style={styles.errorSub}>사주 정보를 먼저 입력해 주세요.</Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.navigate('FortuneHome')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="운세 홈으로 돌아가기"
          >
            <Text style={styles.backHomeBtnText}>운세 홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { pillars, dayMaster, fiveElements, detectedShinsals, daewoon, birthInfo } =
    currentManseryeokAnalysis;
  const report = currentManseryeokReport;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `[우간다 50년 명인 사주] ${report.topicTitle}\n\n${report.summaryQuote}\n\n사주 일간: ${dayMaster.natureTitle}\n핵심 신살: ${detectedShinsals.map((s) => s.name).join(', ')}`,
      });
    } catch (e) {
      console.warn('Notice in sharing saju result:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 네비게이션 및 명인 인증 배너 */}
      <SajuHeaderBar
        topicTitle={report.topicTitle}
        totalCharCount={report.totalCharCount}
        appliedGuideVersion={report.appliedGuideVersion}
        summaryQuote={report.summaryQuote}
        birthInfo={birthInfo}
        onBack={() => navigation.goBack()}
        onShare={handleShare}
        onOpenGuideModal={() => setShowGuideModal(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 0. 주제별 맞춤 인포그래픽 시각화 */}
        <SajuTopicInfographic
          report={report}
          userSaju={currentManseryeokAnalysis}
          partnerSaju={currentPartnerAnalysis}
        />

        {/* 1. 에너지 밸런스 분포 분석 */}
        <SajuFiveElementsCard fiveElements={fiveElements} />

        {/* 2. 중장기 라이프 주기 흐름표 */}
        <SajuDaewoonTimeline daewoon={daewoon} />

        {/* 3. 워크스타일 & 심리 분석 리포트 본문 및 핵심 제안 */}
        <SajuReportContentCard
          sections={report.sections}
          directAdvice={report.directAdvice}
        />

        {/* 하단 탐색 버튼 */}
        <View style={styles.footerActions}>
          {selectedTopic && (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => setShowChatModal(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="AI 어시스턴트에게 질문하기"
            >
              <SparklesIcon size={18} color={theme.onPrimaryText} />
              <Text style={styles.chatBtnText}>AI 어시스턴트에게 질문하기 (성향 · 워크스타일)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.reselectBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="다른 주제 둘러보기"
          >
            <Text style={styles.reselectBtnText}>다른 주제 둘러보기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 사주 분석 가이드 규격 모달 */}
      <SajuGuideInfoModal
        visible={showGuideModal}
        appliedGuideVersion={report.appliedGuideVersion}
        guideRuleRef={report.guideRuleRef}
        totalCharCount={report.totalCharCount}
        onClose={() => setShowGuideModal(false)}
      />

      {/* 사주 · MBTI 통합 AI 심층 대화 모달 (기초 운세 제외, 심층 리포트 발급 후에만 이용 가능) */}
      {selectedTopic && (
        <SajuChatModal
          visible={showChatModal}
          onClose={() => setShowChatModal(false)}
          topic={selectedTopic}
          userSaju={currentManseryeokAnalysis}
          mbti={userBirthInfo.mbti}
          reportContext={{ coreKeyword: report.coreKeyword, summaryQuote: report.summaryQuote }}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NEUTRAL.gray900,
    marginTop: 12,
  },
  errorSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  backHomeBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  backHomeBtnText: {
    color: theme.onPrimaryText,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 50,
  },
  footerActions: {
    gap: 12,
  },
  chatBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  chatBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.onPrimaryText,
  },
  reselectBtn: {
    backgroundColor: NEUTRAL.gray900,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  reselectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.onPrimaryText,
  },
});
