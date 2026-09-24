/**
 * 매일 자정 갱신되는 일일 행운(Lucky Items) 생성기
 * 날짜(YYYY-MM-DD)와 생년월일 시드를 결합한 결정론적 알고리즘으로
 * 하루 동안은 일관되고, 날짜가 바뀌면 매일 새로운 행운 데이터가 산출됩니다.
 */

export interface DailyLuckyInfo {
  dateStr: string;
  colorName: string;
  colorHex: string;
  number: number;
  direction: string;
  item: string;
  element: string; // 오행 (목, 화, 토, 금, 수)
}

export const LUCKY_COLORS = [
  { name: '비바 코랄 핑크', hex: '#FF507C', element: '화(火)' },
  { name: '스카이 세레니티', hex: '#3B82F6', element: '수(水)' },
  { name: '포레스트 힐링 그린', hex: '#10B981', element: '목(木)' },
  { name: '소프트 라벤더', hex: '#8B5CF6', element: '금(金)' },
  { name: '써니 웜 옐로우', hex: '#F59E0B', element: '토(土)' },
  { name: '클리어 아쿠아 민트', hex: '#06B6D4', element: '수(水)' },
  { name: '소프트 로즈 블러쉬', hex: '#EC4899', element: '화(火)' },
  { name: '피스풀 에메랄드', hex: '#059669', element: '목(木)' },
  { name: '모던 딥 네이비', hex: '#1E3A8A', element: '수(水)' },
  { name: '골든 앰버', hex: '#D97706', element: '토(土)' },
];

/**
 * 추가 키워드 및 별칭 매핑 (오행 및 색상 Hex 포함)
 */
export const ADDITIONAL_LUCKY_KEYWORDS: Array<{ name: string; hex: string; element: string }> = [
  { name: '핑크', hex: '#FF507C', element: '화(火)' },
  { name: 'pink', hex: '#FF507C', element: '화(火)' },
  { name: '코랄', hex: '#FF507C', element: '화(火)' },
  { name: '블루', hex: '#3B82F6', element: '수(水)' },
  { name: '파랑', hex: '#3B82F6', element: '수(水)' },
  { name: 'blue', hex: '#3B82F6', element: '수(水)' },
  { name: '스카이', hex: '#3B82F6', element: '수(水)' },
  { name: '그린', hex: '#10B981', element: '목(木)' },
  { name: '초록', hex: '#10B981', element: '목(木)' },
  { name: '녹색', hex: '#10B981', element: '목(木)' },
  { name: 'green', hex: '#10B981', element: '목(木)' },
  { name: '라벤더', hex: '#8B5CF6', element: '금(金)' },
  { name: '보라', hex: '#8B5CF6', element: '금(金)' },
  { name: '퍼플', hex: '#8B5CF6', element: '금(金)' },
  { name: 'purple', hex: '#8B5CF6', element: '금(金)' },
  { name: '옐로우', hex: '#F59E0B', element: '토(土)' },
  { name: '노랑', hex: '#F59E0B', element: '토(土)' },
  { name: '황색', hex: '#F59E0B', element: '토(土)' },
  { name: 'yellow', hex: '#F59E0B', element: '토(土)' },
  { name: '민트', hex: '#06B6D4', element: '수(水)' },
  { name: 'mint', hex: '#06B6D4', element: '수(水)' },
  { name: '로즈', hex: '#EC4899', element: '화(火)' },
  { name: 'rose', hex: '#EC4899', element: '화(火)' },
  { name: '에메랄드', hex: '#059669', element: '목(木)' },
  { name: '네이비', hex: '#1E3A8A', element: '수(水)' },
  { name: 'navy', hex: '#1E3A8A', element: '수(水)' },
  { name: '골드', hex: '#D97706', element: '토(土)' },
  { name: 'amber', hex: '#D97706', element: '토(土)' },
  { name: '금색', hex: '#D97706', element: '토(土)' },
];

/**
 * 단일 원천 통합 색상 이름 -> Hex 매핑 테이블
 */
export const COLOR_NAME_TO_HEX: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const item of LUCKY_COLORS) {
    map[item.name.toLowerCase()] = item.hex;
  }
  for (const item of ADDITIONAL_LUCKY_KEYWORDS) {
    map[item.name.toLowerCase()] = item.hex;
  }
  return map;
})();

