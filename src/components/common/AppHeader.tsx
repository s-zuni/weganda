import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';
import { BellIcon, UserIcon } from './Icon';
import { WegandaLogo } from './WegandaLogo';
import { useHeaderModalStore } from '../../store/useHeaderModalStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationModal } from '../specific/Notification/NotificationModal';
import { MyPageModal } from '../specific/MyPage/MyPageModal';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  onPressNotification?: () => void;
  onPressProfile?: () => void;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = '우간다',
  subtitle,
  leftElement,
  rightElement,
  onPressNotification,
  onPressProfile,
  style,
}) => {
  const {
    notificationModalVisible,
    myPageModalVisible,
    openNotifications,
    closeNotifications,
    openMyPage,
    closeMyPage,
  } = useHeaderModalStore();

  const { unreadCount } = useNotificationStore();

  const handleNotification = onPressNotification || openNotifications;
  const handleProfile = onPressProfile || openMyPage;

  return (
    <>
      <View style={[styles.container, style]}>
        <View style={styles.leftContainer}>
          {leftElement || (
            <View>
              <View style={styles.brandRow}>
                <WegandaLogo size={26} variant="full" />
                <Text style={styles.brandTitle}>{title}</Text>
              </View>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          )}
        </View>
        <View style={styles.rightContainer}>
          {rightElement || (
            <View style={styles.iconsRow}>
              {/* 알림 벨 아이콘 (안 읽은 알림 뱃지) */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleNotification}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <BellIcon size={20} color={COLORS.textPrimary} />
                {unreadCount > 0 && <View style={styles.unreadDot} />}
              </TouchableOpacity>

              {/* 마이페이지 프로필 아이콘 */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleProfile}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <UserIcon size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── 전 화면 공통 상단바 서브 모달들 ── */}
      <NotificationModal
        visible={notificationModalVisible}
        onClose={closeNotifications}
      />
      <MyPageModal
        visible={myPageModalVisible}
        onClose={closeMyPage}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 2,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
});

export default AppHeader;
