import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, useAppTheme, ThemeColors } from '../constants/theme';
import { useHeaderModalStore } from '../store/useHeaderModalStore';
import { NotificationModal } from '../components/specific/Notification/NotificationModal';
import { MyPageModal } from '../components/specific/MyPage/MyPageModal';
import {
  FortuneIcon,
  FriendsIcon,
  StethoscopeIcon,
  StudyIcon,
  CommunityIcon,
} from '../components/common/Icon';

// 화면 컴포넌트
import { DashboardScreen } from '../screens/Home/DashboardScreen';
import { FortuneStackNavigator } from './FortuneStackNavigator';
import { FriendsScreen } from '../screens/Friends/FriendsScreen';
import { StudyScreen } from '../screens/Study/StudyScreen';
import { CommunityScreen } from '../screens/Community/CommunityScreen';

export type BottomTabParamList = {
  FortuneTab: undefined;
  FriendsTab: undefined;
  HomeTab: undefined;
  StudyTab: undefined;
  CommunityTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ─── 중앙 FAB 버튼 (Floating Action Button) ────────────────
const CenterFAB = ({ onPress, theme }: { onPress: () => void; theme: ThemeColors }) => (
  <TouchableOpacity
    style={styles.fabContainer}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel="홈 근무표 대시보드"
  >
    <View style={[styles.fabButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
      <StethoscopeIcon size={28} color={theme.onPrimaryText} />
    </View>
  </TouchableOpacity>
);

export const BottomTabNavigator: React.FC = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    notificationModalVisible,
    myPageModalVisible,
    closeNotifications,
    closeMyPage,
  } = useHeaderModalStore();

  // Safe area bottom inset 고려 + 미존재 기기에서도 Figma 원본 높이(84px) 수준의 쾌적한 높이 확보
  const bottomInset = insets.bottom > 0 ? insets.bottom : 16;
  const barHeight = 64 + bottomInset;

  return (
    <View style={styles.rootContainer}>
      <Tab.Navigator
      initialRouteName="HomeTab"
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: [
          styles.tabBar,
          {
            height: barHeight,
            paddingBottom: bottomInset,
            paddingTop: 10,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* Tab 1: 운세 */}
      <Tab.Screen
        name="FortuneTab"
        component={FortuneStackNavigator}
        options={{
          tabBarLabel: '운세',
          tabBarAccessibilityLabel: '임상 운세 및 사주',
          tabBarIcon: ({ focused }) => (
            <FortuneIcon size={24} focused={focused} color={focused ? theme.primary : '#6B7280'} />
          ),
        }}
      />

      {/* Tab 2: 친구 */}
      <Tab.Screen
        name="FriendsTab"
        component={FriendsScreen}
        options={{
          tabBarLabel: '친구',
          tabBarAccessibilityLabel: '동기 및 듀티 공유',
          tabBarIcon: ({ focused }) => (
            <FriendsIcon size={24} focused={focused} color={focused ? theme.primary : '#6B7280'} />
          ),
        }}
      />

      {/* Tab 3: 홈 (Center FAB) */}
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: '',
          tabBarAccessibilityLabel: '홈 대시보드',
          tabBarButton: (props) => (
            <CenterFAB onPress={props.onPress as () => void} theme={theme} />
          ),
        }}
      />

      {/* Tab 4: 학습 */}
      <Tab.Screen
        name="StudyTab"
        component={StudyScreen}
        options={{
          tabBarLabel: '학습',
          tabBarAccessibilityLabel: '간호 학습 및 약물 계산',
          tabBarIcon: ({ focused }) => (
            <StudyIcon size={24} focused={focused} color={focused ? theme.primary : '#6B7280'} />
          ),
        }}
      />

      {/* Tab 5: 커뮤니티 */}
      <Tab.Screen
        name="CommunityTab"
        component={CommunityScreen}
        options={{
          tabBarLabel: '커뮤니티',
          tabBarAccessibilityLabel: '간호사 커뮤니티',
          tabBarIcon: ({ focused }) => (
            <CommunityIcon size={22} focused={focused} color={focused ? theme.primary : '#6B7280'} />
          ),
        }}
      />
    </Tab.Navigator>

    {/* 전역 단일 상단바 서브 모달 (다중 탭 중복 인스턴스 충돌 방지) */}
    <NotificationModal
      visible={notificationModalVisible}
      onClose={closeNotifications}
    />
    <MyPageModal
      visible={myPageModalVisible}
      onClose={closeMyPage}
    />
  </View>
);
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  fabContainer: {
    top: -24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BottomTabNavigator;