/**
 * 색상 문자열에서 "(#HEX)" 또는 헥스코드를 제거하여 깨끗한 한글/영문 이름만 추출
 */
export function cleanLuckyColorName(colorName?: string): string {
  if (!colorName) return LUCKY_COLORS[0].name;
  return (
    colorName
      .replace(/\s*\([^)]*#[0-9a-fA-F]{3,6}[^)]*\)/gi, '')
      .replace(/#[0-9a-fA-F]{3,6}/gi, '')
      .trim() || LUCKY_COLORS[0].name
  );
}

/**
 * 색상 이름 또는 문자열에서 일치하는 Hex 컬러를 반환
 */
export function getLuckyColorHex(colorName?: string): string {
  if (!colorName) return LUCKY_COLORS[0].hex;

  // 1. 이미 헥스코드가 문자열 안에 포함되어 있는 경우
  const hexMatch = colorName.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
  if (hexMatch) return hexMatch[0];

  // 2. 클린 이름 기반 매칭
  const clean = cleanLuckyColorName(colorName).toLowerCase();

  if (COLOR_NAME_TO_HEX[clean]) {
    return COLOR_NAME_TO_HEX[clean];
  }

  for (const [name, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (clean.includes(name) || name.includes(clean)) {
      return hex;
    }
  }

  // 3. 매핑 실패 시 개발 모드 경고 후 기본 행운 컬러 (비바 코랄 핑크) 반환
  if (__DEV__) {
    console.warn(`[dailyFortuneGenerator] 알 수 없는 색상명: ${colorName}`);
  }
  return LUCKY_COLORS[0].hex;
}

const LUCKY_DIRECTIONS = [
  '간호 스테이션 동쪽 (목(木) 생기)',
  '병동 남쪽 창가 (화(火) 활력)',
  '처치실 서쪽 (금(金) 결단)',
  '약제부 북쪽 (수(水) 평온)',
  '중앙 라운지 (토(土) 안정)',
  '스테이션 동남쪽 (목(木) 순풍)',
  '휴게실 북서쪽 (금(金) 휴식)',
  '엘리베이터 남서쪽 (토(土) 조화)',
];

const LUCKY_ITEMS = [
  '부드러운 3색 볼펜',
  '압박 스타킹',
  '보온 텀블러',
  '포켓 간호 가위',
  '수액 타이머 & 알람',
  '핸드크림 & 립밤',
  '포도당 캔디 & 비타민',
  '메디컬 테이프 커터',
  '에어쿠션 간호화',
  '미니 수첩 & 펜홀더',
];

/**
 * 문자열 해시 함수
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 오늘 날짜 기준 데일리 행운 정보 생성
 */
export function getDailyLuckyInfo(targetDate = new Date(), birthDate = ''): DailyLuckyInfo {
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // 날짜 + 생년월일 시드
  const seedStr = `${dateStr}_${birthDate || 'weganda_nurse_daily'}`;
  const baseHash = hashString(seedStr);

  const colorIndex = baseHash % LUCKY_COLORS.length;
  const directionIndex = (baseHash >> 2) % LUCKY_DIRECTIONS.length;
  const itemIndex = (baseHash >> 4) % LUCKY_ITEMS.length;

  // 행운의 숫자: 1 ~ 99 중 산출
  const number = ((baseHash >> 1) % 99) + 1;

  const colorObj = LUCKY_COLORS[colorIndex];

  return {
    dateStr,
    colorName: colorObj.name,
    colorHex: colorObj.hex,
    number,
    direction: LUCKY_DIRECTIONS[directionIndex],
    item: LUCKY_ITEMS[itemIndex],
    element: colorObj.element,
  };
}

/**
 * 오늘 날짜 + 생년월일 시드 기준 결정론적 일일 총점 산출 (70 ~ 98점 분포)
 */
export function getDailyOverallScore(targetDate = new Date(), birthDate = ''): number {
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const seedStr = `${dateStr}_${birthDate || 'weganda_nurse_daily'}_score`;
  const baseHash = hashString(seedStr);

  // 70 ~ 98 사이 분포 (29개 값: 70 + 0~28)
  return 70 + (baseHash % 29);
}
