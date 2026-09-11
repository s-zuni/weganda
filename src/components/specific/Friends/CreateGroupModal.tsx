import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { FriendDetail } from '../../../types/friends';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  friends: FriendDetail[];
  onCreateGroup: (name: string, category: string, selectedFriends: FriendDetail[]) => void;
}

const CATEGORIES = ['병동', '동기', '스터디', '취미/친목'];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onClose,
  friends,
  onCreateGroup,
}) => {
  const theme = useAppTheme();
  const [groupName, setGroupName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('병동');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  const toggleSelectFriend = (id: string) => {
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds(selectedFriendIds.filter((fid) => fid !== id));
    } else {
      setSelectedFriendIds([...selectedFriendIds, id]);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      Alert.alert('확인', '모임 이름을 입력해주세요.');
      return;
    }
    const chosenFriends = friends.filter((f) => selectedFriendIds.includes(f.id));
    onCreateGroup(groupName.trim(), selectedCategory, chosenFriends);
    setGroupName('');
    setSelectedFriendIds([]);
    onClose();
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedFriendIds([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.modalCloseText, { color: theme.primary }]}>‹ 취소</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>새 단체 모임 만들기</Text>
          <TouchableOpacity onPress={handleCreate}>
            <Text style={[styles.modalDoneText, { color: theme.primary }]}>개설</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
          {/* 모임명 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputSectionTitle}>모임 이름</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="예: 51병동 동기방, 중환자실 나이트방"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* 카테고리 선택 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputSectionTitle}>카테고리</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat && { color: theme.onPrimaryText, fontWeight: '800' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 참여할 친구 선택 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputSectionTitle}>
              함께할 친구 선택 ({selectedFriendIds.length}명 선택됨)
            </Text>
            {friends.length === 0 ? (
              <Text style={styles.emptyFriendsNotice}>
                등록된 친구가 없습니다. 먼저 친구를 추가해주세요.
              </Text>
            ) : (
              <View style={styles.memberSelectList}>
                {friends.map((f) => {
                  const isSelected = selectedFriendIds.includes(f.id);
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[
                        styles.memberSelectItem,
                        isSelected && { backgroundColor: theme.primaryTint, borderColor: theme.primaryLight },
                      ]}
                      onPress={() => toggleSelectFriend(f.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.memberSelectLeft}>
                        <View style={[styles.memberAvatar, { backgroundColor: f.avatarBg || theme.primary }]}>
                          <Text style={styles.memberAvatarText}>{f.avatarLetter || f.name.charAt(0)}</Text>
                        </View>
                        <View>
                          <Text style={styles.memberSelectName}>{f.name}</Text>
                          <Text style={styles.memberSelectRole}>{f.role}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                        ]}
                      >
                        {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    gap: 20,
  },
  inputSection: {
    gap: 10,
  },
  inputSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  emptyFriendsNotice: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  memberSelectList: {
    gap: 10,
  },
  memberSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  memberSelectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  memberSelectRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
