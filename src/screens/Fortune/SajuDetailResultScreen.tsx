import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
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
} from '../../components/specific/Fortune';
import { COLORS, NEUTRAL } from '../../constants/theme';

export const SajuDetailResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    currentManseryeokAnalysis,
    currentPartnerAnalysis,
    currentManseryeokReport,
  } = useFortuneStore();

  const [showGuideModal, setShowGuideModal] = useState(false);

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

  // 음양(陰陽) 비율 계산
  const yangCount = [
    pillars.year.stemYinYang,
    pillars.year.branchYinYang,
    pillars.month.stemYinYang,
    pillars.month.branchYinYang,
    pillars.day.stemYinYang,
    pillars.day.branchYinYang,
    pillars.hour.stemYinYang,
    pillars.hour.branchYinYang,
  ].filter((v) => v === '양').length;
  const yangRatio = Math.round((yangCount / 8) * 100);
  const yinRatio = 100 - yangRatio;

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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

        {/* 1. 만세력 사주 원국표 (四柱原局) */}
        <SajuPillarsCard pillars={pillars} dayMaster={dayMaster} />

        {/* 2. 오행 분포 분석 (五行) */}
        <SajuFiveElementsCard fiveElements={fiveElements} />

        {/* 3. 검출된 기운 및 신살 (神煞) */}
        <SajuShinsalCard detectedShinsals={detectedShinsals} />

        {/* 4. 10년 대운 흐름표 (大運) */}
        <SajuDaewoonTimeline daewoon={daewoon} />

        {/* 5. 50년 명인의 심층 명리학·심리 리포트 본문 & 6. 명인의 최종 직언 */}
        <SajuReportContentCard
          sections={report.sections}
          directAdvice={report.directAdvice}
        />

        {/* 하단 탐색 버튼 */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.reselectBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="다른 주제 둘러보기"
          >
            <Text style={styles.reselectBtnText}>다른 사주 주제 둘러보기</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  backHomeBtnText: {
    color: COLORS.onPrimaryText,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 60,
  },
  footerActions: {
    gap: 12,
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
    color: COLORS.onPrimaryText,
  },
});
