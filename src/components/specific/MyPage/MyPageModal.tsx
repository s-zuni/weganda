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
  Linking,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import * as Clipboard from 'expo-clipboard';
import { useUserStore } from '../../../store/useUserStore';
import { useFortuneStore } from '../../../store/useFortuneStore';
import { BirthInfoModal } from '../Fortune/BirthInfoModal';
import { UserIcon, SparklesIcon, CalendarIcon, BookmarkIcon, CrownIcon, LockIcon, PaletteIcon, ShieldCheckIcon } from '../../common/Icon';
import { PremiumBadge } from '../../common/PremiumBadge';
import { MembershipScreen } from '../../../screens/MyPage/MembershipScreen';
import { APP_THEME_COLORS, AppThemeColor } from '../../../constants/membership';
import { VerificationModal } from '../Verification';
import { SupportModal } from '../Support/SupportModal';
import { BusinessInfoModal } from '../Support/BusinessInfoModal';
import { BurnoutGuardModal } from './BurnoutGuardModal';
import { MyPageUserCodeBadge } from './MyPageUserCodeBadge';
import { MyPageBurnoutBanner } from './MyPageBurnoutBanner';
import { MyPageSupportSection } from './MyPageSupportSection';
import { MyPageFooterSection } from './MyPageFooterSection';
import { InquiryCategory, BUSINESS_INFO } from '../../../types/support';

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
    userCode,
    isPremium,
    role,
    verificationStatus,
    verificationRole,
    verificationRejectReason,
    subscriptionInfo,
    cancelSubscription,
    unsubscribePremium,
    appThemeColor,
    setAppThemeColor,
    setUser,
    clearUser,
    deleteAccount,
  } = useUserStore();
  const { birthInfo } = useFortuneStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(storeName || '김간호');
  const [hospitalName, setHospitalName] = useState(storeHospital || '서울아산병원');
  const [wardName, setWardName] = useState(storeWard || '51병동 (소화기내과)');
  const [experienceYears, setExperienceYears] = useState(String(storeExp !== undefined && storeExp !== null ? storeExp : 3));

  const [notifPush, setNotifPush] = useState(true);
  const [birthModalVisible, setBirthModalVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);
  const [burnoutModalVisible, setBurnoutModalVisible] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [supportCategory, setSupportCategory] = useState<InquiryCategory>('서비스 문의');
  const [businessInfoVisible, setBusinessInfoVisible] = useState(false);

  const handleCancelSubscription = () => {
    const isTrial = subscriptionInfo?.isTrial;
    const isCanceled = subscriptionInfo?.status === 'canceled';

    if (isCanceled) {
      Alert.alert(
        '해지 예약 상태',
        `이미 구독 해지가 예약되어 있습니다. ${subscriptionInfo?.nextBillingDate || '만료일'}까지 혜택이 유지되며 이후 자동 결제되지 않습니다.`
      );
      return;
    }

    Alert.alert(
      'weganda+ 구독 관리 및 해지',
      `${isTrial ? '현재 1개월 무료 체험 기간을 이용 중입니다.' : '현재 평생 얼리버드 특가 멤버십을 이용 중입니다.'}\n\n지금 해지하시더라도 ${subscriptionInfo?.nextBillingDate || '체험 만료일'}까지는 모든 프리미엄 기능(사주 무제한, 월급 예측기, 약물 계산기 등)을 위약금 없이 그대로 이용하실 수 있습니다.`,
      [
        { text: '닫기', style: 'cancel' },
        {
          text: '스토어에서 해지하기',
          onPress: () => {
            const storeUrl = Platform.select({
              ios: 'https://apps.apple.com/account/subscriptions',
              android: 'https://play.google.com/store/account/subscriptions',
              default: 'https://apps.apple.com/account/subscriptions',
            });
            Linking.openURL(storeUrl).catch(() => {
              Alert.alert('안내', '스토어 설정 > 구독 메뉴에서 안전하게 취소하실 수 있습니다.');
            });
          },
        },
        {
          text: '앱에서 즉시 해지 예약',
          style: 'destructive',
          onPress: () => {
            cancelSubscription();
            Alert.alert(
              '해지 예약 완료',
              `구독 해지가 성공적으로 접수되었습니다. ${subscriptionInfo?.nextBillingDate || '다음 결제일'}까지 프리미엄 혜택이 유지되며 이후 결제되지 않습니다.`
            );
          },
        },
      ]
    );
  };

  // 회원 탈퇴 핸들러 (Apple Guideline 5.1.1(v) 대응)
  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말 회원 탈퇴를 진행하시겠습니까?\n\n탈퇴 시 등록된 모든 근무표, 개인 설정, 채팅 및 활동 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAccount();
            if (success) {
              Alert.alert('탈퇴 완료', '회원 탈퇴 및 모든 개인 데이터가 안전하게 삭제되었습니다.');
              onClose();
            } else {
              Alert.alert('오류', '회원 탈퇴 처리 중 문제가 발생했습니다. 고객센터로 문의해 주세요.');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (!name.trim() || !hospitalName.trim()) {
      Alert.alert('확인', '이름과 소속 병원은 필수 입력 항목입니다.');
      return;
    }

    const finalExp = experienceYears === '' ? 1 : Math.max(0, parseInt(experienceYears, 10));

    setUser({
      name: name.trim(),
      hospitalName: hospitalName.trim(),
      wardName: wardName.trim(),
      experienceYears: finalExp,
      isAuthenticated: true,
    });

    const storeUserId = useUserStore.getState().id;
    if (storeUserId) {
      useUserStore.getState().updateUserProfile({
        name: name.trim(),
        hospitalName: hospitalName.trim(),
        wardName: wardName.trim(),
        experienceYears: finalExp,
      }).catch((e) => console.warn('Failed to sync profile with Supabase:', e));
    }

    setIsEditing(false);
    Alert.alert('저장 완료', '프로필 정보가 성공적으로 변경되었습니다.');
  };

  const handleCopyUserCode = async () => {
    if (!userCode) return;
    await Clipboard.setStringAsync(userCode);
    Alert.alert('고유번호 복사', `간호사 고유번호 #${userCode}가 클립보드에 복사되었습니다.\n동료 간호사에게 전달하여 친구를 맺어보세요!`);
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
                <View style={styles.profileNameRow}>
                  <Text style={styles.userName}>{name}</Text>
                  <MyPageUserCodeBadge userCode={userCode} onCopy={handleCopyUserCode} />
                </View>
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

          {/* 간호 전문직 & 간호학생 인증 상태 카드 */}
          <TouchableOpacity
            style={[
              styles.verificationCard,
              verificationStatus === 'verified' && styles.verificationCardVerified,
              verificationStatus === 'pending' && styles.verificationCardPending,
              verificationStatus === 'rejected' && styles.verificationCardRejected,
            ]}
            onPress={() => setVerificationModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.verificationCardLeft}>
              <Text style={styles.verificationCardIcon}>
                {verificationStatus === 'verified'
                  ? '✓'
                  : verificationStatus === 'pending'
                  ? '⏳'
                  : verificationStatus === 'rejected'
                  ? '✕'
                  : '🔒'}
              </Text>
              <View style={styles.verificationCardTexts}>
                <View style={styles.verificationTitleRow}>
                  <Text style={styles.verificationCardTitle}>
                    {verificationStatus === 'verified'
                      ? `${verificationRole === 'student' ? '간호대생' : '간호사'} 인증 완료`
                      : verificationStatus === 'pending'
                      ? '서류 심사 진행 중'
                      : verificationStatus === 'rejected'
                      ? '인증 반려 (사유 확인)'
                      : '간호사 & 간호대생 서류 인증'}
                  </Text>
                  <View
                    style={[
                      styles.verificationStatusTag,
                      verificationStatus === 'verified' && { backgroundColor: '#DEF7EC' },
                      verificationStatus === 'pending' && { backgroundColor: '#FEF3C7' },
                      verificationStatus === 'rejected' && { backgroundColor: '#FDE8E8' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.verificationStatusTagText,
                        verificationStatus === 'verified' && { color: '#03543F' },
                        verificationStatus === 'pending' && { color: '#92400E' },
                        verificationStatus === 'rejected' && { color: '#9B1C1C' },
                      ]}
                    >
                      {verificationStatus === 'verified'
                        ? '인증됨'
                        : verificationStatus === 'pending'
                        ? '심사중'
                        : verificationStatus === 'rejected'
                        ? '반려'
                        : '미인증'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.verificationCardSub}>
                  {verificationStatus === 'verified'
                    ? '커뮤니티 및 전용 서비스를 모두 이용하실 수 있습니다.'
                    : verificationStatus === 'pending'
                    ? '관리자가 서류를 확인하고 있습니다. (최대 24시간 소요)'
                    : verificationStatus === 'rejected'
                    ? `반려 사유: ${verificationRejectReason || '서류 보완 필요'} (터치하여 재신청)`
                    : '면허증 또는 학생증을 인증하고 커뮤니티 권한을 얻으세요.'}
                </Text>
              </View>
            </View>
            <Text style={styles.verificationCardArrow}>›</Text>
          </TouchableOpacity>

          {/* 🩺 스마트 듀티 건강 & 번아웃 위험도 분석 배너 카드 (유료 기능 안내 & 바로가기) */}
          <MyPageBurnoutBanner onPress={() => setBurnoutModalVisible(true)} />

          {/* weganda+ 멤버십 배지 */}
          <PremiumBadge
            isPremium={isPremium}
            onPress={() => setMembershipVisible(true)}
          />

          {/* 프리미엄 회원 전용: 구독 관리 및 해지 카드 */}
          {isPremium && (
            <View style={styles.subscriptionManageCard}>
              <View style={styles.subManageHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.subPlanBadgeRow}>
                    <Text style={styles.subPlanTitle}>
                      {subscriptionInfo?.planType === 'yearly'
                        ? '우간다+ 연간 멤버십'
                        : '우간다+ 월간 멤버십'}
                    </Text>
                    <View
                      style={[
                        styles.subStatusBadge,
                        subscriptionInfo?.status === 'canceled'
                          ? { backgroundColor: '#FEF3C7' }
                          : { backgroundColor: '#DEF7EC' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subStatusBadgeText,
                          subscriptionInfo?.status === 'canceled'
                            ? { color: '#92400E' }
                            : { color: '#03543F' },
                        ]}
                      >
                        {subscriptionInfo?.status === 'canceled'
                          ? '해지 예약됨'
                          : subscriptionInfo?.isTrial
                          ? '1개월 무료체험 중'
                          : '정기 구독 중'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.subPriceText}>
                    {subscriptionInfo?.price
                      ? `₩${subscriptionInfo.price.toLocaleString()} / ${subscriptionInfo.planType === 'yearly' ? '년' : '월'}`
                      : '월 5,900원 (얼리버드 평생특가)'}
                  </Text>
                </View>
              </View>

              <View style={styles.subDateInfoBox}>
                {subscriptionInfo?.isTrial && subscriptionInfo?.trialEndDate && (
                  <View style={styles.subDateRow}>
                    <Text style={styles.subDateLabel}>1개월 무료 체험 종료일</Text>
                    <Text style={styles.subDateVal}>{subscriptionInfo.trialEndDate}</Text>
                  </View>
                )}
                <View style={styles.subDateRow}>
                  <Text style={styles.subDateLabel}>
                    {subscriptionInfo?.status === 'canceled' ? '구독 만료 예정일' : '다음 자동 결제일'}
                  </Text>
                  <Text style={styles.subDateVal}>
                    {subscriptionInfo?.nextBillingDate || '2026-10-11'}
                  </Text>
                </View>
              </View>

              <View style={styles.subActionRow}>
                <TouchableOpacity
                  style={styles.cancelSubBtn}
                  onPress={handleCancelSubscription}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelSubBtnText}>
                    {subscriptionInfo?.status === 'canceled'
                      ? '해지 상태 확인'
                      : '구독 관리 및 해지하기'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}


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

          {/* ── 고객센터 & 1:1 문의 (모듈 분리) ── */}
          <MyPageSupportSection
            onOpenSupport={(cat) => {
              setSupportCategory(cat);
              setSupportModalVisible(true);
            }}
          />

          {/* ── 약관 및 정책 (Apple / Google 심사 필수) ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>약관 및 정책</Text>

            <TouchableOpacity
              style={styles.policyRow}
              onPress={() => {
                const url = 'https://weganda.kr/terms';
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch((err) => console.warn(err));
                }
              }}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel="서비스 이용약관"
            >
              <Text style={styles.policyLabel}>서비스 이용약관</Text>
              <Text style={styles.policyArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.policyDivider} />

            <TouchableOpacity
              style={styles.policyRow}
              onPress={() => {
                const url = 'https://weganda.kr/privacy';
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch((err) => console.warn(err));
                }
              }}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel="개인정보 처리방침"
            >
              <Text style={styles.policyLabel}>개인정보 처리방침</Text>
              <Text style={styles.policyArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.policyDivider} />

            <TouchableOpacity
              style={styles.policyRow}
              onPress={() => {
                const url = 'https://weganda.kr/membership';
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch((err) => console.warn(err));
                }
              }}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel="우간다+ 멤버십 이용약관"
            >
              <Text style={styles.policyLabel}>우간다+ 멤버십 이용약관</Text>
              <Text style={styles.policyArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.policyDivider} />

            <TouchableOpacity
              style={styles.policyRow}
              onPress={() => {
                const url = 'https://weganda.kr/community';
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch((err) => console.warn(err));
                }
              }}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel="커뮤니티 이용약관"
            >
              <Text style={styles.policyLabel}>커뮤니티 이용약관</Text>
              <Text style={styles.policyArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* ── 최하단 서비스 안내 및 고객지원 버튼 (모듈 분리) ── */}
          <MyPageFooterSection
            onOpenSupport={() => {
              setSupportCategory('서비스 문의');
              setSupportModalVisible(true);
            }}
            onOpenBusinessInfo={() => setBusinessInfoVisible(true)}
            onLogout={() =>
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
            onDeleteAccount={handleDeleteAccount}
          />
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

        {/* 고객센터 1:1 문의 모달 */}
        <SupportModal
          visible={supportModalVisible}
          onClose={() => setSupportModalVisible(false)}
          initialCategory={supportCategory}
        />

        {/* 사업자 정보 확인 모달 */}
        <BusinessInfoModal
          visible={businessInfoVisible}
          onClose={() => setBusinessInfoVisible(false)}
        />

        {/* 전문직/간호학생 인증 모달 */}
        <VerificationModal
          visible={verificationModalVisible}
          onClose={() => setVerificationModalVisible(false)}
        />

        {/* 🩺 스마트 듀티 건강 & 번아웃 위험도 AI 분석 모달 */}
        <BurnoutGuardModal
          visible={burnoutModalVisible}
          isPremium={isPremium}
          onClose={() => setBurnoutModalVisible(false)}
          onOpenMembership={() => {
            setBurnoutModalVisible(false);
            setMembershipVisible(true);
          }}
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
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
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
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  verificationCardVerified: {
    backgroundColor: '#F3FAF7',
    borderColor: '#31C48D',
  },
  verificationCardPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  verificationCardRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  verificationCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  verificationCardIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  verificationCardTexts: {
    flex: 1,
  },
  verificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  verificationCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  verificationStatusTag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verificationStatusTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  verificationCardSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  verificationCardArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  subscriptionManageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subManageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subPlanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subPlanTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  subStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subStatusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subPriceText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  subDateInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  subDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subDateLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  subDateVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  subActionRow: {
    alignItems: 'flex-end',
  },
  cancelSubBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelSubBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  policyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  policyArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  policyDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  deleteAccountBtn: {
    marginTop: 12,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minHeight: 44,
  },
  deleteAccountBtnText: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
});

export default MyPageModal;
