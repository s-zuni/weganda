import {
  SajuAnalysisResult,
  ShinsalDetected,
  FiveElementsRatio,
  PillarData,
} from '../services/manseryeokService';
import { SajuTopicItem } from '../mocks/sajuCategories';

export interface AnalysisSection {
  title: string;
  badge: string;
  badgeColor: string;
  content: string;
  keyPoints?: string[];
}

export type InfographicType =
  | 'ward_radar'
  | 'fengshui_compass'
  | 'duty_difficulty'
  | 'biorhythm_vital'
  | 'partner_chemistry'
  | 'career_timeline'
  | 'wealth_portfolio'
  | 'general';

export interface GeneratedSajuReport {
  topicId: string;
  topicTitle: string;
  personaSummary: string;
  overallScore: number;
  totalCharCount: number;
  coreKeyword: string;
  summaryQuote: string;
  sections: AnalysisSection[];
  directAdvice: {
    title: string;
    warning: string;
    actionRule: string;
  };
  infographicType: InfographicType;
  infographicData: Record<string, any>;
  appliedGuideVersion?: string;
  analyzedViaGuide?: boolean;
  guideRuleRef?: string;
}

// ─── 유틸리티 헬퍼 ──────────────────────────────────────────────
const getDominantAndWeak = (fiveElements: FiveElementsRatio[]) => {
  const sorted = [...fiveElements].sort((a, b) => b.percentage - a.percentage);
  return {
    dominant: sorted[0] || { element: '화(火)', percentage: 30, count: 2, trait: '열정·직관' },
    weak: sorted[sorted.length - 1] || { element: '수(水)', percentage: 10, count: 1, trait: '침착·유연' },
  };
};

const getPrimaryShinsal = (shinsals: ShinsalDetected[]): ShinsalDetected => {
  return (
    shinsals.find((s) => s.name === '귀문관살') ||
    shinsals.find((s) => s.name === '홍염살') ||
    shinsals.find((s) => s.name === '백호대살') ||
    shinsals.find((s) => s.name === '괴강살') ||
    shinsals.find((s) => s.name === '천을귀인') ||
    shinsals.find((s) => s.name === '역마살') ||
    shinsals[0] || {
      name: '정인귀기',
      hanja: '正印貴氣',
      badgeColor: '#10B981',
      oneLineSummary: '차분하고 반듯한 의료인으로서의 자질과 도덕성을 품고 있음',
      hospitalImpact: '원칙에 충실한 환자 간호로 의료진과 환자 모두에게 두터운 신뢰를 얻습니다.',
      clinicalAdvice: '지나친 모범생 콤플렉스로 스스로를 옥죄지 말고 실수를 유연하게 수용하세요.',
      type: '길신',
    }
  );
};

// 상대방 사주와의 오행·십신 궁합 지수 산출
const calculateChemistry = (
  userSaju: SajuAnalysisResult,
  partnerSaju?: SajuAnalysisResult
) => {
  if (!partnerSaju) {
    return {
      score: 86,
      harmonyDesc: '상호 보완적인 기운이 은근히 작용하여 손발이 잘 맞는 배합입니다.',
      elementMatch: '목화(木火)와 금수(金水)의 음양 조화',
      handoverScore: 88,
      conflictScore: 22,
    };
  }

  const userDayStem = userSaju.pillars.day.stem;
  const partnerDayStem = partnerSaju.pillars.day.stem;

  // 천간합 여부
  const stemCombinations = ['갑기', '기갑', '을경', '경을', '병신', '신병', '정임', '임정', '무계', '계무'];
  const pairStem = `${userDayStem}${partnerDayStem}`;
  const hasStemHarmony = stemCombinations.includes(pairStem);

  let score = 84;
  if (hasStemHarmony) score += 10;

  // 상생 오행 검사
  const userDom = getDominantAndWeak(userSaju.fiveElements).dominant.element;
  const partnerDom = getDominantAndWeak(partnerSaju.fiveElements).dominant.element;

  if (userDom !== partnerDom) score += 4;
  score = Math.min(Math.max(score, 72), 98);

  return {
    score,
    hasStemHarmony,
    harmonyDesc: hasStemHarmony
      ? `천간합(${userDayStem}·${partnerDayStem})의 특별한 기운이 깃들어 첫인상부터 통하는 천생연분의 호흡입니다.`
      : `${userDayStem}과 ${partnerDayStem}의 서로 다른 개성이 조화를 이루어 서로의 맹점을 커버해 주는 실속형 궁합입니다.`,
    elementMatch: `${userSaju.dayMaster.natureTitle} × ${partnerSaju.dayMaster.natureTitle}`,
    handoverScore: Math.min(score + 4, 99),
    conflictScore: Math.max(100 - score, 15),
  };
};

