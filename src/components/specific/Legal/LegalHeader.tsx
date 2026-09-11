import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

interface LegalHeaderProps {
  onNavigateHome: () => void;
  title: string;
}

export const LegalHeader: React.FC<LegalHeaderProps> = ({ onNavigateHome, title }) => {
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
          <Text style={styles.homeButtonText}>홈으로 이동 ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'sticky' as any,
    top: 0,
    zIndex: 50,
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
    color: '#0F172A',
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  pageTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary || '#FF507C',
    marginTop: 1,
  },
  homeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  homeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});

