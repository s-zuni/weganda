import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabBarMetrics {
  /** 탭바의 실제 렌더링 높이 (기기별 safe area 하단 여백 포함) */
  barHeight: number;
  /** 탭바 내부에 적용되는 하단 padding (safe area 하단 여백) */
  safeBottom: number;
}

/**
 * 하단 탭바의 실제 렌더링 높이를 계산하는 단일 원천 훅.
 * BottomTabNavigator의 tabBarStyle 계산과 반드시 동일한 공식을 사용해야 하며,
 * 탭 화면들의 ScrollView 하단 여백(paddingBottom)도 이 값을 기준으로 삼아야
 * 기기별 safe area 차이로 인한 콘텐츠 잘림을 방지할 수 있다.
 */
export function useTabBarMetrics(): TabBarMetrics {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 26 : 12);
  const barHeight = (Platform.OS === 'ios' ? 56 : 60) + safeBottom;
  return { barHeight, safeBottom };
}

/** 탭바의 실제 렌더링 높이만 필요할 때 사용하는 축약 훅. */
export function useTabBarHeight(): number {
  return useTabBarMetrics().barHeight;
}

export default useTabBarHeight;
