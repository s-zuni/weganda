import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS, NEUTRAL } from '../../../constants/theme';
import { LegalTabKey } from '../../../constants/legal';
import { useResponsive } from '../../../utils/useResponsive';
import { BUSINESS_INFO } from '../../../types/support';

interface LandingFooterProps {
  onNavigateLegal?: (tab?: LegalTabKey) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigateLegal }) => {
  const { isMobile } = useResponsive();

  const handleLegalClick = (tab: LegalTabKey) => {
    if (onNavigateLegal) {
      onNavigateLegal(tab);
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const path = tab === 'terms' ? '/terms' : tab === 'privacy' ? '/privacy' : tab === 'membership' ? '/membership' : '/community';
      window.location.href = path;
    }
  };

  const handleSupportClick = (type: string) => {
    if (type === 'contact' || type === 'b2b') {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = `mailto:${BUSINESS_INFO.email}?subject=[우간다 문의]`;
      } else {
        alert(`문의는 ${BUSINESS_INFO.email}으로 메일을 보내주세요.`);
      }
    } else {
      alert(`${type} 안내는 서비스 공식 출시와 함께 공개됩니다.`);
    }
  };

  return (
    <View style={[styles.footerContainer, isMobile && styles.footerContainerMobile]}>
      <View style={styles.innerFooter}>
        {/* Top Section */}
        <View style={[styles.topRow, isMobile && styles.topRowMobile]}>
          {/* Brand Info */}
          <View style={[styles.brandCol, isMobile && styles.brandColMobile]}>
            <View style={styles.brandHeader}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.brandTitle}>
                우간다 <Text style={styles.brandSubtitle}>Weganda</Text>
              </Text>
            </View>
            <Text style={styles.brandDesc}>
              대한민국 50만 3교대 간호사의 건강하고 행복한 일상을 함께 만드는 올인원 라이프스타일 플랫폼입니다.
            </Text>
          </View>

          {/* Links Columns */}
          <View style={[styles.linksGrid, isMobile && styles.linksGridMobile]}>
            <View style={styles.linksCol}>
              <Text style={styles.linksHeader}>주요 기능</Text>
              <Text style={styles.linkText}>스마트 듀티 캘린더</Text>
              <Text style={styles.linkText}>동기 듀티 연동</Text>
              <Text style={styles.linkText}>간호 지식 Ask AI</Text>
              <Text style={styles.linkText}>듀티 사주 운세</Text>
            </View>

            <View style={styles.linksCol}>
              <Text style={styles.linksHeader}>고객 지원</Text>
              <TouchableOpacity onPress={() => handleSupportClick('FAQ')}>
                <Text style={styles.linkText}>자주 묻는 질문 (FAQ)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSupportClick('공지사항')}>
                <Text style={styles.linkText}>공지사항</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSupportClick('contact')}>
                <Text style={styles.linkText}>1:1 문의 / 제휴</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSupportClick('b2b')}>
                <Text style={styles.linkText}>병원 단체 도입 문의</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linksCol}>
              <Text style={styles.linksHeader}>약관 및 정책</Text>
              <TouchableOpacity onPress={() => handleLegalClick('terms')}>
                <Text style={styles.linkText}>서비스 이용약관</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLegalClick('privacy')}>
                <Text style={[styles.linkText, styles.linkBold]}>개인정보처리방침</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLegalClick('membership')}>
                <Text style={styles.linkText}>우간다+ 멤버십 이용약관</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLegalClick('community')}>
                <Text style={styles.linkText}>커뮤니티 이용약관</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Legal & Copyright */}
        <View style={styles.bottomRow}>
          <Text style={styles.legalInfo}>
            상호명: {BUSINESS_INFO.companyName} | 대표자: {BUSINESS_INFO.representative} | 사업자등록번호: {BUSINESS_INFO.businessNumber}{'\n'}
            고객센터: {BUSINESS_INFO.tel} | 공식 문의: {BUSINESS_INFO.email}{'\n'}
            통신판매업 신고: 심사 대기 중
          </Text>
          <Text style={styles.copyrightText}>
            © 2026 {BUSINESS_INFO.companyName}. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: NEUTRAL.gray950,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL.gray800,
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerContainerMobile: {
    paddingVertical: 44,
    paddingHorizontal: 16,
  },
  innerFooter: {
    maxWidth: 1140,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 48,
    marginBottom: 48,
  },
  topRowMobile: {
    flexDirection: 'column',
    gap: 32,
    marginBottom: 32,
  },
  brandCol: {
    maxWidth: 360,
  },
  brandColMobile: {
    maxWidth: '100%',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.background,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brandDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: NEUTRAL.gray400,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 44,
  },
  linksGridMobile: {
    gap: 24,
  },
  linksCol: {
    minWidth: 100,
    gap: 10,
  },
  linksHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.background,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 13,
    color: NEUTRAL.gray400,
  },
  linkBold: {
    fontWeight: '700',
    color: NEUTRAL.gray200,
  },
  bottomRow: {
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL.gray800,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 16,
  },
  legalInfo: {
    fontSize: 12,
    lineHeight: 18,
    color: NEUTRAL.gray500,
  },
  copyrightText: {
    fontSize: 12,
    color: NEUTRAL.gray600,
    fontWeight: '600',
  },
});
