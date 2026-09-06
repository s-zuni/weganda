import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useFortuneStore, SubFortuneType } from '../../../store/useFortuneStore';
import { SparklesIcon, LockIcon } from '../../common/Icon';

interface FortuneUnlockViewProps {
  fortuneType: SubFortuneType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  previewItems: string[];
  onOpenBirthInfo?: () => void;
}

export const FortuneUnlockView: React.FC<FortuneUnlockViewProps> = ({
  fortuneType,
  title,
  subtitle,
  icon,
  previewItems,
  onOpenBirthInfo,
}) => {
  const {
    birthInfo,
    unlockFortune,
    isGeneratingFortune,
  } = useFortuneStore();

  const isGenerating = isGeneratingFortune[fortuneType];

  const handleConfirm = () => {
    unlockFortune(fortuneType);
  };

  return (
    <View style={styles.container}>
      {/* 상단 서비스 심볼 & 타이틀 */}
      <View style={styles.topIconWrapper}>
        <View style={styles.iconCircle}>{icon}</View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* 분석 대상 사주 정보 요약 카드 */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardLabel}>사주 분석 대상</Text>
          {onOpenBirthInfo && (
            <TouchableOpacity onPress={onOpenBirthInfo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.editLink}>탄생 정보 변경 ›</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.infoValue}>
          {birthInfo.birthDate ? `${birthInfo.birthDate}` : '1998-05-14'}{' '}
          ({birthInfo.calendarType === 'lunar' ? '음력' : '양력'}){' '}
          {birthInfo.birthTime && birthInfo.birthTime !== '미상' ? `${birthInfo.birthTime}` : '시간 미상'}
          {' • '}{birthInfo.gender === 'male' ? '남성' : '여성'}
        </Text>
      </View>

      {/* 정밀 분석 보고서 항목 프리뷰 */}
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <SparklesIcon size={16} color={COLORS.primary} />
          <Text style={styles.previewTitle}>제공되는 맞춤형 정밀 리포트</Text>
        </View>

        {previewItems.map((item, idx) => (
          <View key={idx} style={styles.previewItemRow}>
            <View style={styles.lockBadge}>
              <LockIcon size={12} color={COLORS.primary} />
            </View>
            <Text style={styles.previewItemText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* 액션 버튼 / 로딩 상태 */}
      {isGenerating ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingTitle}>AI 사주 원국 및 임상 데이터 분석 중...</Text>
          <Text style={styles.loadingSub}>정밀 분석 API를 호출하여 결과를 생성하고 있습니다.</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>운세 분석 확인하기</Text>
          </TouchableOpacity>

          <Text style={styles.noticeText}>
            💡 1회 무료 분석이 제공되며, 터치 시 AI가 맞춤형 보고서를 즉시 생성합니다.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  topIconWrapper: {
    marginBottom: 14,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  editLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    gap: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  previewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  noticeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingBox: {
    width: '100%',
    backgroundColor: '#FFF9FA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4EA',
    gap: 6,
  },
  loadingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  loadingSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

export default FortuneUnlockView;

