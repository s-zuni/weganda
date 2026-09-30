import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS, NEUTRAL } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

interface LegalHeaderProps {
  onNavigateHome: () => void;
  title: string;
  homeLabel?: string;
}

export const LegalHeader: React.FC<LegalHeaderProps> = ({ onNavigateHome, title, homeLabel = '홈으로 이동 ›' }) => {
  const { isMobile } = useResponsive();

  return (
    <View style={styles.container}>
      <View style={[styles.inner, isMobile && styles.innerMobile]}>
        {/* Left: Brand Logo & Title */}
        <TouchableOpacity
          onPress={onNavigateHome}
          style={styles.brandContainer}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>
              우간다 <Text style={styles.brandSub}>Weganda</Text>
            </Text>
            <Text style={styles.pageTitle}>{title}</Text>
          </View>
        </TouchableOpacity>

        {/* Right: Home button */}
        <TouchableOpacity
          onPress={onNavigateHome}
          style={styles.homeButton}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>{homeLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.gray100,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    // sticky 배치는 웹에서만 유효 (네이티브 인앱 모달에서는 일반 배치)
    ...(Platform.OS === 'web' ? ({ position: 'sticky', top: 0, zIndex: 50 } as object) : {}),
  },
  inner: {
    maxWidth: 960,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  innerMobile: {
    paddingHorizontal: 0,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NEUTRAL.gray900,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '500',
    color: NEUTRAL.gray500,
  },
  pageTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 1,
  },
  homeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: NEUTRAL.gray200,
  },
  homeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: NEUTRAL.gray700,
  },
});

