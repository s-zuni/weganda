import {
  calculateFourPillars,
  FourPillarsDetail,
  FiveElement,
  HeavenlyStem,
  EarthlyBranch,
} from 'manseryeok';

// ─── 타입 선언 ──────────────────────────────────────────────

export type CalendarType = 'solar' | 'lunar';
export type GenderType = 'male' | 'female';

export interface PillarData {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemHanja: string;
  branchHanja: string;
  combinedKorean: string;
  combinedHanja: string;
  stemElement: FiveElement;
  branchElement: FiveElement;
  stemYinYang: '양' | '음';
  branchYinYang: '양' | '음';
  stemTenGod: string;
  branchTenGod: string;
}

export interface ShinsalDetected {
  name: string;
  hanja: string;
  type: '길신(吉神)' | '흉살(凶煞)' | '특수성(特殊)';
  badgeColor: string;
  oneLineSummary: string;
  hospitalImpact: string;
  clinicalAdvice: string;
}

export interface FiveElementsCount {
  wood: number; // 목
  fire: number; // 화
  earth: number; // 토
  metal: number; // 금
  water: number; // 수
}

export interface FiveElementsRatio {
  element: '목(木)' | '화(火)' | '토(土)' | '금(金)' | '수(水)';
  rawName: FiveElement;
  count: number;
  percentage: number;
  color: string;
  status: '과다' | '적정' | '부족' | '결핍';
  trait: string;
}

export interface DaewoonItem {
  age: number;
  korean: string;
  hanja?: string;
  isCurrent: boolean;
}

export interface SajuAnalysisResult {
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    isLunar: boolean;
    gender: GenderType;
  };
  pillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData;
  };
  dayMaster: {
    stem: HeavenlyStem;
    stemHanja: string;
    element: FiveElement;
    yinYang: '양' | '음';
    natureTitle: string;
    natureDescription: string;
  };
  fiveElements: FiveElementsRatio[];
  detectedShinsals: ShinsalDetected[];
  voidBranches: EarthlyBranch[];
  daewoon: {
    startAge: number;
    isForward: boolean;
    currentAge: number;
    pillars: DaewoonItem[];
    currentPillar?: DaewoonItem;
  };
  rawDetail: FourPillarsDetail;
}

// ─── 한자 및 오행 색상 매핑 ─────────────────────────────────

export const HANJA_STEM: Record<HeavenlyStem, string> = {
  갑: '甲',
  을: '乙',
  병: '丙',
  정: '丁',
  무: '戊',
  기: '己',
  경: '庚',
  신: '辛',
  임: '壬',
  계: '癸',
};

export const HANJA_BRANCH: Record<EarthlyBranch, string> = {
  자: '子',
  축: '丑',
  인: '寅',
  묘: '卯',
  진: '辰',
  사: '巳',
  오: '午',
  미: '未',
  신: '申',
  유: '酉',
  술: '戌',
  해: '亥',
};

export const ELEMENT_COLORS: Record<FiveElement, string> = {
  목: '#10B981', // 초록
  화: '#FF507C', // 코랄 핑크
  토: '#F59E0B', // 노랑/황토
  금: '#6B7280', // 은백색/그레이
  수: '#3B82F6', // 블루
};

// ─── 일간별 상징 및 본성 ───────────────────────────────────

