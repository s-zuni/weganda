import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  AdminSidebar,
  AdminMenuKey,
  AdminContentHeader,
  AdminDashboardOverview,
  UserManagementTab,
  CommunityManagementTab,
  ServiceMetricsTab,
  AdminPaymentsTab,
  AdminSettingsTab,
  AdminWaitlistTab,
  AdminVerificationTab,
  AdminInquiriesTab,
} from '../../components/specific/Admin';
import { adminApi, DashboardStats } from '../../services/adminApi';
import { AdminAnalytics } from '../../types/admin';
import { useVerificationStore } from '../../store/useVerificationStore';
import { useSupportStore } from '../../store/useSupportStore';

export interface AdminScreenProps {
  visible?: boolean;
  onClose?: () => void;
  navigation?: any;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  onClose,
  navigation,
}) => {
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    today_visitors: 1,
    total_users: 1,
    total_revenue: 0,
    pending_reports: 0,
    today_users: 0,
    total_posts: 1,
    recent_users: [],
  });
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [dashStats, analyticsData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAnalytics().catch(() => null),
      ]);
      setStats(dashStats);
      setAnalytics(analyticsData);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleGoMain = () => {
    if (onClose) {
      onClose();
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const getMenuInfo = (menu: AdminMenuKey): { title: string; subtitle: string } => {
    switch (menu) {
      case 'dashboard':
        return {
          title: '운영 대시보드',
          subtitle: '서비스 운영 현황 및 핵심 지표를 한눈에 확인하세요.',
        };
      case 'waitlist':
        return {
          title: '사전예약 대기자 명단 (Waitlist)',
          subtitle: '랜딩페이지에서 출시 알림 및 2개월 무료 혜택을 신청한 간호사 이메일 목록',
        };
      case 'users':
        return {
          title: '회원 관리',
          subtitle: 'Supabase profiles 실데이터 연동 · 유저 역할(Admin/User/Plus) 및 계정 상태 제어',
        };
      case 'inquiries':
        return {
          title: '고객 문의 센터',
          subtitle: '간호사 회원 1:1 서비스 및 결제/버그 문의 확인 · 관리자 공식 답변 작성 및 상태 제어',
        };
      case 'verification':
        return {
          title: '간호 서류 인증 심사',
          subtitle: '간호사 및 간호학생 자격 증빙 서류 심사 · 수락(승인) 및 반려(사유 작성)',
        };
      case 'community':
        return {
          title: '커뮤니티 관리',
          subtitle: '신고 접수 내역 조치 · 게시글 숨김/복구 · 상단고정 공지사항 작성',
        };
      case 'analytics':
        return {
          title: '서비스 활성도 & 체류시간',
          subtitle: '각 기능별 실시간 체류시간 및 간호사 이용 점유율 분석',
        };
      case 'payments':
        return {
          title: '멤버십 & 런칭 이벤트 결제 관리',
          subtitle: '인앱결제(Apple/Google) 3대 프로모션 이벤트 기간 및 평생할인가 제어 콘솔',
        };
      case 'settings':
        return {
          title: '시스템 설정',
          subtitle: 'Supabase 클라우드 인프라 및 서비스 상태 모니터링',
        };
      default:
        return { title: '관리자 콘솔', subtitle: '우간다 서비스 운영 시스템' };
    }
  };

  const { adminRequests } = useVerificationStore();
  const pendingVerificationsCount = adminRequests.filter((r) => r.status === 'pending').length;

  const { inquiries, fetchAllInquiries } = useSupportStore();
  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'pending').length;

  useEffect(() => {
    fetchAllInquiries();
  }, [fetchAllInquiries]);

  const menuInfo = getMenuInfo(activeMenu);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.container}>
        {/* ── 좌측 다크 네이비 사이드바 ── */}
        <AdminSidebar
          activeMenu={activeMenu}
          onSelectMenu={setActiveMenu}
          pendingReportsCount={stats.pending_reports}
          pendingVerificationsCount={pendingVerificationsCount}
          pendingInquiriesCount={pendingInquiriesCount}
          onGoMain={handleGoMain}
        />

        {/* ── 우측 메인 콘텐츠 영역 ── */}
        <View style={styles.mainContent}>
          {/* 상단 통합 헤더 */}
          <AdminContentHeader
            title={menuInfo.title}
            subtitle={menuInfo.subtitle}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          {/* 콘텐츠 뷰 분기 */}
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#FF507C" />
            </View>
          ) : (
            <View style={styles.body}>
              {activeMenu === 'dashboard' && (
                <AdminDashboardOverview
                  stats={stats}
                  analytics={analytics}
                  onNavigateTab={setActiveMenu}
                />
              )}
              {activeMenu === 'waitlist' && <AdminWaitlistTab />}
              {activeMenu === 'users' && <UserManagementTab />}
              {activeMenu === 'inquiries' && <AdminInquiriesTab />}
              {activeMenu === 'verification' && <AdminVerificationTab />}
              {activeMenu === 'community' && <CommunityManagementTab />}
              {activeMenu === 'analytics' && <ServiceMetricsTab />}
              {activeMenu === 'payments' && <AdminPaymentsTab />}
              {activeMenu === 'settings' && <AdminSettingsTab />}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    flexDirection: 'column',
  },
  body: {
    flex: 1,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
