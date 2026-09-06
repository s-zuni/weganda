import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import {
  StethoscopeIcon,
  HeartIcon,
  BriefcaseIcon,
  CoinsIcon,
  PaletteIcon,
  HashIcon,
  CompassIcon,
  LeafIcon,
  SparklesIcon,
} from '../../components/common/Icon';
import { COLORS } from '../../constants/theme';
import { useFortuneStore } from '../../store/useFortuneStore';

// 분리된 서브 모달 컴포넌트들 (직접 임포트로 번들러 미정의 방지)
import { BirthInfoModal } from '../../components/specific/Fortune/BirthInfoModal';
import { NurseSajuDetailModal } from '../../components/specific/Fortune/NurseSajuDetailModal';
import { LoveFortuneDetailModal } from '../../components/specific/Fortune/LoveFortuneDetailModal';
import { CareerFortuneDetailModal } from '../../components/specific/Fortune/CareerFortuneDetailModal';
import { WealthFortuneDetailModal } from '../../components/specific/Fortune/WealthFortuneDetailModal';

export const FortuneScreen: React.FC = () => {
  const { birthInfo, currentFortune, isLoading, fetchAiFortune } = useFortuneStore();

  // 오늘 날짜 동적 계산
  const today = new Date();
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedToday = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()} (${daysOfWeek[today.getDay()]})`;

  useEffect(() => {
    if (birthInfo.isRegistered && !currentFortune) {
      fetchAiFortune('daily');
    }
  }, [birthInfo.isRegistered, currentFortune, fetchAiFortune]);

  // 모달 상태 관리
  const [birthModalVisible, setBirthModalVisible] = useState(false);
  const [nurseModalVisible, setNurseModalVisible] = useState(false);
  const [loveModalVisible, setLoveModalVisible] = useState(false);
  const [careerModalVisible, setCareerModalVisible] = useState(false);
  const [wealthModalVisible, setWealthModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 사주 탄생 정보 배너 (Top Birth Info Banner) ── */}
        <TouchableOpacity
          style={styles.birthBanner}
          onPress={() => setBirthModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.birthBannerLeft}>
            <View style={styles.birthIconDot}>
              <SparklesIcon size={18} color={COLORS.primary} />
            </View>
            <View style={styles.birthInfoTexts}>
              <Text style={styles.birthBannerTitle}>
                {birthInfo.isRegistered && birthInfo.birthDate
                  ? `${birthInfo.birthDate} (${birthInfo.calendarType === 'solar' ? '양력' : '음력'} ${birthInfo.birthTime || '시간 미상'})`
                  : '사주 탄생 정보를 입력해주세요'}
              </Text>
              <Text style={styles.birthBannerSub}>
                {birthInfo.isRegistered
                  ? '사주 탄생 정보 등록됨 (오행·대운 정밀 분석 적용)'
                  : '생년월일시를 등록하면 정확한 AI 맞춤 운세를 분석해드려요'}
              </Text>
            </View>
          </View>
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>
              {birthInfo.isRegistered ? '수정 ›' : '등록 ›'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── 메인 운세 카드 (Hero Fortune Card) ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroDateCol}>
              <Text style={styles.heroDate}>{formattedToday}</Text>
              <Text style={styles.heroHeading}>오늘의 행운 지수</Text>
            </View>
            <TouchableOpacity
              style={styles.scoreCircle}
              onPress={() => fetchAiFortune('daily')}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Text style={styles.scoreNumber}>{currentFortune?.overallScore ?? 92}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.heroQuoteContainer}>
            <Text style={styles.heroQuote}>
              {currentFortune?.title ? `"${currentFortune.title}"` : '"오늘은 새로운 시작을 알리는 날이에요"'}
            </Text>
            <Text style={styles.heroDescription}>
              {currentFortune?.fortuneText ||
                '동료와의 협력이 빛을 발하는 하루입니다. 오후 근무 중 예상치 못한 긍정적인 소식이 있을 수 있어요.'}
            </Text>
          </View>
        </View>

        {/* ── 4대 세부 운세 섹션 (Sub Fortune 2x2 Grid) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>4대 맞춤형 정밀 세부 운세</Text>
          <Text style={styles.sectionHint}>터치하여 그래프·표 분석 확인</Text>
        </View>

        <View style={styles.subFortuneGrid}>
          {/* 1. 간호 사주 (내 직장 오행 궁합 & 적합도) */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={() => setNurseModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF1F4' }]}>
                <StethoscopeIcon size={20} color={COLORS.primary} />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#FFF1F4' }]}>
                <Text style={[styles.subBadgeText, { color: COLORS.primary }]}>궁합 94점</Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>간호 사주</Text>
            <Text style={styles.subCardDesc}>내 직장 오행 궁합 · 간호 적합도 · 병동 랭킹</Text>
          </TouchableOpacity>

          {/* 2. 애정운 (애인 & 짝사랑 & 결혼) */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={() => setLoveModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <HeartIcon size={18} color="#E11D48" />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.subBadgeText, { color: '#E11D48' }]}>MBTI 케미</Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>애정운</Text>
            <Text style={styles.subCardDesc}>애인 사주 궁합 · MBTI 성격 솔루션 · 짝사랑</Text>
          </TouchableOpacity>

          {/* 3. 직업운 (이직운 & 10년 대운 & 동료) */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={() => setCareerModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                <BriefcaseIcon size={18} color="#2563EB" />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.subBadgeText, { color: '#2563EB' }]}>대운 상승</Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>직업운</Text>
            <Text style={styles.subCardDesc}>10년 대운세 그래프 · 추천 이직 병원 · 동료 케미</Text>
          </TouchableOpacity>

          {/* 4. 금전운 (소비 성향 & 재물 대운) */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={() => setWealthModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <CoinsIcon size={18} color="#D97706" />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.subBadgeText, { color: '#D97706' }]}>재물 유입</Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>금전운</Text>
            <Text style={styles.subCardDesc}>사주 재테크 전략 · 자산 배분 표 · 재물 타임라인</Text>
          </TouchableOpacity>
        </View>

        {/* ── 오늘의 행운 (Lucky Info List) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 행운</Text>
        </View>
        <View style={styles.luckyCard}>
          {/* 행운 컬러 */}
          <View style={styles.luckyRow}>
            <View style={styles.luckyLeft}>
              <View style={styles.luckyIconWrapper}>
                <PaletteIcon size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.luckyLabel}>행운의 컬러</Text>
            </View>
            <View style={styles.luckyRight}>
              <View style={styles.colorDot} />
              <Text style={styles.luckyValue}>{currentFortune?.lucky?.color || '우간다 핑크'}</Text>
            </View>
          </View>

          <View style={styles.luckyDivider} />

          {/* 행운 숫자 */}
          <View style={styles.luckyRow}>
            <View style={styles.luckyLeft}>
              <View style={styles.luckyIconWrapper}>
                <HashIcon size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.luckyLabel}>행운의 숫자</Text>
            </View>
            <Text style={styles.luckyValueText}>{currentFortune?.lucky?.number ?? 7}</Text>
          </View>

          <View style={styles.luckyDivider} />

          {/* 행운 방향 */}
          <View style={styles.luckyRow}>
            <View style={styles.luckyLeft}>
              <View style={styles.luckyIconWrapper}>
                <CompassIcon size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.luckyLabel}>행운의 방향</Text>
            </View>
            <Text style={styles.luckyValueText}>{currentFortune?.lucky?.direction || '동쪽 (화(火) 기운)'}</Text>
          </View>
        </View>

        {/* ── 오늘의 조언 (Advice Card) ── */}
        <View style={styles.adviceCard}>
          <View style={styles.adviceIconWrapper}>
            <LeafIcon size={20} color={COLORS.primary} />
          </View>
          <View style={styles.adviceContent}>
            <Text style={styles.adviceTitle}>오늘의 조언</Text>
            <Text style={styles.adviceDesc}>
              {currentFortune?.advice
                ? `"${currentFortune.advice}"`
                : '"오늘 하루, 나 자신에게 \'수고했어\'라고 먼저 말해주세요. 작은 친절 하나가 병동 전체를 따뜻하게 만듭니다."'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── 5대 디테일 모달 컴포넌트 ── */}
      <BirthInfoModal
        visible={birthModalVisible}
        onClose={() => setBirthModalVisible(false)}
      />

      <NurseSajuDetailModal
        visible={nurseModalVisible}
        onClose={() => setNurseModalVisible(false)}
        onOpenBirthInfo={() => {
          setNurseModalVisible(false);
          setBirthModalVisible(true);
        }}
      />

      <LoveFortuneDetailModal
        visible={loveModalVisible}
        onClose={() => setLoveModalVisible(false)}
      />

      <CareerFortuneDetailModal
        visible={careerModalVisible}
        onClose={() => setCareerModalVisible(false)}
      />

      <WealthFortuneDetailModal
        visible={wealthModalVisible}
        onClose={() => setWealthModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },

  // BIRTH BANNER
  birthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F4',
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  birthBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  birthIconDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthInfoTexts: {
    flex: 1,
  },
  birthBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  birthBannerSub: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  editBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  editBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // HERO CARD (Main Fortune Card)
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroDateCol: {
    flex: 1,
  },
  heroDate: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroHeading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreNumber: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroQuoteContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  heroQuote: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // 4 SUB FORTUNE 2x2 GRID
  subFortuneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  subCard: {
    width: '48%',
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
    minHeight: 128,
    justifyContent: 'space-between',
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  subCardDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },

  // LUCKY INFO CARD
  luckyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  luckyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  luckyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  luckyIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  luckyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  luckyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  luckyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  luckyValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  luckyDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // ADVICE CARD
  adviceCard: {
    backgroundColor: '#FFF1F4',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  adviceIconWrapper: {
    marginTop: 2,
  },
  adviceContent: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  adviceDesc: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});

export default FortuneScreen;
