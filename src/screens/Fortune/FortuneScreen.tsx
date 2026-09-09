import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/common/AppHeader';
import { useFortuneStore } from '../../store/useFortuneStore';
import { useUserStore } from '../../store/useUserStore';

// 분리된 서브 모달 및 컴포넌트들
import {
  BirthInfoModal,
  NurseSajuDetailModal,
  LoveFortuneDetailModal,
  CareerFortuneDetailModal,
  WealthFortuneDetailModal,
  BirthInfoBanner,
  HeroFortuneCard,
  ThemeFortuneGrid,
  LuckyItemsSection,
  AdviceCard,
  DailyDutyFortuneCard,
  DailyDutyMateChemistryCard,
} from '../../components/specific/Fortune';

import { PaywallBottomSheet } from '../../components/common/PaywallBottomSheet';
import { MembershipScreen } from '../MyPage/MembershipScreen';
import { SajuCategoryId } from '../../mocks/sajuCategories';

export const FortuneScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { birthInfo, currentFortune, isLoading, fetchAiFortune, setSelectedCategory } =
    useFortuneStore();
  const { isPremium, monthlyFortuneCount, incrementFortuneCount } = useUserStore();

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

  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 사주 탄생 정보 배너 */}
        <BirthInfoBanner
          birthInfo={birthInfo}
          onPress={() => setBirthModalVisible(true)}
        />

        {/* 1. 오늘의 듀티 운세 & 3대 바이오리듬 카드 (최상단 배치) */}
        <DailyDutyFortuneCard
          onPressDetail={() => {
            setSelectedCategory('nurse');
            navigation.navigate('SajuCategoryTopics', { categoryId: 'nurse' });
          }}
        />

        {/* 2. 오늘의 듀티 메이트 궁합 카드 (최상단 배치) */}
        <DailyDutyMateChemistryCard
          onPressFullSaju={() => {
            setSelectedCategory('chemistry');
            navigation.navigate('SajuCategoryTopics', { categoryId: 'chemistry' });
          }}
        />

        {/* 3. 종합 일일 운세 카드 */}
        <HeroFortuneCard
          formattedToday={formattedToday}
          overallScore={currentFortune?.overallScore ?? 92}
          title={currentFortune?.title}
          description={currentFortune?.fortuneText}
          isLoading={isLoading}
          onRefresh={() => fetchAiFortune('daily')}
        />

        {/* 50년 명인 5대 사주 카테고리 섹션 */}
        <ThemeFortuneGrid
          isPremium={isPremium}
          monthlyFortuneCount={monthlyFortuneCount}
          onSelectCategory={(categoryId: SajuCategoryId) => {
            setSelectedCategory(categoryId);
            navigation.navigate('SajuCategoryTopics', { categoryId });
          }}
          onOpenPaywall={() => setPaywallVisible(true)}
        />

        {/* 오늘의 행운 (컬러, 숫자, 방향) */}
        <LuckyItemsSection
          color={currentFortune?.lucky?.color}
          number={currentFortune?.lucky?.number}
          direction={currentFortune?.lucky?.direction}
        />

        {/* 오늘의 조언 */}
        <AdviceCard advice={currentFortune?.advice} />
      </ScrollView>

      {/* 5대 디테일 모달 컴포넌트 */}
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

      <PaywallBottomSheet
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSubscribe={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        onLearnMore={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        featureTitle="사주 서비스"
        featureDescription="매달 횟수 제한 없이 간호 운세와 정밀 사주를 확인하세요"
      />

      <MembershipScreen
        visible={membershipVisible}
        onClose={() => setMembershipVisible(false)}
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
});

export default FortuneScreen;
