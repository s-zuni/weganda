import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useUserStore } from '../../store/useUserStore';
import {
  AdminHeader,
  AdminTabBar,
  AdminTabKey,
  UserManagementTab,
  CommunityManagementTab,
  ServiceMetricsTab,
} from '../../components/specific/Admin';
import { adminApi } from '../../services/adminApi';

export interface AdminScreenProps {
  visible?: boolean;
  onClose?: () => void;
  navigation?: any;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  visible = true,
  onClose,
  navigation,
}) => {
  const { role, setUserRole } = useUserStore();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('users');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pendingReportCount, setPendingReportCount] = useState<number>(0);

  const isAdmin = role === 'admin';

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    try {
      const reports = await adminApi.getReports('pending');
      setPendingReportCount(reports.length);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    adminApi.getReports('pending').then((reps) => {
      setPendingReportCount(reps.length);
    });
  }, [refreshKey]);

  // 권한 부족 시 안내 화면
  if (!isAdmin) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <View style={styles.deniedContainer}>
            <Text style={styles.deniedIcon}>🔒</Text>
            <Text style={styles.deniedTitle}>관리자 권한이 필요합니다</Text>
            <Text style={styles.deniedDesc}>
              이 화면은 우간다 서비스 운영진(Admin)만 접근할 수 있습니다.
              현재 계정의 역할: <Text style={styles.boldText}>{role.toUpperCase()}</Text>
            </Text>

            {/* 개발/테스트용 원클릭 관리자 권한 부여 */}
            <TouchableOpacity
              style={styles.devAdminBtn}
              onPress={() => {
                setUserRole('admin');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.devAdminBtnText}>👑 테스트용 관리자 권한 획득하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.backBtnText}>이전 화면으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  const content = (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 관리자 공통 상단 헤더 */}
      <AdminHeader
        onClose={handleClose}
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
      />

      {/* 3대 탭바 (유저 관리 / 커뮤니티 관리 / 서비스 지표) */}
      <AdminTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        reportCount={pendingReportCount}
      />

      {/* 탭 콘텐츠 영역 */}
      <View style={styles.tabContentContainer} key={refreshKey}>
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'community' && <CommunityManagementTab />}
        {activeTab === 'analytics' && <ServiceMetricsTab />}
      </View>
    </SafeAreaView>
  );

  // Modal or direct screen render
  if (onClose) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  deniedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  deniedIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  deniedDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  devAdminBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  devAdminBtnText: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 14,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  backBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
});
