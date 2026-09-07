import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface LandingHeroProps {
  onDownloadPress: (store: 'ios' | 'android') => void;
  onExploreScreens: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onDownloadPress,
  onExploreScreens,
}) => {
  return (
    <View style={styles.heroContainer} nativeID="hero">
      <View style={styles.innerHero}>
        {/* Eyebrow Pill */}
        <View style={styles.eyebrowBadge}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.eyebrowIcon}
          />
          <Text style={styles.eyebrowText}>
            대한민국 50만 3교대 간호사를 위한 No.1 라이프스타일 앱
          </Text>
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitle}>
          교대근무의 모든 피로,{'\n'}
          <Text style={styles.coralHighlight}>우간다 하나로</Text> 가벼워집니다
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          한 번의 터치로 완성되는 스마트 듀티 캘린더, 동기들과의 실시간 근무 대조,{'\n'}
          임상 현장에서 1초 만에 확인하는 AI 약물 계산기, 지친 마음을 달래는 듀티 운세까지.
        </Text>

        {/* Download & Explore Buttons */}
        <View style={styles.ctaButtonGroup}>
          <TouchableOpacity
            style={styles.storeBtnPrimary}
            onPress={() => onDownloadPress('ios')}
            activeOpacity={0.88}
          >
            <Text style={styles.storeIcon}></Text>
            <View style={styles.storeBtnTextGroup}>
              <Text style={styles.storeSubText}>App Store에서</Text>
              <Text style={styles.storeMainText}>iOS 다운로드</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.storeBtnSecondary}
            onPress={() => onDownloadPress('android')}
            activeOpacity={0.88}
          >
            <Text style={styles.storeIconPlay}>▶</Text>
            <View style={styles.storeBtnTextGroup}>
              <Text style={styles.storeSubText}>Google Play에서</Text>
              <Text style={styles.storeMainText}>Android 다운로드</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={onExploreScreens}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>앱 화면 둘러보기 ↓</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Badges Bar */}
        <View style={styles.trustBar}>
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>4.9 ★★★★★</Text>
            <Text style={styles.trustLabel}>현직 간호사 평점</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>120만 건+</Text>
            <Text style={styles.trustLabel}>누적 듀티 등록</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>94.2%</Text>
            <Text style={styles.trustLabel}>동기 모임 매칭 성공률</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>100%</Text>
            <Text style={styles.trustLabel}>철저한 익명 보장 커뮤니티</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: '100%',
    paddingVertical: 64,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  innerHero: {
    maxWidth: 960,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center' as any,
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  eyebrowIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  eyebrowText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.2,
  },
  mainTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 34,
    lineHeight: Platform.OS === 'web' ? 60 : 44,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1.2,
  },
  coralHighlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    lineHeight: Platform.OS === 'web' ? 28 : 24,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 720,
    marginBottom: 36,
    letterSpacing: -0.3,
  },
  ctaButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 48,
  },
  storeBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  storeBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  storeIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  storeIconPlay: {
    fontSize: 18,
    color: '#38BDF8',
    fontWeight: '800',
  },
  storeBtnTextGroup: {
    alignItems: 'flex-start',
  },
  storeSubText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  storeMainText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  exploreBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 16,
  },
  exploreBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  trustBar: {
    width: '100%',
    maxWidth: 840,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
  },
  trustItem: {
    alignItems: 'center',
    minWidth: 140,
  },
  trustValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  trustLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  trustDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
});

