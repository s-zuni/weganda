import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 표준 키보드 버티컬 오프셋 계산 커스텀 훅
 * iOS 기기의 Safe Area Inset(노치/다이내믹 아일랜드) 및 플랫폼별 헤더 높이를 감안하여
 * KeyboardAvoidingView의 keyboardVerticalOffset을 최적화합니다.
 */
export function useKeyboardOffset(extraOffset: number = 0): number {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'ios') {
    // iOS: 상단 인셋과 모달 헤더 기본 보정값 고려
    return insets.top + extraOffset;
  }

  // Android: windowSoftInputMode가 기본 resize로 동작하므로 0 또는 최소 오프셋
  return extraOffset;
}

