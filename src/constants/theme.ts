export type AppThemeColor = 'pink' | 'deepGreen' | 'deepBlue' | 'yellow' | 'purple';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  primaryTint: string;
  onPrimaryText: string;
  background: string;
  offWhite: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  shift: {
    day: string;
    evening: string;
    night: string;
    off: string;
    vacation: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  subBeige: string;
  subBeigeLight: string;
  subBeigeBorder: string;
  subBeigeText: string;
  subBeigeMuted: string;
  subBeigeBtn: string;
  subBeigeBadge: string;
}

const COMMON_BASE = {
  background: '#FFFFFF',
  offWhite: '#F8F9FA',
  cardBackground: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  shift: {
    day: '#4F98CA',
    evening: '#E2703A',
    night: '#272727',
    off: '#E84A5F',
    vacation: '#9B51E0',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  subBeige: '#F7F3EE',
  subBeigeLight: '#FAF7F2',
  subBeigeBorder: '#E5DCD1',
  subBeigeText: '#5A4A3E',
  subBeigeMuted: '#8C7B6F',
  subBeigeBtn: '#6D5D50',
  subBeigeBadge: '#EDE5DA',
};

export const THEME_PALETTES: Record<AppThemeColor, ThemeColors> = {
  pink: {
    ...COMMON_BASE,
    primary: '#FF507C',
    primaryLight: '#FF6B8E',
    primaryMuted: '#FFAEC0',
    primaryTint: '#FFF1F4',
    onPrimaryText: '#FFFFFF',
  },
  deepGreen: {
    ...COMMON_BASE,
    primary: '#1B4332',
    primaryLight: '#2D6A4F',
    primaryMuted: '#52B788',
    primaryTint: '#E8F5EE',
    onPrimaryText: '#FFFFFF',
  },
  deepBlue: {
    ...COMMON_BASE,
    primary: '#1E3A5F',
    primaryLight: '#2E5B88',
    primaryMuted: '#6C92BF',
    primaryTint: '#EBF3FA',
    onPrimaryText: '#FFFFFF',
  },
  yellow: {
    ...COMMON_BASE,
    primary: '#D97706',
    primaryLight: '#F59E0B',
    primaryMuted: '#FCD34D',
    primaryTint: '#FEF3C7',
    onPrimaryText: '#1A1A1A', // 옐로 테마에서는 텍스트 검정색으로 가독성 확보
  },
  purple: {
    ...COMMON_BASE,
    primary: '#5B2C8E',
    primaryLight: '#7A3EB5',
    primaryMuted: '#B794DE',
    primaryTint: '#F3E8FF',
    onPrimaryText: '#FFFFFF',
  },
};

// 기본 호환용 COLORS 객체 (핑크 테마 기본)
export const COLORS: ThemeColors = THEME_PALETTES.pink;

// 테마 조회 헬퍼 함수
export function getAppTheme(color: AppThemeColor = 'pink'): ThemeColors {
  return THEME_PALETTES[color] || THEME_PALETTES.pink;
}

export { useAppTheme } from '../hooks/useAppTheme';

// 테마 비의존적 뉴트럴(슬레이트) 스케일 — 다크 푸터, 보조 텍스트 등에 사용
export const NEUTRAL = {
  gray50: '#F9FAFB',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  gray950: '#090D16',
} as const;

// 상태/배지용 보조 틴트 컬러 (테마 비의존적)
export const TINT_COLORS = {
  pinkTint: '#FFF1F4',
  pinkTintBorder: '#FFE4E6',
  pinkTintSoft: '#FFF0F3',
  redTint: '#FEF2F2',
  redTintBorder: '#FECACA',
  blueTint: '#EFF6FF',
  blueTintBorder: '#BFDBFE',
  orangeTint: '#FFF7ED',
  orangeAccent: '#F97316',
  greenTint: '#F0FDF4',
  greenTintBorder: '#86EFAC',
  greenTintStrong: '#DCFCE7',
  greenTextDark: '#14532D',
  greenTextMid: '#166534',
  greenIcon: '#16A34A',
} as const;


export const TYPOGRAPHY = {
  // [대주제] 메인 헤딩, 히어로 수치/코드, 화면 최상단 타이틀
  display: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 36,
  },
  h1: {
    fontSize: 24,
    fontWeight: '800' as const,
    lineHeight: 32,
  },
  // [소주제] 섹션 제목, 주요 카드 타이틀, 모달 소제목
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  // [내용] 본문, 주요 설명문, 아티클/채팅 본문 (가독성 상향: 15~16px)
  body1: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  // [보조내용] 라벨, 뱃지, 부가 정보 (가독성 상향: 13~14px)
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  micro: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
};

