import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { AdminUser, UserRole } from '../../../types/admin';
import { adminApi } from '../../../services/adminApi';

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; badgeBg: string; badgeText: string; desc: string }
> = {
  admin: {
    label: '관리자 (Admin)',
    badgeBg: '#111827',
    badgeText: '#FBBF24',
    desc: '모든 서비스 무제한 + 관리자 콘솔 접근 및 제어 권한',
  },
  plus: {
    label: '플러스 (weganda+)',
    badgeBg: '#1B4332',
    badgeText: '#D4A853',
    desc: '유료 프리미엄 멤버십 전체 사용 (AI, 월급예측, 테마 5종, 운세)',
  },
  user: {
    label: '일반 (User)',
    badgeBg: '#F3F4F6',
    badgeText: '#4B5563',
    desc: '일반 무료 회원 (기본 듀티 및 커뮤니티 사용 가능)',
  },
};

export const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // 유저 상세 및 역할 변경 모달 상태
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newIsActive, setNewIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: searchQuery,
        role: selectedRoleFilter,
        page: 1,
        pageSize: 50,
      });
      setUsers(res.users);
      setTotalCount(res.totalCount);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRoleFilter]);

  const handleSearchSubmit = () => {
    fetchUsers();
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewIsActive(user.isActive);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const ok = await adminApi.updateUserRole(editingUser.id, newRole, newIsActive);
      if (ok) {
        Alert.alert('변경 완료', `${editingUser.name} 님의 권한 및 상태가 변경되었습니다.`);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, role: newRole, isActive: newIsActive, tier: newRole }
              : u
          )
        );
        setEditingUser(null);
      } else {
        Alert.alert('오류', '권한 변경에 실패했습니다.');
      }
    } catch (e) {
      Alert.alert('오류', '권한 변경 중 예외가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleBadge = (role: UserRole) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
    return (
      <View style={[styles.roleBadge, { backgroundColor: config.badgeBg }]}>
        <Text style={[styles.roleBadgeText, { color: config.badgeText }]}>
          {role.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="회원 이름 또는 이메일 검색..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearchSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 역할 필터 탭 */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: '전체' },
          { key: 'admin', label: 'Admin' },
          { key: 'plus', label: 'Plus' },
          { key: 'user', label: 'User' },
        ].map((f) => {
          const active = selectedRoleFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSelectedRoleFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.filterChipText, active && styles.filterChipTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 총 인원수 카운트 */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          총 <Text style={styles.countBold}>{totalCount}</Text>명의 회원
        </Text>
        <Text style={styles.guideText}>회원을 탭하여 권한(Role)을 변경할 수 있습니다.</Text>
      </View>

      {/* 유저 리스트 */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>회원 목록을 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>검색 결과에 맞는 회원이 없습니다.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleOpenEdit(item)}
              activeOpacity={0.7}
            >
              <View style={styles.userCardTop}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{item.name}</Text>
                  {renderRoleBadge(item.role)}
                  {!item.isActive && (
                    <View style={styles.suspendedBadge}>
                      <Text style={styles.suspendedText}>정지됨</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userDate}>
                  가입: {item.createdAt ? item.createdAt.substring(0, 10) : '-'}
                </Text>
              </View>

              <Text style={styles.userEmail}>{item.email}</Text>

              {(item.hospitalName || item.wardName) && (
                <View style={styles.userAffiliation}>
                  <Text style={styles.affiliationText}>
                    🏥 {item.hospitalName || '종합병원'} · {item.wardName || '병동'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* 역할 및 계정 상태 변경 모달 */}
      <Modal
        visible={!!editingUser}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingUser(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>회원 권한 & 상태 관리</Text>
            <Text style={styles.modalSubtitle}>
              {editingUser?.name} ({editingUser?.email})
            </Text>

            {/* 역할 선택 섹션 */}
            <Text style={styles.sectionLabel}>유저 역할 (Role) 지정</Text>
            {(['admin', 'plus', 'user'] as UserRole[]).map((r) => {
              const selected = newRole === r;
              const config = ROLE_CONFIG[r];
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOptionCard, selected && styles.roleOptionSelected]}
                  onPress={() => setNewRole(r)}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleOptionTop}>
                    <View style={styles.radioCircle}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                    <Text
                      style={[
                        styles.roleOptionTitle,
                        selected && styles.roleOptionTitleSelected,
                      ]}
                    >
                      {config.label}
                    </Text>
                  </View>
                  <Text style={styles.roleOptionDesc}>{config.desc}</Text>
                </TouchableOpacity>
              );
            })}

            {/* 계정 상태 토글 */}
            <View style={styles.statusToggleRow}>
              <View>
                <Text style={styles.statusToggleTitle}>계정 활성화 상태</Text>
                <Text style={styles.statusToggleDesc}>
                  {newIsActive ? '정상 활동 가능' : '접속 및 서비스 이용 정지'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusSwitchBtn,
                  { backgroundColor: newIsActive ? '#10B981' : '#EF4444' },
                ]}
                onPress={() => setNewIsActive(!newIsActive)}
                activeOpacity={0.8}
              >
                <Text style={styles.statusSwitchText}>
                  {newIsActive ? '활성 (Active)' : '정지 (Suspended)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 모달 액션 버튼들 */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditingUser(null)}
                disabled={isSaving}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveUser}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>변경사항 저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 13,
    color: '#4B5563',
  },
  countBold: {
    fontWeight: '800',
    color: '#111827',
  },
  guideText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  suspendedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  suspendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  userDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  userAffiliation: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  affiliationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  roleOptionCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  roleOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF1F4',
  },
  roleOptionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary,
  },
  roleOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  roleOptionTitleSelected: {
    color: COLORS.primary,
  },
  roleOptionDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 26,
  },
  statusToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  statusToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  statusToggleDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusSwitchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusSwitchText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
