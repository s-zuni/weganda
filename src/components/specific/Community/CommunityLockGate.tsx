import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { LockIcon, StethoscopeIcon } from '../../common/Icon';

interface CommunityLockGateProps {
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  rejectReason?: string;
  onPressVerify: () => void;
}

export const CommunityLockGate: React.FC<CommunityLockGateProps> = ({
  verificationStatus,
  rejectReason,
  onPressVerify,
}) => {
  const isPending = verificationStatus === 'pending';
  const isRejected = verificationStatus === 'rejected';

  const buttonText = isPending
    ? '심사 현황 확인하기'
    : isRejected
    ? '서류 다시 제출하기'
    : '1분 만에 자격 인증하기';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 상단 뱃지 및 잠금 아이콘 */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <StethoscopeIcon size={34} color={COLORS.primary} />
          <View style={styles.lockBadge}>
            <LockIcon size={14} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.tagBadge}>
        <Text style={styles.tagText}>🔒 간호사 · 간호학생 전용 커뮤니티</Text>
      </View>

      {/* 헤드라인 */}
      <Text style={styles.title}>간호 인증 회원만{'\n'}이용할 수 있는 공간이에요</Text>
      <Text style={styles.subtitle}>
        현직 간호사와 예비 간호인(간호학생)의{'\n'}
        신뢰할 수 있고 안전한 소통을 위해 인증 후 이용할 수 있어요.
      </Text>

      {/* 심사 대기 및 반려 상태 알림 카드 */}
      {isPending && (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingIcon}>⏳</Text>
          <View style={styles.pendingTextBox}>
            <Text style={styles.pendingTitle}>서류 인증 심사가 진행 중이에요</Text>
            <Text style={styles.pendingDesc}>
              관리자가 제출 서류를 확인하고 있어요. 보통 24시간 이내에 승인됩니다.
            </Text>
          </View>
        </View>
      )}

      {isRejected && (
        <View style={styles.rejectedCard}>
          <Text style={styles.rejectedIcon}>⚠️</Text>
          <View style={styles.rejectedTextBox}>
            <Text style={styles.rejectedTitle}>인증이 반려되었습니다</Text>
            <Text style={styles.rejectedDesc}>
              {rejectReason ? `사유: ${rejectReason}` : '제출하신 서류를 다시 확인 후 신청해주세요.'}
            </Text>
          </View>
        </View>
      )}

      {/* 권한 및 혜택 안내 카드 */}
      <View style={styles.benefitCard}>
        <Text style={styles.benefitCardTitle}>우간다 커뮤니티 이용 안내</Text>

        <View style={styles.benefitItem}>
          <View style={styles.benefitBullet}>
            <Text style={styles.benefitEmoji}>👩‍⚕️</Text>
          </View>
          <View style={styles.benefitTextCol}>
            <Text style={styles.benefitHeading}>간호사 정회원 (모든 게시판 이용)</Text>
            <Text style={styles.benefitBody}>
              임상/질문, 교대근무 고민, 이직/커리어, 자유게시판 등 전체 라운지 무제한 이용
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.benefitItem}>
          <View style={styles.benefitBullet}>
            <Text style={styles.benefitEmoji}>🎓</Text>
          </View>
          <View style={styles.benefitTextCol}>
            <Text style={styles.benefitHeading}>간호학생 회원 (3개 지정 게시판)</Text>
            <Text style={styles.benefitBody}>
              간호대생 라운지, 채용/취업 정보, 임상/질문 게시판 자유 이용
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.benefitItem}>
          <View style={styles.benefitBullet}>
            <Text style={styles.benefitEmoji}>🛡️</Text>
          </View>
          <View style={styles.benefitTextCol}>
            <Text style={styles.benefitHeading}>철저한 익명 및 보안 보장</Text>
            <Text style={styles.benefitBody}>
              서류 인증 완료 후 완벽하게 마스킹된 닉네임으로 안심하고 소통하세요.
            </Text>
          </View>
        </View>
      </View>

      {/* 액션 버튼 */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onPressVerify}
        activeOpacity={0.85}
      >
        <Text style={styles.actionBtnText}>{buttonText}</Text>
      </TouchableOpacity>

      <Text style={styles.footnote}>
        면허증 사본, 재직증명서, 학생증 또는 재학증명서로 간편하게 인증을 신청할 수 있습니다.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 60,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE4EA',
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  pendingCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 20,
    gap: 12,
  },
  pendingIcon: {
    fontSize: 24,
  },
  pendingTextBox: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 2,
  },
  pendingDesc: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 17,
  },
  rejectedCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
    gap: 12,
  },
  rejectedIcon: {
    fontSize: 24,
  },
  rejectedTextBox: {
    flex: 1,
  },
  rejectedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 2,
  },
  rejectedDesc: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
  },
  benefitCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 28,
  },
  benefitCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  benefitEmoji: {
    fontSize: 16,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  benefitBody: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  actionBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  footnote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
});

