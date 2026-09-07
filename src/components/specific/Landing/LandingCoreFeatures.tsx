import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const LandingCoreFeatures: React.FC = () => {
  const features = [
    {
      icon: '📅',
      title: '스마트 듀티 캘린더',
      desc: 'D/E/N/O 전용 컬러와 직관적인 Bento 카드로 오늘과 내일의 스케줄을 명확하게 파악합니다.',
    },
    {
      icon: '👯‍♀️',
      title: '동기 듀티 실시간 공유',
      desc: '동기들의 근무표를 한 번에 비교하고, 함께 쉬는 오프 날짜를 자동으로 탐색해 약속을 잡습니다.',
    },
    {
      icon: '⚡',
      title: '간호 지식 Ask AI 어시스턴트',
      desc: '도파민, 헤파린 등 복잡한 점적 약물 계산부터 ACLS 알고리즘까지 자연어로 1초 만에 확인합니다.',
    },
    {
      icon: '💬',
      title: '100% 익명 보장 커뮤니티',
      desc: '병원 내 누구에게도 말하지 못한 고충, 나이트 근무 꿀팁, 이직/커리어 정보를 안전하게 나눕니다.',
    },
    {
      icon: '🔮',
      title: '오행 사주 듀티 운세',
      desc: '오늘의 행운 지수와 맞춤 테라피 메시지로 3교대 근무에 지친 마음을 따뜻하게 충전해 드립니다.',
    },
    {
      icon: '💰',
      title: '야간수당 & 월급 예측기',
      desc: '이번 달 나의 D/E/N 근무 횟수와 통상임금을 기반으로 예상 야간근로수당과 실지급액을 정밀 분석합니다.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>올인원 간호 솔루션</Text>
          </View>
          <Text style={styles.title}>간호사에게 필요한 모든 것, 우간다 하나로</Text>
          <Text style={styles.subtitle}>
            3교대 근무표 관리부터 임상 보조, 동기 연결, 힐링까지 완벽하게 지원합니다.
          </Text>
        </View>

        <View style={styles.grid}>
          {features.map((feat, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{feat.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{feat.title}</Text>
              <Text style={styles.cardDesc}>{feat.desc}</Text>
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
    backgroundColor: '#FFFFFF',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  card: {
    width: Platform.OS === 'web' ? '31%' : '100%',
    minWidth: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconText: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
  },
});

