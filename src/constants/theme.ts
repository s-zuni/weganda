export const COLORS = {
  primary: '#FF507C',
  primaryLight: '#FF6B8E',
  primaryMuted: '#FFAEC0',
  primaryTint: '#FFE8EE',
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
  // Sub Color Palette (웜 베이지톤)
  subBeige: '#F7F3EE',
  subBeigeLight: '#FAF7F2',
  subBeigeBorder: '#E5DCD1',
  subBeigeText: '#5A4A3E',
  subBeigeMuted: '#8C7B6F',
  subBeigeBtn: '#6D5D50',
  subBeigeBadge: '#EDE5DA',
};

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

