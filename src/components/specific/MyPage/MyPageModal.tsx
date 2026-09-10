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
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { useUserStore } from '../../../store/useUserStore';
import { useFortuneStore } from '../../../store/useFortuneStore';
import { BirthInfoModal } from '../Fortune/BirthInfoModal';
import { UserIcon, SparklesIcon, CalendarIcon, BookmarkIcon, CrownIcon, LockIcon, PaletteIcon } from '../../common/Icon';
import { PremiumBadge } from '../../common/PremiumBadge';
import { MembershipScreen } from '../../../screens/MyPage/MembershipScreen';
import { APP_THEME_COLORS, AppThemeColor } from '../../../constants/membership';

interface MyPageModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MyPageModal: React.FC<MyPageModalProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const {
    name: storeName,
    hospitalName: storeHospital,
    wardName: storeWard,
    experienceYears: storeExp,
    isPremium,
    role,
    appThemeColor,
    setAppThemeColor,
    setUser,
    clearUser,
  } = useUserStore();
  const { birthInfo } = useFortuneStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(storeName || '김간호');
  const [hospitalName, setHospitalName] = useState(storeHospital || '서울아산병원');
  const [wardName, setWardName] = useState(storeWard || '51병동 (소화기내과)');
  const [experienceYears, setExperienceYears] = useState(String(storeExp || 3));

  const [notifPush, setNotifPush] = useState(true);
  const [birthModalVisible, setBirthModalVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  const handleSaveProfile = () => {
    if (!name.trim() || !hospitalName.trim()) {
      Alert.alert('확인', '이름과 소속 병원은 필수 입력 항목입니다.');
      return;
    }

    setUser({
      name: name.trim(),
      hospitalName: hospitalName.trim(),
      wardName: wardName.trim(),
      experienceYears: parseInt(experienceYears, 10) || 1,
      isAuthenticated: true,
    });

    const storeUserId = useUserStore.getState().id;
    if (storeUserId) {
      useUserStore.getState().updateUserProfile({
        name: name.trim(),
        hospitalName: hospitalName.trim(),
        wardName: wardName.trim(),
        experienceYears: parseInt(experienceYears, 10) || 1,
      }).catch((e) => console.warn('Failed to sync profile with Supabase:', e));
    }

    setIsEditing(false);
    Alert.alert('저장 완료', '프로필 정보가 성공적으로 변경되었습니다.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.backText, { color: theme.primary }]}>‹ 닫기</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>마이페이지 & 프로필 설정</Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* 프로필 카드 */}
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={[styles.avatar, { backgroundColor: theme.primaryTint }]}>
                <UserIcon size={24} color={theme.primary} />
              </View>
              <View style={styles.profileTexts}>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userRole}>
                  {hospitalName} • {wardName} ({experienceYears}년차)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditing(!isEditing)}
                activeOpacity={0.8}
              >
                <Text style={styles.editBtnText}>{isEditing ? '취소' : '수정'}</Text>
              </TouchableOpacity>
            </View>

            {/* 프로필 수정 인라인 폼 */}
            {isEditing && (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>이름 / 닉네임</Text>
                  <TextInput style={styles.textInput} value={name} onChangeText={setName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>소속 병원</Text>
                  <TextInput
                    style={styles.textInput}
                    value={hospitalName}
                    onChangeText={setHospitalName}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>소속 병동</Text>
                  <TextInput style={styles.textInput} value={wardName} onChangeText={setWardName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>임상 연차 (년)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveProfile}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.saveBtnText, { color: theme.onPrimaryText }]}>프로필 저장하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* weganda+ 멤버십 배지 */}
          <PremiumBadge
            isPremium={isPremium}
            onPress={() => setMembershipVisible(true)}
          />


          {/* ── 사주 탄생 정보 연동 섹션 (운세 PRD 연계) ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <SparklesIcon size={18} color={theme.primary} />
                <Text style={styles.sectionTitle}>사주 탄생 정보 (운세·오행 연계)</Text>
              </View>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => setBirthModalVisible(true)}
              >
                <Text style={styles.actionChipText}>수정 ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>생년월일</Text>
              <Text style={styles.infoValue}>
                {birthInfo.birthDate} ({birthInfo.calendarType === 'solar' ? '양력' : '음력'})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>출생 시각</Text>
              <Text style={styles.infoValue}>
                {birthInfo.birthTime || '미상'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>성별</Text>
              <Text style={styles.infoValue}>{birthInfo.gender === 'female' ? '여성' : '남성'}</Text>
            </View>
          </View>

          {/* ── 나의 9월 3교대 근무 현황 ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleGroup}>
              <CalendarIcon size={18} color={theme.primary} />
              <Text style={styles.sectionTitle}>이번 달 나의 3교대 현황</Text>
            </View>

            <View style={styles.shiftStatsRow}>
              <View style={styles.shiftStatItem}>
                <View style={[styles.statDot, { backgroundColor: '#4F98CA' }]} />
                <Text style={styles.statLabel}>Day</Text>
                <Text style={styles.statValue}>10회</Text>
              </View>
              <View style={styles.shiftStatItem}>
                <View style={[styles.statDot, { backgroundColor: '#E2703A' }]} />
                <Text style={styles.statLabel}>Evening</Text>
                <Text style={styles.statValue}>8회</Text>
              </View>
              <View style={styles.shiftStatItem}>
                <View style={[styles.statDot, { backgroundColor: '#272727' }]} />
                <Text style={styles.statLabel}>Night</Text>
                <Text style={styles.statValue}>5회</Text>
              </View>
              <View style={styles.shiftStatItem}>
                <View style={[styles.statDot, { backgroundColor: '#E84A5F' }]} />
                <Text style={styles.statLabel}>Off</Text>
                <Text style={styles.statValue}>8회</Text>
              </View>
            </View>
          </View>

          {/* ── 내 활동 통계 ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleGroup}>
              <BookmarkIcon size={18} color={theme.primary} filled={true} />
              <Text style={styles.sectionTitle}>내 활동 기록</Text>
            </View>

            <View style={styles.activityRow}>
              <View style={styles.activityCol}>
                <Text style={styles.activityCount}>3</Text>
                <Text style={styles.activityLabel}>작성한 글</Text>
              </View>
              <View style={styles.activityDivider} />
              <View style={styles.activityCol}>
                <Text style={styles.activityCount}>12</Text>
                <Text style={styles.activityLabel}>작성한 댓글</Text>
              </View>
              <View style={styles.activityDivider} />
              <View style={styles.activityCol}>
                <Text style={styles.activityCount}>5</Text>
                <Text style={styles.activityLabel}>보관한 족보</Text>
              </View>
            </View>
          </View>

          {/* 앱 테마 컬러 설정 */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleGroup}>
              <PaletteIcon size={18} color={theme.primary} />
              <Text style={styles.sectionTitle}>앱 테마 컬러</Text>
            </View>
            <View style={styles.themeColorGrid}>
              {APP_THEME_COLORS.map((themeOption) => {
                const isSelected = appThemeColor === themeOption.key;
                const isLocked = themeOption.isPremiumOnly && !isPremium;
                return (
                  <TouchableOpacity
                    key={themeOption.key}
                    style={[
                      styles.themeColorItem,
                      isSelected && [styles.themeColorItemSelected, { borderColor: theme.primary }],
                    ]}
                    onPress={() => {
                      if (isLocked) {
                        setMembershipVisible(true);
                      } else {
                        setAppThemeColor(themeOption.key);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.themeColorCircle, { backgroundColor: themeOption.hex }]}>
                      {isLocked && (
                        <View style={styles.themeColorLockOverlay}>
                          <LockIcon size={12} color="#FFFFFF" />
                        </View>
                      )}
                      {isSelected && !isLocked && (
                        <Text style={[styles.themeColorCheckmark, { color: theme.onPrimaryText }]}>✓</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.themeColorLabel,
                      isLocked && styles.themeColorLabelLocked,
                    ]}>{themeOption.label}</Text>
                    {isLocked && (
                      <Text style={styles.themeColorPremiumTag}>PRO</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── 앱 설정 & 알림 ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>앱 알림 설정</Text>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>근무 D-1시간 리마인더 알림</Text>
                <Text style={styles.settingSub}>출근 준비와 인계를 잊지 않도록 푸시 알림 발송</Text>
              </View>
              <Switch
                value={notifPush}
                onValueChange={setNotifPush}
                trackColor={{ false: '#E5E7EB', true: theme.primaryLight }}
                thumbColor={notifPush ? theme.primary : '#FFFFFF'}
              />
            </View>
          </View>

          {/* 로그아웃 버튼 */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() =>
              Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                {
                  text: '로그아웃',
                  style: 'destructive',
                  onPress: () => {
                    clearUser();
                    onClose();
                  },
                },
              ])
            }
          >
            <Text style={styles.logoutBtnText}>로그아웃</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 사주 탄생정보 수정 모달 */}
        <BirthInfoModal
          visible={birthModalVisible}
          onClose={() => setBirthModalVisible(false)}
        />

        <MembershipScreen
          visible={membershipVisible}
          onClose={() => setMembershipVisible(false)}
        />
      </KeyboardAvoidingView>
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
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTexts: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  editForm: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    gap: 10,
  },
  inputGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  actionChip: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  shiftStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  shiftStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  activityCol: {
    alignItems: 'center',
  },
  activityCount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  activityLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activityDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  themeColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  themeColorItem: {
    alignItems: 'center',
    width: 64,
    gap: 6,
    padding: 4,
    borderRadius: 12,
  },
  themeColorItemSelected: {
    backgroundColor: '#F8F9FA',
  },
  themeColorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeColorLockOverlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  themeColorCheckmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  themeColorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  themeColorLabelLocked: {
    color: '#9CA3AF',
  },
  themeColorPremiumTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B8922E',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
});

export default MyPageModal;
