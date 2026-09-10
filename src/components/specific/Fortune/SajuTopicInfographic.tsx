import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeneratedSajuReport } from '../../../utils/sajuAnalysisGenerator';
import {
  SajuAnalysisResult,
  PillarData,
  ELEMENT_COLORS,
} from '../../../services/manseryeokService';

interface SajuTopicInfographicProps {
  report: GeneratedSajuReport;
  userSaju: SajuAnalysisResult;
  partnerSaju?: SajuAnalysisResult;
}

export const SajuTopicInfographic: React.FC<SajuTopicInfographicProps> = ({
  report,
  userSaju,
  partnerSaju,
}) => {
  const { infographicType, infographicData } = report;

  // ─── 4기둥 축약형 렌더링 헬퍼 ───
  const renderCompactPillar = (
    title: string,
    pillar: PillarData,
    isDayMaster: boolean = false
  ) => (
    <View style={[styles.compactPillar, isDayMaster && styles.compactPillarActive]}>
      <Text style={styles.compactPillarTitle}>{title}</Text>
      <View
        style={[
          styles.compactCharCircle,
          { backgroundColor: ELEMENT_COLORS[pillar.stemElement] },
        ]}
      >
        <Text style={styles.compactHanjaChar}>{pillar.stemHanja}</Text>
      </View>
      <Text style={styles.compactKoreanChar}>{pillar.stem}</Text>
      <View style={styles.compactDivider} />
      <View
        style={[
          styles.compactCharCircle,
          { backgroundColor: ELEMENT_COLORS[pillar.branchElement] },
        ]}
      >
        <Text style={styles.compactHanjaChar}>{pillar.branchHanja}</Text>
      </View>
      <Text style={styles.compactKoreanChar}>{pillar.branch}</Text>
    </View>
  );

  // ─── 1. 동료/프리셉터/연인 궁합 인포그래픽 ───
  if (infographicType === 'partner_chemistry') {
    const partnerName = infographicData.partnerName || '상대방';
    const chemistryScore = infographicData.chemistryScore || report.overallScore;
    const handoverScore = infographicData.handoverScore || 88;
    const conflictScore = infographicData.conflictScore || 20;
    const elementMatch = infographicData.elementMatch || '오행 상생의 조화';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-circle" size={20} color="#10B981" />
          <Text style={styles.cardTitle}>
            {partnerName}님과의 사주 궁합 & 케미 지수
          </Text>
        </View>
        <Text style={styles.cardSubtitle}>
          두 사람의 만세력 사주팔자 대조 및 임상 협업 호흡
        </Text>

        {/* 종합 궁합 점수 배너 */}
        <View style={styles.scoreBanner}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>종합 케미 지수</Text>
            <Text style={styles.scoreValue}>{chemistryScore}점</Text>
            <Text style={styles.scoreGrade}>
              {chemistryScore >= 90 ? '🌟 천생연분 찰떡궁합' : '✨ 상호보완적 명콤비'}
            </Text>
          </View>
          <View style={styles.scoreRightBadge}>
            <Text style={styles.scoreRightBadgeText}>{elementMatch}</Text>
          </View>
        </View>

        {/* 사주 4기둥 대조표 */}
        {partnerSaju && (
          <View style={styles.comparisonBox}>
            <Text style={styles.subSectionTitle}>사주 원국(四柱) 상호 대조</Text>

            {/* 본인 4기둥 */}
            <View style={styles.pillarGroup}>
              <View style={styles.pillarLabelRow}>
                <Ionicons name="person" size={14} color="#FF507C" />
                <Text style={styles.pillarGroupLabel}>본인 ({userSaju.dayMaster.natureTitle})</Text>
              </View>
              <View style={styles.pillarsRow}>
                {renderCompactPillar('시주', userSaju.pillars.hour)}
                {renderCompactPillar('일주', userSaju.pillars.day, true)}
                {renderCompactPillar('월주', userSaju.pillars.month)}
                {renderCompactPillar('연주', userSaju.pillars.year)}
              </View>
            </View>

            {/* 상대방 4기둥 */}
            <View style={[styles.pillarGroup, { marginTop: 12 }]}>
              <View style={styles.pillarLabelRow}>
                <Ionicons name="people" size={14} color="#10B981" />
                <Text style={styles.pillarGroupLabel}>
                  {partnerName} ({partnerSaju.dayMaster.natureTitle})
                </Text>
              </View>
              <View style={styles.pillarsRow}>
                {renderCompactPillar('시주', partnerSaju.pillars.hour)}
                {renderCompactPillar('일주', partnerSaju.pillars.day, true)}
                {renderCompactPillar('월주', partnerSaju.pillars.month)}
                {renderCompactPillar('연주', partnerSaju.pillars.year)}
              </View>
            </View>
          </View>
        )}

        {/* 세부 케미 지표 프로그레스 바 */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>인수인계 & 업무 호흡</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{handoverScore}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${handoverScore}%`, backgroundColor: '#10B981' }]} />
            </View>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>갈등 및 마찰 위험도</Text>
              <Text style={[styles.metricValue, { color: '#EF4444' }]}>{conflictScore}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${conflictScore}%`, backgroundColor: '#EF4444' }]} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ─── 2. 병동 적합도 인포그래픽 ───
  if (infographicType === 'ward_radar') {
    const { bestWard, erScore, icuScore, wardScore, orScore, opdScore } = infographicData;

    const wardList = [
      { name: '응급실 (ER)', score: erScore || 95, icon: 'flash' },
      { name: '중환자실 (ICU)', score: icuScore || 92, icon: 'pulse' },
      { name: '수술실 (OR)', score: orScore || 90, icon: 'cut' },
      { name: '일반 병동 (Ward)', score: wardScore || 80, icon: 'bed' },
      { name: '외래/건강검진 (OPD)', score: opdScore || 72, icon: 'document-text' },
    ];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="pie-chart" size={20} color="#FF507C" />
          <Text style={styles.cardTitle}>병동 부서별 적합도 랭킹</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          사주 일간 오행과 백호·귀문관살 기반 부서 매칭
        </Text>

        <View style={styles.bestBadgeBox}>
          <Ionicons name="trophy" size={18} color="#D4A853" />
          <Text style={styles.bestBadgeText}>
            최고 궁합 부서: <Text style={styles.bestBadgeHighlight}>{bestWard}</Text>
          </Text>
        </View>

        <View style={styles.wardList}>
          {wardList.map((item, idx) => (
            <View key={item.name} style={styles.wardRow}>
              <View style={styles.wardRankBadge}>
                <Text style={styles.wardRankText}>{idx + 1}위</Text>
              </View>
              <Text style={styles.wardName}>{item.name}</Text>
              <View style={styles.wardBarTrack}>
                <View
                  style={[
                    styles.wardBarFill,
                    {
                      width: `${item.score}%`,
                      backgroundColor: idx === 0 ? '#FF507C' : idx === 1 ? '#3B82F6' : '#9CA3AF',
                    },
                  ]}
                />
              </View>
              <Text style={styles.wardScoreText}>{item.score}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ─── 3. 오늘의 업무 난이도 인포그래픽 ───
  if (infographicType === 'duty_difficulty') {
    const { shiftDifficultyScore, overtimeRisk, cautionWindow, ivSuccessRate } =
      infographicData;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="speedometer" size={20} color="#3B82F6" />
          <Text style={styles.cardTitle}>오늘의 듀티 안전 모니터링</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          일진(日辰) 에너지와 시간대별 임상 처방 지표
        </Text>

        <View style={styles.grid2Col}>
          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>IV 원샷 성공률</Text>
            <Text style={[styles.tileValue, { color: '#10B981' }]}>
              {ivSuccessRate || 95}%
            </Text>
            <Text style={styles.tileSub}>손끝의 감각 최상</Text>
          </View>

          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>오버타임(OT) 확률</Text>
            <Text style={[styles.tileValue, { color: '#3B82F6' }]}>
              {overtimeRisk || 28}%
            </Text>
            <Text style={styles.tileSub}>정시 칼퇴 가능권</Text>
          </View>
        </View>

        <View style={styles.cautionWindowBox}>
          <Ionicons name="warning" size={18} color="#EF4444" />
          <View style={{ flex: 1 }}>
            <Text style={styles.cautionTitle}>
              집중 주의 시간대: {cautionWindow || '14:00 ~ 16:30'}
            </Text>
            <Text style={styles.cautionDesc}>
              환자 돌발 바이탈 변동 및 고위험 약물 2인 더블체킹 필수
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ─── 4. 나이트 체질 & 생체 리듬 인포그래픽 ───
  if (infographicType === 'biorhythm_vital') {
    const { nightAdaptability, sleepWindow } = infographicData;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="fitness" size={20} color="#8B5CF6" />
          <Text style={styles.cardTitle}>나이트 체질 & 오행 장기 밸런스</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          수화(水火) 조후 균형과 수면 회복 프로토콜
        </Text>

        <View style={styles.grid2Col}>
          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>나이트 적응 체질</Text>
            <Text style={[styles.tileValue, { color: '#8B5CF6' }]}>
              {nightAdaptability || 84}%
            </Text>
            <Text style={styles.tileSub}>2~3일 단기 적합</Text>
          </View>

          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>황금 수면 윈도우</Text>
            <Text style={[styles.tileValue, { color: '#10B981', fontSize: 16 }]}>
              {sleepWindow || '09:30~15:30'}
            </Text>
            <Text style={styles.tileSub}>암막 커튼 100% 필수</Text>
          </View>
        </View>

        <View style={styles.organCard}>
          <Text style={styles.subSectionTitle}>오행 장기(臟器) 건강 현황</Text>
          <View style={styles.organRow}>
            <View style={styles.organTag}>
              <Text style={styles.organName}>신장·부신 (수)</Text>
              <Text style={[styles.organStatus, { color: '#EF4444' }]}>보양 필요</Text>
            </View>
            <View style={styles.organTag}>
              <Text style={styles.organName}>심장·순환 (화)</Text>
              <Text style={[styles.organStatus, { color: '#F59E0B' }]}>과열 주의</Text>
            </View>
            <View style={styles.organTag}>
              <Text style={styles.organName}>간·해독 (목)</Text>
              <Text style={[styles.organStatus, { color: '#10B981' }]}>양호</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ─── 5. 병원 풍수 인포그래픽 ───
  if (infographicType === 'fengshui_compass') {
    const { luckyDirection, bestScale, luckyColor } = infographicData;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="compass" size={20} color="#10B981" />
          <Text style={styles.cardTitle}>병원 오행 궁합 & 풍수 나침반</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          기운을 채워줄 최적 병원 규모와 지리적 방위
        </Text>

        <View style={styles.grid2Col}>
          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>최적 병원 규모</Text>
            <Text style={[styles.tileValue, { color: '#10B981', fontSize: 16 }]}>
              {bestScale || '상급종합병원'}
            </Text>
            <Text style={styles.tileSub}>체계적 시스템 적합</Text>
          </View>

          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>행운의 지리 방위</Text>
            <Text style={[styles.tileValue, { color: '#3B82F6' }]}>
              {luckyDirection || '동남방'}
            </Text>
            <Text style={styles.tileSub}>거주지 기준 출퇴근</Text>
          </View>
        </View>

        <View style={styles.fengshuiTipBox}>
          <Ionicons name="color-palette" size={18} color="#FF507C" />
          <Text style={styles.fengshuiTipText}>
            행운의 보완 컬러: <Text style={{ fontWeight: '700' }}>{luckyColor || '코랄 핑크 & 베이지'}</Text>
          </Text>
        </View>
      </View>
    );
  }

  // ─── 6. 커리어 & 이직/해외 대운 인포그래픽 ───
  if (infographicType === 'career_timeline') {
    const rate =
      infographicData.transitionSuccessRate ||
      infographicData.academicSuccessRate ||
      infographicData.nclexPassRate ||
      90;
    const goldenWindow =
      infographicData.goldenWindow || '올해 하반기 ~ 내년 상반기';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up" size={20} color="#3B82F6" />
          <Text style={styles.cardTitle}>커리어 도약 & 합격 지수</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          대운의 기운과 최적의 목표 달성 확률
        </Text>

        <View style={styles.grid2Col}>
          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>도전 성공 확률</Text>
            <Text style={[styles.tileValue, { color: '#3B82F6' }]}>{rate}%</Text>
            <Text style={styles.tileSub}>대운 상승기 작용</Text>
          </View>

          <View style={styles.infoTile}>
            <Text style={styles.tileLabel}>황금 타이밍 윈도우</Text>
            <Text style={[styles.tileValue, { color: '#10B981', fontSize: 14 }]}>
              {goldenWindow}
            </Text>
            <Text style={styles.tileSub}>문서운 집중 시기</Text>
          </View>
        </View>
      </View>
    );
  }

  // ─── 7. 재테크 & 부동산 인포그래픽 ───
  if (infographicType === 'wealth_portfolio') {
    const regular = infographicData.regularWealthRatio || 70;
    const speculative = infographicData.speculativeWealthRatio || 30;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cash" size={20} color="#F59E0B" />
          <Text style={styles.cardTitle}>사주 맞춤 자산 배분 포트폴리오</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          정재(안정 저축)와 편재(성장 투자)의 황금 비율
        </Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>정재(안정 배당·저축·청약)</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{regular}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${regular}%`, backgroundColor: '#10B981' }]} />
            </View>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>편재(S&P500 지수 ETF)</Text>
              <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{speculative}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${speculative}%`, backgroundColor: '#3B82F6' }]} />
            </View>
          </View>
        </View>

        <View style={styles.seedBox}>
          <Ionicons name="shield-checkmark" size={18} color="#F59E0B" />
          <Text style={styles.seedText}>
            나이트 수당 100% 자동 이체 시 3년 내 1억 종잣돈 완성 로드맵
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
    marginLeft: 26,
  },
  scoreBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  scoreLeft: {
    gap: 2,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#047857',
  },
  scoreGrade: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  scoreRightBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  scoreRightBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  comparisonBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  pillarGroup: {
    gap: 6,
  },
  pillarLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillarGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  pillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactPillar: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 6,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compactPillarActive: {
    borderColor: '#FF507C',
    backgroundColor: '#FFF1F4',
  },
  compactPillarTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  compactCharCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactHanjaChar: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  compactKoreanChar: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },
  compactDivider: {
    width: '60%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  metricsContainer: {
    gap: 12,
  },
  metricItem: {
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  bestBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  bestBadgeText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  bestBadgeHighlight: {
    fontWeight: '800',
    color: '#B45309',
  },
  wardList: {
    gap: 10,
  },
  wardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wardRankBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  wardRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  wardName: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
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
    width: 38,
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  grid2Col: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoTile: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    gap: 2,
  },
  tileLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  tileValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  tileSub: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  cautionWindowBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cautionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 2,
  },
  cautionDesc: {
    fontSize: 11,
    color: '#7F1D1D',
  },
  organCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  organRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  organTag: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  organName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 2,
  },
  organStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  fengshuiTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1F4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  fengshuiTipText: {
    fontSize: 12,
    color: '#9F1239',
  },
  seedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  seedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
});
