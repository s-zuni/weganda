import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';

interface SplashScreenViewProps {
  onAnimationEnd?: () => void;
}

export const SplashScreenView: React.FC<SplashScreenViewProps> = ({ onAnimationEnd }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Center Brand Identity Container */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.brandRow,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* App Icon Container (96px squircle with coral soft glow shadow) */}
          <View style={styles.iconShadowWrapper}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.appIcon}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Typography Group */}
          <View style={styles.textGroup}>
            <Text style={styles.brandTitle}>우간다</Text>
            <Text style={styles.brandSubtitle}>대한민국 1등 간호사 플랫폼</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreenView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconShadowWrapper: {
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 12,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  textGroup: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FF507C',
    letterSpacing: -1.2,
    lineHeight: 42,
    fontFamily: Platform.OS === 'ios' ? 'Apple SD Gothic Neo' : 'sans-serif',
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF507C',
    letterSpacing: -0.5,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Apple SD Gothic Neo' : 'sans-serif',
  },
});
