import { useUserStore } from '../store/useUserStore';
import { THEME_PALETTES, ThemeColors } from '../constants/theme';

/**
 * 앱 전역 활성 테마 색상 및 스타일 훅
 * useUserStore의 appThemeColor 상태에 따라 실시간으로 primary, onPrimaryText, primaryTint 등이 변경됩니다.
 */
export function useAppTheme(): ThemeColors {
  const appThemeColor = useUserStore((state) => state.appThemeColor);
  return THEME_PALETTES[appThemeColor] || THEME_PALETTES.pink;
}

export default useAppTheme;