const DAY_MASTER_DESCRIPTIONS: Record<HeavenlyStem, { title: string; desc: string }> = {
  갑: {
    title: '갑목(甲木) — 곧게 뻗은 대들보 거목',
    desc: '추진력과 책임감이 남다르며, 병동의 든든한 버팀목 역할을 자처합니다. 꺾이기보다 부러지는 성향이 있어 유연성이 필요합니다.',
  },
  을: {
    title: '을목(乙木) — 강인한 생명력의 화초/담쟁이',
    desc: '적응력과 친화력이 탁월하여 낯선 병동이나 부서 이동에도 빠르게 뿌리를 내립니다. 환자에게 부드러운 치유 에너지를 전달합니다.',
  },
  병: {
    title: '병화(丙火) — 세상을 밝게 비추는 태양',
    desc: '화끈하고 열정적이며 뒤끝이 없습니다. 응급 상황에서 거침없는 행동력을 발휘하지만, 에너지를 급격히 소진하여 번아웃이 올 수 있습니다.',
  },
  정: {
    title: '정화(丁火) — 어둠을 밝히는 등불과 촛불',
    desc: '섬세하고 따뜻하며 헌신적입니다. 나이트 근무나 어두운 중환자실에서 환자의 미세한 신음도 놓치지 않는 극진한 간호를 펼칩니다.',
  },
  무: {
    title: '무토(戊土) — 넓고 깊은 대지이자 거산',
    desc: '묵직한 안정감과 포용력을 지녔습니다. 위기나 돌발 상황에서도 당황하지 않고 병동의 중심을 지키는 든든한 선배 기질입니다.',
  },
  기: {
    title: '기토(己土) — 만물을 길러내는 비옥한 전답',
    desc: '꼼꼼하고 실리적이며 기록과 차팅, 투약 계산에 빈틈이 없습니다. 동료들을 세심하게 챙기며 조직의 윤활유 역할을 합니다.',
  },
  경: {
    title: '경금(庚金) — 단련되지 않은 강철과 바위',
    desc: '원칙주의자이자 칼 같은 결단력을 지녔습니다. 수술실(OR)이나 응급실(ER) 등 무결점 정밀 처치와 단호한 처치가 필요한 곳에 적합합니다.',
  },
  신: {
    title: '신금(辛金) — 정밀하게 세공된 보석과 메스',
    desc: '예리한 직관과 극도의 완벽주의를 자랑합니다. 주사(IV) 성공률이 높고 미세한 오차도 허용하지 않으나, 스스로에게 지나치게 엄격할 수 있습니다.',
  },
  임: {
    title: '임수(壬水) — 도도히 흐르는 거대한 강과 바다',
    desc: '통찰력과 임기응변, 넓은 시야를 지녔습니다. 복잡한 다중 업무(Multi-tasking)를 유연하게 소화하며 인차지 리더십에 적합합니다.',
  },
  계: {
    title: '계수(癸水) — 만물을 적시는 이슬과 봄비',
    desc: '지혜롭고 눈치가 빠르며 공감 능력이 깊습니다. 환자와 보호자의 심리적 불안을 귀신같이 읽어내어 위로하는 치유의 능력이 있습니다.',
  },
};

// ─── 시간대 파싱 헬퍼 ──────────────────────────────────────

export function parseBirthTimeToHourMinute(timeStr: string): { hour: number; minute: number } {
  if (!timeStr || timeStr === '미상' || timeStr.trim() === '') {
    return { hour: 12, minute: 0 };
  }

  // "HH:mm" 포맷 파싱
  if (timeStr.includes(':')) {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    if (!isNaN(h) && !isNaN(m)) {
      return { hour: Math.min(Math.max(h, 0), 23), minute: Math.min(Math.max(m, 0), 59) };
    }
  }

  // 12지시 텍스트 매핑
  const branchMap: Record<string, number> = {
    자: 0,
    축: 2,
    인: 4,
    묘: 6,
    진: 8,
    사: 10,
    오: 12,
    미: 14,
    신: 16,
    유: 18,
    술: 20,
    해: 22,
  };

  for (const [key, hour] of Object.entries(branchMap)) {
    if (timeStr.includes(key)) {
      return { hour, minute: 30 };
    }
  }

  return { hour: 12, minute: 0 };
}

// ─── 10대 핵심 신살(神煞) 계산기 ────────────────────────────

