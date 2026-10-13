import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, NEUTRAL, TINT_COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';
import { REPORT_REASONS } from '../../../mocks/communityData';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { FlagIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';

interface ReportModalProps {
  visible: boolean;
  targetId: string;
  targetType: 'post' | 'comment';
  /** 댓글 신고 시 해당 댓글이 속한 게시글 ID (신고 즉시 댓글을 숨기기 위함) */
  parentPostId?: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  targetId,
  targetType,
  parentPostId,
  onClose,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { reportContent, hidePost, hideComment } = useCommunityStore();
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);

  const handleSubmit = () => {
    reportContent(targetId, targetType, selectedReason);
    if (targetType === 'post') {
      hidePost(targetId);
    } else if (parentPostId) {
      hideComment(parentPostId, targetId);
    }
    Alert.alert(
      '신고 접수 및 즉시 숨김 완료',
      '신고가 정상 접수되었습니다. 해당 콘텐츠는 즉시 피드에서 제외되었으며, 운영팀이 24시간 이내에 검토하여 유해 콘텐츠 영구 삭제 및 작성자 계정 강제 퇴출(Ejection) 조치를 완료합니다.\n\n운영팀 직통 이메일: buiszuni@gmail.com',
      [{ text: '확인', onPress: onClose }]
    );
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height={600}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <FlagIcon size={20} color="#E11D48" />
              <Text style={styles.headerTitle}>
                {targetType === 'post' ? '게시글 신고' : '댓글 신고'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subGuide}>
            건전하고 안전한 간호사 커뮤니티 조성을 위해 사유를 선택해 주세요.
          </Text>

          {/* 사유 라디오 리스트 */}
          <View style={styles.reasonList}>
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 24시간 내 신속 처리 SLA 및 직통 신고 연락처 안내 (Guideline 1.2 준수) */}
          <View style={styles.slaBanner}>
            <Text style={styles.slaTitle}>🛡️ 24시간 이내 조치 원칙 & 직통 문의처</Text>
            <Text style={styles.slaText}>
              접수된 신고는 24시간 이내에 운영팀이 직접 검토하여 유해 콘텐츠 영구 삭제 및 가해 이용자 강제 퇴출(Ejection)을 집행합니다.
            </Text>
            <Text style={styles.slaContact}>직통 이메일 문의/신고: buiszuni@gmail.com</Text>
          </View>

          {/* 하단 액션 버튼 */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>신고 접수 및 즉시 숨기기</Text>
          </TouchableOpacity>
        </View>
    </SwipeableBottomSheet>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  subGuide: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  reasonList: {
    gap: 10,
    marginBottom: 24,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  reasonRowSelected: {
    backgroundColor: theme.primaryTint,
    borderColor: theme.primaryLight,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
  },
  reasonText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  reasonTextSelected: {
    color: theme.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  slaBanner: {
    backgroundColor: TINT_COLORS.redTint,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: TINT_COLORS.redTintBorder,
    marginTop: 8,
    marginBottom: 14,
  },
  slaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.primary,
    marginBottom: 2,
  },
  slaText: {
    fontSize: 11,
    color: NEUTRAL.gray700,
    lineHeight: 16,
    marginBottom: 4,
  },
  slaContact: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
  },
});

export default ReportModal;

