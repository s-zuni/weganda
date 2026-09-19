import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { friendsApi } from '../../../services/friendsApi';
import { contactService, DeviceContact } from '../../../services/contactService';
import { useUserStore } from '../../../store/useUserStore';
import { useFriendsStore } from '../../../store/useFriendsStore';

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
}

type AddTab = 'code' | 'contacts';

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const myUserId = useUserStore((s) => s.id);
  const myUserCode = useUserStore((s) => s.userCode);
  const { fetchFriends } = useFriendsStore();

  const [activeTab, setActiveTab] = useState<AddTab>('code');

  // 고유번호 검색 관련 상태
  const [nurseCodeInput, setNurseCodeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedNurse, setSearchedNurse] = useState<{
    id: string;
    name: string;
    hospital_name: string | null;
    ward_name: string | null;
    experience_years: number | null;
    user_code: string | null;
  } | null>(null);

  // 연락처 관련 상태
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [addedContactIds, setAddedContactIds] = useState<Record<string, boolean>>({});

  // 1. 7자리 고유번호 검색
  const handleSearchCode = async () => {
    const trimmed = nurseCodeInput.trim();
    if (!trimmed) {
      Alert.alert('확인', '7자리 간호사 고유번호를 입력해주세요.');
      return;
    }
    if (trimmed === myUserCode) {
      Alert.alert('알림', '본인의 고유번호입니다. 동료 간호사의 번호를 입력해주세요.');
      return;
    }

    try {
      setIsSearching(true);
      setSearchedNurse(null);
      const result = await friendsApi.searchByNurseCode(trimmed);
      if (!result) {
        Alert.alert('검색 결과 없음', `고유번호 #${trimmed}에 해당하는 동료 간호사를 찾을 수 없습니다.\n번호를 다시 확인해주세요.`);
      } else {
        setSearchedNurse(result);
      }
    } catch (e: any) {
      Alert.alert('오류', '동료 간호사 검색 중 문제가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 고유번호 검색 결과로 친구 추가
  const handleAddNurseByCode = async () => {
    if (!searchedNurse || !myUserId) return;
    try {
      await friendsApi.addFriendDirect(myUserId, searchedNurse.id);
      Alert.alert(
        '친구 추가 완료',
        `${searchedNurse.name} 간호사님과 친구가 되었습니다!\n서로의 듀티와 겹치는 오프를 확인해보세요.`
      );
      setSearchedNurse(null);
      setNurseCodeInput('');
      await fetchFriends(myUserId);
      onClose();
    } catch (e: any) {
      Alert.alert('친구 추가 실패', e.message || '친구 추가 중 문제가 발생했습니다.');
    }
  };

  // 2. 디바이스 연락처 불러오기
  const handleLoadContacts = async () => {
    setIsLoadingContacts(true);
    const res = await contactService.getDeviceContacts();
    setIsLoadingContacts(false);
    if (!res.success) {
      Alert.alert('연락처 권한 필요', res.message || '연락처를 불러올 수 없습니다.');
    } else {
      setContacts(res.contacts);
    }
  };

  // 연락처 개별 수동 추가 (원칙: 사용자가 직접 '추가' 버튼을 눌러야만 친구 등록)
  const handleAddIndividualContact = async (contact: DeviceContact) => {
    // 이미 추가된 경우 방지
    if (addedContactIds[contact.id]) return;

    // 로컬 상태 및 안내
    setAddedContactIds((prev) => ({ ...prev, [contact.id]: true }));
    Alert.alert(
      '친구 추가 완료',
      `${contact.name}님을 친구 목록에 추가했습니다.`
    );

    // 스토어 친구 목록 갱신
    if (myUserId) {
      fetchFriends(myUserId);
    }
  };

  const filteredContacts = contacts.filter(
    (c) => c.name.includes(contactSearchQuery) || (c.phoneNumber && c.phoneNumber.includes(contactSearchQuery))
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.closeBtn, { color: theme.primary }]}>‹ 닫기</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>친구 추가</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* 탭 전환 */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'code' && styles.activeTabItem]}
            onPress={() => setActiveTab('code')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'code' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              간호사 고유번호 (7자리)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'contacts' && styles.activeTabItem]}
            onPress={() => {
              setActiveTab('contacts');
              if (contacts.length === 0) {
                handleLoadContacts();
              }
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'contacts' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              내 연락처로 찾기
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'code' ? (
            /* ── 고유번호 검색 탭 ── */
            <View style={styles.section}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardIcon}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardTitle}>동료의 7자리 고유번호를 입력하세요</Text>
                  <Text style={styles.infoCardSub}>
                    마이페이지 프로필 이름 옆에 표시된 7자리 숫자(예: 6258828)로 동료를 찾아 친구로 등록할 수 있습니다.
                  </Text>
                  {myUserCode && (
                    <Text style={[styles.myCodeHint, { color: theme.primary }]}>
                      내 고유번호: #{myUserCode}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.codeInput}
                  value={nurseCodeInput}
                  onChangeText={(t) => setNurseCodeInput(t.replace(/[^0-9]/g, '').slice(0, 7))}
                  placeholder="7자리 번호 (예: 6258828)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={7}
                  returnKeyType="search"
                  onSubmitEditing={handleSearchCode}
                />
                <TouchableOpacity
                  style={[styles.searchBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSearchCode}
                  disabled={isSearching}
                  activeOpacity={0.85}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.searchBtnText, { color: theme.onPrimaryText }]}>검색</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* 검색 결과 표시 */}
              {searchedNurse && (
                <View style={styles.resultCard}>
                  <View style={styles.resultLeft}>
                    <View style={[styles.resultAvatar, { backgroundColor: theme.primaryTint }]}>
                      <Text style={[styles.resultAvatarText, { color: theme.primary }]}>
                        {searchedNurse.name.charAt(0) || '간'}
                      </Text>
                    </View>
                    <View style={styles.resultTexts}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.resultName}>{searchedNurse.name}</Text>
                        <Text style={styles.resultCode}>#{searchedNurse.user_code}</Text>
                      </View>
                      <Text style={styles.resultRole}>
                        {searchedNurse.hospital_name || '병원 미지정'} • {searchedNurse.ward_name || '병동 미지정'} ({searchedNurse.experience_years || 1}년차)
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                    onPress={handleAddNurseByCode}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.addBtnText, { color: theme.onPrimaryText }]}>친구 추가</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* ── 연락처 연동 탭 (수동 추가 원칙 준수) ── */
            <View style={styles.section}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardIcon}>📱</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardTitle}>연락처에서 친구 선택 추가</Text>
                  <Text style={styles.infoCardSub}>
                    자동으로 추가되지 않으며, 원하시는 동료 간호사의 [추가] 버튼을 직접 눌러야만 친구로 등록됩니다.
                  </Text>
                </View>
              </View>

              {contacts.length > 0 && (
                <View style={styles.contactSearchBox}>
                  <TextInput
                    style={styles.contactSearchInput}
                    value={contactSearchQuery}
                    onChangeText={setContactSearchQuery}
                    placeholder="이름 또는 전화번호로 검색..."
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="search"
                  />
                </View>
              )}

              {isLoadingContacts ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.loadingText}>연락처를 불러오는 중입니다...</Text>
                </View>
              ) : contacts.length === 0 ? (
                <View style={styles.emptyContactsBox}>
                  <Text style={styles.emptyContactsIcon}>👥</Text>
                  <Text style={styles.emptyContactsTitle}>연락처가 아직 로드되지 않았습니다</Text>
                  <Text style={styles.emptyContactsSub}>
                    아래 버튼을 눌러 디바이스 연락처 권한을 허용하고 동료를 찾아보세요.
                  </Text>
                  <TouchableOpacity
                    style={[styles.loadContactsBtn, { backgroundColor: theme.primary }]}
                    onPress={handleLoadContacts}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.loadContactsBtnText, { color: theme.onPrimaryText }]}>
                      연락처 불러오기
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.contactList}>
                  <Text style={styles.contactCountText}>
                    총 {filteredContacts.length}개의 연락처
                  </Text>
                  {filteredContacts.slice(0, 50).map((c) => {
                    const isAdded = addedContactIds[c.id];
                    return (
                      <View key={c.id} style={styles.contactItem}>
                        <View style={styles.contactItemLeft}>
                          <View style={styles.contactAvatar}>
                            <Text style={styles.contactAvatarText}>{c.name.charAt(0)}</Text>
                          </View>
                          <View>
                            <Text style={styles.contactName}>{c.name}</Text>
                            {c.phoneNumber && (
                              <Text style={styles.contactPhone}>{c.phoneNumber}</Text>
                            )}
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.individualAddBtn,
                            isAdded ? styles.addedBtn : { backgroundColor: theme.primary },
                          ]}
                          onPress={() => handleAddIndividualContact(c)}
                          disabled={isAdded}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.individualAddBtnText,
                              isAdded ? styles.addedBtnText : { color: theme.onPrimaryText },
                            ]}
                          >
                            {isAdded ? '추가됨 ✓' : '추가'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCardIcon: {
    fontSize: 22,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },
  infoCardSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  myCodeHint: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  searchBtn: {
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultAvatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  resultTexts: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  resultCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  resultRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  contactSearchBox: {
    marginBottom: 8,
  },
  contactSearchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContactsBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyContactsIcon: {
    fontSize: 40,
  },
  emptyContactsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  emptyContactsSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadContactsBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  loadContactsBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  contactList: {
    gap: 10,
  },
  contactCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contactItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  contactPhone: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  individualAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  individualAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  addedBtn: {
    backgroundColor: '#E5E7EB',
  },
  addedBtnText: {
    color: '#6B7280',
  },
});

