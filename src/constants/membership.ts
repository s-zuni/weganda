// App theme color type and options
export type AppThemeColor = 'pink' | 'deepGreen' | 'deepBlue' | 'yellow' | 'purple';

export interface ThemeColorOption {
  key: AppThemeColor;
  label: string;
  hex: string;
  isPremiumOnly: boolean;
}

export const APP_THEME_COLORS: ThemeColorOption[] = [
  { key: 'pink', label: '비바 코랄 핑크 (기본)', hex: '#FF507C', isPremiumOnly: false },
  { key: 'deepGreen', label: '딥 그린', hex: '#1B4332', isPremiumOnly: true },
  { key: 'deepBlue', label: '딥 블루', hex: '#1E3A5F', isPremiumOnly: true },
  { key: 'yellow', label: '머스타드 옐로', hex: '#C49B2A', isPremiumOnly: true },
  { key: 'purple', label: '로얄 퍼플', hex: '#5B2C8E', isPremiumOnly: true },
];

// Benefit definition
export interface PremiumBenefit {
  key: string;
  icon: string; // Icon component name from Icon.tsx
  title: string;
  description: string;
  freeLimit?: string;
}

export const PREMIUM_BENEFITS: PremiumBenefit[] = [
  // 1. Custom theme colors
  { key: 'theme', icon: 'PaletteIcon', title: '앱 커스텀 컬러 설정', description: '딥 그린, 딥 블루, 옐로, 퍼플 등\n나만의 앱 테마 컬러를 설정하세요', freeLimit: '기본 핑크만 사용 가능' },
  // 2. Unlimited fortune
  { key: 'fortune', icon: 'FortuneIcon', title: '사주 서비스 무제한 제공', description: '매달 횟수 제한 없이\n간호 운세와 정밀 사주를 확인하세요', freeLimit: '월 5회 제한' },
  // 3. Salary predictor (Killer feature)
  { key: 'salary', icon: 'ChartBarIcon', title: '야간/휴일 수당 및 월급 자동 예측기', description: 'D/E/N 근무 패턴 기반으로\n다음 달 예상 월급을 자동 계산해요', freeLimit: 'weganda+ 전용 기능' },
  // 4. Unlimited AI & Drug Calculator
  { key: 'ai', icon: 'BotIcon', title: '약물 계산기 & Ask AI 무제한', description: '복잡한 약물 용량 계산 프리셋과\nAI 임상 어시스턴트를 무제한 사용하세요', freeLimit: '일일 3회 제한' },
  // 5. Smart duty health & burnout analysis
  { key: 'burnout', icon: 'SparklesIcon', title: '스마트 듀티 건강 & 번아웃 위험도 AI 분석', description: 'N-O-D 패턴, 수면 부채, 연속 근무 피로도를\nAI가 분석하여 회복 골든타임을 알려드려요', freeLimit: 'weganda+ 전용 기능' },
];

export const FREE_LIMITS = {
  maxMonthlyFortune: 5,
  maxDailyAiQueries: 3,
  maxDailyDrugCalculations: 3,
} as const;

// 정규 멤버십 가격
export const STANDARD_PRICING = {
  monthly: 7900,
  yearly: 70000,
} as const;

// 출시 얼리버드 평생할인 가격
export const EARLYBIRD_PRICING = {
  monthly: 5900,
  yearly: 59000,
} as const;

export const PREMIUM_PRICE = '월 7,900원';
export const PREMIUM_PRICE_NUMBER = 7900;
export const PREMIUM_TRIAL_DAYS = 30; // 1개월 무료 체험 (30일)

// In-App Purchase (IAP) SKUs & Product IDs for App Store & Google Play
export const IAP_SKUS = {
  // 정규 구독 SKU
  MONTHLY_STANDARD: 'com.weganda.app.sub.monthly.standard',
  YEARLY_STANDARD: 'com.weganda.app.sub.yearly.standard',

  // 출시 얼리버드 평생할인 SKU
  MONTHLY_EARLYBIRD: 'com.weganda.app.sub.monthly.earlybird',
  YEARLY_EARLYBIRD: 'com.weganda.app.sub.yearly.earlybird',

  // 하위 호환성 유지
  SUBSCRIPTION_MONTHLY_IOS: 'com.weganda.app.sub.monthly.earlybird',
  SUBSCRIPTION_MONTHLY_ANDROID: 'com.weganda.app.sub.monthly.earlybird',
} as const;

// 스토어 구독 관리 직접 링크
export const STORE_SUBSCRIPTION_URLS = {
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
  web: 'https://weganda.kr/membership',
} as const;

export const IAP_CONFIG = {
  subscriptionSku: IAP_SKUS.MONTHLY_EARLYBIRD,
  trialPeriodDays: 30,
  storeTermsUrl: 'https://weganda.kr/membership',
  privacyUrl: 'https://weganda.kr/privacy',
} as const;

// 출시일 기준 기본 이벤트 일정 계산 함수 (2026-09-11 기준)
export const getDefaultEventDates = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const startDate = `${yyyy}-${mm}-${dd}`;

  // 1개월 후 (얼리버드 할인 종료일)
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const end1m = `${oneMonthLater.getFullYear()}-${String(oneMonthLater.getMonth() + 1).padStart(2, '0')}-${String(oneMonthLater.getDate()).padStart(2, '0')}`;

  // 3개월 후 (1개월 무료체험 이벤트 종료일)
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const end3m = `${threeMonthsLater.getFullYear()}-${String(threeMonthsLater.getMonth() + 1).padStart(2, '0')}-${String(threeMonthsLater.getDate()).padStart(2, '0')}`;

  return { startDate, end1m, end3m };
};

