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
import { HeartIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';
import { SajuBirthPicker } from './SajuBirthPicker';
import { MOCK_LOVE_FORTUNE } from '../../../mocks/fortuneData';
import { useFortuneStore } from '../../../store/useFortuneStore';

interface LoveFortuneDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'couple' | 'crush' | 'marriage';

export const LoveFortuneDetailModal: React.FC<LoveFortuneDetailModalProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('couple');
  const { partnerInfo, setPartnerInfo, unlockedFortunes, resetFortune } = useFortuneStore();
  const isUnlocked = unlockedFortunes.love;

  const [partnerDate, setPartnerDate] = useState(partnerInfo.birthDate || '1996-11-20');
  const [partnerTime, setPartnerTime] = useState(partnerInfo.birthTime || '08:15');
  const [partnerMbti, setPartnerMbti] = useState(partnerInfo.mbti || 'ISTJ');
  const [showDetailPicker, setShowDetailPicker] = useState(false);
  const [partnerCalendarType, setPartnerCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [partnerGender, setPartnerGender] = useState<'female' | 'male'>('male');

  const handleDateChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    setPartnerDate(formatted);
  };

  const handleUpdatePartner = () => {
    setPartnerInfo({
      birthDate: partnerDate.trim(),
      birthTime: partnerTime.trim(),
      mbti: partnerMbti.trim().toUpperCase(),
    });
    Alert.alert('궁합 계산 완료', `${partnerMbti.toUpperCase()} 상대방과의 사주&MBTI 궁합이 갱신되었습니다!`);
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <HeartIcon size={20} color="#E11D48" />
          <View>
            <Text style={styles.headerTitle}>💖 애정운 & 사주·MBTI 궁합</Text>
            <Text style={styles.headerSubtitle}>
              사주 연애운 타임라인 및 MBTI 이상형 매칭
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isUnlocked && (
            <TouchableOpacity
              onPress={() => resetFortune('love')}
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

      {/* 미열람 잠금 오버레이 / 언락 화면 */}
      {!isUnlocked ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <FortuneUnlockView
            fortuneType="love"
            title="💖 애정운 & 사주·MBTI 궁합"
            subtitle="연인·짝사랑 사주 궁합, MBTI 성격 케미스트리 및 3교대 데이트 가이드 정밀 분석"
            icon={<HeartIcon size={28} color="#E11D48" />}
            previewItems={[
              '💞 상대방과의 사주 오행 상생 궁합 지수 및 인연도',
              '⏰ 간호사 3교대 패턴을 배려하는 데이트 타이밍 가이드',
              '🧩 MBTI 성격 유형별 소통 노하우 및 갈등 완화 솔루션',
              '💍 결혼 궁합 지수 및 현실적 주의점 체크리스트',
            ]}
          />
        </ScrollView>
      ) : (
        <>
          {/* 3단 탭 네비게이션 */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'couple' && styles.tabBtnActive]}
              onPress={() => setActiveTab('couple')}
            >
              <Text style={[styles.tabText, activeTab === 'couple' && styles.tabTextActive]}>
                💑 애인 & MBTI 궁합
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'crush' && styles.tabBtnActive]}
              onPress={() => setActiveTab('crush')}
            >
              <Text style={[styles.tabText, activeTab === 'crush' && styles.tabTextActive]}>
                💌 짝사랑 공략
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'marriage' && styles.tabBtnActive]}
              onPress={() => setActiveTab('marriage')}
            >
              <Text style={[styles.tabText, activeTab === 'marriage' && styles.tabTextActive]}>
                💍 결혼 궁합
              </Text>
            </TouchableOpacity>
          </View>


          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ══════════ TAB 1: 애인과의 사주 & MBTI 궁합 ══════════ */}
            {activeTab === 'couple' && (
              <View>
                {/* 상대방 정보 입력 폼 */}
                <View style={styles.inputCard}>
                  <View style={styles.inputCardHeader}>
                    <Text style={styles.inputCardTitle}>상대방 사주 & MBTI 입력</Text>
                    <TouchableOpacity
                      style={styles.pickerToggleBtn}
                      onPress={() => setShowDetailPicker(!showDetailPicker)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerToggleText}>
                        {showDetailPicker ? '간편 입력' : '📅 달력·12시진 선택'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showDetailPicker ? (
                    <View style={{ marginBottom: 12 }}>
                      <SajuBirthPicker
                        title="상대방 탄생일시 (달력/시진)"
                        birthDate={partnerDate}
                        birthTime={partnerTime}
                        calendarType={partnerCalendarType}
                        gender={partnerGender}
                        onDateChange={setPartnerDate}
                        onTimeChange={setPartnerTime}
                        onCalendarTypeChange={setPartnerCalendarType}
                        onGenderChange={setPartnerGender}
                        accentColor="#E11D48"
                      />
                      <View style={[styles.inputGroup, { marginTop: 12 }]}>
                        <Text style={styles.inputLabel}>상대방 MBTI (4글자)</Text>
                        <TextInput
                          style={styles.input}
                          value={partnerMbti}
                          onChangeText={setPartnerMbti}
                          placeholder="ISTJ"
                          placeholderTextColor={COLORS.textMuted}
                          maxLength={4}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.rowInputs}>
                      <View style={[styles.inputGroup, { flex: 1.2 }]}>
                        <Text style={styles.inputLabel}>생년월일</Text>
                        <TextInput
                          style={styles.input}
                          value={partnerDate}
                          onChangeText={handleDateChange}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={COLORS.textMuted}
                          keyboardType="numeric"
                          maxLength={10}
                        />
                      </View>

                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>태어난 시간</Text>
                        <TextInput
                          style={styles.input}
                          value={partnerTime}
                          onChangeText={setPartnerTime}
                          placeholder="HH:mm"
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>

                      <View style={[styles.inputGroup, { flex: 0.8 }]}>
                        <Text style={styles.inputLabel}>MBTI</Text>
                        <TextInput
                          style={styles.input}
                          value={partnerMbti}
                          onChangeText={setPartnerMbti}
                          placeholder="ISTJ"
                          placeholderTextColor={COLORS.textMuted}
                          maxLength={4}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>
                  )}

                  <TouchableOpacity style={styles.calcBtn} onPress={handleUpdatePartner} activeOpacity={0.85}>
                    <Text style={styles.calcBtnText}>궁합 다시 분석하기</Text>
                  </TouchableOpacity>
                </View>

                {/* 궁합 점수 게이지 */}
                <Text style={styles.sectionHeading}>사주 궁합 점수</Text>
                <FortuneGauge
                  score={MOCK_LOVE_FORTUNE.coupleScore}
                  title="천생연분 상생 지수"
                  subtitle="서로의 사주 오행이 조화롭게 결합된 궁합"
                  badgeLabel="애정 지수"
                />

                {/* MBTI 성격 솔루션 카드 */}
                <View style={styles.mbtiCard}>
                  <View style={styles.mbtiHeaderRow}>
                    <Text style={styles.mbtiTitle}>🧩 MBTI 성격 케미 & 처방전</Text>
                    <Text style={styles.mbtiTitle}>MBTI 성격 케미 & 처방전</Text>
                    <View style={styles.mbtiBadge}>
                      <Text style={styles.mbtiBadgeText}>{MOCK_LOVE_FORTUNE.mbtiSolution.chemistry}</Text>
                    </View>
                  </View>
                  <Text style={styles.mbtiSolutionText}>
                    {MOCK_LOVE_FORTUNE.mbtiSolution.solution}
                  </Text>
                </View>

                {/* 사주 오행 총평 */}
                <View style={styles.quoteCard}>
                  <Text style={styles.quoteTitle}>📜 사주 명리학 풀이</Text>
                  <Text style={styles.quoteTitle}>사주 명리학 풀이</Text>
                  <Text style={styles.quoteBody}>{MOCK_LOVE_FORTUNE.sajuCompatibility}</Text>
                </View>
              </View>
            )}

            {/* ══════════ TAB 2: 짝사랑 궁합 & 공략 타임라인 ══════════ */}
            {activeTab === 'crush' && (
              <View>
                <Text style={styles.sectionHeading}>짝사랑 호감도 지수</Text>
                <FortuneGauge
                  score={88}
                  title="상대방의 무의식적 호감도"
                  subtitle="친절하고 전문적인 간호사 이미지에 큰 매력을 느낌"
                  badgeLabel="호감도"
                  color="#FF507C"
                />

                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  공략 전략 & 고백 최적기 타임라인
                </Text>
                <View style={styles.timelineCard}>
                  {MOCK_LOVE_FORTUNE.crushTimeline.map((item, idx) => (
                    <View key={item.timing} style={styles.timelineItem}>
                      <View style={styles.timelineNodeCol}>
                        <View style={styles.timelineDot} />
                        {idx < MOCK_LOVE_FORTUNE.crushTimeline.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeaderRow}>
                          <Text style={styles.timelineTiming}>{item.timing}</Text>
                          <Text style={styles.timelineAction}>{item.action}</Text>
                        </View>
                        <Text style={styles.timelineStrategy}>{item.strategy}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ══════════ TAB 3: 결혼 궁합 분석 ══════════ */}
            {activeTab === 'marriage' && (
              <View>
                <Text style={styles.sectionHeading}>평생 동반자 궁합</Text>
                <FortuneGauge
                  score={MOCK_LOVE_FORTUNE.marriageAdvice.score}
                  title="결혼 적합도 & 가정 안정 지수"
                  subtitle="경제적 안정과 상호 배려가 돋보이는 결합"
                  badgeLabel="결혼 지수"
                />

                {/* 장점 표 */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  🌟 결혼 시 기대되는 장점 (Pros)
                </Text>
                <View style={styles.prosCard}>
                  {MOCK_LOVE_FORTUNE.marriageAdvice.pros.map((pro, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>✓</Text>
                      <Text style={styles.bulletText}>{pro}</Text>
                    </View>
                  ))}
                </View>

                {/* 주의점 표 */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  ⚠️ 주의해야 할 현실적 요소 (Cautions)
                </Text>
                <View style={styles.cautionsCard}>
                  {MOCK_LOVE_FORTUNE.marriageAdvice.cautions.map((caution, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.cautionDot}>!</Text>
                      <Text style={styles.bulletText}>{caution}</Text>
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
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerToggleBtn: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pickerToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
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
  mbtiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  mbtiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mbtiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mbtiBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mbtiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mbtiSolutionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  quoteCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  quoteBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineNodeCol: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timelineTiming: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timelineAction: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timelineStrategy: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  prosCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 8,
  },
  cautionsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },
  cautionDot: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});

export default LoveFortuneDetailModal;

