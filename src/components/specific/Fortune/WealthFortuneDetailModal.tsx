import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { FortuneGauge } from './FortuneGauge';
import { FortuneUnlockView } from './FortuneUnlockView';
import { CoinsIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';
import { MOCK_WEALTH_FORTUNE } from '../../../mocks/fortuneData';
import { useFortuneStore } from '../../../store/useFortuneStore';

interface WealthFortuneDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'strategy' | 'timeline';

export const WealthFortuneDetailModal: React.FC<WealthFortuneDetailModalProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('strategy');
  const { unlockedFortunes, resetFortune } = useFortuneStore();
  const isUnlocked = unlockedFortunes.wealth;

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <CoinsIcon size={20} color="#F59E0B" />
          <View>
            <Text style={styles.headerTitle}>💰 금전운 & 사주 재테크 전략</Text>
            <Text style={styles.headerSubtitle}>
              사주 기반 재물 흐름 및 자산 포트폴리오
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isUnlocked && (
            <TouchableOpacity
              onPress={() => resetFortune('wealth')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.reanalyzeText}>재분석</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 확인하기 전: 유료화 대비 언락 프리뷰 뷰 */}
      {!isUnlocked ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <FortuneUnlockView
            fortuneType="wealth"
            title="💰 금전운 & 사주 재테크 전략"
            subtitle="사주 풀이 기반 4대 소비 성향, 간호사 맞춤형 자산 배분 포트폴리오, 재물 대운 타임라인 정밀 분석"
            icon={<CoinsIcon size={28} color="#F59E0B" />}
            previewItems={[
              '💳 사주 오행으로 분석한 나의 소비 및 저축 성향 지수',
              '🏦 3교대 야간/위험 수당 관리 최적화 자산 배분 포트폴리오',
              '📈 월별·분기별 재물 유입 및 지출 주의 타임라인',
              '💎 부동산/금융 투자 시기 및 손실 방지 풍수 솔루션',
            ]}
          />
        </ScrollView>
      ) : (
        <>
          {/* 2단 탭 네비게이션 */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'strategy' && styles.tabBtnActive]}
              onPress={() => setActiveTab('strategy')}
            >
              <Text style={[styles.tabText, activeTab === 'strategy' && styles.tabTextActive]}>
                📊 소비 성향 & 포트폴리오
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'timeline' && styles.tabBtnActive]}
              onPress={() => setActiveTab('timeline')}
            >
              <Text style={[styles.tabText, activeTab === 'timeline' && styles.tabTextActive]}>
                ⏳ 재물 대운 타임라인
              </Text>
            </TouchableOpacity>
          </View>


              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* ══════════ TAB 1: 사주 재테크 전략 & 자산 배분 ══════════ */}
            {activeTab === 'strategy' && (
              <View>
                <Text style={styles.sectionHeading}>사주 풀이로 보는 4대 소비 성향</Text>
                <View style={styles.tendencyCard}>
                  {MOCK_WEALTH_FORTUNE.wealthTendency.map((item) => (
                    <View key={item.trait} style={styles.tendencyItem}>
                      <View style={styles.tendencyHeader}>
                        <Text style={styles.tendencyTitle}>{item.trait}</Text>
                        <Text style={styles.tendencyScore}>{item.score}점</Text>
                      </View>
                      <View style={styles.tendencyTrack}>
                        <View
                          style={[
                            styles.tendencyFill,
                            {
                              width: `${item.score}%`,
                              backgroundColor: item.score >= 80 ? COLORS.primary : '#3B82F6',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.tendencyDesc}>{item.description}</Text>
                    </View>
                  ))}
                </View>

                {/* 추천 재테크 포트폴리오 표 */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  간호사 맞춤형 자산 배분 포트폴리오 표
                </Text>
                <View style={styles.portfolioCard}>
                  {/* 누적 바 그래프 */}
                  <View style={styles.portfolioBarTrack}>
                    {MOCK_WEALTH_FORTUNE.investmentPortfolio.map((item) => (
                      <View
                        key={item.asset}
                        style={{
                          flex: item.ratio,
                          backgroundColor: item.color,
                          height: '100%',
                        }}
                      />
                    ))}
                  </View>

                  <View style={styles.portfolioList}>
                    {MOCK_WEALTH_FORTUNE.investmentPortfolio.map((item) => (
                      <View key={item.asset} style={styles.portfolioRow}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <View style={styles.assetInfo}>
                          <View style={styles.assetTitleRow}>
                            <Text style={styles.assetName}>{item.asset}</Text>
                            <Text style={styles.assetRatio}>{item.ratio}%</Text>
                          </View>
                          <Text style={styles.assetRec}>{item.recommendation}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ══════════ TAB 2: 재물 대운 타임라인 ══════════ */}
            {activeTab === 'timeline' && (
              <View>
                <Text style={styles.sectionHeading}>재물 유입 & 유출 대운세 타임라인</Text>
                <FortuneGauge
                  score={92}
                  title="2026 하반기 재물 대운"
                  subtitle="상여금 및 저축성 자산의 안정적 증식기"
                  badgeLabel="재물운"
                />

                <View style={styles.timelineCard}>
                  {MOCK_WEALTH_FORTUNE.wealthTimeline.map((item) => {
                    const isIncome = item.type === '유입(입금)' || item.type === '성장';
                    return (
                      <View key={item.period} style={styles.timelineRow}>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeText,
                              { color: isIncome ? '#15803D' : '#B91C1C' },
                            ]}
                          >
                            {item.type}
                          </Text>
                        </View>

                        <View style={styles.timelineContent}>
                          <View style={styles.timelineHeader}>
                            <Text style={styles.periodText}>{item.period}</Text>
                            <Text style={styles.amountText}>{item.amount}</Text>
                          </View>
                          <Text style={styles.guideText}>{item.guide}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
            </>
          )}
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reanalyzeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  tendencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  tendencyItem: {
    gap: 4,
  },
  tendencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tendencyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tendencyScore: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  tendencyTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  tendencyFill: {
    height: '100%',
    borderRadius: 4,
  },
  tendencyDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  portfolioBarTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  portfolioList: {
    gap: 10,
  },
  portfolioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  assetInfo: {
    flex: 1,
  },
  assetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  assetRatio: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  assetRec: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  guideText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});

export default WealthFortuneDetailModal;

