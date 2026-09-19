import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { REPORT_REASONS } from '../../../mocks/communityData';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { FlagIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';

interface ReportModalProps {
  visible: boolean;
  targetId: string;
  targetType: 'post' | 'comment';
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  targetId,
  targetType,
  onClose,
}) => {
  const { reportContent } = useCommunityStore();
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);

  const handleSubmit = () => {
    reportContent(targetId, targetType, selectedReason);
    Alert.alert(
      '신고 접수 완료',
      '신고해 주신 내용이 정상적으로 접수되었습니다. 커뮤니티 가이드라인에 따라 24시간 이내에 검토 및 블라인드 처리됩니다.',
      [{ text: '확인', onPress: onClose }]
    );
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height={540}>
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

          {/* 하단 액션 버튼 */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>신고 접수하기</Text>
          </TouchableOpacity>
        </View>
    </SwipeableBottomSheet>
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
    backgroundColor: '#FFF1F4',
    borderColor: COLORS.primaryLight,
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
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  reasonText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  reasonTextSelected: {
    color: COLORS.primary,
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
});

export default ReportModal;

