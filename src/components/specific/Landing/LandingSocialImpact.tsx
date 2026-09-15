import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingSocialImpact: React.FC = () => {
  const { isMobile } = useResponsive();

  const impactCards = [
    {
      icon: '🩺',
      tag: '의료 및 돌봄 지원',
      title: '간호가 필요한 소아 환아 지원',
      desc: '병동에서 마주하는 아픈 아이들이 웃음을 되찾고 건강하게 자라날 수 있도록, 경제적 돌봄이 절실한 소아 환아의 의료비 및 치료 물품을 후원합니다.',
    },
    {
      icon: '🎓',
      tag: '미래 인재 장학금',
      title: '간호사를 꿈꾸는 예비 간호인 육성',
      desc: '고된 병원 실습과 학업을 병행하며 생명을 살리는 나이팅게일을 꿈꾸는 간호대학생 후배들에게 든든한 디딤돌이 될 장학금을 지원합니다.',
    },
  ];

  return (
    <View style={[styles.sectionContainer, isMobile && styles.sectionContainerMobile]}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>💖 사회공헌 & 10% 기부 약속</Text>
          </View>
          <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>
            간호사의 따뜻한 손길이,{'\n'}
            <Text style={styles.highlightText}>더 넓은 세상</Text>으로 이어지도록
          </Text>
          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            우간다+ 멤버십 수익의 10%는 간호가 필요한 어린이들과{'\n'}
            간호사를 꿈꾸는 미래의 후배들을 위해 기부됩니다.
          </Text>
        </View>

        {/* 2 Grid Cards */}
        <View style={[styles.cardsRow, isMobile && styles.cardsRowMobile]}>
          {impactCards.map((card, idx) => (
            <View key={idx} style={[styles.impactCard, isMobile && styles.impactCardMobile]}>
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{card.icon}</Text>
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>{card.tag}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>
          ))}
        </View>

        {/* Transparency Pledge Notice */}
        <View style={styles.pledgeNoticeBox}>
          <Text style={styles.pledgeIcon}>🌱</Text>
          <View style={styles.pledgeTextCol}>
            <Text style={styles.pledgeTitle}>투명한 나눔 거버넌스</Text>
            <Text style={styles.pledgeDesc}>
              우간다는 회원 여러분께서 보내주신 소중한 마음이 온전히 전달될 수 있도록,{'\n'}
              기부금 전달 내역과 지원 성과를 투명하게 공개할 것을 약속드립니다.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    paddingVertical: 90,
    paddingHorizontal: 24,
    backgroundColor: '#FAFAFC',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F2F4F6',
  },
  sectionContainerMobile: {
    paddingVertical: 56,
    paddingHorizontal: 16,
  },
  inner: {
    maxWidth: 1040,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 44,
  },
  badgeRow: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD1DC',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF507C',
    letterSpacing: -0.2,
  },
  mainTitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '900',
    color: '#191F28',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.6,
  },
  mainTitleMobile: {
    fontSize: 24,
    lineHeight: 34,
    marginBottom: 10,
  },
  highlightText: {
    color: '#FF507C',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: '#4E5968',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitleMobile: {
    fontSize: 14,
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    marginBottom: 32,
  },
  cardsRowMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  impactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1.5,
    borderColor: '#F2F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  impactCardMobile: {
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  iconText: {
    fontSize: 22,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4E5968',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#191F28',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4E5968',
    letterSpacing: -0.2,
  },
  pledgeNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    gap: 16,
  },
  pledgeIcon: {
    fontSize: 26,
  },
  pledgeTextCol: {
    flex: 1,
  },
  pledgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 3,
  },
  pledgeDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    letterSpacing: -0.2,
  },
});

