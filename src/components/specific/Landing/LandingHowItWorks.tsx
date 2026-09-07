import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingHowItWorks: React.FC = () => {
  const { isMobile } = useResponsive();

  const steps = [
    {
      num: '1',
      color: '#EF4444',
      title: '사전예약 신청',
      desc: '이메일 주소만 입력하면 사전예약이 완료되며, 출시 시 안내 메일을 발송해 드립니다.',
    },
    {
      num: '2',
      color: '#10B981',
      title: '2개월 무료 혜택 지급',
      desc: '사전예약자 전원에게 weganda+ 프리미엄 멤버십 2개월 무료 이용 혜택을 제공합니다.',
    },
    {
      num: '3',
      color: '#6366F1',
      title: '스마트 듀티 시작',
      desc: '복잡했던 근무표 정리와 동기 오프 맞추기, 임상 약물 계산까지 한 번에 해결하세요.',
    },
  ];

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.title, isMobile && styles.titleMobile]}>사전예약 진행 방법</Text>
          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            간단한 이메일 입력만으로 모든 혜택을 예약할 수 있습니다.
          </Text>
        </View>

        <View style={[styles.stepsRow, isMobile && styles.stepsRowMobile]}>
          {steps.map((step, idx) => (
            <View key={idx} style={[styles.stepCol, isMobile && styles.stepColMobile]}>
              <View style={[styles.circleBadge, { backgroundColor: step.color }]}>
                <Text style={styles.circleNumber}>{step.num}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  containerMobile: {
    paddingVertical: 52,
    paddingHorizontal: 16,
  },
  inner: {
    maxWidth: 960,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 56,
    textAlign: 'center' as any,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  titleMobile: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  subtitleMobile: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 32,
  },
  stepsRowMobile: {
    flexDirection: 'column',
    gap: 28,
  },
  stepCol: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center' as any,
    maxWidth: 280,
  },
  stepColMobile: {
    maxWidth: '100%',
    width: '100%',
  },
  circleBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  circleNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
});
