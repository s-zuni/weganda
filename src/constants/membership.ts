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
  // 5. Unlimited shared calendar + AI date picker
  { key: 'calendar', icon: 'CalendarIcon', title: '무제한 교집합 캘린더 & AI 모임 추천', description: '친구 수 제한 없이 듀티를 공유하고\nAI가 최적의 모임 날짜를 추천해드려요', freeLimit: '최대 3명 동기화' },
];

export const FREE_LIMITS = {
  maxMonthlyFortune: 5,
  maxSharedCalendarFriends: 3,
  maxDailyAiQueries: 3,
} as const;

export const PREMIUM_PRICE = '월 7,800원';
export const PREMIUM_PRICE_NUMBER = 7800;
export const PREMIUM_TRIAL_DAYS = 7;

// In-App Purchase (IAP) SKUs & Product IDs for App Store & Google Play
export const IAP_SKUS = {
  SUBSCRIPTION_MONTHLY_IOS: 'com.weganda.app.premium.monthly',
  SUBSCRIPTION_MONTHLY_ANDROID: 'com.weganda.app.premium.monthly',
} as const;

export const IAP_CONFIG = {
  subscriptionSku: 'com.weganda.app.premium.monthly',
  trialPeriodDays: 7,
  storeTermsUrl: 'https://weganda.app/terms/membership',
  privacyUrl: 'https://weganda.app/privacy',
} as const;

