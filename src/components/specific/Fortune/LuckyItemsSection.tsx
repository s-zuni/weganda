import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

interface LuckyItemsSectionProps {
  color?: string;
  number?: number;
  direction?: string;
  item?: string;
  isLoading?: boolean;
  onAnalyze?: () => void;
}

const extractColorHex = (colorStr: string): string => {
  const hexMatch = colorStr.match(/#([A-Fa-f0-9]{6})/);
  if (hexMatch) return hexMatch[0];
  if (colorStr.includes('핑크')) return '#FF507C';
  if (colorStr.includes('그린') || colorStr.includes('초록') || colorStr.includes('에메랄드')) return '#10B981';
  if (colorStr.includes('블루') || colorStr.includes('파랑') || colorStr.includes('네이비')) return '#3B82F6';
  if (colorStr.includes('옐로우') || colorStr.includes('노랑') || colorStr.includes('골드')) return '#F59E0B';
  if (colorStr.includes('퍼플') || colorStr.includes('보라') || colorStr.includes('라벤더')) return '#8B5CF6';
  if (colorStr.includes('베이지')) return '#D97706';
  return '#FF507C';
};

export const LuckyItemsSection: React.FC<LuckyItemsSectionProps> = ({
  color = '비바 코랄 핑크 (#FF507C)',
  number = 7,
  direction = '스테이션 동쪽 (목(木) 생기 방위)',
  item,
  isLoading = false,
  onAnalyze,
}) => {
  const dotColor = extractColorHex(color);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>🍀 오늘의 행운</Text>
          <Text style={styles.sectionSubtitle}>매일 갱신되는 3대 행운 지표</Text>
        </View>

        {onAnalyze && (
          <TouchableOpacity
            style={[styles.headerAnalyzeBtn, isLoading && styles.btnDisabled]}
            onPress={onAnalyze}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                <Text style={styles.headerAnalyzeBtnText}>오늘 분석하기</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.luckyCard}>
        {/* 행운 컬러 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <Text style={styles.luckyLabel}>🎨 행운의 컬러</Text>
          </View>
          <View style={styles.luckyRight}>
            <View style={[styles.colorDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.luckyValue, { color: dotColor }]}>{color}</Text>
          </View>
        </View>

        <View style={styles.luckyDivider} />

        {/* 행운 숫자 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <Text style={styles.luckyLabel}>🔢 행운의 숫자</Text>
          </View>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{number}</Text>
          </View>
        </View>

        <View style={styles.luckyDivider} />

        {/* 행운 방향 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <Text style={styles.luckyLabel}>🧭 행운의 방향</Text>
          </View>
          <Text style={styles.luckyValueText}>{direction}</Text>
        </View>

        {/* 행운 아이템 (존재 시 노출) */}
        {item && (
          <>
            <View style={styles.luckyDivider} />
            <View style={styles.luckyRow}>
              <View style={styles.luckyLeft}>
                <Text style={styles.luckyLabel}>🎁 행운의 아이템</Text>
              </View>
              <Text style={styles.luckyItemText}>{item}</Text>
            </View>
          </>
        )}

        {/* 카드 하단 신규 분석하기 액션 버튼 */}
        {onAnalyze && (
          <>
            <View style={styles.luckyDivider} />
            <TouchableOpacity
              style={[styles.cardActionBtn, isLoading && styles.cardActionBtnDisabled]}
              onPress={onAnalyze}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.btnContentRow}>
                  <ActivityIndicator size="small" color="#FF507C" />
                  <Text style={styles.cardActionLoadingText}>오늘의 행운 기운을 분석하는 중...</Text>
                </View>
              ) : (
                <View style={styles.btnContentRow}>
                  <Ionicons name="refresh" size={15} color="#FF507C" />
                  <Text style={styles.cardActionBtnText}>오늘의 행운 새로고침 & 분석하기</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  headerAnalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF507C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  headerAnalyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.65,
  },
  luckyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  luckyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  luckyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  luckyLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  luckyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  luckyValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  numberBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  numberBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF507C',
  },
  luckyValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  luckyItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  luckyDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  cardActionBtn: {
    backgroundColor: '#FFF1F4',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E8',
    marginTop: 2,
  },
  cardActionBtnDisabled: {
    opacity: 0.65,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF507C',
  },
  cardActionLoadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF507C',
  },
});