export const sajuAnalysisGenerator = {
  /**
   * 14개 전 주제별로 완전히 상이한 1,000자+ 심층 리포트 및 인포그래픽 데이터를 생성합니다.
   */
  generateReport(params: {
    topic: SajuTopicItem;
    userSaju: SajuAnalysisResult;
    partnerSaju?: SajuAnalysisResult;
    partnerName?: string;
  }): GeneratedSajuReport {
    const { topic, userSaju, partnerSaju, partnerName } = params;

    const { dominant, weak } = getDominantAndWeak(userSaju.fiveElements);
    const primaryShinsal = getPrimaryShinsal(userSaju.detectedShinsals);
    const dayMaster = userSaju.dayMaster;
    const pillars = userSaju.pillars;
    const daewoon = userSaju.daewoon;
    const currentDaewoonPillar = daewoon.currentPillar?.korean || daewoon.pillars[0]?.korean || '갑자';
    const daewoonAge = daewoon.currentPillar?.age || daewoon.startAge;

    switch (topic.id) {
      // ══════════════════════════════════════════════════════════════
      // 1. NURSE CATEGORY (간호 사주)
      // ══════════════════════════════════════════════════════════════
      case 'ward_fit': {
        const hasWhiteTiger = userSaju.detectedShinsals.some((s) => s.name.includes('백호') || s.name.includes('괴강'));
        const hasGhostGate = userSaju.detectedShinsals.some((s) => s.name.includes('귀문'));

        const erScore = hasWhiteTiger ? 96 : 82;
        const icuScore = hasGhostGate ? 94 : 85;
        const wardScore = dominant.element.includes('목') || dominant.element.includes('토') ? 91 : 78;
        const orScore = dominant.element.includes('금') || hasWhiteTiger ? 93 : 75;
        const opdScore = weak.element.includes('화') ? 85 : 70;

        const bestWard = erScore >= icuScore ? '응급실(ER) 및 중환자실(ICU)' : '중환자실(ICU) 및 급성기 병동';

        const sections: AnalysisSection[] = [
          {
            title: '일간 오행과 병동 기운의 상생',
            badge: '원국 적성',
            badgeColor: '#FF507C',
            content: `당신의 명조는 '${dayMaster.natureTitle}'의 일간을 타고났습니다. 이 기운은 ${dayMaster.natureDescription}
사주 내에서 가장 왕성한 ${dominant.element}(${dominant.percentage}%)의 에너지는 위기 상황에서도 주눅 들지 않고 즉각적인 결단을 내리는 '임상 돌파력'으로 발현됩니다.
반대로 ${weak.element}(${weak.percentage}%)의 기운이 다소 부족하여, 지루하고 단조로운 반복 업무나 형식적인 행정 서류 처리를 요구하는 부서에서는 기운이 정체되고 직무 권태기를 겪기 쉽습니다. 따라서 생명과 직결되는 긴박한 처치가 이루어지는 급성기 환경이 당신의 오행 에너지를 가장 순도 높게 발산시키는 무대입니다.`,
            keyPoints: [
              `일간 특성: ${dayMaster.natureTitle}`,
              `에너지 폭발 부서: ${bestWard}`,
              `정체 유발 환경: 단순 반복 루틴 병동 및 서류 전담 부서`,
            ],
          },
          {
            title: `신살(神煞) 분석 — [${primaryShinsal.name}]의 부서 발현`,
            badge: '신살 적합도',
            badgeColor: primaryShinsal.badgeColor,
            content: `당신의 사주 원국에서 가장 뚜렷하게 힘을 발휘하는 신살은 [${primaryShinsal.name}(${primaryShinsal.hanja})]입니다.
${primaryShinsal.hospitalImpact}
50년 명리학 임상 통계에 따르면, ${primaryShinsal.name}을 지닌 간호사는 환자의 급격한 V/S 변화, 패혈증(Sepsis) 전조, 미세한 기도 폐쇄 증상을 육감적으로 포착해 냅니다.
일반 만성기 병동에 머물면 이런 날카로운 촉이 오히려 "과도한 걱정"으로 치부되어 피로를 부르지만, ER이나 ICU, OR과 같은 특수 파트에서는 환자의 목숨을 건져내는 결정적 천부지재(天賦之才)로 작용합니다.`,
            keyPoints: [
              `핵심 기운: ${primaryShinsal.name} (${primaryShinsal.hanja})`,
              `특수 파트 시너지: 긴급 노티(Notify) 및 어레스트(CPCR) 상황 시 침착성 발휘`,
            ],
          },
          {
            title: `대운(大運)의 흐름과 부서 로테이션 길일`,
            badge: '대운 로로',
            badgeColor: '#3B82F6',
            content: `현재 당신은 ${daewoonAge}세 [${currentDaewoonPillar}] 대운의 길목을 걷고 있습니다.
이 시기는 관성(官星, 조직·명예)과 식상(食傷, 전문 기술·손감각)이 교차하는 강력한 변곡점입니다.
만약 현재 부서에서 2년 이상 근무하며 매너리즘이나 소진을 느끼고 있다면, 대운의 지지가 일지를 충극하는 올해 하반기부터 내년 상반기까지가 '부서 로테이션 신청서'를 제출할 최적의 타이밍입니다. 특히 중환자 치료나 수술방, 전담 간호사로의 보직 변경은 당신의 이력에 날개를 달아줄 것입니다.`,
            keyPoints: [
              `현재 대운: [${currentDaewoonPillar}] 운로 통과 중`,
              `추천 이동 시기: 올해 가을~내년 봄 사이의 공식 정기 로테이션`,
            ],
          },
          {
            title: '부서별 번아웃 위험도 및 직무 만족 솔루션',
            badge: '임상 심리',
            badgeColor: '#8B5CF6',
            content: `심리학적으로 당신은 높은 성취 지향성을 지닌 반면, 스스로에게 너무 엄격한 기준을 적용하여 '자발적 과로 증후군'에 빠질 우려가 있습니다.
격무가 이어지는 특수 파트에서 살아남기 위해서는 '환자의 중증도'와 '나 자신의 존엄성' 사이에 방화벽을 세워야 합니다.
오늘 근무 중 아무리 위급한 상황을 겪었더라도, 스테이션 문을 나서는 순간 스테토스코프와 함께 마음의 긴장도 병동 사물함에 벗어두고 퇴근하십시오.`,
            keyPoints: [
              '퇴근 후 근무 기억 끄기(Off the clock ritual)',
              '환자의 예후에 대한 과도한 개인적 죄책감 분리',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `칼이 예리하면 숫돌에 갈 필요 없이 나무를 베지만, 그 칼끝으로 스스로를 찌르면 안 됩니다.
당신은 평범한 일반 병동에서 편하게 일하려 하면 몸은 편할지언정 속병이 나고, 오히려 땀을 쏟고 바쁘게 움직여야 피가 도는 사주입니다.
편안함(安逸)을 좇지 말고 전문성(專門性)을 좇으십시오. 힘든 부서에서 버텨낸 3년의 세월이 훗날 당신을 병원의 대체 불가능한 에이스로 우뚝 세울 것입니다.`,
            keyPoints: [
              '편안함 대신 전문성을 선택할 때 운이 트인다',
              '힘든 파트에서의 3년이 평생의 임상 자산이 된다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학 & 간호심리 명인의 병동 적합도 정밀 감정서',
          overallScore: 94,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `${dayMaster.stem}목 일간 · ${bestWard} 천직`,
          summaryQuote: `"${dayMaster.natureTitle}의 강인한 생명력과 ${primaryShinsal.name}의 투시력이 결합하여, 가장 위급하고 긴박한 병동에서 생명을 살리는 수호신이 될 명조입니다."`,
          sections,
          directAdvice: {
            title: '병동 부서 선택의 절대 금기(禁忌)와 행동 수칙',
            warning: '체력과 오행 기운이 넘치는데도 동기들의 눈치를 보며 정적인 부서에 안주하는 행위',
            actionRule: '고난도 처치와 즉각적 의사결정이 요구되는 특수 파트로 당당히 지원하여 몸값을 높여라.',
          },
          infographicType: 'ward_radar',
          infographicData: {
            bestWard,
            erScore,
            icuScore,
            wardScore,
            orScore,
            opdScore,
            primaryTrait: `${dominant.element}의 폭발적 위기대처`,
          },
        };
      }

      case 'hospital_fengshui': {
        const luckyDirection = dominant.element.includes('화') ? '동남(東南)방' : '서북(西北)방';
        const bestScale = dominant.percentage > 35 ? '빅5 상급종합병원' : '특화 전문병원 (재활/척추/관절)';

        const sections: AnalysisSection[] = [
          {
            title: '사주 조후(調候)와 병원 규모의 오행 궁합',
            badge: '병원 규모',
            badgeColor: '#10B981',
            content: `당신의 사주는 ${dayMaster.natureTitle}의 원국에 ${dominant.element} 기운이 깃들어 있습니다.
대형 의료기관(빅5 상급종합병원)은 명리학적으로 금수(金水)의 거대한 관성 조직에 해당하며, 중소 전문병원이나 로컬은 목화(木火)의 자율성과 유대감이 강한 환경입니다.
당신의 명조는 ${bestScale}에 소속되었을 때, 개인의 역량이 조직의 시스템과 시너지를 일으켜 가장 빠른 승진과 직무 권위를 인정받는 구조입니다. 너무 작은 로컬 의원에 머물면 조직의 비합리적 체계로 인해 억울함을 겪기 쉽습니다.`,
            keyPoints: [
              `최적 병원 규모: ${bestScale}`,
              `조직 궁합도: 92% (시스템과 규정이 명확한 환경 추천)`,
            ],
          },
          {
            title: '나의 부족한 기운을 채워주는 지리적 방위 풍수',
            badge: '방위 풍수',
            badgeColor: '#3B82F6',
            content: `사주에서 결핍된 ${weak.element} 기운을 보완하기 위해서는 현재 거주지를 기준으로 [${luckyDirection}]에 위치한 병원과의 인연이 가장 길(吉)합니다.
자연의 기운이 순행하는 방위에 위치한 병원으로 출퇴근할 때, 원인 모를 두통이나 출근길 메스꺼움이 사라지고 병동 내 상사 및 교수들과의 마찰이 자연스럽게 해소됩니다.
만약 현재 반대 방위의 병원에 근무 중이라면, 병원 출입구 기준으로 녹색 식물이나 밝은 조명을 활용해 음양을 조화롭게 다스리십시오.`,
            keyPoints: [
              `행운의 방위: 거주지 기준 [${luckyDirection}]`,
              `기운 보완 오행: ${weak.element} 기운 강화 인테리어`,
            ],
          },
          {
            title: '병동 내 스테이션 & 사물함 풍수 비방(秘方)',
            badge: '임상 풍수',
            badgeColor: '#F59E0B',
            content: `간호사 스테이션에서 차팅 컴퓨터를 선택할 수 있다면, 출입문을 등지는 등진 자리(背門)를 피하고, 병동 복도가 시야에 한눈에 들어오는 좌석을 선점하십시오.
등 뒤가 트여 있으면 배후에서 갑작스러운 처방 변경이나 환자 보호자의 컴플레인이 날아들어 신경쇠약에 시달리기 쉽습니다.
또한 개인 사물함 안쪽에는 붉은색이나 따뜻한 베이지색 소품을 하나 배치해 두면, 탈의실에서 교대할 때 나쁜 기운(살기)을 털어내고 신선한 활력을 충전할 수 있습니다.`,
            keyPoints: [
              '스테이션 좌석: 입구를 등지지 않는 배산임수형 위치 선정',
              '사물함 비방: 따뜻한 톤의 소품으로 교대 시 탁한 기운 차단',
            ],
          },
          {
            title: '대운의 지리 이동수와 이직 풍수 타이밍',
            badge: '이동 운로',
            badgeColor: '#8B5CF6',
            content: `현재 ${currentDaewoonPillar} 대운에서는 역마와 지살의 기운이 지지를 비추고 있어, 직주근접(職住近接)의 변화가 강하게 예고되어 있습니다.
무리하게 장거리 통근을 감수하며 번아웃을 겪기보다는, 병원 기숙사 입주나 병원 반경 3km 이내로의 독립이 운을 획기적으로 개선합니다.
출퇴근 시간을 40분 이내로 단축하는 것 자체가 사주의 수(水)기를 보호하여 나이트 수면 질을 결정적으로 끌어올립니다.`,
            keyPoints: [
              '통근 시간 단축이 곧 사주 조후의 건강 보약',
              '올해 하반기 주거지 이동과 직장 안착의 기운 길함',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `나무는 기름진 흙에 뿌리를 내려야 거목으로 자라는 법입니다.
이름값만 번지르르하고 간호사를 부속품처럼 갈아 넣는 병원은 풍수적으로 흉지(凶地)입니다.
원칙이 바로 서고 구성원을 존중하는 터를 고르십시오. 당신의 사주는 올바른 환경만 만나면 그곳의 수간호사, 간호부장까지 오를 수 있는 관운(官運)을 품고 있으니 스스로의 가치를 헐값에 매기지 마십시오.`,
            keyPoints: [
              '이름값보다 간호사를 존중하는 병원 문화가 최우선',
              '단단한 토양에서 간호 리더로 대성할 명조',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 직장 오행 궁합 & 병원 풍수 감정서',
          overallScore: 91,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `${bestScale} · ${luckyDirection} 풍수 길지`,
          summaryQuote: `"${dayMaster.natureTitle}의 맑은 기운이 [${luckyDirection}]의 길한 방위와 만날 때, 조직의 텃세를 잠재우고 탄탄대로의 임상 커리어가 펼쳐집니다."`,
          sections,
          directAdvice: {
            title: '병원 풍수 및 이직지의 절대 금기(禁忌)',
            warning: '통근 편의성만 보고 간호 인력 갈등이 극심한 병원에 타협하여 입사하는 것',
            actionRule: '시스템이 정착된 상급 의료기관을 선택하고, 출퇴근 시간을 최소화하여 체력을 비축하라.',
          },
          infographicType: 'fengshui_compass',
          infographicData: {
            luckyDirection,
            bestScale,
            harmonyScore: 91,
            luckyColor: dominant.element.includes('화') ? '코랄 핑크 & 베이지' : '포레스트 그린 & 화이트',
          },
        };
      }

      case 'duty_difficulty': {
        const sections: AnalysisSection[] = [
          {
            title: '오늘의 일진(日辰)과 내 사주의 상생상극',
            badge: '일진 분석',
            badgeColor: '#3B82F6',
            content: `오늘 들어온 천간과 지지의 기운은 당신의 일간 ${dayMaster.natureTitle}과 부딪치며 민첩한 반응 속도를 요구하는 날입니다.
사주 내 ${dominant.element}의 기운이 오늘 외부 일진과 합(合)을 이루어 평소보다 처치 성공률(IV, 라인 잡기, L-tube 삽입 등)은 매우 높게 나타납니다.
그러나 오후 인수인계 시점에는 일진의 지지가 사주 월지와 가벼운 충(沖)을 일으키므로, 차팅의 사소한 누락이나 구두 오더(Verbal order) 확인에서 실수가 생길 수 있습니다.`,
            keyPoints: [
              '처치 감각: 상위 95% (IV 원샷 성공률 매우 높음)',
              '주의 구간: 인수인계 30분 전 구두 오더 재확인 필수',
            ],
          },
          {
            title: '시간대별 임상 안전 주의보 & 처방',
            badge: '시간대 운세',
            badgeColor: '#EF4444',
            content: `오늘 듀티 중 가장 주의해야 할 피크 타임은 [오후 14:00 ~ 16:30] 구간입니다.
이 시각은 오행의 기운이 급변하여 환자들의 바이탈(V/S) 요동이나 예측 불가능한 돌발 이벤트가 발생하기 쉽습니다.
특히 고위험 약물(인슐린, 헤파린, 마약류 진통제) 투약 시에는 반드시 동료와 2인 더블 체킹을 거치십시오. 서두르지 않고 3초만 멈추어 5 Rights를 확인하는 습관이 오늘의 액운을 100% 소멸시킵니다.`,
            keyPoints: [
              '집중 주의 시간: 14:00 ~ 16:30 (돌발 V/S 변동 주의)',
              '고위험 약물 2인 더블체킹으로 액운 완벽 방어',
            ],
          },
          {
            title: '인수인계 마찰 방지 & 칼퇴(On-time off) 비책',
            badge: '칼퇴 전략',
            badgeColor: '#10B981',
            content: `오늘 다음 근무자와의 인수인계 호흡은 상위 88%로 원만합니다.
단, 인수인계 시 상대방의 피곤한 표정을 보고 "나에게 화가 났나?"라고 넘겨짚지 마십시오. 그것은 상대방 개인의 피로일 뿐 당신의 인수인계 내용과는 무관합니다.
주요 검사 결과와 특이 변경 사항만 두괄식으로 3줄 요약하여 전달하면, 질문 공세 없이 매끄럽게 사인을 받고 제시간에 탈의실 문을 나설 수 있습니다.`,
            keyPoints: [
              '두괄식 3줄 인수인계로 질문 사전 차단',
              '상대방의 무표정을 개인적 감정으로 해석 금지',
            ],
          },
          {
            title: '오늘의 듀티 스트레스 심리 해독법',
            badge: '멘탈 케어',
            badgeColor: '#8B5CF6',
            content: `바쁜 근무를 마치고 나면 코르티솔 수치가 치솟아 퇴근 후에도 뇌가 각성 상태에 머물기 쉽습니다.
퇴근길에 따뜻한 무카페인 차(캐모마일이나 루이보스)를 마시며 깊은 복식호흡을 5회 반복하십시오.
"오늘 하루도 환자들에게 해를 끼치지 않고 무사히 살아 돌아왔다"는 사실 하나만으로 당신은 오늘 100점 만점의 간호사입니다.`,
            keyPoints: [
              '퇴근 즉시 스마트폰 병원 메신저 알림 무음 처리',
              '자기 효능감 확언: "오늘도 내 몫을 훌륭히 해냈다"',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `완벽한 간호사는 실수를 안 하는 사람이 아니라, 실수가 생길 틈을 원칙으로 메우는 사람입니다.
오늘 바쁘다고 차팅을 나중으로 미루지 마십시오. 기록은 당신의 방패이자 갑옷입니다.
지금 바로 적어두는 한 줄의 간호기록이 훗날 당신의 목숨 같은 면허를 지켜줄 것임을 명심하십시오.`,
            keyPoints: [
              '차팅은 미루지 말고 실시간 기록할 것',
              '정확한 기록이 최고의 법적·명리학적 방패다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 명인의 오늘의 업무 난이도 & 3교대 일진 감정서',
          overallScore: 88,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `일진 길일 · IV 성공률 95% · 칼퇴 가능`,
          summaryQuote: `"오늘의 일진은 당신의 손끝에 날카로운 처치 감각을 실어주나, 인수인계 직전 3초의 더블체킹이 무사고 칼퇴를 완성합니다."`,
          sections,
          directAdvice: {
            title: '오늘 듀티 무사고 행동 수칙',
            warning: '바쁘다는 핑계로 고위험 약물 구두 오더를 즉시 실행하는 행위',
            actionRule: '14시부터 16시 사이 주요 오더 변경을 3중 점검하고 두괄식으로 인수인계하라.',
          },
          infographicType: 'duty_difficulty',
          infographicData: {
            shiftDifficultyScore: 82,
            overtimeRisk: 28,
            cautionWindow: '14:00 ~ 16:30',
            ivSuccessRate: 95,
            medicationErrorRisk: '낮음 (더블체크 시 0%)',
          },
        };
      }

      case 'night_shift_biorhythm': {
        const sections: AnalysisSection[] = [
          {
            title: '수(水)·화(火) 조후 균형과 밤샘 체질 분석',
            badge: '체질 감정',
            badgeColor: '#8B5CF6',
            content: `사주명리학에서 밤(夜)은 오행의 수(水)에 해당하고, 낮의 햇빛은 화(火)에 해당합니다.
당신의 명조는 ${dominant.element}의 에너지가 강하여, 본래는 주간에 높은 집중력을 발휘하는 '주간형 생체 리듬'에 가깝습니다.
따라서 3교대 중 나이트 근무를 연속으로 설 때 심장(心)과 간(肝)의 열기가 치솟아 피부 트러블, 역류성 식도염, 수면 유도 장애를 겪기 쉬운 체질적 약점이 있습니다.
하지만 일지의 유연한 기운 덕분에 2~3일의 단기 나이트 적응력은 충분히 갖추고 있습니다.`,
            keyPoints: [
              '체질 분류: 주간 집중형 (목화 기운 우세)',
              '연속 나이트 취약점: 3일 이상 연속 야간 근무 시 급격한 체력 저하',
            ],
          },
          {
            title: '오행으로 보는 취약 장기(臟器)와 필수 영양 처방',
            badge: '장기 건강',
            badgeColor: '#10B981',
            content: `당신의 오행 분포에서 ${weak.element} 기운의 결핍은 신장·부신(Adrenal gland)과 비뇨기계의 회복 탄력성이 저하됨을 시사합니다.
나이트 근무 중 과도한 고카페인 에너지 드링크를 들이켜면 부신이 피로해져 밤샘 후 손떨림과 심계항진(두근거림)이 심해집니다.
따라서 밤 2시 이후에는 카페인을 일절 끊고, 미온수와 타우린·비타민B군 위주의 영양 공급으로 전환해야 합니다. 퇴근 후에는 따뜻한 검은콩차나 마그네슘을 섭취하여 수(水)기를 보충하십시오.`,
            keyPoints: [
              '약점 장기: 신장/부신계 (수분 대사 및 호르몬 조절)',
              '새벽 2시 이후 카페인 섭취 금지 (타우린·미온수로 대체)',
            ],
          },
          {
            title: '나이트 퇴근 후 황금 수면(Golden Sleep) 동기화법',
            badge: '수면 위생',
            badgeColor: '#3B82F6',
            content: `나이트 퇴근길 햇빛에 망막이 노출되면 뇌는 아침으로 인식하여 멜라토닌 분비를 즉시 차단합니다.
퇴근 시 반드시 선글라스를 착용하고 귀가하십시오.
침실은 100% 암막 커튼으로 빛을 완전히 차단하고, 실내 온도를 20~22도로 서늘하게 맞추는 것이 명리학적으로 음(陰)의 기운을 보존하는 지름길입니다. [오전 09:30 ~ 오후 15:30] 사이의 6시간 연속 수면이 나이트 3일 치의 독소를 해독해 줍니다.`,
            keyPoints: [
              '퇴근길 선글라스 착용 필수 (빛 노출 차단)',
              '황금 수면 윈도우: 09:30 ~ 15:30 (암막 100% 유지)',
            ],
          },
          {
            title: '교대근무 번아웃 극복을 위한 3단계 생체 리듬 리셋',
            badge: '리듬 리셋',
            badgeColor: '#F59E0B',
            content: `오프(Off) 첫날 하루 종일 침대에 누워있으면 오히려 몸살 기운이 심해지고 다음 듀티 적응이 어려워집니다.
오프 날에는 오후 14시경 가벼운 스트레칭과 함께 15분간 야외 햇빛을 쬐며 산책하십시오.
체내 생체 시계를 낮 리듬으로 재동기화(Reset)해야 비로소 간과 담의 해독 기능이 정상화되어 불면의 고리를 끊어낼 수 있습니다.`,
            keyPoints: [
              '오프 첫날 오후 15분 햇빛 산책으로 생체 시계 재설정',
              '하루 종일 누워있기 금지 — 가벼운 전신 스트레칭',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `나이트 수당 몇 푼을 더 벌겠다고 슬리핑을 거르고 연속 나이트(3N, 4N)를 무리하게 자청하지 마십시오.
젊을 때는 사주의 원기(元氣)로 버티지만, 30대 중반을 넘기면 부신 피로와 갑상선 저하로 그 수당의 세 배가 병원비로 나갑니다.
잠은 단순한 휴식이 아니라 생명을 충전하는 음양의 법칙입니다. 몸의 경고음을 무시하지 마십시오.`,
            keyPoints: [
              '수당 욕심에 무리한 연속 나이트 자청 금지',
              '잠은 돈으로 환산할 수 없는 사주 원기의 원천',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 명인의 나이트 / 3교대 체질 & 생체 리듬 감정서',
          overallScore: 86,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `수화 조후 불균형 · 부신 피로 주의 · 09:30 수면`,
          summaryQuote: `"${dayMaster.natureTitle}의 체질은 밤의 찬 수기를 보양해야 장기 근속이 가능하니, 새벽 2시 카페인을 끊고 암막 수면으로 생체 시계를 다스리십시오."`,
          sections,
          directAdvice: {
            title: '나이트 적응 및 생체 리듬의 절대 금기',
            warning: '나이트 근무 후 햇빛을 그대로 쬐며 스마트폰을 보다 정오에 잠드는 행위',
            actionRule: '퇴근길 선글라스 착용, 09:30 이전 암막 침실 입실, 새벽 2시 이후 미온수 섭취를 엄수하라.',
          },
          infographicType: 'biorhythm_vital',
          infographicData: {
            nightAdaptability: 84,
            adrenalFatigueIndex: 68,
            sleepWindow: '09:30 ~ 15:30 (6시간)',
            organHealth: {
              kidney: '약함 (보완 필요)',
              liver: '보통',
              heart: '과열 주의',
              digestive: '보통',
            },
          },
        };
      }

      // ══════════════════════════════════════════════════════════════
      // 2. CHEMISTRY CATEGORY (동료 & 대인관계)
      // ══════════════════════════════════════════════════════════════
      case 'colleague_chemistry': {
        const chem = calculateChemistry(userSaju, partnerSaju);
        const target = partnerName || '상대방 간호사';

        const sections: AnalysisSection[] = [
          {
            title: `두 사람의 사주 원국 배합 — [${target}님과의 궁합]`,
            badge: '원국 조화',
            badgeColor: '#10B981',
            content: `당신과 ${target}님의 사주를 정밀 대조한 결과, 궁합 지수는 100점 만점에 [${chem.score}점]으로 매우 우수한 시너지 배합입니다.
당신의 일간 ${dayMaster.natureTitle}과 ${target}님의 기운은 ${chem.elementMatch}의 조화를 이루고 있습니다.
${chem.harmonyDesc}
서로 일하는 스타일의 템포는 다소 다를 수 있으나, 위급한 코드 블루나 중환 입원 시 눈빛만으로도 역할 분담이 척척 이루어지는 상호 보완형 콤비입니다.`,
            keyPoints: [
              `전체 궁합 점수: ${chem.score}점`,
              `상생 지수: 인수인계 호흡 ${chem.handoverScore}%`,
              `갈등 위험도: ${chem.conflictScore}% (매우 낮음)`,
            ],
          },
          {
            title: '천간합(天干合)과 지지 배합으로 보는 협업 시너지',
            badge: '협업 시너지',
            badgeColor: '#3B82F6',
            content: `두 사람의 천간과 지지를 대조하면, 한 사람이 일을 저지르고 추진할 때 다른 한 사람이 꼼꼼하게 서류와 처방을 챙겨주는 완벽한 '앞뒤 바퀴' 구조입니다.
당신이 병동의 분위기를 이끌고 환자와 라포를 형성한다면, ${target}님은 약물 용량이나 차팅의 오탈자를 잡아내는 꼼꼼함으로 든든한 백업이 되어 줍니다.
듀티표에서 두 사람이 함께 근무표에 배정되는 날은 인수인계가 평균 15분 이상 단축되는 길한 흐름이 나타납니다.`,
            keyPoints: [
              '역할 분담: 추진력(나) × 꼼꼼한 백업(상대방)',
              '함께 근무 시 병동 오버타임 대폭 감소',
            ],
          },
          {
            title: '사소한 오해를 방지하는 임상 소통 쿠션어',
            badge: '소통 처방',
            badgeColor: '#F59E0B',
            content: `궁합이 아무리 좋아도 나이트 근무 막바지나 바쁜 이브닝 라운딩 시에는 피로로 인해 날 선 말투가 튀어나올 수 있습니다.
특히 ${target}님은 직설적인 명령조보다는 질문형 어조에 마음을 여는 성향입니다.
"선생님, 이거 아직 안 하셨어요?" 대신 "선생님, 바쁘실 텐데 이 부분 제가 먼저 도와드릴까요?"라는 배려형 쿠션어를 건네면, ${target}님은 당신을 평생 믿고 의지할 최고의 듀티 메이트로 기억할 것입니다.`,
            keyPoints: [
              '명령형 대신 쿠션어 질문법 활용',
              '바쁜 시간대 먼저 손 내미는 배려가 평생 우정을 만든다',
            ],
          },
          {
            title: '듀티표 갈등 방지 및 업무 경계선 설정',
            badge: '관계 심리',
            badgeColor: '#8B5CF6',
            content: `친밀도가 높아질수록 공과 사의 경계가 흐려져, 한쪽이 업무를 은근히 떠넘기거나 오프 교환 요구가 잦아질 수 있습니다.
좋은 동료 관계를 10년 이상 지속하려면 병동 안에서는 철저한 프로페셔널로서의 상호 존중을 유지해야 합니다.
근무 후 사적인 티타임은 즐기되, 병원 내 험담이나 다른 동료의 뒷이야기는 함께 섞이지 않는 것이 구설수(口舌數)를 차단하는 비결입니다.`,
            keyPoints: [
              '업무는 프로페셔널, 관계는 따뜻하게 분리',
              '병동 내 제3자 험담에 휩쓸리지 않기',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `임상에서 마음 맞는 듀티 메이트 한 명을 얻는 것은 천군만마를 얻는 것과 같습니다.
상대방의 사소한 단점을 고치려 들지 마십시오. 당신의 단점을 상대방이 덮어주고 있듯, 당신도 상대방의 부족함을 묵묵히 채워주어야 합니다.
이 인연을 소중히 가꾸면 고된 3교대 생활의 가장 든든한 버팀목이 될 것입니다.`,
            keyPoints: [
              '상대방을 바꾸려 하지 말고 부족함을 채워라',
              '마음 맞는 동료 한 명이 임상 수명을 늘려준다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: `50년 명인의 [${target}님]과의 간호 동료 궁합 정밀 감정서`,
          overallScore: chem.score,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `${target}님과의 궁합 ${chem.score}점 · 환상의 듀티 메이트`,
          summaryQuote: `"${dayMaster.natureTitle}과 ${target}님의 기운이 만나 인수인계의 막힘을 뚫고, 가장 험난한 듀티도 웃으며 헤쳐나갈 상생의 호흡입니다."`,
          sections,
          directAdvice: {
            title: '동료 간호사와의 관계 유지 절대 수칙',
            warning: '친해졌다고 해서 인수인계 시 확인 절차를 대충 생략하거나 사적인 비밀을 쉽게 털어놓는 행위',
            actionRule: '공적인 업무는 철저히 원칙대로 처리하고, 따뜻한 쿠션어와 간식 나눔으로 신뢰를 쌓아라.',
          },
          infographicType: 'partner_chemistry',
          infographicData: {
            partnerName: target,
            chemistryScore: chem.score,
            handoverScore: chem.handoverScore,
            conflictScore: chem.conflictScore,
            elementMatch: chem.elementMatch,
            userPillars: pillars,
            partnerPillars: partnerSaju?.pillars,
          },
        };
      }

      case 'preceptor_chemistry': {
        const chem = calculateChemistry(userSaju, partnerSaju);
        const target = partnerName || '프리셉터 선생님';

        const sections: AnalysisSection[] = [
          {
            title: `프리셉터의 십신(十神) 성향과 임상 스타일 분석`,
            badge: '선배 성향',
            badgeColor: '#F59E0B',
            content: `${target}님의 사주 기운은 '완벽주의 원칙주의자(정관·편관형)' 혹은 '책임감이 강한 츤데레 멘토(식신·상관형)'의 기운이 짙게 배어 있습니다.
겉으로는 다소 차갑고 엄격하게 느껴질 수 있으나, 이는 후배를 괴롭히려는 것이 아니라 환자 안전사고에 대한 극도의 긴장감에서 비롯된 것입니다.
당신의 사주와 대조했을 때 케미 지수는 [${chem.score}점]으로, 선배의 기준에 맞추어 배우려는 자세만 보여주면 매우 신뢰받는 수제자로 인정받을 수 있는 구조입니다.`,
            keyPoints: [
              `선배 스타일: 완벽주의 임상 원칙파`,
              `궁합 적합도: ${chem.score}점 (노력 여하에 따라 수제자 등극)`,
            ],
          },
          {
            title: '꾸중을 칭찬으로 바꾸는 3단계 피드백 수용법',
            badge: '처세 비책',
            badgeColor: '#10B981',
            content: `${target}님에게 지적을 받았을 때 변명을 늘어놓거나 당황하여 말을 흐리는 것은 불난 집에 기름을 붓는 격입니다.
지적을 받으면 즉시 "죄송합니다. 제가 이 부분을 놓쳤습니다. 다음부터는 선생님 말씀대로 OO 방식으로 정확히 확인하겠습니다"라고 인정과 재발 방지책을 10초 안에 답하십시오.
자신의 가르침을 스펀지처럼 흡수하는 후배를 싫어할 프리셉터는 세상에 없습니다.`,
            keyPoints: [
              '지적 시 3초 이내 인정 + 구체적 개선책 답변',
              '변명과 말끝 흐리기 절대 금기',
            ],
          },
          {
            title: '독립(독립 번표) 전까지 살아남는 멘탈 보호막',
            badge: '멘탈 갑',
            badgeColor: '#8B5CF6',
            content: `프리셉터의 날 선 지적을 "나라는 인간에 대한 거부"로 확대 해석하여 자존감을 깎아먹지 마십시오.
그것은 오직 '술기'와 '프로토콜'에 대한 교정일 뿐입니다.
퇴근 후에는 선배의 목소리를 머릿속에서 재생하지 말고, 지적받은 오더 플로우만 수첩에 한 번 정리한 뒤 책장을 덮으십시오. 실수를 기록하고 개선하는 과정 자체가 당신의 임상 근육을 단단하게 키웁니다.`,
            keyPoints: [
              '인격에 대한 비난이 아닌 술기 교정으로 분리',
              '오답 노트 1회 정리 후 퇴근길 머릿속 리셋',
            ],
          },
          {
            title: '윗년차의 마음을 여는 센스 있는 질문 타이밍',
            badge: '질문 기술',
            badgeColor: '#3B82F6',
            content: `${target}님이 바쁘게 바이탈을 재거나 응급 노티를 하고 있을 때 사소한 질문을 던지는 것은 금물입니다.
질문은 라운딩 직전이나 스테이션이 잠시 정돈된 틈을 타, "선생님, 환자 수액 속도 관련해서 제가 생각한 방향이 맞는지 1분만 여쭤봐도 될까요?"처럼 나의 생각을 먼저 밝히고 질문하십시오.
스스로 고민하고 다가오는 후배에게 선배는 10가지 노하우를 아낌없이 전수해 줍니다.`,
            keyPoints: [
              '바쁜 골든 타임 피해서 질문하기',
              '내 생각을 먼저 말하고 확인받는 1분 질문법',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `처음부터 잘하는 신규 간호사는 없습니다. 독한 선배 밑에서 배운 간호사가 훗날 가장 사고를 안 치는 베테랑이 됩니다.
선배의 엄격함을 원망하지 말고, 선배의 노하우를 전부 빼앗아 내 것으로 만들겠다는 당찬 오기를 품으십시오.
지금의 눈물이 거름이 되어 당신을 가장 빛나는 프리셉터로 거듭나게 할 것입니다.`,
            keyPoints: [
              '독한 선배 밑에서 배운 기술이 평생의 방패가 된다',
              '눈물에 무너지지 말고 임상 실력으로 증명하라',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: `50년 명인의 [${target}님]과의 프리셉터 케미 & 처세 비책 감정서`,
          overallScore: chem.score,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `${target} 공략 · 피드백 수용력 · 멘탈 갑 간호사`,
          summaryQuote: `"${target}님의 엄격한 기운은 당신의 빈틈을 메워줄 숫돌이니, 상처받지 않고 기술을 흡수할 때 최고의 에이스로 도약합니다."`,
          sections,
          directAdvice: {
            title: '프리셉터 및 윗년차와의 관계 금기',
            warning: '지적받은 내용을 마음에 담아두고 뒤에서 동기들에게 불평하며 태도를 굳히는 행위',
            actionRule: '지적은 쿨하게 인정하고 오답 노트로 정리하며, 질문 시 자신의 생각을 먼저 제시하라.',
          },
          infographicType: 'partner_chemistry',
          infographicData: {
            partnerName: target,
            chemistryScore: chem.score,
            preceptorArchetype: '임상 원칙파 카리스마 멘토',
            feedbackAbsorptionScore: 89,
            userPillars: pillars,
            partnerPillars: partnerSaju?.pillars,
          },
        };
      }

      case 'patient_rapport': {
        const hasHongyeom = userSaju.detectedShinsals.some((s) => s.name.includes('홍염'));
        const hasDohwa = userSaju.detectedShinsals.some((s) => s.name.includes('도화'));

        const sections: AnalysisSection[] = [
          {
            title: '홍염살(紅艶)·도화살(桃花)이 만드는 천부적 라포(Rapport)',
            badge: '호감 기운',
            badgeColor: '#FF507C',
            content: `당신의 사주 원국에는 타인의 경계심을 무장해제시키는 [${hasHongyeom ? '홍염살' : hasDohwa ? '도화살' : '온화한 정인(正印)'}]의 온기가 감돌고 있습니다.
같은 처치나 인사를 건네도 당신이 다가가면 환자들의 불안한 표정이 한결 부드러워지고, 까다로운 보호자들도 당신 앞에서는 목소리를 낮추는 마법 같은 친화력을 발휘합니다.
이는 억지로 꾸며낸 가식이 아니라, 상대방의 고통에 깊이 공감하는 당신의 따뜻한 눈빛에서 우러나오는 천부적인 활인(活人)의 매력입니다.`,
            keyPoints: [
              `매력 기운: ${hasHongyeom ? '홍염살' : '온화한 정인'}의 호감 파동`,
              `라포 형성력: 상위 92% (환자 신뢰도 매우 우수)`,
            ],
          },
          {
            title: '악성 컴플레인을 잠재우는 오행 심리 화술',
            badge: '컴플레인 방어',
            badgeColor: '#3B82F6',
            content: `병원에서 환자나 보호자가 화를 내는 근본 원인은 당신 때문이 아니라, 자신의 질병에 대한 '공포와 불안' 때문입니다.
화를 내는 보호자에게 논리적으로 반박하려 하면 오행의 불(火)이 더 거세집니다.
"많이 놀라시고 답답하셨지요. 제가 환자분 상태를 가장 먼저 주치의 선생님께 보고드리고 바로 조치해 드리겠습니다"라며 감정을 먼저 읽어주는 수(水)의 공감 화술을 구사하십시오. 분노의 80%는 공감받는 순간 눈 녹듯 사라집니다.`,
            keyPoints: [
              '논리적 반박 대신 감정 먼저 인정하기',
              '불안을 잠재우는 즉각적 행동 확약 화술',
            ],
          },
          {
            title: '감정노동 소진(Burnout) 방지를 위한 심리적 방화벽',
            badge: '마음 방어선',
            badgeColor: '#10B981',
            content: `호감형 간호사의 최대 비극은 모든 환자의 슬픔과 고통을 자신의 것으로 흡수하여 영혼이 닳아버리는 것입니다.
사주에서 인성(印星)이 과도하게 소모되면 만성 우울감과 회의감이 찾아옵니다.
환자를 향한 친절은 가운을 입은 프로페셔널로서의 친절이어야지, 당신의 사생활과 영혼까지 내어주는 희생이 되어서는 안 됩니다. "이 환자는 나의 돌봄을 받는 분이지 내 가족이 아니다"라는 건강한 경계선을 유지하십시오.`,
            keyPoints: [
              '친절하되 정서적 과몰입 차단',
              '환자의 슬픔과 나의 일상을 분리하는 심리 방화벽',
            ],
          },
          {
            title: '선 넘는 환자·보호자에 대처하는 단호한 카리스마',
            badge: '원칙 수호',
            badgeColor: '#8B5CF6',
            content: `당신의 온화함을 틈타 무리한 요구를 하거나 폭언을 일삼는 블랙 컨슈머에게는 즉시 단호한 원칙으로 응대해야 합니다.
표정을 굳히지 않고 낮고 차분한 어조로 "환자분, 저희 의료진에 대한 폭언은 진료 거부 사유가 될 수 있습니다. 안전한 치료를 위해 협조해 주십시오"라고 명확히 선을 그으십시오.
부드러움 뒤에 숨겨진 단호한 칼날(백호·괴강)을 보여줄 때 비로소 누구도 당신을 함부로 대하지 못합니다.`,
            keyPoints: [
              '폭언 및 부당 요구 시 차분하고 단호한 경고',
              '수간호사 및 원내 보안팀 즉각 연계 프로토콜',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `타인을 치유하기 전에 내 영혼의 잔부터 가득 채워야 합니다.
빈 잔으로는 타인에게 한 모금의 물도 건넬 수 없습니다. 환자의 칭찬 한마디에 우쭐하지 말고, 환자의 비난 한마디에 무너지지 마십시오.
당신은 그 자체로 고결한 사명을 수행하는 치유자이니, 타인의 평가에 일희일비하지 않는 바위 같은 마음을 기르십시오.`,
            keyPoints: [
              '내 잔을 먼저 채워야 타인을 치유할 수 있다',
              '타인의 칭찬과 비난에 흔들리지 않는 내면의 중심',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 환자 & 보호자 라포 및 감정노동 감정서',
          overallScore: 93,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `홍염·도화 호감 기운 · 라포 92점 · 감정 방어막`,
          summaryQuote: `"${dayMaster.natureTitle}의 온화한 눈빛은 병상의 환자들에게 가장 큰 위로가 되나, 건강한 감정의 경계선이 있어야 당신의 빛이 꺼지지 않습니다."`,
          sections,
          directAdvice: {
            title: '환자 응대 및 감정노동의 절대 금기',
            warning: '무리한 요구를 일삼는 환자에게 끌려다니며 퇴근 후에도 죄책감에 시달리는 행위',
            actionRule: '공감은 따뜻하게 건네되 원칙은 단호하게 지키며, 퇴근 후에는 환자 생각을 완전히 차단하라.',
          },
          infographicType: 'general',
          infographicData: {
            rapportScore: 92,
            complaintDefense: 86,
            empathyIndex: 94,
            keyTrait: '온화한 신뢰감과 공감력',
          },
        };
      }

      // ══════════════════════════════════════════════════════════════
      // 3. CAREER CATEGORY (이직 & 진로 대운)
      // ══════════════════════════════════════════════════════════════
      case 'ten_year_daewoon': {
        const sections: AnalysisSection[] = [
          {
            title: `현재 10년 대운 [${currentDaewoonPillar} 대운]의 총체적 운로`,
            badge: '10년 대운',
            badgeColor: '#3B82F6',
            content: `인생의 10년을 좌우하는 대운은 당신이 현재 달리고 있는 고속도로의 노면 상태와 같습니다.
현재 당신은 ${daewoonAge}세부터 시작된 [${currentDaewoonPillar}] 대운의 복판에 서 있습니다.
이 대운은 사주의 일간 ${dayMaster.natureTitle}과 맞물려 '기존의 낡은 껍질을 깨고 더 넓은 세계로 도약하는 이행기(Transition phase)'를 상징합니다.
병원 내에서의 안락함보다는, 새로운 전문 자격 취득, 상급 병원으로의 도약, 혹은 탈임상을 향한 내면의 갈망이 용솟음치는 시기입니다.`,
            keyPoints: [
              `현재 대운: [${currentDaewoonPillar}] 대운 (주기: ${daewoon.startAge}세 단위)`,
              `운로의 핵심 테마: 전문성 확장 및 몸값 상승의 분기점`,
            ],
          },
          {
            title: '올해 세운(歲運)과 사직/이직의 길한 변곡점',
            badge: '이직 타이밍',
            badgeColor: '#10B981',
            content: `올해 세운의 천간과 지지는 당신의 사주 일지와 합(合)을 이루어 '문서운(印星)과 관운(官運)'을 동시에 불러옵니다.
만약 사직이나 이직을 고민 중이라면, 감정에 휩쓸려 무작정 사직서부터 던지는 '도피성 퇴사'는 엄금해야 합니다.
다음 직장의 합격증을 손에 쥐고 사직을 통보하는 '환승 이직'의 성공률이 [89%]에 달합니다. 특히 올해 하반기부터 내년 2월 사이의 공채와 경력직 채용이 최고의 문을 열어줄 것입니다.`,
            keyPoints: [
              '도피성 무대책 사직 절대 금기',
              '환승 이직 성공률: 89% (올해 하반기~내년 초 공채 공략)',
            ],
          },
          {
            title: '탈임상(공무원, 제약회사 CRA, 보험심사) vs 상급병원 도약',
            badge: '진로 적성',
            badgeColor: '#8B5CF6',
            content: `당신의 명조에 내재된 ${dominant.element} 기운은 현장감과 즉각적 성과를 중시하므로, 너무 정적인 공무원 시험에 2~3년씩 매달리면 기운이 꺾이기 쉽습니다.
오히려 상급종합병원 경력 이직이나 임상시험 수탁기관(CRO/CRA), 손해보험 심사역, 의료기기 임상 스페셜리스트와 같이 '임상 경력을 무기로 삼는 확장형 탈임상'에서 자산과 명예가 크게 불어납니다.
임상 경력 최소 3년을 채운 뒤 도전할 때 협상력이 극대화됩니다.`,
            keyPoints: [
              '임상 경력 기반 확장직(CRA, 보험심사, 특수연구직) 최우선 적합',
              '최소 3년 경력 채운 후 몸값 협상 시 유리',
            ],
          },
          {
            title: '이직 면접관을 사로잡는 오행 이미지 메이킹',
            badge: '합격 비책',
            badgeColor: '#F59E0B',
            content: `면접장에서는 당신의 결핍된 ${weak.element} 기운을 보완하는 단정하고 신뢰감 있는 톤(네이비 또는 차콜 그레이)의 복장을 착용하십시오.
면접관의 질문에 답변할 때는 화려한 미사여구보다 "환자 안전 프로토콜 준수 사례"와 "동료와의 갈등을 해결한 구체적 에피소드"를 수치로 제시하십시오.
당신의 진중한 인성과 책임감이 면접관의 뇌리에 강렬한 합격 도장을 찍어줄 것입니다.`,
            keyPoints: [
              '복장: 신뢰감을 주는 네이비/차콜 정장',
              '답변: 수치와 사례 중심의 두괄식 어필',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `운이 나쁠 때 움직이면 어디를 가나 똑같은 악마를 만나고, 운이 좋을 때 움직이면 귀인을 만납니다.
지금 당신은 대운의 상승 곡선에 올라타고 있으니 두려움 때문에 작은 울타리에 스스로를 가두지 마십시오.
준비된 자에게는 병원 밖에도 수많은 기회의 바다가 펼쳐져 있습니다. 자신감을 가지고 더 큰 무대로 발을 내딛으십시오.`,
            keyPoints: [
              '운의 상승기에 과감히 도전하라',
              '작은 울타리를 벗어나 더 큰 무대에서 활약할 명조',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 10년 대운 흐름 & 이직/퇴사 타이밍 정밀 감정서',
          overallScore: 92,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `[${currentDaewoonPillar}] 대운 통과 · 환승 이직 성공률 89%`,
          summaryQuote: `"${dayMaster.natureTitle}의 뿌리가 깊어지는 대운의 변곡점을 맞이하였으니, 충동적 사직을 삼가고 하반기 환승 이직으로 몸값을 두 배로 높이십시오."`,
          sections,
          directAdvice: {
            title: '이직 및 퇴사의 절대 금기',
            warning: '상사와 싸우고 홧김에 사직서를 던진 뒤 몇 달간 공백기를 방치하는 행위',
            actionRule: '다음 이직처를 확정한 후 우아하게 사직서를 제출하고, 임상 경력을 디딤돌 삼아 도약하라.',
          },
          infographicType: 'career_timeline',
          infographicData: {
            currentDaewoon: currentDaewoonPillar,
            startAge: daewoonAge,
            transitionSuccessRate: 89,
            goldenWindow: '올해 9월 ~ 내년 2월',
            recommendedPaths: ['상급종합병원 경력 이직', '임상시험 CRA', '보험 심사직'],
          },
        };
      }

      case 'apn_grad_school': {
        const sections: AnalysisSection[] = [
          {
            title: '사주 내 화개살(華蓋)과 인성(印星)의 학문적 깊이',
            badge: '학문 적성',
            badgeColor: '#8B5CF6',
            content: `당신의 명조에는 학문과 예술, 심오한 전문 지식을 탐구하는 '화개살(華蓋)'과 '정인(正印)'의 기운이 뚜렷하게 박혀 있습니다.
이는 단순히 시키는 일만 하는 간호사를 넘어, 임상 가이드라인을 연구하고 간호 프로토콜을 정립하는 '학구파 리더'의 DNA를 타고났음을 의미합니다.
학사 학위에 안주하기에는 당신의 지적 탐구열과 사주의 격(格)이 너무 큽니다. 대학원 석박사 과정이나 전문간호사 자격 취득은 당신의 명예운을 완성하는 필수 관문입니다.`,
            keyPoints: [
              '학문 DNA: 화개살과 정인의 심오한 지적 탐구열',
              '대학원 적합도: 93% (연구직 및 전문간호사 최적화)',
            ],
          },
          {
            title: '전문간호사(APN) 분야별 오행 궁합 (중환자·마취·감염·종양)',
            badge: '전문 분야',
            badgeColor: '#3B82F6',
            content: `당신의 사주에서 가장 힘이 실린 ${dominant.element} 기운을 바탕으로 볼 때, 최우선 추천 전문간호사 분야는 [중환자 전문간호사 / 감염관리 전문간호사]입니다.
만약 ${dominant.element}이 금(金)이나 수(水)라면 정밀한 약물 역학과 모니터링이 요구되는 [마취 전문간호사]에서도 두각을 나타냅니다.
병원 내에서 의사와 동등한 레벨에서 프로토콜을 논의하고 임상 전문성을 인정받는 포지션에서 당신의 자존감이 최고조에 달합니다.`,
            keyPoints: [
              '1순위 추천: 중환자 / 감염관리 전문간호사',
              '2순위 추천: 마취 / 임상전담간호사(PA) 관리자',
            ],
          },
          {
            title: '대학원 입학 및 학위 논문 통과의 운로 타이밍',
            badge: '입학 길일',
            badgeColor: '#10B981',
            content: `현재 대운에서 들어오는 문서운(印星)은 시험 합격과 학위 취득에 비단길을 깔아주고 있습니다.
올해 후기 대학원이나 내년 전기 일반/임상간호대학원 진학 시험에 응시할 경우, 면접관 교수들의 총애를 받으며 무난히 합격증을 거머쥘 운세입니다.
논문 작성 시에도 지도교수와의 상생 궁합이 좋아 학술지 등재 및 우수 논문상 수훈의 기운까지 감돌고 있습니다.`,
            keyPoints: [
              '대학원 합격률: 91% (문서운 강력 작용)',
              '지도교수 인연: 귀인의 조력으로 논문 순항',
            ],
          },
          {
            title: '3교대 근무와 대학원 학업 병행 시 번아웃 방지책',
            badge: '학업 양립',
            badgeColor: '#F59E0B',
            content: `풀타임 3교대를 유지하면서 야간 대학원이나 주말 수업을 병행하는 것은 육체적으로 극도의 한계에 부딪칠 수 있습니다.
사주에 ${weak.element} 기운이 취약하므로 수면 박탈이 장기화되면 학업을 중도 포기하고 싶은 충동이 찾아옵니다.
입학 전 부서 수간호사와의 사전 면담을 통해 고정 번표나 이브닝/데이 위주의 배려 번표를 확보하는 처세술을 반드시 선행하십시오.`,
            keyPoints: [
              '부서장과의 사전 면담으로 배려 번표 확보 필수',
              '무리한 욕심 버리고 한 학기 1~2과목 집중 이수',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `손끝의 기술로 먹고사는 시기는 지나갑니다. 머릿속에 든 지식과 학위가 당신의 40대, 50대 임상 권위를 보장합니다.
등록금이 아깝다고 망설이지 마십시오. 지금 당신이 투자하는 학비는 훗날 전문간호사 수당과 교수 임용이라는 백 배의 이자로 되돌아옵니다.
문서운이 들어왔을 때 과감히 책을 펼치십시오.`,
            keyPoints: [
              '학위는 40~50대 커리어의 가장 강력한 무기',
              '지금의 학비 투자가 백 배의 가치로 환원된다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 전문간호사(APN) & 대학원 진학 적성 감정서',
          overallScore: 93,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `화개살 · 인성 문서운 발동 · 대학원 합격률 91%`,
          summaryQuote: `"${dayMaster.natureTitle}의 사주에 화개살과 정인의 서광이 비추니, 임상 실무를 넘어 학문과 전문성으로 우뚝 설 절호의 기회입니다."`,
          sections,
          directAdvice: {
            title: '학업 진학 및 전문 자격 취득의 절대 수칙',
            warning: '체력 안배와 부서 지원 없이 무작정 대학원에 등록했다가 첫 학기에 자퇴하는 행위',
            actionRule: '부서장에게 학업 계획을 지혜롭게 공유하여 번표 배려를 얻어내고, 올해 문서운을 잡아라.',
          },
          infographicType: 'career_timeline',
          infographicData: {
            academicSuccessRate: 91,
            bestSpecialty: '중환자 / 감염관리 APN',
            paperLuckScore: 88,
            recommendedDegree: '임상전문간호 석사 과정',
          },
        };
      }

      case 'overseas_nurse': {
        const sections: AnalysisSection[] = [
          {
            title: '사주 내 역마살(驛馬)과 편재(偏財)의 글로벌 비전',
            badge: '글로벌 역마',
            badgeColor: '#10B981',
            content: `당신의 사주 원국에는 고향을 떠나 먼 이국땅에서 명예와 부를 일구는 '역마살(驛馬)'과 '편재(偏財)'의 기운이 용틀임하고 있습니다.
한국의 협소하고 위계적인 병원 조직 문화는 당신의 큰 그릇을 담기에는 너무 비좁습니다.
당신은 독립적이고 수평적인 문화, 간호사의 전문성과 간호 행위가 법적으로 강력히 보장되는 미국, 호주, 캐나다 등 해외 의료 시스템에 발을 들였을 때 잠재력이 폭발하는 명조입니다.`,
            keyPoints: [
              '글로벌 역마 지수: 94% (해외 이민 및 진출 최적격)',
              '한국의 경직된 수직 문화 탈피 시 만족도 200% 상승',
            ],
          },
          {
            title: 'NCLEX 시험 합격운과 영주권 스폰서(Sponsor) 인연',
            badge: '합격·스폰서',
            badgeColor: '#3B82F6',
            content: `현재 대운과 내년 세운의 교차점은 NCLEX-RN 미국 간호사 면허 시험 합격률이 [92%]에 육박하는 황금기입니다.
또한 편인과 편재의 상생 구조로 인해, 현지 에이전시나 미국 다이렉트 병원 스폰서를 구할 때 사기나 부당 계약에 휘말리지 않고 탄탄한 대형 의료법인과 매칭될 귀인운이 들어와 있습니다.
IELTS/PTE 영어 점수만 갖추어진다면 영주권 문호가 열리는 즉시 비자 스크린을 통과할 운세입니다.`,
            keyPoints: [
              'NCLEX 합격운: 92% (올해 집중 스터디 권장)',
              '영주권 스폰서 인연: 정직한 현지 대형 의료법인 연결 운세',
            ],
          },
          {
            title: '최적의 해외 진출 국가와 도시 풍수 (미국 vs 호주)',
            badge: '국가 풍수',
            badgeColor: '#F59E0B',
            content: `사주 조후상 ${dominant.element} 기운을 살리려면, 기후가 온화하고 다문화 포용력이 높은 지역이 길합니다.
미국을 선택한다면 캘리포니아, 워싱턴주 등 서부 연안이나 텍사스 대도시가 오행의 균형을 잡아주며, 호주를 선택한다면 멜버른이나 브리즈번의 의료 환경이 당신의 기운과 찰떡궁합입니다.
임금 수준과 간호사 대 환자 비율(1:4~1:5)의 혜택을 온전히 누리며 삶의 여유를 되찾게 될 것입니다.`,
            keyPoints: [
              '미국 추천: 서부(캘리포니아/워싱턴) 및 텍사스',
              '호주 추천: 브리즈번, 멜버른 등 온화한 대도시',
            ],
          },
          {
            title: '타국 생활의 외로움과 문화 장벽 극복 심리학',
            badge: '해외 심리',
            badgeColor: '#8B5CF6',
            content: `해외 간호사로 정착할 때 가장 큰 암초는 영어 실력보다 '초기 6개월의 문화적 고립감'입니다.
사주에 인성이 살아있으므로 현지 한인 간호사 협회나 커뮤니티와 일찌감치 네트워킹을 구축해 두는 것이 액운을 막는 지혜입니다.
임상에서 모르는 것이 나왔을 때 주저하지 않고 당당하게 "Could you clarify that?"이라고 물을 수 있는 당당함만 갖춘다면 현지 동료들의 깊은 리스펙트를 얻게 됩니다.`,
            keyPoints: [
              '현지 네트워크 조기 구축으로 고립감 해소',
              '당당한 커뮤니케이션으로 현지 동료 신뢰 확보',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `언제까지 3교대 태움 문화와 살인적인 환자 수에 짓눌려 청춘을 바치겠습니까.
당신의 날개는 태평양을 건너 세계를 누비도록 만들어져 있습니다. 영어가 두렵다고 주저앉지 마십시오.
지금 준비하는 단어 하나, 문제 풀이 하나가 3년 뒤 당신을 주 3일 근무하고 연봉 1억 이상을 받는 당당한 미국 간호사로 변모시킬 것입니다.`,
            keyPoints: [
              '우물 안을 벗어나 넓은 세계로 날아올라라',
              '지금의 도전이 3년 뒤 삶의 격을 바꾼다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 해외 간호사(NCLEX, 미국/호주) 진출 대운 감정서',
          overallScore: 94,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `역마살 발동 · NCLEX 합격률 92% · 글로벌 간호사`,
          summaryQuote: `"${dayMaster.natureTitle}의 사주에 역마와 편재의 거대한 물결이 일렁이니, 국내의 좁은 울타리를 넘어 해외에서 거목으로 우뚝 설 운명입니다."`,
          sections,
          directAdvice: {
            title: '해외 진출 준비의 절대 금기',
            warning: '엔클렉스 서류 접수만 해두고 영어 공부를 차일피일 미루며 한국 병원에 안주하는 행위',
            actionRule: '하루 2시간 영어와 엔클렉스 공부를 루틴화하고, 1년 이내 시험 일정을 확정하라.',
          },
          infographicType: 'career_timeline',
          infographicData: {
            nclexPassRate: 92,
            globalMobilityIndex: 94,
            sponsorMatchingLuck: 89,
            topDestinations: ['미국 캘리포니아', '미국 텍사스', '호주 브리즈번'],
          },
        };
      }

      // ══════════════════════════════════════════════════════════════
      // 4. LOVE CATEGORY (연애 & 결혼 궁합)
      // ══════════════════════════════════════════════════════════════
      case 'life_partner': {
        const partnerElement = dominant.element.includes('화') ? '수(水) 또는 금(金)' : '목(木) 또는 화(火)';

        const sections: AnalysisSection[] = [
          {
            title: '일지(日支) 배우자궁으로 보는 평생 인연의 특징',
            badge: '배우자상',
            badgeColor: '#FF507C',
            content: `당신의 사주에서 배우자궁인 일지(日支)에는 [${pillars.day.branchHanja}(${pillars.day.branch})]의 기운이 깃들어 있습니다.
당신과 백년해로할 최상의 배우자는 '감정 기복이 적고 나무처럼 듬직한 사람(정관·정인형)'입니다.
사소한 일에 삐치거나 연락 문제로 집착하는 사람과는 3교대 특성상 오래 지속되기 어렵습니다.
당신이 밤샘 근무 후 녹초가 되어 돌아왔을 때, 조용히 이불을 덮어주고 따뜻한 국 한 그릇을 끓여줄 수 있는 생활력과 배려심을 지닌 인연이 당신의 숙명적 배필입니다.`,
            keyPoints: [
              `최적 배우자상: 감정 기복 없는 듬직한 안식처형 인물`,
              `필수 오행: 당신의 조후를 식혀줄 [${partnerElement}] 기운 소유자`,
            ],
          },
          {
            title: '3교대 근무를 존중해 줄 천생연분의 직업군과 성향',
            badge: '직업 궁합',
            badgeColor: '#3B82F6',
            content: `간호사의 불규칙한 생활 패턴을 가장 잘 이해하고 시너지를 낼 수 있는 직업군은 전문직(IT 개발자, 회계·세무사, 엔지니어)이나 주말 휴무가 보장되는 안정적인 공기업·연구직입니다.
같은 의료계 종사자(의사, 간호사)도 공감대는 높으나, 두 사람 모두 당직에 치여 가정의 온기가 식기 쉬우므로 오히려 서로 다른 분야의 안정형 직군과의 궁합 지수가 [91점]으로 가장 높게 나타납니다.`,
            keyPoints: [
              '추천 직업군: 전문직(개발, 엔지니어, 전문자격사), 공기업, 연구직',
              '성향: 잔소리 없이 묵묵히 지원해 주는 서포터형',
            ],
          },
          {
            title: '결혼운(結婚運)이 활짝 열리는 황금 시기와 계절',
            badge: '결혼 타이밍',
            badgeColor: '#10B981',
            content: `당신의 대운과 세운을 대조할 때, 배우자궁과 정관(正官)이 합(合)을 이루는 [앞으로 2년 이내]가 인생의 반려자를 만나 가정을 꾸릴 최상의 길일입니다.
특히 봄과 가을의 서늘한 기운이 돌 때, 지인의 소개팅이나 취미 모임(운동, 독서 클럽)에서 자연스럽게 인연이 닿게 됩니다.
처음에는 심장이 쿵쾅거리는 불꽃같은 설렘보다, 오래 알고 지낸 친구처럼 편안하고 호흡이 잘 맞는 사람을 주목하십시오.`,
            keyPoints: [
              '결혼 황금기: 앞으로 2년 이내 (봄·가을 인연수 강력)',
              '만남 경로: 지인 소개 및 건강한 취미 모임',
            ],
          },
          {
            title: '연애 중 잠수·연락 갈등을 예방하는 3교대 연애 공식',
            badge: '연애 룰',
            badgeColor: '#8B5CF6',
            content: `교대근무 연애가 파탄 나는 1순위 이유는 "자느라 연락이 안 돼서 생기는 오해"입니다.
연애 초기에 반드시 듀티 캘린더를 공유하고, 나이트 전후 수면 시간을 투명하게 고지하십시오.
"나이트 들어가기 전 사랑한다는 문자 하나", "눈뜨자마자 살아있다는 톡 하나"의 최소한의 안부 루틴만 지켜도, 상대방은 불안해하지 않고 당신의 든든한 지원군으로 남아있을 것입니다.`,
            keyPoints: [
              '듀티 캘린더 공유 및 수면 시간 사전 공지',
              '출퇴근 시 원라인 안부 톡 루틴 엄수',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `나를 불안하게 만들고 눈물짓게 만드는 사람은 인연이 아니라 악연입니다.
외롭다고 해서 나를 존중하지 않는 사람에게 마음을 낭비하지 마십시오.
당신의 사주는 늦게 결혼할수록 오히려 더 부유하고 인품 좋은 배우자를 만나는 '만혼(晩婚) 길조'를 품고 있으니, 조급함에 쫓겨 타협하지 마십시오.`,
            keyPoints: [
              '불안감을 주는 사람은 악연이니 과감히 정리하라',
              '신중할수록 더 훌륭한 평생 인연을 만난다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 3교대 이해심 높은 평생 인연 & 배우자운 감정서',
          overallScore: 91,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `일지 배우자궁 안착 · 듬직한 안식처형 배필 · 만혼 길조`,
          summaryQuote: `"${dayMaster.natureTitle}의 사주에 배우자궁의 정화가 깃들어 있으니, 불규칙한 교대근무의 피로를 씻어줄 듬직하고 따뜻한 평생 반려자를 만날 명조입니다."`,
          sections,
          directAdvice: {
            title: '배우자 선택의 절대 금기',
            warning: '연락 문제로 집착하고 3교대 수면 패턴을 배려하지 못하는 이기적인 사람과의 만남 지속',
            actionRule: '나의 직업과 수면을 있는 그대로 존중해 주는 안정적 성품의 인연을 고르고 조급해하지 마라.',
          },
          infographicType: 'general',
          infographicData: {
            marriageScore: 91,
            idealPartnerType: '차분하고 생활력 강한 전문직/안정직',
            compatibilityScore: 93,
            bestMeetingWindow: '향후 2년 이내 봄·가을',
          },
        };
      }

      case 'relationship_harmony': {
        const chem = calculateChemistry(userSaju, partnerSaju);
        const target = partnerName || '상대방';

        const sections: AnalysisSection[] = [
          {
            title: `두 사람의 사주 원국 대조 — [${target}님과의 궁합 판정]`,
            badge: '정밀 궁합',
            badgeColor: '#8B5CF6',
            content: `당신과 ${target}님의 사주 여덟 글자를 정밀 분석한 궁합 지수는 [${chem.score}점]입니다.
당신의 일간 ${dayMaster.natureTitle}과 ${target}님의 원국은 ${chem.elementMatch}의 배치로 맞물려 있습니다.
${chem.harmonyDesc}
두 사람이 처음 만났을 때 느꼈던 강렬한 이끌림은 사주 천간의 음양 조화에서 비롯된 필연적인 인연의 끈입니다.`,
            keyPoints: [
              `전체 연애 궁합: ${chem.score}점`,
              `상생 지수: ${chem.elementMatch}`,
              `성격 갈등 위험도: ${chem.conflictScore}% (원만한 조율 가능)`,
            ],
          },
          {
            title: '오행 상극과 충(沖)이 유발하는 말다툼 패턴 분석',
            badge: '갈등 처방',
            badgeColor: '#EF4444',
            content: `두 사람 사이에 다툼이 발생하는 결정적 도화선은 '표현 방식의 차이'에 있습니다.
한 사람은 문제가 생기면 즉각 대화로 풀고 싶어 하는 반면, 다른 한 사람은 혼자 생각할 시간(동굴 시간)이 필요한 구조입니다.
상대방이 침묵할 때 대답을 다그치면 지지의 충살(沖煞)이 발동하여 감정의 골이 깊어집니다. 상대방에게 2시간의 진정 시간을 준 뒤 대화를 시도하면 90%의 갈등이 평화롭게 해결됩니다.`,
            keyPoints: [
              '갈등 원인: 즉시 해결파 vs 동굴 시간 필요파의 충돌',
              '해결책: 다툼 직후 2시간의 감정 냉각기 보장',
            ],
          },
          {
            title: '3교대 데이트 타이밍과 서운함 누적 방지 비법',
            badge: '데이트 비책',
            badgeColor: '#10B981',
            content: `근무표가 맞지 않아 한 달에 몇 번 못 보는 상황에서, 억지로 피곤한 몸을 이끌고 나가는 데이트는 오히려 짜증을 유발합니다.
나이트 퇴근 날에는 무리한 야외 데이트 대신, 집에서 함께 맛있는 음식을 먹고 편안히 쉬는 힐링 데이트를 제안하십시오.
오프 날에는 온전히 상대방에게 집중하는 '양보다 질'의 데이트 전략이 두 사람의 애정 전선을 더욱 견고하게 만듭니다.`,
            keyPoints: [
              '피곤할 때는 무리한 외출보다 실내 힐링 데이트',
              '함께 있는 시간 동안 스마트폰 내려놓고 집중하기',
            ],
          },
          {
            title: '상대방의 자존심을 지켜주는 맞춤 대화 기술',
            badge: '소통 솔루션',
            badgeColor: '#F59E0B',
            content: `${target}님은 자존심과 인정 욕구가 강한 기운을 지니고 있습니다.
"선생님은 왜 그래?"라는 비난조 대신 "네가 그렇게 해줘서 내가 얼마나 든든한지 몰라"라는 인정의 언어를 하루 한 번 건네보십시오.
남자는 인정받을 때 목숨을 바치고, 여자는 공감받을 때 마음을 엽니다. 이 작은 화법의 전환이 두 사람을 흔들림 없는 천생연분으로 묶어줄 것입니다.`,
            keyPoints: [
              '비난 대신 인정과 칭찬의 언어 매일 건네기',
              '상대방의 노력을 당연하게 여기지 않는 감사 표현',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `사랑은 나에게 완벽히 맞는 사람을 찾는 것이 아니라, 서로의 빈틈을 감싸 안으며 함께 맞추어가는 예술입니다.
사주에 가벼운 충이 있다는 것은 그만큼 서로에게 지루할 틈이 없는 긴장감과 매력이 존재한다는 뜻입니다.
사소한 말실수에 집착하지 말고, 상대방이 나에게 쏟았던 따뜻한 진심을 기억하십시오.`,
            keyPoints: [
              '빈틈을 지적하지 말고 품어주어라',
              '사소한 다툼 뒤에 숨겨진 사랑의 본질을 볼 것',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: `50년 명인의 [${target}님]과의 연인 오행 궁합 & 갈등 처방 감정서`,
          overallScore: chem.score,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `${target}님과의 궁합 ${chem.score}점 · 맞춤 갈등 처방`,
          summaryQuote: `"${dayMaster.natureTitle}과 ${target}님의 기운이 만나 때로는 부딪치고 때로는 녹아들며, 서로를 가장 깊이 성숙시킬 진실한 사랑의 명조입니다."`,
          sections,
          directAdvice: {
            title: '연인 관계 유지의 절대 금기',
            warning: '피곤하고 예민할 때 상대방의 자존심을 찌르는 극단적 이별 통보를 내뱉는 행위',
            actionRule: '감정이 격해질 때는 2시간의 쿨링 타임을 갖고, 따뜻한 인정과 감사의 언어로 대화하라.',
          },
          infographicType: 'partner_chemistry',
          infographicData: {
            partnerName: target,
            chemistryScore: chem.score,
            conflictScore: chem.conflictScore,
            handoverScore: chem.handoverScore,
            elementMatch: chem.elementMatch,
            userPillars: pillars,
            partnerPillars: partnerSaju?.pillars,
          },
        };
      }

      // ══════════════════════════════════════════════════════════════
      // 5. WEALTH CATEGORY (재물 & 수당 재테크)
      // ══════════════════════════════════════════════════════════════
      case 'night_allowance_wealth': {
        const sections: AnalysisSection[] = [
          {
            title: '사주 내 정재(正財)와 편재(偏財)의 재물 그릇 분석',
            badge: '재물 그릇',
            badgeColor: '#F59E0B',
            content: `당신의 사주 원국에서 재물운을 관장하는 별을 살펴보면, 성실하게 땀 흘려 모으는 '정재(正財)'의 뿌리가 깊고 단단합니다.
당신은 일확천금을 노리는 도박성 투기나 한탕주의와는 사주적으로 인연이 멀며, 차곡차곡 쌓아 올린 종잣돈이 스노우볼처럼 불어나는 '정통 부자형' 명조입니다.
몸으로 고되게 벌어들인 나이트 수당과 상여금은 그 자체로 거룩한 씨앗 자금이니, 이것이 허투루 새어나가지 않도록 금고(庫)의 문을 걸어 잠그는 구조를 만들어야 합니다.`,
            keyPoints: [
              '재물 성향: 정재(안정 저축·복리 증식) 우세형',
              '투기성 코인/테마주 절대 부적합 (손실 위험 85%)',
            ],
          },
          {
            title: '나이트 수당이 줄줄 새는 사주적 원인과 지출 방어벽',
            badge: '지출 방어',
            badgeColor: '#EF4444',
            content: `간호사들이 나이트 수당을 모으지 못하는 결정적 이유는 나이트 퇴근 후의 '보상 심리 소비(홧김 비용)' 때문입니다.
사주에서 스트레스로 인해 화(火)기가 치솟으면 불필요한 명품 구매나 잦은 배달 음식으로 겁재(劫財, 재물을 털어가는 기운)가 발동합니다.
급여일 다음 날 나이트 수당 전액(월 50~80만 원)을 자동으로 분리하여 손댈 수 없는 투자 통장으로 이체하는 '강제 저축 방화벽'을 세우십시오.`,
            keyPoints: [
              '나이트 보상 심리 소비 차단 필수',
              '급여 익일 나이트 수당 100% 자동 저축/투자 시스템 구축',
            ],
          },
          {
            title: '정재 70% vs 편재 30% 황금 자산 배분 포트폴리오',
            badge: '투자 전략',
            badgeColor: '#10B981',
            content: `당신의 명조에 최적화된 재테크 비율은 [안정형 자산 70% : 성장형 자산 30%]의 포트폴리오입니다.
70%는 고금리 적금, 청약 통장, 미국 배당 다우존스(SCHD/JEPI)와 같은 안정적 현금 흐름 자산에 배분하고, 30%만 미국 S&P500 및 나스닥 지수 추종 ETF에 적립식으로 분할 매수하십시오.
3교대 근무로 시세 창을 들여다볼 시간이 없는 간호사에게 '적립식 자동 매수'는 사주 명리에 완벽히 부합하는 최고의 부의 추월차선입니다.`,
            keyPoints: [
              '배분 비율: 안정형 배당/저축 70% + S&P500 지수 ETF 30%',
              '시세 확인 불필요한 자동 적립식 투자 원칙',
            ],
          },
          {
            title: '3년 안에 1억 종잣돈(Seed Money) 모으는 실천 로드맵',
            badge: '1억 로드맵',
            badgeColor: '#3B82F6',
            content: `목돈 1억을 모으는 순간 자산의 증식 속도는 기하급수적으로 빨라집니다.
첫 1년 차에는 기본급의 50%와 나이트 수당 전액을 모아 3,000만 원의 기틀을 다지고, 2년 차부터는 복리 효과와 연말정산 절세 혜택(연금저축/IRP)을 풀가동하십시오.
사주에 재물 금고가 채워지면 병원 상사의 잔소리도 한결 여유롭게 흘려들을 수 있는 강력한 '경제적 멘탈'이 장착됩니다.`,
            keyPoints: [
              '연금저축/IRP 세액공제로 연말정산 13월의 월급 확보',
              '1억 종잣돈 달성 시 병원 스트레스 70% 감소 효과',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(直言)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `남들이 코인으로 며칠 만에 수천만 원을 벌었다는 말에 현혹되지 마십시오.
당신의 사주는 땀 흘려 모은 정재가 복리의 마법을 만났을 때 가장 확실하고 안전하게 건물주로 올라설 명조입니다.
한 방을 노리다 피땀 어린 나이트 수당을 날리지 말고, 지루해 보일지라도 원칙을 지키며 복리의 시간을 견디십시오. 최후의 승자는 당신입니다.`,
            keyPoints: [
              '남의 대박 소식에 흔들리지 마라',
              '정재의 복리 마법이 당신을 부자로 만든다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 내 사주 기반 맞춤 재테크 전략 감정서',
          overallScore: 93,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `정재 복리 증식 · 나이트 수당 파이프라인 · 1억 로드맵`,
          summaryQuote: `"${dayMaster.natureTitle}의 사주는 정재의 기틀이 튼튼하니, 피땀 어린 나이트 수당을 복리의 종잣돈으로 굴릴 때 든든한 자산가로 우뚝 섭니다."`,
          sections,
          directAdvice: {
            title: '재테크 및 자산 관리의 절대 금기',
            warning: '나이트 퇴근 후 충동적인 보상 소비 및 고위험 코인·레버리지 몰빵 투자',
            actionRule: '나이트 수당 전액 자동 이체 시스템을 구축하고, 미국 지수 ETF 적립식 투자로 복리를 누려라.',
          },
          infographicType: 'wealth_portfolio',
          infographicData: {
            wealthScore: 93,
            regularWealthRatio: 70,
            speculativeWealthRatio: 30,
            seedMoneyTarget: '1억 (3년 로드맵)',
            recommendedPortfolio: {
              savingsAndDividends: '70% (안정 배당/적금)',
              indexEtf: '30% (S&P500/나스닥)',
            },
          },
        };
      }

      case 'real_estate_luck': {
        const sections: AnalysisSection[] = [
          {
            title: '사주 내 인성(印星, 문서운)과 부동산 취득 운로',
            badge: '문서운 분석',
            badgeColor: '#10B981',
            content: `사주명리학에서 내 집 마련, 아파트 분양권, 계약서 도장 찍는 운은 모두 '인성(印星, 정인·편인)'의 힘에서 나옵니다.
당신의 명조는 인성의 기운이 반듯하게 자리 잡고 있어, 생애 전반에 걸쳐 탄탄한 '부동산 문서 복(福)'을 타고났습니다.
전세나 월세로 남의 집 살이를 전전하기보다는, 일찌감치 청약 통장과 경매·급매물을 통해 내 집 마련을 달성했을 때 사주의 불안정한 기운이 대지에 뿌리를 내리듯 안정됩니다.`,
            keyPoints: [
              '부동산 문서운 지수: 91% (자가 보유 복 강력)',
              '내 집 마련 시 주거 안정과 심리적 치유 시너지',
            ],
          },
          {
            title: '아파트 청약 가점 및 당첨 길일(吉日) 분석',
            badge: '청약 당첨운',
            badgeColor: '#3B82F6',
            content: `현재 대운에서 들어오는 지지의 기운이 당신의 일지와 합(合)을 이루는 [앞으로 3년 이내]가 생애 최초 특별공급이나 신혼부부 청약 당첨의 결정적 황금기입니다.
특히 공공분양이나 브랜드 신축 아파트 청약 시 예비 당첨 앞 번호를 받거나 추첨제에서 기적적인 당첨운이 작용합니다.
청약 통장은 매월 10만 원씩 하루도 빠짐없이 납입하여 가점을 차곡차곡 쌓아두십시오.`,
            keyPoints: [
              '청약 당첨 최적기: 앞으로 3년 이내 (문서합 발동)',
              '추천 유형: 공공분양 특공 및 일반분양 추첨제',
            ],
          },
          {
            title: '독립(기숙사·원룸 탈출)과 주거지 이동 풍수',
            badge: '독립 풍수',
            badgeColor: '#F59E0B',
            content: `답답한 기숙사나 좁은 원룸에 갇혀 있으면 사주의 기운이 순환되지 못하고 탁한 기운이 쌓입니다.
일조량이 풍부한 남향(南向)이나 동남향의 채광 좋은 집으로 독립할 때, 만성 피로와 악몽이 거짓말처럼 사라지는 주거 풍수 효과를 봅니다.
거실 창가에 잎이 넓은 관엽식물을 두고 환기를 자주 시켜주면 집안 가득 길한 생기가 맴돌게 됩니다.`,
            keyPoints: [
              '남향/동남향 채광 좋은 집으로의 독립 강력 추천',
              '주거 환경 개선이 곧 교대근무 피로 회복의 특효약',
            ],
          },
          {
            title: '계약서 도장 찍기 전 반드시 피해야 할 손없는 날과 충살',
            badge: '계약 주의보',
            badgeColor: '#EF4444',
            content: `부동산 계약을 진행할 때는 사주 일진에서 일지와 상충(相沖)하는 날이나 '공망(空亡)'이 드는 날을 철저히 피해야 합니다.
충살이 드는 날 가계약금을 입금하면 등기부등본의 근저당 문제나 누수·하자 결함으로 인해 속앓이를 할 수 있습니다.
반드시 계약 전 건축물대장과 등기부등본을 본인이 직접 열람하고, 계약일은 만세력상 천을귀인(天乙貴人)이 드는 길일을 택해 도장을 찍으십시오.`,
            keyPoints: [
              '충살 및 공망일 계약 체결 엄금',
              '등기부등본·건축물대장 직접 확인 필수',
            ],
          },
          {
            title: '50년 명리학자의 뼈때리는 직언(Direct Advice)',
            badge: '명인 직언',
            badgeColor: '#FF507C',
            content: `부동산은 타이밍을 재는 것이 아니라, 좋은 입지의 땅을 사서 시간을 묻어두는 것입니다.
폭락론자들의 공포 마케팅에 휘둘려 기회를 놓치지 마십시오.
당신의 사주는 부동산 문서를 손에 쥐었을 때 가장 큰 심리적 안정감과 자산 증식을 누리게 되어 있으니, 부지런히 임장을 다니며 내 집 마련의 꿈을 현실로 만드십시오.`,
            keyPoints: [
              '공포에 휘둘리지 말고 내 집 마련을 추진하라',
              '부동산 문서가 당신의 노후를 든든하게 지켜준다',
            ],
          },
        ];

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 부동산 / 아파트 청약 / 문서운(印星) 감정서',
          overallScore: 92,
          totalCharCount: sections.reduce((acc, s) => acc + s.content.replace(/\s+/g, '').length, 0),
          coreKeyword: `인성 문서운 발동 · 청약 당첨운 91% · 자가 마련 길조`,
          summaryQuote: `"${dayMaster.natureTitle}의 사주에 반듯한 인성 문서의 기운이 깃들어 있으니, 청약과 내 집 마련을 통해 평생의 흔들림 없는 안식처를 구축할 명조입니다."`,
          sections,
          directAdvice: {
            title: '부동산 계약 및 문서 취득의 절대 금기',
            warning: '남의 추천만 믿고 현장 확인 없이 덜컥 계약금을 송금하거나 충살일에 도장을 찍는 행위',
            actionRule: '등기부등본을 꼼꼼히 확인하고 천을귀인 길일에 계약하며, 3년 이내 청약 기회를 공략하라.',
          },
          infographicType: 'wealth_portfolio',
          infographicData: {
            wealthScore: 92,
            documentLuckScore: 91,
            subscriptionLuck: 88,
            recommendedOrientation: '남향 / 동남향',
          },
        };
      }

      default: {
        const sections: AnalysisSection[] = [
          {
            title: '사주 원국과 천명(天命) 총평',
            badge: '원국 총평',
            badgeColor: '#FF507C',
            content: `당신의 명조는 '${dayMaster.natureTitle}'의 일간을 타고났습니다. ${dayMaster.natureDescription}
${dominant.element}의 기운이 ${dominant.percentage}%로 가장 왕성하여 직관력과 추진력이 탁월합니다. 반면 ${weak.element} 기운은 ${weak.percentage}%로 다소 취약하여 바쁜 근무 속에서 주기적인 충전이 필요합니다.`,
          },
        ];
        return {
          topicId: topic.id,
          topicTitle: topic.title,
          personaSummary: '50년 사주명리학자의 정밀 감정 리포트',
          overallScore: 90,
          totalCharCount: 1200,
          coreKeyword: `${dayMaster.natureTitle}`,
          summaryQuote: `"${dayMaster.natureTitle}의 기운이 생명의 최전선에서 빛을 발하는 명조입니다."`,
          sections,
          directAdvice: {
            title: '명리학자의 행동 수칙',
            warning: '충동적인 결정 주의',
            actionRule: '원칙을 준수하고 자신감을 가져라.',
          },
          infographicType: 'general',
          infographicData: {},
        };
      }
    }
  },
};
