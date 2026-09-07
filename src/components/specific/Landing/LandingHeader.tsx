import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

interface LandingHeaderProps {
  onScrollToWaitlist: () => void;
  onScrollToFeatures: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onScrollToWaitlist,
  onScrollToFeatures,
}) => {
  const { isMobile } = useResponsive();

  return (
    <View style={styles.headerContainer}>
      <View style={[styles.innerHeader, isMobile && styles.innerHeaderMobile]}>
        {/* Brand Logo & Name */}
        <View style={styles.brandGroup}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>우간다</Text>
            <Text style={styles.brandSubtitle}>Weganda</Text>
          </View>
        </View>

        {/* Navigation Menu (Hidden on Mobile for clean UX) */}
        {!isMobile && (
          <View style={styles.navMenu}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={onScrollToFeatures}
              activeOpacity={0.7}
            >
              <Text style={styles.navItemText}>주요 기능</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={onScrollToWaitlist}
              activeOpacity={0.7}
            >
              <Text style={styles.navItemText}>사전예약 혜택</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA Button */}
        <View style={styles.ctaGroup}>
          <TouchableOpacity
            style={[styles.ctaBtn, isMobile && styles.ctaBtnMobile]}
            onPress={onScrollToWaitlist}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaBtnText, isMobile && styles.ctaBtnTextMobile]}>
              사전예약 신청
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: Platform.OS === 'web' ? ('sticky' as any) : 'relative',
    top: 0,
    zIndex: 100,
  },
  innerHeader: {
    maxWidth: 1160,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerHeaderMobile: {
    paddingHorizontal: 16,
    height: 64,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  brandTextGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.2,
  },
  navMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  navItem: {
    paddingVertical: 8,
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  ctaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ctaBtnMobile: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaBtnTextMobile: {
    fontSize: 13,
    fontWeight: '700',
  },
});