export function calculateShinsals(
  pillars: {
    year: { stem: HeavenlyStem; branch: EarthlyBranch };
    month: { stem: HeavenlyStem; branch: EarthlyBranch };
    day: { stem: HeavenlyStem; branch: EarthlyBranch };
    hour: { stem: HeavenlyStem; branch: EarthlyBranch };
  }
): ShinsalDetected[] {
  const detected: ShinsalDetected[] = [];

  const dayStem = pillars.day.stem;
  const dayBranch = pillars.day.branch;
  const yearBranch = pillars.year.branch;
  const allBranches = [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch];
  const allPillarsKorean = [
    pillars.year.stem + pillars.year.branch,
    pillars.month.stem + pillars.month.branch,
    pillars.day.stem + pillars.day.branch,
    pillars.hour.stem + pillars.hour.branch,
  ];

  // 1. 귀문관살 (鬼門關煞) — 감각적 촉, 예민함, 바이탈 조기 감지
  const gwimunPairs: [EarthlyBranch, EarthlyBranch][] = [
    ['자', '유'],
    ['축', '오'],
    ['인', '미'],
    ['묘', '신'],
    ['진', '해'],
    ['사', '술'],
  ];
  let hasGwimun = false;
  for (const [b1, b2] of gwimunPairs) {
    if (
      (allBranches.includes(b1) && allBranches.includes(b2)) ||
      (dayBranch === b1 && allBranches.includes(b2)) ||
      (dayBranch === b2 && allBranches.includes(b1))
    ) {
      hasGwimun = true;
      break;
    }
  }
  if (hasGwimun) {
    detected.push({
      name: '귀문관살',
      hanja: '鬼門關煞',
      type: '특수성(特殊)',
      badgeColor: '#8B5CF6',
      oneLineSummary: '신들린 육감과 예민한 감각으로 환자의 미세한 바이탈 악화를 조기 포착함',
      hospitalImpact: '모니터 경보가 울리기 전 환자의 상태 이상을 감지하는 천부적 임상 직관이 발휘됩니다.',
      clinicalAdvice: '극도의 신경과민과 불면증, 교대근무 후 잔류 스트레스가 심할 수 있으니 오프 날 뇌 휴식이 절대 필수입니다.',
    });
  }

  // 2. 홍염살 (紅艶煞) — 사람을 끌어당기는 은은한 온화함과 매력
  const hongyeomMap: Record<HeavenlyStem, EarthlyBranch[]> = {
    갑: ['오', '신'],
    을: ['오', '신'],
    병: ['인'],
    정: ['미'],
    무: ['진', '사'],
    기: ['진', '사'],
    경: ['술'],
    신: ['유'],
    임: ['자', '신'],
    계: ['신'],
  };
  const targetHongyeomBranches = hongyeomMap[dayStem] || [];
  const hasHongyeom = allBranches.some((b) => targetHongyeomBranches.includes(b));
  if (hasHongyeom) {
    detected.push({
      name: '홍염살',
      hanja: '紅艶煞',
      type: '길신(吉神)',
      badgeColor: '#FF507C',
      oneLineSummary: '환자와 보호자의 마음을 무장해제시키는 따뜻한 인간적 호감과 라포 형성력',
      hospitalImpact: '까다롭고 날 선 보호자도 당신의 부드러운 미소와 눈빛 앞에서는 컴플레인을 누그러뜨립니다.',
      clinicalAdvice: '모든 사람의 감정 쓰레기통 역할을 자처하기 쉬우므로, 직업적 친절과 개인적 감정의 분리선(경계)을 지키세요.',
    });
  }

  // 3. 백호대살 (白虎大煞) — 피를 보고 칼을 쓰는 강한 압도력과 액땜
  const baekhoPillars = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];
  const hasBaekho = allPillarsKorean.some((p) => baekhoPillars.includes(p));
  if (hasBaekho) {
    detected.push({
      name: '백호대살',
      hanja: '白虎大煞',
      type: '특수성(特殊)',
      badgeColor: '#EF4444',
      oneLineSummary: '피를 보거나 응급 시술을 하는 의료계에 종사함으로써 최고의 액땜(업상대체)을 이룸',
      hospitalImpact: '응급실(ER), 중환자실(ICU), 수술실(OR)에서 엄청난 순발력과 돌파력으로 위기 상황을 제압합니다.',
      clinicalAdvice: '평소에는 얌전하다가도 욱하는 기질이 튀어나올 수 있으니, 갈등 상황에서 3초 호흡법을 실천하세요.',
    });
  }

  // 4. 괴강살 (魁罡煞) — 우두머리 기질, 단호한 카리스마와 결단력
  const goegangPillars = ['무진', '무술', '경진', '경술', '임진', '임술'];
  const hasGoegang = allPillarsKorean.some((p) => goegangPillars.includes(p));
  if (hasGoegang) {
    detected.push({
      name: '괴강살',
      hanja: '魁罡煞',
      type: '특수성(特殊)',
      badgeColor: '#1F2937',
      oneLineSummary: '인차지 및 수간호사 리더십에 적합한 총명함과 강력한 병동 장악력',
      hospitalImpact: '위기 상황에서 우물쭈물하지 않고 확실하게 지시를 내리며 병동의 질서를 세웁니다.',
      clinicalAdvice: '완벽주의로 인해 후배들에게 엄격한 잣대를 들이대지 않도록 포용력 있는 피드백을 유지하세요.',
    });
  }

  // 5. 도화살 (桃花煞) — 대중적 인기, 시선을 끄는 존재감
  const dohwaTarget = (base: EarthlyBranch): EarthlyBranch => {
    if (['인', '오', '술'].includes(base)) return '묘';
    if (['신', '자', '진'].includes(base)) return '유';
    if (['사', '유', '축'].includes(base)) return '오';
    return '자';
  };
  const targetDohwa = [dohwaTarget(yearBranch), dohwaTarget(dayBranch)];
  const hasDohwa = allBranches.some((b) => targetDohwa.includes(b));
  if (hasDohwa) {
    detected.push({
      name: '도화살',
      hanja: '桃花煞',
      type: '길신(吉神)',
      badgeColor: '#EC4899',
      oneLineSummary: '병동 분위기를 밝게 만드는 에너지와 환자·의사·동료 간의 탁월한 인맥 형성',
      hospitalImpact: '스테이션의 비타민 같은 존재로 동료들의 신뢰를 얻으며 원내 소통의 중심에 섭니다.',
      clinicalAdvice: '사소한 일로 병동 내 뒷말이나 시기 질투를 살 수 있으니 사생활 공유는 신중히 하세요.',
    });
  }

  // 6. 역마살 (驛馬煞) — 활동성, 3교대 적응력, 해외 간호사 운
  const yeokmaTarget = (base: EarthlyBranch): EarthlyBranch => {
    if (['인', '오', '술'].includes(base)) return '신';
    if (['신', '자', '진'].includes(base)) return '인';
    if (['사', '유', '축'].includes(base)) return '해';
    return '사';
  };
  const targetYeokma = [yeokmaTarget(yearBranch), yeokmaTarget(dayBranch)];
  const hasYeokma = allBranches.some((b) => targetYeokma.includes(b)) || allBranches.filter((b) => ['인', '신', '사', '해'].includes(b)).length >= 2;
  if (hasYeokma) {
    detected.push({
      name: '역마살',
      hanja: '驛馬煞',
      type: '특수성(特殊)',
      badgeColor: '#3B82F6',
      oneLineSummary: '가만히 앉아있는 업무보다 역동적인 병동 순회 및 해외 간호사(NCLEX) 진출 최상',
      hospitalImpact: '변화무쌍한 3교대 스케줄과 부서 이동에도 빠르게 적응하며 글로벌 커리어 확장에 유리합니다.',
      clinicalAdvice: '한 병원에 안주하기보다 2~3년 주기로 전문성을 레벨업하는 이직 전략이 길합니다.',
    });
  }

  // 7. 화개살 (華蓋煞) — 학구열, 전문성, 대학원/전문간호사(APN)
  const hwagaeTarget = (base: EarthlyBranch): EarthlyBranch => {
    if (['인', '오', '술'].includes(base)) return '술';
    if (['신', '자', '진'].includes(base)) return '진';
    if (['사', '유', '축'].includes(base)) return '축';
    return '미';
  };
  const targetHwagae = [hwagaeTarget(yearBranch), hwagaeTarget(dayBranch)];
  const hasHwagae = allBranches.some((b) => targetHwagae.includes(b));
  if (hasHwagae) {
    detected.push({
      name: '화개살',
      hanja: '華蓋煞',
      type: '길신(吉神)',
      badgeColor: '#D97706',
      oneLineSummary: '깊이 있는 학구열과 정신적 통찰력으로 임상 전문간호사(APN) 및 연구직에 최적',
      hospitalImpact: '단순 반복 처치를 넘어 질환의 병태생리와 약리학적 메커니즘을 파고드는 학구파 간호사입니다.',
      clinicalAdvice: '마음의 고독감이 깊어질 수 있으니 업무 외에 깊은 대화를 나눌 수 있는 멘토를 곁에 두세요.',
    });
  }

  // 8. 천을귀인 (天乙貴人) — 최고의 길신, 위기 탈출의 구원투수
  const cheoneulMap: Record<HeavenlyStem, EarthlyBranch[]> = {
    갑: ['축', '미'],
    무: ['축', '미'],
    경: ['축', '미'],
    을: ['자', '신'],
    기: ['자', '신'],
    병: ['해', '유'],
    정: ['해', '유'],
    신: ['인', '오'],
    임: ['사', '묘'],
    계: ['사', '묘'],
  };
  const targetCheoneul = cheoneulMap[dayStem] || [];
  const hasCheoneul = allBranches.some((b) => targetCheoneul.includes(b));
  if (hasCheoneul) {
    detected.push({
      name: '천을귀인',
      hanja: '天乙貴人',
      type: '길신(吉神)',
      badgeColor: '#10B981',
      oneLineSummary: '인생과 커리어의 결정적 위기 순간마다 나를 구해주는 든든한 선배·조력자가 나타남',
      hospitalImpact: '투약 오류 위기나 까다로운 인수인계 상황에서도 조력자의 도움으로 무탈히 넘깁니다.',
      clinicalAdvice: '받은 은혜를 후배들에게 베풀수록 자신의 복록과 귀인 운이 배로 확장됩니다.',
    });
  }

  // 9. 양인살 (羊刃煞) — 칼을 쥐는 제왕의 기운, CPR 및 급박한 순간의 담력
  const yanginMap: Record<HeavenlyStem, EarthlyBranch> = {
    갑: '묘',
    을: '진',
    병: '오',
    정: '미',
    무: '오',
    기: '미',
    경: '유',
    신: '술',
    임: '자',
    계: '축',
  };
  const targetYangin = yanginMap[dayStem];
  if (targetYangin && allBranches.includes(targetYangin)) {
    detected.push({
      name: '양인살',
      hanja: '羊刃煞',
      type: '특수성(特殊)',
      badgeColor: '#B91C1C',
      oneLineSummary: '심폐소생술(CPR)이나 응급 프로토콜에서 한 치의 주저함도 없는 대담한 결단력',
      hospitalImpact: '급성 악화 환자 발생 시 침착하고 대담하게 중심을 잡고 처치를 이끌어냅니다.',
      clinicalAdvice: '동료에게 직설적인 화법으로 상처를 줄 수 있으니 의사 전달 시 쿠션어를 의식적으로 사용하세요.',
    });
  }

  // 10. 원진살 (怨嗔煞) — 애증과 오해, 인간관계 주의보
  const wonjinPairs: [EarthlyBranch, EarthlyBranch][] = [
    ['자', '미'],
    ['축', '오'],
    ['인', '유'],
    ['묘', '신'],
    ['진', '해'],
    ['사', '술'],
  ];
  let hasWonjin = false;
  for (const [w1, w2] of wonjinPairs) {
    if (allBranches.includes(w1) && allBranches.includes(w2)) {
      hasWonjin = true;
      break;
    }
  }
  if (hasWonjin) {
    detected.push({
      name: '원진살',
      hanja: '怨嗔煞',
      type: '흉살(凶煞)',
      badgeColor: '#D97706',
      oneLineSummary: '동료나 프리셉터와의 미묘한 오해 및 애증 관계로 인한 대인관계 스트레스',
      hospitalImpact: '좋아하면서도 사소한 일로 서운함이 생기기 쉬우며 인수인계 시 감정적 마찰 주의가 필요합니다.',
      clinicalAdvice: '추측으로 혼자 끙끙 앓지 말고, 의문이나 서운함은 업무적 사실(Fact) 중심으로 담백하게 소통하세요.',
    });
  }

  return detected;
}

