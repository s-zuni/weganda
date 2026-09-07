import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface LandingDownloadCtaProps {
  onDownloadPress: (store: 'ios' | 'android') => void;
}

export const LandingDownloadCta: React.FC<LandingDownloadCtaProps> = ({ onDownloadPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          지금 바로 우간다와 함께{'\n'}
          교대근무의 피로를 덜어내세요
        </Text>

        <Text style={styles.subtitle}>
          대한민국 50만 간호사가 선택한 3교대 라이프스타일 앱.{'\n'}
          복잡한 근무표 정리부터 동기 모임 약속까지 오늘부터 한 번에 시작하세요.
        </Text>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnApple}
            onPress={() => onDownloadPress('ios')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIcon}></Text>
            <View style={styles.btnTextCol}>
              <Text style={styles.btnSub}>App Store에서</Text>
              <Text style={styles.btnMain}>iOS 다운로드</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnGoogle}
            onPress={() => onDownloadPress('android')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIconPlay}>▶</Text>
            <View style={styles.btnTextCol}>
              <Text style={styles.btnSub}>Google Play에서</Text>
              <Text style={styles.btnMain}>Android 다운로드</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          iOS 15.0 이상 / Android 10.0 이상 지원 • 개인정보 암호화 및 무단 공유 방지
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 88,
    paddingHorizontal: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  inner: {
    maxWidth: 800,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center' as any,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 28,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 38 : 28,
    lineHeight: Platform.OS === 'web' ? 50 : 38,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 18,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: '#94A3B8',
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 600,
  },
  btnGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
  },
  btnApple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnIcon: {
    fontSize: 26,
    color: '#0F172A',
    fontWeight: '800',
  },
  btnIconPlay: {
    fontSize: 18,
    color: '#38BDF8',
    fontWeight: '800',
  },
  btnTextCol: {
    alignItems: 'flex-start',
  },
  btnSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  btnMain: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  disclaimer: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

