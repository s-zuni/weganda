import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { WegandaLogo } from './WegandaLogo';
import { COLORS } from '../../constants/theme';

interface SplashScreenViewProps {
  onAnimationEnd?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 고화질 무손실 벡터 기반 인앱 스플래시 화면
 * - SafeAreaView 패딩 편향을 제거하여 기하학적 정중앙(Absolute Geometric Center) 배치
 * - 비트맵 압축 깨짐 없이 100% 선명한 SVG WegandaLogo & 브랜드 타이포그래피 렌더링
 */
export const SplashScreenView: React.FC<SplashScreenViewProps> = ({ onAnimationEnd }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    });
  }, [fadeAnim, scaleAnim, onAnimationEnd]);

  return (
    <View style={styles.container}>
      {/* 기하학적 정중앙 컨텐츠 래퍼 */}
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* 무손실 벡터 SVG 로고 */}
        <View style={styles.logoShadowWrapper}>
          <WegandaLogo size={92} variant="full" />
        </View>

        {/* 브랜드 명칭 & 슬로건 */}
        <Text style={styles.brandTitle}>weganda</Text>
        <Text style={styles.brandSlogan}>간호사의 든든한 하루를 엽니다</Text>
      </Animated.View>

      {/* 하단 카피라이트 */}
      <View style={styles.bottomFooter}>
        <Text style={styles.footerText}>Smart Clinical Shift Companion</Text>
      </View>
    </View>
  );
};

export default SplashScreenView;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadowWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSlogan: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
});
