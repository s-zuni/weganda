import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { FiveElementsBar } from './FiveElementsBar';
import { FortuneGauge } from './FortuneGauge';
import { FortuneUnlockView } from './FortuneUnlockView';
import { StethoscopeIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';
import {
  MOCK_FIVE_ELEMENTS,
  MOCK_WARD_RANKINGS,
  MOCK_DUTY_DIFFICULTY,
} from '../../../mocks/fortuneData';
import { useFortuneStore } from '../../../store/useFortuneStore';

interface NurseSajuDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenBirthInfo?: () => void;
}

type TabType = 'elements' | 'suitability' | 'today_duty';

export const NurseSajuDetailModal: React.FC<NurseSajuDetailModalProps> = ({
  visible,
  onClose,
  onOpenBirthInfo,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('elements');
  const { birthInfo, unlockedFortunes, resetFortune } = useFortuneStore();
  const isUnlocked = unlockedFortunes.saju;

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <StethoscopeIcon size={20} color={COLORS.primary} />
          <View>
            <Text style={styles.headerTitle}>🔮 간호 사주 & 직장 궁합</Text>
            <Text style={styles.headerSubtitle}>
              {birthInfo.birthDate || '1998-05-14'} ({birthInfo.birthTime || '오시'}) 기준
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isUnlocked && (
            <TouchableOpacity
              onPress={() => resetFortune('saju')}
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
            fortuneType="saju"
            title="🔮 간호 사주 & 직장 궁합"
            subtitle="내 사주 오행과 직장의 풍수지리적 궁합, 최적 병동 랭킹 및 오늘의 업무 난이도 정밀 분석"
            icon={<StethoscopeIcon size={28} color={COLORS.primary} />}
            previewItems={[
              '🌳 내 사주 오행(목/화/토/금/수) 밸런스 및 부족 오행 분석',
              '🏥 현재 병원 및 병동과의 풍수지리적 상생 궁합 지수',
              '🏆 임상 5대 주요 병동 적합도 랭킹 TOP 5',
              '⚡ 오늘의 3교대 업무 난이도 및 액땜 가이드',
            ]}
            onOpenBirthInfo={onOpenBirthInfo}
          />
        </ScrollView>
      ) : (
        <>
          {/* 3단 탭 네비게이션 */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'elements' && styles.tabBtnActive]}
              onPress={() => setActiveTab('elements')}
            >
              <Text style={[styles.tabText, activeTab === 'elements' && styles.tabTextActive]}>
                🌿 직장 오행 궁합
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'suitability' && styles.tabBtnActive]}
              onPress={() => setActiveTab('suitability')}
            >
              <Text style={[styles.tabText, activeTab === 'suitability' && styles.tabTextActive]}>
                🏥 간호 적합도
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'today_duty' && styles.tabBtnActive]}
              onPress={() => setActiveTab('today_duty')}
            >
              <Text style={[styles.tabText, activeTab === 'today_duty' && styles.tabTextActive]}>
                ⭐ 오늘 업무 운세
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ══════════ TAB 1: 내 직장과 나의 사주 오행 궁합 ══════════ */}
            {activeTab === 'elements' && (
              <View>
                <Text style={styles.sectionHeading}>내 사주 오행(五行) 밸런스</Text>
                <FiveElementsBar elements={MOCK_FIVE_ELEMENTS} />

                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  현재 병원과의 풍수지리 궁합
                </Text>
                <FortuneGauge
                  score={94}
                  title="서울아산병원 풍수 매칭"
                  subtitle="한강변 수(水) 기운과 화(火) 사주의 상생 조화"
                  badgeLabel="병원 궁합"
                />

                <View style={styles.analysisCard}>
                  <Text style={styles.analysisTitle}>🌿 풍수지리 오행 분석 총평</Text>
                  <Text style={styles.analysisTitle}>풍수지리 오행 분석 총평</Text>
                  <Text style={styles.analysisBody}>
                    사용자님은 따뜻한 열정과 기운을 지닌 <Text style={styles.boldPink}>화(火) 중심 사주</Text>입니다.
                    현재 병원의 풍수적 수(水) 기운이 과도한 열감을 식혀주어, 위기 상황에서도 침착하고 유연하게 대처할 수 있는 최상의 근무 환경을 만들어 줍니다.
                  </Text>
                </View>
              </View>
            )}

            {/* ══════════ TAB 2: 간호 적합도 & 추천 병동 랭킹 ══════════ */}
            {activeTab === 'suitability' && (
              <View>
                <Text style={styles.sectionHeading}>간호사 직무 종합 적합도</Text>
                <FortuneGauge
                  score={96}
                  title="임상 간호 적성 지수"
                  subtitle="환자 공감 능력 + 빠른 프로토콜 숙지 능력"
                  badgeLabel="적합도"
                />

                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  간호 진로 분야별 적합도 비교
                </Text>
                <View style={styles.careerGrid}>
                  <View style={styles.careerBarRow}>
                    <Text style={styles.careerLabel}>임상 간호사 (병원)</Text>
                    <View style={styles.careerTrack}>
                      <View style={[styles.careerFill, { width: '98%', backgroundColor: COLORS.primary }]} />
                    </View>
                    <Text style={styles.careerScore}>98%</Text>
                  </View>

                  <View style={styles.careerBarRow}>
                    <Text style={styles.careerLabel}>전담/PA 간호사</Text>
                    <View style={styles.careerTrack}>
                      <View style={[styles.careerFill, { width: '90%', backgroundColor: '#3B82F6' }]} />
                    </View>
                    <Text style={styles.careerScore}>90%</Text>
                  </View>

                  <View style={styles.careerBarRow}>
                    <Text style={styles.careerLabel}>산업/보건 관리자</Text>
                    <View style={styles.careerTrack}>
                      <View style={[styles.careerFill, { width: '82%', backgroundColor: '#10B981' }]} />
                    </View>
                    <Text style={styles.careerScore}>82%</Text>
                  </View>

                  <View style={styles.careerBarRow}>
                    <Text style={styles.careerLabel}>제약/CRO 연구원</Text>
                    <View style={styles.careerTrack}>
                      <View style={[styles.careerFill, { width: '75%', backgroundColor: '#F59E0B' }]} />
                    </View>
                    <Text style={styles.careerScore}>75%</Text>
                  </View>
                </View>

                {/* 추천 병동 순위표 */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  사주 기반 최고 궁합 병동 랭킹 표
                </Text>
                <View style={styles.tableCard}>
                  {MOCK_WARD_RANKINGS.map((item) => (
                    <View key={item.ward} style={styles.tableRow}>
                      <View style={styles.rankCircle}>
                        <Text style={styles.rankText}>{item.rank}</Text>
                      </View>
                      <View style={styles.wardInfo}>
                        <View style={styles.wardTitleRow}>
                          <Text style={styles.wardName}>{item.ward}</Text>
                          <View style={styles.wardBadge}>
                            <Text style={styles.wardBadgeText}>{item.score}점 ({item.badge})</Text>
                          </View>
                        </View>
                        <Text style={styles.wardReason}>{item.reason}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ══════════ TAB 3: 오늘의 간호 업무 운세 ══════════ */}
            {activeTab === 'today_duty' && (
              <View>
                <Text style={styles.sectionHeading}>오늘의 교대 근무 지수</Text>
                <View style={styles.difficultyGrid}>
                  {MOCK_DUTY_DIFFICULTY.map((item) => (
                    <View key={item.category} style={styles.difficultyCard}>
                      <View style={styles.diffHeaderRow}>
                        <Text style={styles.diffCategory}>{item.category}</Text>
                        <View
                          style={[
                            styles.diffBadge,
                            {
                              backgroundColor:
                                item.status === '최고'
                                  ? COLORS.primary
                                  : item.status === '좋음'
                                  ? '#10B981'
                                  : '#EF4444',
                            },
                          ]}
                        >
                          <Text style={styles.diffBadgeText}>{item.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.diffComment}>{item.comment}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.adviceBanner}>
                  <Text style={styles.adviceTitle}>오늘의 임상 처세술 조언</Text>
                  <Text style={styles.adviceText}>
                    오후 2시경 인수인계 전 중요한 약물 용량은 더블 체킹하고, 차지 선생님께 미리 브리핑하면 원활하게 정시 퇴근할 수 있습니다!
                  </Text>
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
  analysisCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analysisTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  analysisBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  boldPink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  careerGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  careerBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  careerLabel: {
    width: 95,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  careerTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  careerFill: {
    height: '100%',
    borderRadius: 4,
  },
  careerScore: {
    width: 32,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  wardInfo: {
    flex: 1,
  },
  wardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  wardName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  wardBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  wardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  wardReason: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  difficultyGrid: {
    gap: 10,
    marginBottom: 16,
  },
  difficultyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  diffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  diffCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  diffComment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  adviceBanner: {
    backgroundColor: '#FFF1F4',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});

export default NurseSajuDetailModal;