// ─── 오행 비율 분석기 ──────────────────────────────────────

export function calculateFiveElementsRatio(
  pillars: {
    year: { stemElement: FiveElement; branchElement: FiveElement };
    month: { stemElement: FiveElement; branchElement: FiveElement };
    day: { stemElement: FiveElement; branchElement: FiveElement };
    hour: { stemElement: FiveElement; branchElement: FiveElement };
  }
): FiveElementsRatio[] {
  const counts: Record<FiveElement, number> = {
    목: 0,
    화: 0,
    토: 0,
    금: 0,
    수: 0,
  };

  const elements = [
    pillars.year.stemElement,
    pillars.year.branchElement,
    pillars.month.stemElement,
    pillars.month.branchElement,
    pillars.day.stemElement,
    pillars.day.branchElement,
    pillars.hour.stemElement,
    pillars.hour.branchElement,
  ];

  for (const el of elements) {
    if (counts[el] !== undefined) {
      counts[el]++;
    }
  }

  const traitsMap: Record<FiveElement, string> = {
    목: '성장과 공감, 환자 치유 능력 및 유대감',
    화: '열정과 순발력, 빠른 응급처치와 위기 대처',
    토: '안정감과 끈기, 꼼꼼한 기록과 투약 확인',
    금: '원칙과 정확성, 칼 같은 결단력과 무결점 간호',
    수: '유연한 대처, 야간 집중력과 심리적 통찰력',
  };

  const koreanNames: Record<FiveElement, '목(木)' | '화(火)' | '토(土)' | '금(金)' | '수(水)'> = {
    목: '목(木)',
    화: '화(火)',
    토: '토(土)',
    금: '금(金)',
    수: '수(水)',
  };

  const total = 8;
  const result: FiveElementsRatio[] = (['목', '화', '토', '금', '수'] as FiveElement[]).map((el) => {
    const count = counts[el];
    const percentage = Math.round((count / total) * 100);

    let status: '과다' | '적정' | '부족' | '결핍' = '적정';
    if (count >= 3) status = '과다';
    else if (count === 2) status = '적정';
    else if (count === 1) status = '부족';
    else status = '결핍';

    return {
      element: koreanNames[el],
      rawName: el,
      count,
      percentage,
      color: ELEMENT_COLORS[el],
      status,
      trait: traitsMap[el],
    };
  });

  return result;
}

