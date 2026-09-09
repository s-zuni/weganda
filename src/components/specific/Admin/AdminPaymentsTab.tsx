import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const AdminPaymentsTab: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>💳 결제 및 정산 관리</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>연동 준비 중</Text>
          </View>
        </View>

        <Text style={styles.desc}>
          현재 토스페이먼츠(Toss Payments) 정산 시스템과의 실시간 웹훅/정산 API 연동을 준비하고 있습니다.
          정식 오픈 시 실시간 유료 결제 건수, 환불 요청, 월간 순수익이 이 화면에 자동으로 집계됩니다.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📌 예정 결제 상품 구성</Text>
          <Text style={styles.infoText}>• weganda+ 월 정기구독: 4,900원 / 월 (첫 달 990원 프로모션)</Text>
          <Text style={styles.infoText}>• 오행 사주 듀티 운세 패키지: 1회 1,200원 / 5회 4,900원</Text>
          <Text style={styles.infoText}>• 간호사 교대근무 캘린더 위젯 팩: 무료 제공 (프리미엄 5종 테마 포함)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 6,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
  },
});
