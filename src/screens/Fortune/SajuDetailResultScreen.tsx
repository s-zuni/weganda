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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFortuneStore } from '../../store/useFortuneStore';
import { ELEMENT_COLORS, PillarData } from '../../services/manseryeokService';
import { SajuTopicInfographic } from '../../components/specific/Fortune';
import {
  SAJU_ANALYSIS_GUIDE_MD,
  SAJU_GUIDE_METADATA,
} from '../../constants/sajuAnalysisGuide';

export const SajuDetailResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    currentManseryeokAnalysis,
    currentPartnerAnalysis,
    currentManseryeokReport,
    selectedTopic,
  } = useFortuneStore();

  const [showGuideModal, setShowGuideModal] = useState(false);

  if (!currentManseryeokAnalysis || !currentManseryeokReport) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>분석 결과가 없습니다</Text>
          <Text style={styles.errorSub}>사주 정보를 먼저 입력해 주세요.</Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.navigate('FortuneHome')}
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

  // 사주 기둥 렌더링 헬퍼
  const renderPillarColumn = (
    title: string,
    sub: string,
    pillar: PillarData,
    isDayMaster: boolean = false
  ) => (
    <View style={[styles.pillarColumn, isDayMaster && styles.dayMasterColumn]}>
      <Text style={styles.pillarHeaderTitle}>{title}</Text>
      <Text style={styles.pillarHeaderSub}>{sub}</Text>

      {/* 천간 영역 */}
      <View style={styles.stemBox}>
        <Text style={styles.tenGodText}>{pillar.stemTenGod}</Text>
        <View
          style={[
            styles.charCircle,
            { backgroundColor: ELEMENT_COLORS[pillar.stemElement] },
          ]}
        >
          <Text style={styles.hanjaChar}>{pillar.stemHanja}</Text>
        </View>
        <Text style={styles.koreanChar}>{pillar.stem}</Text>
        <Text style={styles.elementTag}>
          {pillar.stemYinYang} {pillar.stemElement}
        </Text>
      </View>

      {/* 구분선 */}
      <View style={styles.pillarDivider} />

      {/* 지지 영역 */}
      <View style={styles.branchBox}>
        <Text style={styles.tenGodText}>{pillar.branchTenGod}</Text>
        <View
          style={[
            styles.charCircle,
            { backgroundColor: ELEMENT_COLORS[pillar.branchElement] },
          ]}
        >
          <Text style={styles.hanjaChar}>{pillar.branchHanja}</Text>
        </View>
        <Text style={styles.koreanChar}>{pillar.branch}</Text>
        <Text style={styles.elementTag}>
          {pillar.branchYinYang} {pillar.branchElement}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 상단 네비게이션 헤더 */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {report.topicTitle}
        </Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 명인 인증 헤더 카드 */}
        <View style={styles.masterBanner}>
          <View style={styles.masterBadgeRow}>
            <View style={styles.masterBadge}>
              <Ionicons name="medal" size={14} color="#D4A853" />
              <Text style={styles.masterBadgeText}>50년 명인 정밀 사주 감정서</Text>
            </View>
            <Text style={styles.wordCountBadge}>
              심층 분석 {report.totalCharCount}자 수록
            </Text>
          </View>

          <TouchableOpacity
            style={styles.guideCertificationBadge}
            onPress={() => setShowGuideModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark" size={13} color="#1B4332" />
            <Text style={styles.guideCertificationText}>
              사주 분석 가이드({report.appliedGuideVersion || 'v1.0.0'}) 준수 감정
            </Text>
            <Ionicons name="information-circle-outline" size={14} color="#1B4332" />
          </TouchableOpacity>

          <Text style={styles.bannerTitle}>{report.topicTitle}</Text>
          <Text style={styles.summaryQuote}>{report.summaryQuote}</Text>

          <View style={styles.birthInfoTagRow}>
            <Text style={styles.birthInfoTag}>
              {birthInfo.year}. {birthInfo.month}. {birthInfo.day} ({birthInfo.isLunar ? '음력' : '양력'})
            </Text>
            <Text style={styles.birthInfoTag}>
              {birthInfo.gender === 'female' ? '여명(女命)' : '남명(男命)'}
            </Text>
          </View>
        </View>

        {/* 0. 주제별 맞춤 인포그래픽 시각화 */}
        <SajuTopicInfographic
          report={report}
          userSaju={currentManseryeokAnalysis}
          partnerSaju={currentPartnerAnalysis}
        />

        {/* 1. 만세력 사주 원국표 (四柱原局) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="grid" size={18} color="#FF507C" />
            <Text style={styles.sectionHeaderTitle}>만세력 사주 원국표 (四柱原局)</Text>
          </View>
          <Text style={styles.sectionHeaderDesc}>
            천간과 지지 8글자의 음양오행 및 십신(十神) 정밀 배치
          </Text>

          <View style={styles.pillarsCard}>
            <View style={styles.pillarsRow}>
              {renderPillarColumn('시주 (時柱)', '말년·자녀', pillars.hour)}
              {renderPillarColumn('일주 (日柱)', '본인·일간', pillars.day, true)}
              {renderPillarColumn('월주 (月柱)', '청년·직장', pillars.month)}
              {renderPillarColumn('연주 (年柱)', '초년·가문', pillars.year)}
            </View>

            <View style={styles.dayMasterCallout}>
              <Ionicons name="star" size={16} color="#FF507C" />
              <Text style={styles.dayMasterCalloutText}>
                나를 상징하는 일간(본원):{' '}
                <Text style={styles.dayMasterHighlight}>{dayMaster.natureTitle}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 2. 오행 분포 분석 (五行) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="pie-chart" size={18} color="#10B981" />
            <Text style={styles.sectionHeaderTitle}>오행(五行) 에너지 밸런스</Text>
          </View>

          <View style={styles.fiveElementsCard}>
            {fiveElements.map((el) => (
              <View key={el.rawName} style={styles.elementRow}>
                <View style={styles.elementNameWrap}>
                  <View style={[styles.elementDot, { backgroundColor: el.color }]} />
                  <Text style={styles.elementNameText}>{el.element}</Text>
                  <View
                    style={[
                      styles.elementStatusBadge,
                      el.status === '과다' && styles.statusOver,
                      el.status === '결핍' && styles.statusDeficient,
                    ]}
                  >
                    <Text style={styles.elementStatusText}>{el.status}</Text>
                  </View>
                </View>

                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.max(el.percentage, 5)}%`,
                        backgroundColor: el.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percentageText}>{el.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. 검출된 기운 및 신살 (神煞) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flash" size={18} color="#8B5CF6" />
            <Text style={styles.sectionHeaderTitle}>사주에 잠재된 특수 기운 & 신살 (神煞)</Text>
          </View>
          <Text style={styles.sectionHeaderDesc}>
            임상 현장에서 발현되는 귀문관살, 홍염살, 백호대살 등의 작용
          </Text>

          <View style={styles.shinsalList}>
            {detectedShinsals.length > 0 ? (
              detectedShinsals.map((shinsal) => (
                <View key={shinsal.name} style={styles.shinsalCard}>
                  <View style={styles.shinsalHeader}>
                    <View
                      style={[
                        styles.shinsalBadge,
                        { backgroundColor: shinsal.badgeColor },
                      ]}
                    >
                      <Text style={styles.shinsalBadgeText}>{shinsal.name}</Text>
                    </View>
                    <Text style={styles.shinsalHanja}>{shinsal.hanja}</Text>
                    <View style={styles.shinsalTypeTag}>
                      <Text style={styles.shinsalTypeTagText}>{shinsal.type}</Text>
                    </View>
                  </View>

                  <Text style={styles.shinsalSummary}>{shinsal.oneLineSummary}</Text>

                  <View style={styles.shinsalDetailBox}>
                    <Text style={styles.shinsalDetailLabel}>병원 임상 발현:</Text>
                    <Text style={styles.shinsalDetailText}>{shinsal.hospitalImpact}</Text>
                  </View>

                  <View style={[styles.shinsalDetailBox, { marginTop: 6 }]}>
                    <Text style={[styles.shinsalDetailLabel, { color: '#FF507C' }]}>
                      처방 조언:
                    </Text>
                    <Text style={styles.shinsalDetailText}>{shinsal.clinicalAdvice}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyShinsalCard}>
                <Text style={styles.emptyShinsalText}>
                  특정 흉살이나 극단적 충살 없이, 온화하고 원만한 정인(正印)의 기운이 흐릅니다.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 4. 10년 대운 흐름표 (大運) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="calendar" size={18} color="#3B82F6" />
            <Text style={styles.sectionHeaderTitle}>10년 대운(大運)의 인생 운로</Text>
          </View>
          <Text style={styles.sectionHeaderDesc}>
            {daewoon.startAge}세부터 시작하는 {daewoon.isForward ? '순행(順行)' : '역행(逆行)'} 운로 (현재 대운 강조)
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daewoonScroll}>
            {daewoon.pillars.map((item) => (
              <View
                key={item.age}
                style={[
                  styles.daewoonItem,
                  item.isCurrent && styles.daewoonItemCurrent,
                ]}
              >
                {item.isCurrent && (
                  <View style={styles.currentIndicatorBadge}>
                    <Text style={styles.currentIndicatorText}>현재 대운</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.daewoonAge,
                    item.isCurrent && styles.daewoonAgeCurrent,
                  ]}
                >
                  {item.age}세~
                </Text>
                <Text
                  style={[
                    styles.daewoonPillar,
                    item.isCurrent && styles.daewoonPillarCurrent,
                  ]}
                >
                  {item.korean}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 5. 50년 명인의 1,000자+ 심층 분석 리포트 본문 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="book" size={18} color="#111827" />
            <Text style={styles.sectionHeaderTitle}>50년 명인의 심층 명리학·심리 리포트</Text>
          </View>

          {report.sections.map((section, idx) => (
            <View key={section.title} style={styles.reportSectionCard}>
              <View style={styles.reportSectionHeader}>
                <View
                  style={[
                    styles.reportSectionBadge,
                    { backgroundColor: section.badgeColor },
                  ]}
                >
                  <Text style={styles.reportSectionBadgeText}>{section.badge}</Text>
                </View>
                <Text style={styles.reportSectionTitle}>
                  {idx + 1}. {section.title}
                </Text>
              </View>

              <Text style={styles.reportSectionContent}>{section.content}</Text>

              {section.keyPoints && (
                <View style={styles.keyPointsBox}>
                  {section.keyPoints.map((point) => (
                    <View key={point} style={styles.keyPointRow}>
                      <Ionicons name="checkmark-circle" size={15} color={section.badgeColor} />
                      <Text style={styles.keyPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 6. 명인의 최종 직언 및 행동 수칙 */}
        <View style={styles.directAdviceCard}>
          <View style={styles.directAdviceHeader}>
            <Ionicons name="alert-circle" size={20} color="#FF507C" />
            <Text style={styles.directAdviceTitle}>{report.directAdvice.title}</Text>
          </View>

          <View style={styles.adviceRow}>
            <Text style={styles.adviceLabel}>경고(禁忌):</Text>
            <Text style={styles.adviceWarnText}>{report.directAdvice.warning}</Text>
          </View>

          <View style={[styles.adviceRow, { marginTop: 8 }]}>
            <Text style={[styles.adviceLabel, { color: '#10B981' }]}>처방(行動):</Text>
            <Text style={styles.adviceActionText}>{report.directAdvice.actionRule}</Text>
          </View>
        </View>

        {/* 하단 탐색 버튼 */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.reselectBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.reselectBtnText}>다른 주제 둘러보기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 사주 분석 가이드 규격 모달 */}
      <Modal
        visible={showGuideModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuideModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text style={styles.modalTitle}>우간다 표준 사주 분석 가이드</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGuideModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.guideMetaBox}>
                <Text style={styles.guideMetaTitle}>
                  {SAJU_GUIDE_METADATA.title} ({report.appliedGuideVersion || SAJU_GUIDE_METADATA.version})
                </Text>
                <Text style={styles.guideMetaDesc}>
                  본 사주 분석은 『{report.guideRuleRef || SAJU_GUIDE_METADATA.filename}』의 8대 거버넌스 규격에 따라 50년 명인 페르소나 및 14대 임상 사주 알고리즘을 거쳐 정밀 산출되었습니다.
                </Text>
              </View>

              <Text style={styles.guideSectionHeading}>적용된 핵심 원칙 및 거버넌스</Text>
              <View style={styles.guideRuleItem}>
                <Ionicons name="checkmark-circle" size={16} color="#FF507C" />
                <Text style={styles.guideRuleText}>
                  <Text style={styles.guideRuleBold}>최소 1,000자 이상 심층 분석:</Text> 단편적 풀이를 배제하고 5대 정밀 섹션 체계 준수 (현재 {report.totalCharCount}자).
                </Text>
              </View>
              <View style={styles.guideRuleItem}>
                <Ionicons name="checkmark-circle" size={16} color="#FF507C" />
                <Text style={styles.guideRuleText}>
                  <Text style={styles.guideRuleBold}>간호 임상 십신·신살 매트릭스:</Text> 비견(동기애), 상관(직언/돌발상황), 귀문관살(예민한 관찰력/임상 촉) 등 병원 현장 맞춤 해석.
                </Text>
              </View>
              <View style={styles.guideRuleItem}>
                <Ionicons name="checkmark-circle" size={16} color="#FF507C" />
                <Text style={styles.guideRuleText}>
                  <Text style={styles.guideRuleBold}>객관적 대운 & 금기/행동 직언:</Text> 뜬구름 잡는 위로 대신 실질적인 태움 방어, 이직 타이밍, 나이트 근무 행동 수칙 명시.
                </Text>
              </View>
              <View style={styles.guideRuleItem}>
                <Ionicons name="checkmark-circle" size={16} color="#FF507C" />
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
              onPress={() => setShowGuideModal(false)}
            >
              <Text style={styles.modalConfirmBtnText}>확인 및 감정서 계속 읽기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
    marginTop: 12,
  },
  errorSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  backHomeBtn: {
    backgroundColor: '#FF507C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  navHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 50,
  },
  masterBanner: {
    backgroundColor: '#1B4332', // Deep Green for Master Certificate
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  masterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  masterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 168, 83, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  masterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4A853',
  },
  wordCountBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryQuote: {
    fontSize: 13,
    color: '#D1FAE5',
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  birthInfoTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  birthInfoTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  sectionHeaderDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 24,
  },
  pillarsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillarColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
  },
  dayMasterColumn: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FF507C',
  },
  pillarHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  pillarHeaderSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  stemBox: {
    alignItems: 'center',
  },
  branchBox: {
    alignItems: 'center',
  },
  tenGodText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  charCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  hanjaChar: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  koreanChar: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  elementTag: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
  pillarDivider: {
    width: '70%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  dayMasterCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F4',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  dayMasterCalloutText: {
    fontSize: 12,
    color: '#1F2937',
  },
  dayMasterHighlight: {
    fontWeight: '800',
    color: '#FF507C',
  },
  fiveElementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  elementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  elementNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 86,
    gap: 4,
  },
  elementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  elementNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  elementStatusBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOver: {
    backgroundColor: '#FEE2E2',
  },
  statusDeficient: {
    backgroundColor: '#E0E7FF',
  },
  elementStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    width: 32,
    textAlign: 'right',
  },
  shinsalList: {
    gap: 12,
  },
  shinsalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shinsalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  shinsalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shinsalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shinsalHanja: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  shinsalTypeTag: {
    marginLeft: 'auto',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shinsalTypeTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  shinsalSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  shinsalDetailBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
  },
  shinsalDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 2,
  },
  shinsalDetailText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 17,
  },
  emptyShinsalCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyShinsalText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  daewoonScroll: {
    flexDirection: 'row',
  },
  daewoonItem: {
    width: 68,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  daewoonItemCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  currentIndicatorBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  currentIndicatorText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daewoonAge: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  daewoonAgeCurrent: {
    color: '#1D4ED8',
  },
  daewoonPillar: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  daewoonPillarCurrent: {
    color: '#1D4ED8',
  },
  reportSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  reportSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reportSectionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reportSectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reportSectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  reportSectionContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  keyPointsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyPointText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 18,
    flex: 1,
  },
  directAdviceCard: {
    backgroundColor: '#FFF1F4',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FF507C',
    marginBottom: 24,
  },
  directAdviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  directAdviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B91C1C',
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
    width: 64,
  },
  adviceWarnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 18,
  },
  adviceActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    lineHeight: 18,
  },
  footerActions: {
    gap: 12,
  },
  reselectBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reselectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guideCertificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  guideCertificationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F3F4F6',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    marginVertical: 14,
  },
  guideMetaBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  guideMetaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 6,
  },
  guideMetaDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
    lineHeight: 18,
  },
  guideSectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
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
    color: '#374151',
    lineHeight: 18,
  },
  guideRuleBold: {
    fontWeight: '700',
    color: '#111827',
  },
  guideExcerptBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
    marginBottom: 8,
  },
  guideExcerptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
  },
  guideExcerptText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
  },
  modalConfirmBtn: {
    backgroundColor: '#FF507C',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
