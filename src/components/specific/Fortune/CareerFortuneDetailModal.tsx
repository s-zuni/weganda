import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { FortuneGauge } from './FortuneGauge';
import { FortuneUnlockView } from './FortuneUnlockView';
import { BriefcaseIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';
import { MOCK_CAREER_FORTUNE } from '../../../mocks/fortuneData';
import { useFortuneStore } from '../../../store/useFortuneStore';

interface CareerFortuneDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'transfer' | 'colleague';

export const CareerFortuneDetailModal: React.FC<CareerFortuneDetailModalProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('transfer');
  const { colleagueInfo, setColleagueInfo, unlockedFortunes, resetFortune } = useFortuneStore();
  const isUnlocked = unlockedFortunes.career;

  const [colleagueName, setColleagueName] = useState(colleagueInfo.name || '');
  const [colleagueDate, setColleagueDate] = useState(colleagueInfo.birthDate || '');
  const [colleagueTime, setColleagueTime] = useState(colleagueInfo.birthTime || '');

  const handleDateChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    setColleagueDate(formatted);
  };

  const handleUpdateColleague = () => {
    setColleagueInfo({
      name: colleagueName.trim(),
      birthDate: colleagueDate.trim(),
      birthTime: colleagueTime.trim(),
    });
    Alert.alert('동료 케미 분석 완료', `${colleagueName} 간호사님과의 듀티 케미가 98점으로 분석되었습니다!`);
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <BriefcaseIcon size={20} color={COLORS.primary} />
          <View>
            <Text style={styles.headerTitle}>💼 📈 직업운 & 이직·동료 케미</Text>
            <Text style={styles.headerSubtitle}>
              10년 사주 대운 및 병원 이직 타이밍 분석
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isUnlocked && (
            <TouchableOpacity
              onPress={() => resetFortune('career')}
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
            fortuneType="career"
            title="💼 📈 직업운 & 이직·동료 케미"
            subtitle="10년 사주 커리어 대운 흐름 그래프, 사주 오행 매칭 병원 추천, 동료 간호사 듀티 케미 정밀 분석"
            icon={<BriefcaseIcon size={28} color={COLORS.primary} />}
            previewItems={[
              '📈 10년 사주 커리어 대운 흐름 및 전성기 예측',
              '🏥 사주 오행 매칭 상급종합·전문병원 추천 및 타이밍 표',
              '🤝 직장 동료와의 3교대 업무 호흡 및 듀티 케미 지수',
              '🛡️ 이직·부서 이동 시 대인관계 스트레스 예방 가이드',
            ]}
          />
        </ScrollView>
      ) : (
        <>
          {/* 2단 탭 네비게이션 */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'transfer' && styles.tabBtnActive]}
              onPress={() => setActiveTab('transfer')}
            >
              <Text style={[styles.tabText, activeTab === 'transfer' && styles.tabTextActive]}>
                🚀 이직운 & 10년 대운
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'colleague' && styles.tabBtnActive]}
              onPress={() => setActiveTab('colleague')}
            >
              <Text style={[styles.tabText, activeTab === 'colleague' && styles.tabTextActive]}>
                🤝 직장 동료 듀티 케미
              </Text>
            </TouchableOpacity>
          </View>


              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ══════════ TAB 1: 이직운 & 10년 대운세 ══════════ */}
                {activeTab === 'transfer' && (
                  <View>
                    <Text style={styles.sectionHeading}>10년 사주 커리어 대운 흐름 그래프</Text>
                    
                    {/* 10년 대운 막대/지수 그래프 */}
                    <View style={styles.chartCard}>
                      <View style={styles.barChartRow}>
                        {MOCK_CAREER_FORTUNE.tenYearGreatFlow.map((item) => {
                          const isPeak = item.score >= 90;
                          return (
                            <View key={item.year} style={styles.chartCol}>
                              <Text style={[styles.chartScoreText, isPeak && styles.peakText]}>
                                {item.score}
                              </Text>
                              <View style={styles.chartTrack}>
                                <View
                                  style={[
                                    styles.chartBar,
                                    {
                                      height: `${item.score}%`,
                                      backgroundColor: isPeak ? COLORS.primary : '#9CA3AF',
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={[styles.chartYearText, isPeak && styles.peakYear]}>
                                {item.year}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <View style={styles.chartFooter}>
                        <Text style={styles.peakNotice}>
                          [핵심 안내] <Text style={styles.boldPink}>2026년~2027년</Text>은 직무 전문성과 상급종합 이직운이 정점에 달하는 황금기입니다!
                        </Text>
                      </View>
                    </View>


                {/* 추천 이직 병원 및 타이밍 표 */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  사주 오행 매칭 추천 이직 병원 표
                </Text>
                <View style={styles.tableCard}>
                  {MOCK_CAREER_FORTUNE.transferHospitals.map((item) => (
                    <View key={item.hospital} style={styles.tableRow}>
                      <View style={styles.hospitalHeader}>
                        <Text style={styles.hospitalName}>{item.hospital}</Text>
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchBadgeText}>{item.matchScore}점 ({item.timing})</Text>
                        </View>
                      </View>
                      <Text style={styles.advantageText}>{item.advantage}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ══════════ TAB 2: 직장 동료 듀티 케미 ══════════ */}
            {activeTab === 'colleague' && (
              <View>
                {/* 동료 정보 입력 폼 */}
                <View style={styles.inputCard}>
                  <Text style={styles.inputCardTitle}>직장 동료 사주 정보 입력</Text>
                  
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>동료 이름</Text>
                      <TextInput
                        style={styles.input}
                        value={colleagueName}
                        onChangeText={setColleagueName}
                        placeholder="예: 동료 간호사 이름"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1.2 }]}>
                      <Text style={styles.inputLabel}>생년월일</Text>
                      <TextInput
                        style={styles.input}
                        value={colleagueDate}
                        onChangeText={handleDateChange}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 0.8 }]}>
                      <Text style={styles.inputLabel}>태어난 시간</Text>
                      <TextInput
                        style={styles.input}
                        value={colleagueTime}
                        onChangeText={setColleagueTime}
                        placeholder="HH:mm"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.calcBtn} onPress={handleUpdateColleague} activeOpacity={0.85}>
                    <Text style={styles.calcBtnText}>듀티 케미 분석하기</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeading}>등록된 동료와의 듀티 케미 분석</Text>
                <FortuneGauge
                  score={colleagueName.trim() ? 98 : 85}
                  title={`${colleagueName.trim() || '동료'} 간호사와의 콤비 지수`}
                  subtitle={
                    colleagueName.trim()
                      ? '처치 합이 잘 맞고 인수인계 오류 0%의 찰떡 궁합'
                      : '동료 정보를 입력하여 정밀 사주 듀티 케미를 확인해보세요'
                  }
                  badgeLabel="듀티 케미"
                />

                <View style={styles.colleagueList}>
                  {MOCK_CAREER_FORTUNE.colleagueChemistry.map((item) => (
                    <View key={item.name} style={styles.colleagueCard}>
                      <View style={styles.colleagueHeader}>
                        <View style={styles.colleagueInfo}>
                          <Text style={styles.colleagueNameText}>{item.name}</Text>
                          <Text style={styles.colleagueRoleText}>{item.dutyRole}</Text>
                        </View>
                        <View style={styles.chemScoreBadge}>
                          <Text style={styles.chemScoreText}>{item.chemistryScore}점</Text>
                        </View>
                      </View>
                      <Text style={styles.colleagueComment}>{item.comment}</Text>
                    </View>
                  ))}
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
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    paddingBottom: 4,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartScoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  peakText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  chartTrack: {
    width: 20,
    height: 90,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
  },
  chartYearText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 6,
  },
  peakYear: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  chartFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  peakNotice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  boldPink: {
    color: COLORS.primary,
    fontWeight: '700',
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  matchBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  advantageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  inputCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  inputCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  calcBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  calcBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  colleagueList: {
    gap: 10,
    marginTop: 10,
  },
  colleagueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colleagueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  colleagueInfo: {
    gap: 2,
  },
  colleagueNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  colleagueRoleText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  chemScoreBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chemScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  colleagueComment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default CareerFortuneDetailModal;

