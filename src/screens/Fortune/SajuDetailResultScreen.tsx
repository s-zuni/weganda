import React from 'react';
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
import { ELEMENT_COLORS, PillarData } from '../../services/manseryeokService';

export const SajuDetailResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentManseryeokAnalysis, currentManseryeokReport } = useFortuneStore();

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
              <Ionicons name="medal" size={15} color="#D4A853" />
              <Text style={styles.masterBadgeText}>50년 명인 정밀 사주 감정서</Text>
            </View>
            <Text style={styles.wordCountBadge}>
              심층 분석 {report.totalCharCount}자 수록
            </Text>
          </View>
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

        {/* 1. 만세력 사주 원국표 (四柱原局) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="grid" size={20} color="#FF507C" />
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
              <Ionicons name="star" size={18} color="#FF507C" />
              <Text style={styles.dayMasterCalloutText}>
                나를 상징하는 일간(본원):{' '}
                <Text style={styles.dayMasterHighlight}>{dayMaster.natureTitle}</Text>
              </Text>
            </View>

            {/* 인포그래픽: 음양 밸런스 듀얼 바 */}
            <View style={styles.yinYangSection}>
              <View style={styles.yinYangHeader}>
                <Text style={styles.yinYangLabel}>음양(陰陽) 에너지 밸런스</Text>
                <Text style={styles.yinYangRatioText}>
                  양(陽) {yangRatio}% : 음(陰) {yinRatio}%
                </Text>
              </View>
              <View style={styles.yinYangTrack}>
                <View
                  style={[styles.yinYangFillYang, { width: `${yangRatio}%` }]}
                />
                <View
                  style={[styles.yinYangFillYin, { width: `${yinRatio}%` }]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 2. 오행 분포 분석 (五行) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="pie-chart" size={20} color="#10B981" />
            <Text style={styles.sectionHeaderTitle}>오행(五行) 에너지 밸런스</Text>
          </View>
          <Text style={styles.sectionHeaderDesc}>
            목·화·토·금·수 5가지 기운의 분포율과 과다/결핍 진단
          </Text>

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
            <Ionicons name="flash" size={20} color="#8B5CF6" />
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
                    <Text style={styles.shinsalDetailLabel}>🏥 병원 임상 발현:</Text>
                    <Text style={styles.shinsalDetailText}>{shinsal.hospitalImpact}</Text>
                  </View>

                  <View style={[styles.shinsalDetailBox, { marginTop: 8, backgroundColor: '#FFF5F7' }]}>
                    <Text style={[styles.shinsalDetailLabel, { color: '#FF507C' }]}>
                      💡 50년 명인 처방 조언:
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
            <Ionicons name="calendar" size={20} color="#3B82F6" />
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

        {/* 5. 주제별 특화 인포그래픽 모듈 */}
        {(report.topicId === 'custom_wealth_strategy' || report.topicId === 'night_allowance_wealth') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="wallet" size={20} color="#F59E0B" />
              <Text style={styles.sectionHeaderTitle}>📊 맞춤 자산 포트폴리오 3분할 인포그래픽</Text>
            </View>
            <View style={styles.infographicBox}>
              <View style={styles.portfolioRatioBar}>
                <View style={[styles.portfolioSegment, { width: '45%', backgroundColor: '#10B981' }]}>
                  <Text style={styles.portfolioSegText}>안전자산 45%</Text>
                </View>
                <View style={[styles.portfolioSegment, { width: '35%', backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.portfolioSegText}>배당 ETF 35%</Text>
                </View>
                <View style={[styles.portfolioSegment, { width: '20%', backgroundColor: '#FF507C' }]}>
                  <Text style={styles.portfolioSegText}>건강 20%</Text>
                </View>
              </View>

              <View style={styles.portfolioLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>청약 & 비상금 파킹 (45%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.legendText}>미국 S&P 500 배당주 (35%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FF507C' }]} />
                  <Text style={styles.legendText}>체력 & 전문자격 자본 (20%)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {report.topicId === 'ward_fit' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="medkit" size={20} color="#FF507C" />
              <Text style={styles.sectionHeaderTitle}>🏥 병동별 적합도 랭킹 인포그래픽</Text>
            </View>
            <View style={styles.infographicBox}>
              {[
                { rank: '1위', ward: '응급실 (ER) & 중환자실 (ICU)', score: 98, color: '#FF507C' },
                { rank: '2위', ward: '일반 병동 (Ward)', score: 86, color: '#3B82F6' },
                { rank: '3위', ward: '수술실 (OR)', score: 79, color: '#10B981' },
                { rank: '4위', ward: '외래 / 건강검진센터', score: 65, color: '#9CA3AF' },
              ].map((item) => (
                <View key={item.rank} style={styles.wardRankRow}>
                  <Text style={styles.wardRankText}>{item.rank}</Text>
                  <Text style={styles.wardNameText}>{item.ward}</Text>
                  <View style={styles.wardBarTrack}>
                    <View style={[styles.wardBarFill, { width: `${item.score}%`, backgroundColor: item.color }]} />
                  </View>
                  <Text style={[styles.wardScoreText, { color: item.color }]}>{item.score}점</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 6. 50년 명인의 1,000자+ 심층 분석 리포트 본문 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="book" size={20} color="#111827" />
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
                      <Ionicons name="checkmark-circle" size={17} color={section.badgeColor} />
                      <Text style={styles.keyPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 7. 명인의 최종 직언 및 행동 수칙 (시각적 대비 카드) */}
        <View style={styles.directAdviceCard}>
          <View style={styles.directAdviceHeader}>
            <Ionicons name="alert-circle" size={22} color="#FF507C" />
            <Text style={styles.directAdviceTitle}>{report.directAdvice.title}</Text>
          </View>

          <View style={styles.adviceBlockWarn}>
            <View style={styles.adviceBlockHeader}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={styles.adviceWarnLabel}>명인의 절대 금기(禁忌)</Text>
            </View>
            <Text style={styles.adviceWarnText}>{report.directAdvice.warning}</Text>
          </View>

          <View style={styles.adviceBlockAction}>
            <View style={styles.adviceBlockHeader}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.adviceActionLabel}>명인의 즉각 실천(行動)</Text>
            </View>
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
            <Text style={styles.reselectBtnText}>다른 사주 주제 둘러보기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  errorSub: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  backHomeBtn: {
    backgroundColor: '#FF507C',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  navHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
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
    paddingTop: 18,
    paddingBottom: 60,
  },
  masterBanner: {
    backgroundColor: '#1B4332', // Deep Green for Master Certificate
    borderRadius: 22,
    padding: 22,
    marginBottom: 26,
  },
  masterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  masterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 168, 83, 0.22)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  masterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A853',
  },
  wordCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  bannerTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 33,
  },
  summaryQuote: {
    fontSize: 15,
    color: '#D1FAE5',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  birthInfoTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  birthInfoTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 26,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  sectionHeaderDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
    marginLeft: 28,
  },
  pillarsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  pillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillarColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderRadius: 14,
  },
  dayMasterColumn: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1.5,
    borderColor: '#FF507C',
  },
  pillarHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  pillarHeaderSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  stemBox: {
    alignItems: 'center',
  },
  branchBox: {
    alignItems: 'center',
  },
  tenGodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 5,
  },
  charCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  hanjaChar: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  koreanChar: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  elementTag: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  pillarDivider: {
    width: '75%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  dayMasterCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1F4',
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  dayMasterCalloutText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  dayMasterHighlight: {
    fontWeight: '800',
    color: '#FF507C',
  },
  yinYangSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  yinYangHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  yinYangLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  yinYangRatioText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  yinYangTrack: {
    height: 10,
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  yinYangFillYang: {
    backgroundColor: '#EF4444',
    height: '100%',
  },
  yinYangFillYin: {
    backgroundColor: '#3B82F6',
    height: '100%',
  },
  fiveElementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  elementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  elementNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 96,
    gap: 6,
  },
  elementDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  elementNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  elementStatusBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusOver: {
    backgroundColor: '#FEE2E2',
  },
  statusDeficient: {
    backgroundColor: '#E0E7FF',
  },
  elementStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
    width: 40,
    textAlign: 'right',
  },
  shinsalList: {
    gap: 14,
  },
  shinsalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  shinsalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  shinsalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },
  shinsalBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shinsalHanja: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  shinsalTypeTag: {
    marginLeft: 'auto',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shinsalTypeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  shinsalSummary: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  shinsalDetailBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  shinsalDetailLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4B5563',
    marginBottom: 3,
  },
  shinsalDetailText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyShinsalCard: {
    backgroundColor: '#F9FAFB',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyShinsalText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  daewoonScroll: {
    flexDirection: 'row',
  },
  daewoonItem: {
    width: 74,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  daewoonItemCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  currentIndicatorBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  currentIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  daewoonAge: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  daewoonAgeCurrent: {
    color: '#1D4ED8',
  },
  daewoonPillar: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },
  daewoonPillarCurrent: {
    color: '#1D4ED8',
  },
  infographicBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  portfolioRatioBar: {
    flexDirection: 'row',
    height: 38,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },
  portfolioSegment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioSegText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  portfolioLegendRow: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  wardRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  wardRankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF507C',
    width: 28,
  },
  wardNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    width: 140,
  },
  wardBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  wardBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  wardScoreText: {
    fontSize: 13,
    fontWeight: '800',
    width: 32,
    textAlign: 'right',
  },
  reportSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 18,
  },
  reportSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  reportSectionBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  reportSectionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reportSectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    flex: 1,
  },
  reportSectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    fontWeight: '400',
  },
  keyPointsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    gap: 8,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyPointText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  directAdviceCard: {
    backgroundColor: '#FFF1F4',
    borderRadius: 22,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF507C',
    marginBottom: 26,
  },
  directAdviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  directAdviceTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B91C1C',
  },
  adviceBlockWarn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  adviceBlockAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  adviceBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adviceWarnLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  adviceActionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },
  adviceWarnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 21,
  },
  adviceActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    lineHeight: 21,
  },
  footerActions: {
    gap: 12,
  },
  reselectBtn: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  reselectBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
