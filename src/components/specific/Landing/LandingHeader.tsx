import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface LandingHeaderProps {
  onScrollToSection?: (sectionId: string) => void;
  onDownloadPress: (store: 'ios' | 'android') => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onScrollToSection,
  onDownloadPress,
}) => {
  const handleNavClick = (sectionId: string) => {
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.innerHeader}>
        {/* Brand Group */}
        <TouchableOpacity
          style={styles.brandGroup}
          onPress={() => handleNavClick('hero')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>우간다</Text>
            <Text style={styles.brandSubtitle}>Weganda</Text>
          </View>
        </TouchableOpacity>

        {/* Navigation Menu (User-focused) */}
        <View style={styles.navMenu}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavClick('screens')}
            activeOpacity={0.7}
          >
            <Text style={styles.navItemText}>화면 미리보기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavClick('spotlight')}
            activeOpacity={0.7}
          >
            <Text style={styles.navItemText}>주요 기능</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavClick('how-it-works')}
            activeOpacity={0.7}
          >
            <Text style={styles.navItemText}>이용 방법</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavClick('testimonials')}
            activeOpacity={0.7}
          >
            <Text style={styles.navItemText}>간호사 후기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavClick('pricing')}
            activeOpacity={0.7}
          >
            <Text style={styles.navItemText}>요금제</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaGroup}>
          <TouchableOpacity
            style={styles.headerDownloadBtn}
            onPress={() => onDownloadPress('ios')}
            activeOpacity={0.85}
          >
            <Text style={styles.headerDownloadBtnText}>무료 다운로드</Text>
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  innerHeader: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandTextGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary, // Viva Coral Pink
    letterSpacing: -0.2,
  },
  navMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    // Web only responsive check
  },
  navItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    transitionDuration: '150ms',
  } as any,
  ctaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerDownloadBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  headerDownloadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

