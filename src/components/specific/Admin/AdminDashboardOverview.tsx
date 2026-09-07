import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DashboardStats } from '../../../services/adminApi';
import { AdminAnalytics, AdminUser } from '../../../types/admin';

interface AdminDashboardOverviewProps {
  stats: DashboardStats;
  analytics: AdminAnalytics | null;
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  stats,
  analytics,
  onNavigateTab,
}) => {
  const serviceStats = analytics?.service_stats || [
    { service_key: 'chat', service_name: 'AI 임상/약물 챗봇', duration_share: 29.0, avg_duration: 256.1 },
    { service_key: 'shift', service_name: '3교대 듀티 캘린더', duration_share: 25.4, avg_duration: 214.6 },
    { service_key: 'fortune', service_name: '오행·사주 듀티 운세', duration_share: 23.5, avg_duration: 319.5 },
    { service_key: 'home', service_name: '홈 대시보드 피드', duration_share: 11.2, avg_duration: 74.1 },
    { service_key: 'community', service_name: '간호사 커뮤니티', duration_share: 10.1, avg_duration: 156.1 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── 1. 상단 4대 주요 KPI 카드 그리드 (예시 사진 완벽 구현) ── */}
      <View style={styles.topCardRow}>
        {/* 카드 1: 오늘 접속자 수 (보라색) */}
        <View style={styles.topCard}>
          <View style={styles.topCardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.cardIcon, { color: '#7C3AED' }]}>⚡</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateTab('analytics')}>
              <Text style={styles.detailLink}>상세 ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardLabel}>오늘 접속자 수</Text>
          <Text style={styles.cardValue}>{stats.today_visitors}명</Text>
          <Text style={styles.cardSub}>~ 실시간 접속 현황</Text>
        </View>

        {/* 카드 2: 전체 회원 (파란색) */}
        <View style={styles.topCard}>
          <View style={styles.topCardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.cardIcon, { color: '#2563EB' }]}>👥</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateTab('users')}>
              <Text style={styles.detailLink}>상세 ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardLabel}>전체 회원</Text>
          <Text style={styles.cardValue}>{stats.total_users}명</Text>
          <Text style={styles.cardSub}>~ 가입 회원 실시간 연동</Text>
        </View>

        {/* 카드 3: 총 매출액 (초록색) */}
        <View style={styles.topCard}>
          <View style={styles.topCardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.cardIcon, { color: '#059669' }]}>💳</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateTab('payments')}>
              <Text style={styles.detailLink}>상세 ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardLabel}>총 매출액</Text>
          <Text style={styles.cardValue}>
            {stats.total_revenue > 0 ? `${stats.total_revenue.toLocaleString()}원` : '0원'}
          </Text>
          <Text style={styles.cardSub}>~ PG사 연동 준비 중</Text>
        </View>

        {/* 카드 4: 미처리 신고/문의 (주황색) */}
        <View style={styles.topCard}>
          <View style={styles.topCardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
              <Text style={[styles.cardIcon, { color: '#EA580C' }]}>⚠️</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateTab('community')}>
              <Text style={styles.detailLink}>상세 ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardLabel}>미처리 신고/문의</Text>
          <Text style={styles.cardValue}>{stats.pending_reports}건</Text>
          <Text style={styles.cardSub}>
            {stats.pending_reports > 0 ? '~ 집중 관리 필요' : '~ 모든 신고 처리 완료'}
          </Text>
        </View>
      </View>

      {/* ── 2. 서비스 활성도 지표 섹션 ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleIcon}>📈</Text>
        <Text style={styles.sectionTitle}>서비스 활성도 지표</Text>
      </View>

      <View style={styles.miniStatsRow}>
        <View style={styles.miniCard}>
          <Text style={styles.miniIcon}>⚡</Text>
          <Text style={styles.miniLabel}>오늘 접속자</Text>
          <Text style={styles.miniValue}>{stats.today_visitors}명</Text>
        </View>

        <View style={styles.miniCard}>
          <Text style={styles.miniIcon}>🌱</Text>
          <Text style={styles.miniLabel}>오늘 신규 가입</Text>
          <Text style={styles.miniValue}>{stats.today_users}명</Text>
        </View>

        <View style={styles.miniCard}>
          <Text style={styles.miniIcon}>📊</Text>
          <Text style={styles.miniLabel}>이번 주 신규</Text>
          <Text style={styles.miniValue}>{stats.total_users}명</Text>
        </View>

        <View style={styles.miniCard}>
          <Text style={styles.miniIcon}>⏳</Text>
          <Text style={styles.miniLabel}>미처리 신고</Text>
          <Text style={styles.miniValue}>{stats.pending_reports}건</Text>
        </View>
      </View>

      {/* ── 3. 중간 2열 그리드: 최근 7일 가입자 추이 & 최근 가입자 목록 ── */}
      <View style={styles.midRow}>
        {/* 좌측: 최근 7일 신규 가입자 추이 */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>최근 7일 신규 가입자 추이</Text>
          <Text style={styles.cardSubTitle}>일자별 신규 회원 유입 그래프</Text>

          {/* 간이 막대 차트 */}
          <View style={styles.barChartContainer}>
            {[
              { date: '9. 1.', count: 0 },
              { date: '9. 2.', count: 0 },
              { date: '9. 3.', count: 0 },
              { date: '9. 4.', count: 0 },
              { date: '9. 5.', count: 1, active: true },
              { date: '9. 6.', count: 0 },
              { date: '9. 7.', count: 0 },
            ].map((item, idx) => (
              <View key={idx} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: item.count > 0 ? 80 : 6,
                        backgroundColor: item.active ? '#FF507C' : '#E2E8F0',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barCount}>{item.count > 0 ? `${item.count}명` : ''}</Text>
                <Text style={[styles.barDate, item.active && styles.barDateActive]}>
                  {item.date}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 우측: 최근 가입자 목록 (profiles 실데이터) */}
        <View style={styles.recentUsersCard}>
          <View style={styles.recentHeader}>
            <Text style={styles.cardTitle}>최근 가입자</Text>
            <TouchableOpacity onPress={() => onNavigateTab('users')}>
              <Text style={styles.seeAllText}>전체보기 ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userList}>
            {stats.recent_users.slice(0, 5).map((user: AdminUser) => (
              <View key={user.id} style={styles.userItem}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user.name ? user.name.charAt(0) : '간'}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View
                      style={[
                        styles.roleTag,
                        user.role === 'admin' && styles.roleTagAdmin,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleTagText,
                          user.role === 'admin' && styles.roleTagTextAdmin,
                        ]}
                      >
                        {user.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <Text style={styles.userDate}>
                  {user.createdAt ? user.createdAt.substring(5, 10).replace('-', '.') : '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── 4. 하단: 이번 주 서비스별 사용 현황 & 체류시간 ── */}
      <View style={styles.dwellCard}>
        <Text style={styles.cardTitle}>이번 주 서비스별 사용 현황 & 체류시간</Text>
        <Text style={styles.cardSubTitle}>
          각 기능별 간호사 회원 평균 체류시간 및 사용 점유율
        </Text>

        <View style={styles.serviceProgressList}>
          {serviceStats.map((item: any, idx: number) => {
            const colors = ['#FF507C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
            const barColor = colors[idx % colors.length];

            return (
              <View key={item.service_key} style={styles.serviceProgressItem}>
                <View style={styles.serviceProgressHeader}>
                  <Text style={styles.serviceName}>{item.service_name}</Text>
                  <View style={styles.serviceShareRow}>
                    <Text style={styles.serviceAvgTime}>
                      평균 {Math.round(item.avg_duration || 120)}초
                    </Text>
                    <Text style={[styles.serviceShareText, { color: barColor }]}>
                      {item.duration_share}%
                    </Text>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(100, Math.max(10, item.duration_share))}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  content: {
    padding: 24,
    gap: 20,
  },
  topCardRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  topCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  detailLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  cardSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionTitleIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  miniCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  miniLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  miniValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  midRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  chartCard: {
    flex: 2,
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 16,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  barColumn: {
    alignItems: 'center',
    width: 36,
  },
  barTrack: {
    height: 90,
    justifyContent: 'flex-end',
    width: 14,
  },
  barFill: {
    width: 14,
    borderRadius: 4,
  },
  barCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF507C',
    marginTop: 4,
  },
  barDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  barDateActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  recentUsersCard: {
    flex: 1.2,
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  userList: {
    gap: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleTagAdmin: {
    backgroundColor: '#0F172A',
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTagTextAdmin: {
    color: '#FBBF24',
  },
  userEmail: {
    fontSize: 11,
    color: '#94A3B8',
  },
  userDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  dwellCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceProgressList: {
    marginTop: 14,
    gap: 12,
  },
  serviceProgressItem: {
    gap: 4,
  },
  serviceProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  serviceShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceAvgTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  serviceShareText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
