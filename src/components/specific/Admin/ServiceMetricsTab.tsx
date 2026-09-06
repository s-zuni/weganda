import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { AdminAnalytics } from '../../../types/admin';
import { adminApi } from '../../../services/adminApi';

export const ServiceMetricsTab: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rangeDays, setRangeDays] = useState<number>(30);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAnalytics(rangeDays);
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [rangeDays]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = Math.round(sec % 60);
    if (mins === 0) return `${remainingSec}초`;
    return `${mins}분 ${remainingSec}초`;
  };

  if (isLoading || !analytics) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>서비스 통계 지표를 실시간 분석 중...</Text>
      </View>
    );
  }

  const { overview, service_stats, daily_trends, monthly_revenue } = analytics;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 기간 필터 */}
      <View style={styles.rangeRow}>
        <Text style={styles.sectionHeaderTitle}>주요 서비스 KPI 요약</Text>
        <View style={styles.rangeChips}>
          {[7, 30].map((days) => (
            <TouchableOpacity
              key={days}
              style={[styles.rangeChip, rangeDays === days && styles.rangeChipActive]}
              onPress={() => setRangeDays(days)}
            >
              <Text
                style={[
                  styles.rangeChipText,
                  rangeDays === days && styles.rangeChipTextActive,
                ]}
              >
                최근 {days}일
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4대 KPI 카드 그리드 */}
      <View style={styles.kpiGrid}>
        {/* MAU */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>월간 활성자수 (MAU)</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{overview.unique_users}</Text>
            <Text style={styles.kpiUnit}>명</Text>
          </View>
          <Text style={styles.kpiSub}>최근 {rangeDays}일 순 방문 간호사</Text>
        </View>

        {/* 재방문율 */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>재방문율 (Retention)</Text>
          <View style={styles.kpiValueRow}>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              {overview.retention_rate}
            </Text>
            <Text style={styles.kpiUnit}>%</Text>
          </View>
          <Text style={styles.kpiSub}>다회 방문 복귀 이용자 비율</Text>
        </View>

        {/* 총 세션 수 */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>총 누적 세션수</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{overview.total_sessions}</Text>
            <Text style={styles.kpiUnit}>회</Text>
          </View>
          <Text style={styles.kpiSub}>앱 실행 및 활성 세션 합계</Text>
        </View>

        {/* 평균 체류시간 */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>평균 체류시간</Text>
          <View style={styles.kpiValueRow}>
            <Text style={[styles.kpiValue, { color: COLORS.primary }]}>
              {formatSeconds(overview.avg_duration_seconds)}
            </Text>
          </View>
          <Text style={styles.kpiSub}>세션당 평균 서비스 이용시간</Text>
        </View>
      </View>

      {/* ── 월간 수익 카드 (요청사항: 준비 중 명시) ── */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueTop}>
          <View style={styles.revenueTitleRow}>
            <Text style={styles.revenueEmoji}>💰</Text>
            <Text style={styles.revenueTitle}>월간 서비스 수익</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>준비 중</Text>
          </View>
        </View>

        <Text style={styles.revenueDesc}>
          현재 토스페이먼츠 PG 결제 연동 가이드에 따른 정산 시스템 연동 준비 중입니다.
          weganda+ 유료 구독 모델 정식 오픈 시 실시간 자동 집계됩니다.
        </Text>

        <View style={styles.revenueInfoBox}>
          <Text style={styles.revenueInfoLabel}>수익 파이프라인 계획</Text>
          <Text style={styles.revenueInfoText}>
            • weganda+ 멤버십: 월 4,900원 (첫 달 990원 프로모션)
          </Text>
          <Text style={styles.revenueInfoText}>
            • 프리미엄 운세 패키지 및 병원 교대근무 캘린더 고급 위젯
          </Text>
        </View>
      </View>

      {/* ── 서비스별 체류시간 및 점유율 ── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>서비스별 체류시간 및 점유율</Text>
        <Text style={styles.sectionSubtitle}>
          간호사 회원들이 각 기능에서 머무른 평균 시간 및 사용 비중입니다.
        </Text>

        <View style={styles.servicesList}>
          {service_stats.map((stat, idx) => {
            const barColors = ['#FF507C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'];
            const color = barColors[idx % barColors.length];

            return (
              <View key={stat.service_key} style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{stat.service_name}</Text>
                  <View style={styles.serviceMeta}>
                    <Text style={styles.serviceAvgTime}>
                      평균 {formatSeconds(stat.avg_duration)}
                    </Text>
                    <Text style={[styles.serviceShare, { color }]}>
                      {stat.duration_share}%
                    </Text>
                  </View>
                </View>

                {/* 프로그레스 바 */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(100, Math.max(8, stat.duration_share))}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.serviceSubText}>
                  총 이용: {formatSeconds(stat.total_duration)} · 방문 {stat.visit_count}회
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 일자별 활동 추이 요약 ── */}
      {daily_trends.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>일자별 세션 및 활동 추이</Text>
          <View style={styles.trendsTable}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableColHeader, { flex: 2 }]}>일자</Text>
              <Text style={[styles.tableColHeader, { flex: 1.5, textAlign: 'center' }]}>
                세션수
              </Text>
              <Text style={[styles.tableColHeader, { flex: 1.5, textAlign: 'center' }]}>
                유저수
              </Text>
              <Text style={[styles.tableColHeader, { flex: 2, textAlign: 'right' }]}>
                평균시간
              </Text>
            </View>

            {daily_trends.slice(-7).map((trend) => (
              <View key={trend.date} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {trend.date.substring(5)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1.5, textAlign: 'center', fontWeight: '700' },
                  ]}
                >
                  {trend.session_count}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>
                  {trend.unique_users}
                </Text>
                <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                  {formatSeconds(trend.avg_duration)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  rangeChips: {
    flexDirection: 'row',
    gap: 6,
  },
  rangeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rangeChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  rangeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  rangeChipTextActive: {
    color: '#FFFFFF',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    marginBottom: 4,
    gap: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  kpiUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  kpiSub: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  revenueCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  revenueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  revenueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revenueEmoji: {
    fontSize: 18,
  },
  revenueTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  revenueDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  revenueInfoBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 4,
  },
  revenueInfoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  revenueInfoText: {
    fontSize: 11,
    color: '#78350F',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 14,
  },
  servicesList: {
    gap: 14,
  },
  serviceItem: {
    gap: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceAvgTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  serviceShare: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  serviceSubText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  trendsTable: {
    marginTop: 6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 12,
    color: '#374151',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 10,
  },
});
