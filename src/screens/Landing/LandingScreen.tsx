import React from 'react';
import { StyleSheet, ScrollView, Platform } from 'react-native';
import {
  LandingHeader,
  LandingHero,
  LandingFeatureSpotlights,
  LandingHowItWorks,
  LandingCoreFeatures,
  LandingDownloadCta,
  LandingFooter,
} from '../../components/specific/Landing';
import { LegalTabKey } from '../../constants/legal/types';

interface LandingScreenProps {
  onNavigateAdmin?: () => void;
  onNavigateLegal?: (tab?: LegalTabKey) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigateLegal }) => {
  const handleScrollToWaitlist = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = document.getElementById('waitlist-input') || document.getElementById('waitlist-bottom');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScrollToFeatures = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = document.getElementById('features');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Global Navigation Bar (Official Logo & Pre-order CTA) */}
      <LandingHeader
        onScrollToWaitlist={handleScrollToWaitlist}
        onScrollToFeatures={handleScrollToFeatures}
      />

      {/* 2. Hero Section: Clean Copy + Early Access Email Input + Benefit Notice */}
      <LandingHero />

      {/* 3. Real Clinical & Duty Features Spotlight (동기 공유 / 캘린더 / AI 계산기) */}
      <LandingFeatureSpotlights />

      {/* 4. How It Works (3 Steps to Pre-register) */}
      <LandingHowItWorks />

      {/* 5. Dark Navy Problem-Solving Section (간호사의 고충을 해결하는 6가지) */}
      <LandingCoreFeatures />

      {/* 6. Bottom Waitlist Email Conversion Box */}
      <LandingDownloadCta />

      {/* 7. Understated Legal & Brand Footer */}
      <LandingFooter onNavigateLegal={onNavigateLegal} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    alignItems: 'center',
  },
});
