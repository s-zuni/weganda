import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: '근무표 30초 간편 등록',
      desc: '터치 몇 번으로 이번 달 Day, Evening, Night, Off를 빠르게 등록하고 월간 캘린더를 완성하세요.',
      icon: '📲',
    },
    {
      num: '02',
      title: '동기 연결 & 오프 자동 매칭',
      desc: '동기들을 친구로 추가하면 겹치는 오프를 자동으로 계산해주어 약속 잡기가 훨씬 수월해집니다.',
      icon: '👯‍♀️',
    },
    {
      num: '03',
      title: '임상 AI & 힐링 라이프',
      desc: '급할 땐 AI 약물 계산기를 활용하고, 지친 퇴근길에는 따뜻한 듀티 운세와 익명 커뮤니티로 위로받으세요.',
      icon: '✨',
    },
  ];

  return (
    <View style={styles.container} nativeID="how-it-works">
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>간편한 3단계 시작</Text>
          </View>
          <Text style={styles.title}>우간다와 함께하는 스마트한 하루</Text>
          <Text style={styles.subtitle}>
            복잡한 설정 없이 누구나 지금 바로 시작할 수 있습니다.
          </Text>
        </View>

        <View style={styles.stepsGrid}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{step.num}</Text>
              </View>
              <Text style={styles.stepIcon}>{step.icon}</Text>
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
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
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
  badge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  stepsGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
    justifyContent: 'center',
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    position: 'relative',
  },
  stepNumberBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  stepIcon: {
    fontSize: 36,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
  },
});

