import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  LandingHeader,
  LandingHero,
  LandingScreenShowcase,
  LandingFeatureSpotlights,
  LandingHowItWorks,
  LandingCoreFeatures,
  LandingTestimonials,
  LandingPricing,
  LandingDownloadCta,
  LandingFooter,
} from '../../components/specific/Landing';

interface LandingScreenProps {
  onNavigateAdmin?: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = () => {
  const handleDownloadPress = (store: 'ios' | 'android') => {
    const storeName = store === 'ios' ? 'Apple App Store' : 'Google Play 스토어';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(
        `우간다(Weganda) ${storeName} 앱 출시 심사 진행 중입니다!\n\n현재 웹 브라우저에서 모바일 앱 핵심 기능들을 모두 미리 확인하실 수 있습니다.`
      );
    } else {
      alert(`우간다(Weganda) ${storeName} 앱 출시 준비 중입니다.`);
    }
  };

  const handleSelectPlan = (plan: 'free' | 'plus') => {
    if (plan === 'free') {
      handleDownloadPress('ios');
    } else {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(
          'weganda+ 프리미엄 멤버십 7일 무료 체험 이벤트가 앱 출시와 함께 시작됩니다!\n지금 무료 다운로드 알림을 신청해보세요.'
        );
      }
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = document.getElementById(sectionId);
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
      {/* 1. Global Navigation Bar (User-Focused, Official Logo, No Admin Link) */}
      <LandingHeader
        onScrollToSection={handleScrollToSection}
        onDownloadPress={handleDownloadPress}
      />

      {/* 2. Hero Section with Trust Metrics */}
      <LandingHero
        onDownloadPress={handleDownloadPress}
        onExploreScreens={() => handleScrollToSection('screens')}
      />

      {/* 3. Interactive Figma Screen Showcase (Home / 학습 / 커뮤니티 / 운세 / 친구) */}
      <LandingScreenShowcase />

      {/* 4. Feature Spotlights (Duty Calendar & AI Clinical Assistant) */}
      <LandingFeatureSpotlights />

      {/* 5. How It Works (3 Steps to Start) */}
      <LandingHowItWorks />

      {/* 6. Core 6-Grid Features */}
      <LandingCoreFeatures />

      {/* 7. Nurse Testimonials & Ratings */}
      <LandingTestimonials />

      {/* 8. Pricing Section (Free vs Plus) */}
      <LandingPricing onSelectPlan={handleSelectPlan} />

      {/* 9. Bottom Download Conversion Banner */}
      <LandingDownloadCta onDownloadPress={handleDownloadPress} />

      {/* 10. Professional Legal & Brand Footer */}
      <LandingFooter />
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