// ─── 메인 만세력 분석 서비스 ─────────────────────────────────

export const manseryeokService = {
  /**
   * 사용자의 생년월일시 및 성별을 바탕으로 정밀 사주팔자, 오행, 신살, 대운을 종합 계산합니다.
   */
  calculateSaju(params: {
    birthDate: string; // YYYY-MM-DD
    birthTime?: string; // HH:mm or '자시' or '미상'
    calendarType?: CalendarType;
    gender?: GenderType;
    isLeapMonth?: boolean;
  }): SajuAnalysisResult {
    const { birthDate, birthTime = '12:00', calendarType = 'solar', gender = 'female', isLeapMonth = false } = params;

    // 1. 날짜 파싱
    const [yearStr, monthStr, dayStr] = birthDate.split('-');
    const year = parseInt(yearStr, 10) || 1995;
    const month = parseInt(monthStr, 10) || 5;
    const day = parseInt(dayStr, 10) || 15;

    // 2. 시간 파싱
    const { hour, minute } = parseBirthTimeToHourMinute(birthTime);

    // 3. 만세력 라이브러리 정밀 계산
    const rawDetail = calculateFourPillars({
      year,
      month,
      day,
      hour,
      minute,
      isLunar: calendarType === 'lunar',
      isLeapMonth,
      gender,
      dayBoundary: 'splitJasi',
    });

    // 4. 각 기둥 데이터 정형화
    const formatPillar = (
      pillarKey: 'year' | 'month' | 'day' | 'hour',
      elementPair: { stem: FiveElement; branch: FiveElement },
      yinYangPair: { stem: '양' | '음'; branch: '양' | '음' },
      tenGodPair: { stem: string; branch: string }
    ): PillarData => {
      const stem = rawDetail[pillarKey].heavenlyStem;
      const branch = rawDetail[pillarKey].earthlyBranch;
      return {
        stem,
        branch,
        stemHanja: HANJA_STEM[stem] || stem,
        branchHanja: HANJA_BRANCH[branch] || branch,
        combinedKorean: `${stem}${branch}`,
        combinedHanja: `${HANJA_STEM[stem] || stem}${HANJA_BRANCH[branch] || branch}`,
        stemElement: elementPair.stem,
        branchElement: elementPair.branch,
        stemYinYang: yinYangPair.stem,
        branchYinYang: yinYangPair.branch,
        stemTenGod: tenGodPair.stem,
        branchTenGod: tenGodPair.branch,
      };
    };

    const pillars = {
      year: formatPillar('year', rawDetail.yearElement, rawDetail.yearYinYang, rawDetail.tenGods.year),
      month: formatPillar('month', rawDetail.monthElement, rawDetail.monthYinYang, rawDetail.tenGods.month),
      day: formatPillar('day', rawDetail.dayElement, rawDetail.dayYinYang, rawDetail.tenGods.day),
      hour: formatPillar('hour', rawDetail.hourElement, rawDetail.hourYinYang, rawDetail.tenGods.hour),
    };

    // 5. 일간(日干) 분석
    const dayMasterStem = pillars.day.stem;
    const dayMasterInfo = DAY_MASTER_DESCRIPTIONS[dayMasterStem] || {
      title: `${dayMasterStem}목 일간`,
      desc: '의료 현장에서 환자를 돌보고 책임을 다하는 간호사입니다.',
    };

    const dayMaster = {
      stem: dayMasterStem,
      stemHanja: HANJA_STEM[dayMasterStem],
      element: pillars.day.stemElement,
      yinYang: pillars.day.stemYinYang,
      natureTitle: dayMasterInfo.title,
      natureDescription: dayMasterInfo.desc,
    };

    // 6. 오행 분포
    const fiveElements = calculateFiveElementsRatio(pillars);

    // 7. 신살(神煞) 계산
    const detectedShinsals = calculateShinsals(pillars);

    // 8. 대운(大運) 정보 계산
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - year + 1;

    let daewoonPillars: DaewoonItem[] = [];
    let startAge = 5;
    let isForward = true;

    if (rawDetail.luckPillars) {
      startAge = rawDetail.luckPillars.startAge;
      isForward = rawDetail.luckPillars.forward;
      daewoonPillars = rawDetail.luckPillars.pillars.map((p, idx, arr) => {
        const nextAge = arr[idx + 1] ? arr[idx + 1].age : p.age + 10;
        const isCurrent = currentAge >= p.age && currentAge < nextAge;
        return {
          age: p.age,
          korean: p.korean,
          isCurrent,
        };
      });
    }

    const currentPillar = daewoonPillars.find((p) => p.isCurrent) || daewoonPillars[0];

    return {
      birthInfo: {
        year,
        month,
        day,
        hour,
        minute,
        isLunar: calendarType === 'lunar',
        gender,
      },
      pillars,
      dayMaster,
      fiveElements,
      detectedShinsals,
      voidBranches: rawDetail.voidBranches,
      daewoon: {
        startAge,
        isForward,
        currentAge,
        pillars: daewoonPillars,
        currentPillar,
      },
      rawDetail,
    };
  },
};

