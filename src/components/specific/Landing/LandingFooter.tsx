import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const LandingFooter: React.FC = () => {
  const handleLinkClick = (name: string) => {
    alert(`${name} 페이지는 현재 준비 중입니다. 문의사항은 contact@weganda.kr로 보내주세요.`);
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.innerFooter}>
        {/* Top Section */}
        <View style={styles.topRow}>
          {/* Brand Info */}
          <View style={styles.brandCol}>
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
          <View style={styles.linksGrid}>
            <View style={styles.linksCol}>
              <Text style={styles.linksHeader}>서비스</Text>
              <TouchableOpacity onPress={() => handleLinkClick('스마트 듀티 캘린더')}>
                <Text style={styles.linkText}>스마트 듀티 캘린더</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('동기 듀티 공유')}>
                <Text style={styles.linkText}>동기 듀티 공유</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('간호 지식 AI')}>
                <Text style={styles.linkText}>간호 지식 Ask AI</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('듀티 사주 운세')}>
                <Text style={styles.linkText}>듀티 사주 운세</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linksCol}>
              <Text style={styles.linksHeader}>고객 지원</Text>
              <TouchableOpacity onPress={() => handleLinkClick('자주 묻는 질문(FAQ)')}>
                <Text style={styles.linkText}>자주 묻는 질문 (FAQ)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('공지사항')}>
                <Text style={styles.linkText}>공지사항</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('1:1 제휴/문의')}>
                <Text style={styles.linkText}>1:1 문의 / 제휴</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('병원 단체 도입')}>
                <Text style={styles.linkText}>병원 단체 도입 문의</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linksCol}>
              <Text style={styles.linksHeader}>약관 및 정책</Text>
              <TouchableOpacity onPress={() => handleLinkClick('서비스 이용약관')}>
                <Text style={styles.linkText}>서비스 이용약관</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('개인정보처리방침')}>
                <Text style={[styles.linkText, styles.linkBold]}>개인정보처리방침</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('위치정보 이용약관')}>
                <Text style={styles.linkText}>위치기반서비스 이용약관</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLinkClick('커뮤니티 운영원칙')}>
                <Text style={styles.linkText}>커뮤니티 운영원칙</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Legal & Copyright */}
        <View style={styles.bottomRow}>
          <Text style={styles.legalInfo}>
            우간다 (Weganda) | 대표자: 이승준 | 문의 이메일: contact@weganda.kr{'\n'}
            주소: 서울특별시 강남구 테헤란로 (출시 준비 중) | 통신판매업 신고: 심사 대기 중
          </Text>
          <Text style={styles.copyrightText}>
            © 2026 Weganda Inc. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: '#090D16',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  innerFooter: {
    maxWidth: 1140,
    width: '100%',
  },
  topRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 48,
    marginBottom: 48,
  },
  brandCol: {
    maxWidth: 360,
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
    color: '#FFFFFF',
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brandDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#94A3B8',
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 44,
  },
  linksCol: {
    minWidth: 120,
    gap: 12,
  },
  linksHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  linkBold: {
    fontWeight: '700',
    color: '#E2E8F0',
  },
  bottomRow: {
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 16,
  },
  legalInfo: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },
  copyrightText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});

