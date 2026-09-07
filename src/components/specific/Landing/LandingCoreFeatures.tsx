import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingCoreFeatures: React.FC = () => {
  const { isMobile } = useResponsive();

  const problems = [
    {
      icon: '📅',
      title: '근무표 수기 작성의 번거로움',
      desc: '달력에 일일이 적던 복잡한 3교대 표를 터치 한 번으로 정리하고 위클리 스트립으로 즉시 확인합니다.',
    },
    {
      icon: '👯‍♀️',
      title: '동기 모임 날짜 조율의 어려움',
      desc: '단톡방에서 근무표 사진을 비교할 필요 없이, 동기들과 겹치는 오프(Off)를 자동으로 탐색합니다.',
    },
    {
      icon: '💊',
      title: '점적 약물 계산 실수에 대한 부담',
      desc: 'Dopamine, Heparin 등 긴박한 투약 상황에서 환자 체중 기준 mL/hr와 gtt/min을 1초 만에 환산합니다.',
    },
    {
      icon: '💬',
      title: '누구에게도 말 못 한 병동 고충',
      desc: '철저한 익명이 보장되는 간호사 전용 소통 공간에서 태움 고민, 나이트 생존 꿀팁을 안전하게 나눕니다.',
    },
    {
      icon: '🔮',
      title: '불규칙한 교대로 인한 멘탈 피로',
      desc: '오행 사주 명리학에 기반한 따뜻한 듀티 운세와 행운 지수로 지친 출퇴근길 마음에 활력을 채웁니다.',
    },
    {
      icon: '💰',
      title: '내가 일한 만큼의 야간수당 계산',
      desc: '이번 달 나의 D/E/N 근무 횟수에 따른 예상 야간근로수당과 월급 실수령액을 투명하게 계산해 드립니다.',
    },
  ];

  return (
    <View style={[styles.darkSection, isMobile && styles.darkSectionMobile]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
            간호사의 실제 고충을 해결하기 위해{'\n'}
            우간다를 만들고 있습니다
          </Text>
          <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile]}>
            현직 간호사들의 목소리를 직접 듣고 연구하여, 실무와 일상에 꼭 필요한 핵심 기능들만 담았습니다.
          </Text>
        </View>

        <View style={styles.grid}>
          {problems.map((item, idx) => (
            <View key={idx} style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkSection: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 96,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  darkSectionMobile: {
    paddingVertical: 56,
    paddingHorizontal: 16,
  },
  inner: {
    maxWidth: 1140,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    textAlign: 'center' as any,
  },
  sectionHeadline: {
    fontSize: 34,
    lineHeight: 46,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  sectionHeadlineMobile: {
    fontSize: 24,
    lineHeight: 34,
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 16,
    lineHeight: 24,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 640,
  },
  sectionSubMobile: {
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    width: '31%',
    minWidth: 280,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardMobile: {
    width: '100%',
    minWidth: 0,
    padding: 20,
    borderRadius: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#94A3B8',
  },
});
