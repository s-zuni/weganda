import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const LandingTestimonials: React.FC = () => {
  const reviews = [
    {
      name: '김지혜 간호사',
      hospital: '대학병원 중환자실(ICU) 3년차',
      stars: '★★★★★',
      quote: '“동기들이랑 오프 겹치는 날 잡기가 세상에서 제일 쉬워졌어요.”',
      content:
        '예전엔 단톡방에 근무표 사진 5장씩 올려놓고 일일이 날짜 비교하느라 힘들었는데, 우간다에서는 친구 듀티가 한눈에 보이고 겹치는 날을 자동으로 짚어줘서 정말 편합니다.',
      tag: '동기 듀티 매칭',
    },
    {
      name: '이수민 간호사',
      hospital: '종합병원 병동(Ward) 1년차 신규',
      stars: '★★★★★',
      quote: '“임상 AI 약물 계산기 덕분에 투약 전 두려움이 사라졌습니다.”',
      content:
        '도파민이나 헤파린 점적 계산할 때마다 선배님께 여쭤보기 눈치 보였는데, 체중이랑 처방량만 넣으면 cc/hr와 gtt/min을 즉시 계산해주니 투약 오류 걱정 없이 안전하게 일할 수 있어요.',
      tag: 'AI 약물 계산기',
    },
    {
      name: '박준영 간호사',
      hospital: '응급의료센터(ER) 5년차 책임',
      stars: '★★★★★',
      quote: '“고된 나이트 퇴근길, 마음을 달래주는 따뜻한 힐링 앱입니다.”',
      content:
        '새벽 나이트 근무 끝나고 퇴근길에 듀티 운세 보면서 위로받고, 커뮤니티에서 다른 병원 선생님들과 격려를 나누며 번아웃을 극복하고 있습니다. 간호사를 진심으로 이해하는 앱이에요.',
      tag: '듀티 사주 & 커뮤니티',
    },
  ];

  return (
    <View style={styles.container} nativeID="testimonials">
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>현직 간호사 생생 후기</Text>
          </View>
          <Text style={styles.title}>간호사 98%가 추천하는 이유</Text>
          <Text style={styles.subtitle}>
            병원 현장에서 매일 우간다를 사용하는 실제 간호사 선생님들의 솔직한 이야기입니다.
          </Text>
        </View>

        <View style={styles.grid}>
          {reviews.map((rev, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.stars}>{rev.stars}</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{rev.tag}</Text>
                </View>
              </View>

              <Text style={styles.quote}>{rev.quote}</Text>
              <Text style={styles.content}>{rev.content}</Text>

              <View style={styles.authorInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{rev.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{rev.name}</Text>
                  <Text style={styles.authorDept}>{rev.hospital}</Text>
                </View>
              </View>
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
  grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    fontSize: 16,
    color: '#F59E0B',
    letterSpacing: 2,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  quote: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    marginBottom: 24,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorDept: {
    fontSize: 12,
    color: '#64748B',
  },
});

