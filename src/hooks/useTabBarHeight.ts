import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 중앙 FAB(홈 버튼)이 탭바 상단 경계 위로 돌출하는 높이.
 * BottomTabNavigator의 fabContainer.top 값과 반드시 동일해야 한다.
 */
export const CENTER_FAB_LIFT = 18;

export interface TabBarMetrics {
  /** 탭바의 실제 렌더링 높이 (기기별 safe area 하단 여백 포함) */
  barHeight: number;
  /** 탭바 내부에 적용되는 하단 padding (safe area 하단 여백) */
  safeBottom: number;
  /**
   * 탭바 위로 돌출된 중앙 FAB까지 완전히 가리지 않기 위해 필요한 하단 여백.
   * 마이페이지 모달처럼 탭바 위에 임베디드 오버레이를 그릴 때 이 값을 bottomOffset으로 사용해야
   * FAB 상단이 오버레이에 잘리지 않는다.
   */
  fabClearance: number;
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
  const fabClearance = barHeight + CENTER_FAB_LIFT + 8;
  return { barHeight, safeBottom, fabClearance };
}

/** 탭바의 실제 렌더링 높이만 필요할 때 사용하는 축약 훅. */
export function useTabBarHeight(): number {
  return useTabBarMetrics().barHeight;
}

export default useTabBarHeight;
