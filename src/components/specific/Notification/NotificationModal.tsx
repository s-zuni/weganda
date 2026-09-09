import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { BellIcon, TrashIcon } from '../../common/Icon';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'swap':
        return { label: '듀티 교환', bg: '#FFF1F4', text: COLORS.primary };
      case 'shift':
        return { label: '근무 알림', bg: '#EFF6FF', text: '#2563EB' };
      case 'comment':
        return { label: '커뮤니티', bg: '#FEF3C7', text: '#D97706' };
      default:
        return { label: '동기 매칭', bg: '#F3F4F6', text: COLORS.textSecondary };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 핸들바 */}
          <View style={styles.handleBar} />

          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <BellIcon size={20} color={COLORS.textPrimary} />
              <Text style={styles.headerTitle}>알림 센터</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.readAllText}>모두 읽음</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 알림 리스트 */}
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
              </View>
            ) : (
              notifications.map((item) => {
                const badge = getTypeBadge(item.type);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
                    onPress={() => markAsRead(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.itemTopRow}>
                      <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.typeBadgeText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <View style={styles.timeDeleteRow}>
                        <Text style={styles.timeText}>{item.timeAgo}</Text>
                        <TouchableOpacity
                          onPress={() => deleteNotification(item.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <TrashIcon size={14} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifMessage}>{item.message}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  readAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  notifItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notifItemUnread: {
    backgroundColor: '#FFF9FA',
    borderColor: '#FFE4EA',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeDeleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default NotificationModal;

