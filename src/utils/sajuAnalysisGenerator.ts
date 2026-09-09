import { SajuAnalysisResult, ShinsalDetected, FiveElementsRatio } from '../services/manseryeokService';
import { SajuTopicItem } from '../mocks/sajuCategories';

export interface AnalysisSection {
  title: string;
  badge: string;
  badgeColor: string;
  content: string;
  keyPoints?: string[];
}

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
}

export const sajuAnalysisGenerator = {
  /**
   * 50년 사주명리학 및 간호심리 전문가의 깊이 있는 1,000자+ 심층 분석 리포트를 생성합니다.
   */
  generateReport(params: {
    topic: SajuTopicItem;
    userSaju: SajuAnalysisResult;
    partnerSaju?: SajuAnalysisResult;
    partnerName?: string;
  }): GeneratedSajuReport {
    const { topic, userSaju, partnerSaju, partnerName } = params;

    const dayMaster = userSaju.dayMaster;
    const shinsals = userSaju.detectedShinsals;
    const fiveElements = userSaju.fiveElements;
    const daewoon = userSaju.daewoon;
    const pillars = userSaju.pillars;

    // 대표 신살 추출 (귀문관살, 홍염살, 백호대살 우선 순위)
    const primaryShinsal =
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
      };

    // 가장 왕성한 오행과 결핍된 오행
    const dominantElement = [...fiveElements].sort((a, b) => b.count - a.count)[0];
    const weakElement = [...fiveElements].sort((a, b) => a.count - b.count)[0];

    // 현재 대운 정보
    const currentDaewoonPillar = daewoon.currentPillar?.korean || daewoon.pillars[0]?.korean || '임인';
    const daewoonAge = daewoon.currentPillar?.age || daewoon.startAge;

    // ─── 섹션 1: 사주 원국과 천명(天命) 총평 ───────────────────
    const section1Title = '사주 원국과 천명(天命) 총평';
    const section1Content = `당신의 명조(命造)는 일간(日干)에 '${dayMaster.natureTitle}'을 품고 태어났습니다. ${dayMaster.natureDescription}

사주 여덟 글자의 기운을 들여다보면, ${dominantElement.element} 기운이 ${dominantElement.percentage}%로 가장 왕성하여 ${dominantElement.trait} 능력이 본능적으로 발휘됩니다. 반면 ${weakElement.element} 기운은 ${weakElement.percentage}%로 다소 취약하여, 바쁜 교대 근무 속에서 쉽게 피로를 느끼거나 대인관계에서 방어 기제가 발동하기 쉬운 구조입니다.

명리학에서 간호사라는 직업은 타인의 고통을 덜어주고 생명을 보살피는 활인업(活人業)이자, 불과 쇠(火·金)가 부딪치는 고도의 전문 영역입니다. 당신의 사주는 천간의 ${pillars.day.stemHanja}(${pillars.day.stem})과 지지의 ${pillars.day.branchHanja}(${pillars.day.branch})이 조화를 이루어, 단순히 밥벌이를 위한 직업을 넘어 타인을 치유하면서 스스로의 업장과 액운을 씻어내는 강한 숙명적 에너지를 내포하고 있습니다.`;

    // ─── 섹션 2: 기운(氣運) 및 신살(神煞) 심층 분석 ───────────
    const shinsalListText =
      shinsals.length > 0
        ? shinsals.map((s) => `• ${s.name}(${s.hanja}): ${s.oneLineSummary}`).join('\n')
        : '• 정인귀기(正印貴氣): 온화한 성품과 바른 원칙으로 의료진의 모범이 됨';

    const section2Title = `기운(氣運) 및 신살(神煞) 분석 — [${primaryShinsal.name}]의 작용`;
    const section2Content = `사주 내에 잠재된 특수 기운과 신살(神煞)을 정밀 분석한 결과입니다.

${shinsalListText}

특히 주목해야 할 기운은 바로 '${primaryShinsal.name}(${primaryShinsal.hanja})'입니다.
${primaryShinsal.hospitalImpact}

50년간 수많은 간호사의 명조를 상담해 오며 확인한 바에 따르면, ${primaryShinsal.name}을 가진 간호사는 남들이 보지 못하는 환자의 미세한 안색 변화, 호흡음의 이상, 보호자의 불안한 심리를 본능적으로 감지해 내는 천부적인 임상 감각을 자랑합니다. 그러나 칼날이 예리할수록 그 칼끝이 스스로를 향하기 쉽습니다. ${primaryShinsal.clinicalAdvice} 평소 병동에서의 긴장감을 퇴근 후까지 끌고 가지 않는 단절의 연습이 반드시 병행되어야 합니다.`;

    // ─── 섹션 3: 대운세(大運勢) 및 시기별 흐름 ───────────────
    const section3Title = `대운세(大運勢) 및 시기별 흐름 — [현재 ${daewoonAge}세 대운]`;
    const section3Content = `사주는 타고난 자동차의 엔진이라면, 대운(大運)은 그 자동차가 달리는 10년 단위의 고속도로와 같습니다.

당신은 ${daewoon.startAge}세부터 시작하여 ${daewoon.isForward ? '순행(順行)' : '역행(逆行)'}하는 운로를 걷고 있으며, 현재는 [${currentDaewoonPillar}(${daewoon.currentPillar?.hanja || ''})] 대운의 한가운데를 지나고 있습니다.

이 대운은 당신에게 '${topic.title}'에 관한 중대한 의사결정과 인생의 변곡점을 요구하는 시기입니다. 
지지의 기운이 일지와 ${dominantElement.element}을 자극하므로, 안주하고 싶은 마음과 탈출하고 싶은 충동이 끊임없이 교차합니다. 특히 계절의 절입 시기와 일진의 상충(相沖)이 겹치는 달에는 갑작스러운 병동 로테이션이나 이직 제안, 혹은 예상치 못한 부서 내 갈등이 수면 위로 떠오를 수 있습니다. 그러나 이 파도는 당신을 침몰시키기 위함이 아니라, 당신의 임상 역량과 자산 가치를 한 단계 높은 상급 레벨로 도약시키기 위한 필연적인 성장통임을 기억하십시오.`;

    // ─── 섹션 4: 주제별 정밀 임상 & 심리학 처방 ────────────────
    const section4Title = `주제별 맞춤 처방 — [${topic.title}]`;
    let section4Content = '';

    if (topic.id === 'ward_fit') {
      section4Content = `당신의 일간 ${dayMaster.natureTitle}과 신살 ${primaryShinsal.name}을 대조해 볼 때, 병동 적합도 1순위는 '응급실(ER) 및 중환자실(ICU)' 혹은 고난도 처치가 요구되는 급성기 병동입니다.

당신은 반복적이고 정적인 외래 업무나 서류 위주의 부서에 머물면 오히려 기운이 정체되어 우울감과 무기력증을 겪기 쉽습니다. 몸은 고되고 긴박하지만 처치 결과가 즉각적으로 나타나고 위기 대처 역량을 발휘할 수 있는 환경에서 당신의 ${dominantElement.element} 에너지가 꽃을 피웁니다. 만약 현재 일반 병동에 계시다면 액티브한 환자군을 담당하거나 팀의 중간 브릿지 역할을 맡으실 때 직무 만족도가 극대화됩니다.`;
    } else if (topic.id === 'duty_difficulty') {
      section4Content = `오늘의 일진과 당신의 원국을 대조하면, 오전 듀티와 오후 인수인계 시점에 기운의 교차가 발생합니다.

특히 인수인계 30분 전 환자 컴플레인이나 돌발 바이탈 변동 이벤트가 발생할 소지가 있으므로, 평소보다 15분 일찍 차팅을 정리하고 주요 오더와 투약 기록을 3중 점검하십시오. 동료 간의 케미 지수는 상위 85%로 매우 양호하니, 혼자 모든 짐을 짊어지려 하지 말고 동기나 차지 간호사에게 적극적으로 업무를 분담(Share)할 때 칼퇴의 문이 열립니다.`;
    } else if (topic.id === 'colleague_chemistry' || topic.id === 'preceptor_chemistry') {
      const targetName = partnerName || '상대방';
      section4Content = `${targetName}님과의 명조 배합은 겉으로는 무뚝뚝해 보일 수 있으나 속으로는 서로의 부족한 오행을 채워주는 상호보완적 콤비입니다.

당신이 ${dominantElement.element}의 추진력으로 업무를 리드한다면, ${targetName}님은 섬세함과 뒷받침으로 펑크를 막아주는 구조입니다. 다만 인수인계 시 화법의 직설성으로 인해 사소한 감정의 응어리(원진 기운)가 남을 수 있으니, "선생님, 이 부분은 제가 이렇게 했는데 혹시 놓친 게 있을까요?"라는 쿠션어 질문법을 활용하면 환상의 듀오로 거듭날 수 있습니다.`;
    } else if (topic.id === 'ten_year_daewoon' || topic.id === 'overseas_nurse') {
      section4Content = `당신의 사주에는 역마와 화개의 기운이 함께 깃들어 있어, 한 병원에서 10년 이상 정체되는 것보다 경력을 확장하며 글로벌/상급 의료기관으로 도약하는 것이 사주 명리에 부합합니다.

올해 하반기부터 내년 상반기까지는 문서운(印星)과 관성(官星)이 동시에 들어오는 절호의 타이밍입니다. 이 시기에 NCLEX 취득, 전문간호사 시험, 혹은 상급종합병원 경력 이직에 도전하신다면 평소보다 합격운과 스폰서운이 2배 이상 강력하게 작용할 것입니다.`;
    } else {
      section4Content = `당신의 ${dayMaster.stem} 일간은 성실성과 정밀함이 무기입니다. ${topic.description}

심리학적으로 당신은 스스로에게 지나치게 높은 기준을 부여하여 쉽게 번아웃(Burnout)에 취약해지는 '초성실형 간호사' 프로파일을 보입니다. 완벽주의는 환자의 안전을 지키는 훌륭한 방패이지만, 당신의 마음을 갉아먹는 창이 되어서는 안 됩니다. "오늘 하루도 사고 없이 내 몫을 해냈다"는 자기 긍정의 확언을 근무 교대 시마다 속으로 3번씩 되뇌십시오.`;
    }

    // ─── 섹션 5: 50년 명리학자의 뼈때리는 직언(直言) ──────────
    const section5Title = '50년 명리학자의 뼈때리는 직언(直言)';
    const section5Content = `마지막으로 50년간 음양의 이치를 연구해 온 노학자로서, 당신에게 사탕발림 없는 뼈때리는 직언(直言)을 남깁니다.

당신은 사주에 불과 쇠의 기운이 치열하게 맞서고 있어, 억울한 일을 겪거나 상식 밖의 상황을 마주하면 겉으로는 참아도 속으로는 천불이 나며 사직서를 가슴에 품고 다닙니다. 하지만 감정에 휩쓸려 홧김에 던지는 사직서는 공백기를 길어지게 하고 후회를 남깁니다.

운이 꺾이는 달에는 선배의 사소한 지적에도 자존감이 무너져 내릴 수 있습니다. 그때 "내가 무능한가?"라고 자책하지 마십시오. 그것은 당신의 탓이 아니라, 그저 궂은비가 내리는 운의 날씨일 뿐입니다. 

비가 올 때는 우산을 쓰고 처마 밑에서 잠시 비를 피해야지, 비를 온몸으로 맞으며 진흙탕으로 뛰어들어서는 안 됩니다. 당신의 명조는 대기만성(大器晩成)형으로, 30대 중반 이후 임상과 관리직에서 독보적인 카리스마를 떨치게 되어 있으니, 눈앞의 잔물결에 일희일비하지 마십시오.`;

    const sections: AnalysisSection[] = [
      {
        title: section1Title,
        badge: '원국 총평',
        badgeColor: '#10B981',
        content: section1Content,
        keyPoints: [
          `타고난 일간: ${dayMaster.natureTitle}`,
          `왕성한 기운: ${dominantElement.element} (${dominantElement.percentage}%)`,
          `보완할 기운: ${weakElement.element} (${weakElement.percentage}%)`,
        ],
      },
      {
        title: section2Title,
        badge: '신살 정밀',
        badgeColor: primaryShinsal.badgeColor,
        content: section2Content,
        keyPoints: [
          `핵심 작용 신살: ${primaryShinsal.name} (${primaryShinsal.hanja})`,
          `임상 발현: ${primaryShinsal.oneLineSummary}`,
        ],
      },
      {
        title: section3Title,
        badge: '10년 대운',
        badgeColor: '#3B82F6',
        content: section3Content,
        keyPoints: [
          `대운 주기: ${daewoon.startAge}세 단위 (${daewoon.isForward ? '순행' : '역행'})`,
          `현재 운로: [${currentDaewoonPillar}] 대운 통과 중`,
        ],
      },
      {
        title: section4Title,
        badge: '임상 처방',
        badgeColor: '#8B5CF6',
        content: section4Content,
      },
      {
        title: section5Title,
        badge: '명인 직언',
        badgeColor: '#FF507C',
        content: section5Content,
        keyPoints: [
          '감정적 충동 사직 엄금 — 운의 날씨를 버텨라',
          '30대 중반 이후 대기만성의 독보적 카리스마',
        ],
      },
    ];

    // 전체 한글 글자수 계산 (공백 제외)
    const totalKoreanChars = sections.reduce(
      (acc, s) => acc + s.content.replace(/\s+/g, '').length,
      0
    );

    return {
      topicId: topic.id,
      topicTitle: topic.title,
      personaSummary: '50년 사주명리학 & 간호심리 명인의 정밀 감정 리포트',
      overallScore: 92,
      totalCharCount: totalKoreanChars,
      coreKeyword: `${dayMaster.stem}목 일간 · ${primaryShinsal.name}`,
      summaryQuote: `"${dayMaster.natureTitle}의 단단한 기운과 ${primaryShinsal.name}의 예리한 직관이 조화를 이루어, 생명의 최전선에서 빛을 발하는 숙명적 치유자의 명조입니다."`,
      sections,
      directAdvice: {
        title: '50년 명리학자의 금기(禁忌) 및 행동 수칙',
        warning: '충동적인 홧김 사직서 제출 및 나이트 근무 후 과도한 카페인 섭취',
        actionRule: '환자의 바이탈 변화를 직관으로 감지하되, 퇴근 후에는 병원 생각을 완전히 단절하라.',
      },
    };
  },
};

