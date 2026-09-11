import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useFortuneStore } from '../../store/useFortuneStore';
import {
  SAJU_CATEGORIES,
  SAJU_TOPICS,
  SajuCategoryId,
  SajuTopicItem,
} from '../../mocks/sajuCategories';
import { SajuTopicInputModal } from '../../components/specific/Fortune/SajuTopicInputModal';
import { useUserStore } from '../../store/useUserStore';
import { FREE_LIMITS } from '../../constants/membership';
import { PaywallBottomSheet } from '../../components/common/PaywallBottomSheet';
import { MembershipScreen } from '../MyPage/MembershipScreen';

type RouteParams = {
  SajuCategoryTopics: {
    categoryId: SajuCategoryId;
  };
};

export const SajuCategoryTopicsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'SajuCategoryTopics'>>();
  const categoryId = route.params?.categoryId || 'nurse';

  const category = SAJU_CATEGORIES.find((c) => c.id === categoryId) || SAJU_CATEGORIES[0];
  const topics = SAJU_TOPICS[categoryId] || [];

  const { runManseryeokAnalysis, isAnalyzingManseryeok } = useFortuneStore();

  const [selectedTopic, setSelectedTopic] = useState<SajuTopicItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  const handleSelectTopic = (topic: SajuTopicItem) => {
    const { isPremium, monthlyFortuneCount } = useUserStore.getState();
    if (!isPremium && monthlyFortuneCount >= FREE_LIMITS.maxMonthlyFortune) {
      setPaywallVisible(true);
      return;
    }
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  const handleAnalysisSubmit = async (data: any) => {
    if (!selectedTopic) return;

    const { isPremium, monthlyFortuneCount } = useUserStore.getState();
    if (!isPremium && monthlyFortuneCount >= FREE_LIMITS.maxMonthlyFortune) {
      setModalVisible(false);
      setPaywallVisible(true);
      return;
    }

    const report = await runManseryeokAnalysis(
      selectedTopic,
      data.birthInfo,
      data.partnerData
    );

    if (report) {
      if (!isPremium) {
        useUserStore.getState().incrementFortuneCount();
      }
      setModalVisible(false);
      navigation.navigate('SajuDetailResult', {
        topicId: selectedTopic.id,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 상단 네비게이션 헤더 */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{category.title}</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 카테고리 메인 히어로 배너 */}
        <View style={[styles.heroCard, { backgroundColor: category.bgLightColor, borderColor: category.themeColor }]}>
          <View style={styles.masterBadgeRow}>
            <View style={[styles.masterBadge, { backgroundColor: category.themeColor }]}>
              <Text style={styles.masterBadgeText}>50년 사주명리학 & 간호심리 명인 감정</Text>
            </View>
            <Text style={styles.topicsCountBadge}>총 {topics.length}개 주제</Text>
          </View>
          <Text style={styles.heroTitle}>{category.title} 정밀 분석</Text>
          <Text style={styles.heroDescription}>{category.description}</Text>

          <View style={styles.personaCallout}>
            <Ionicons name="sparkles" size={16} color={category.themeColor} />
            <Text style={styles.personaCalloutText}>
              만세력 절기 정본 데이터 기반 1,000자+ 심층 분석 & 현실 직언(直言) 제공
            </Text>
          </View>
        </View>

        {/* 사주 세부 주제 그리드 / 리스트 섹션 */}
        <View style={styles.topicsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>분석 주제를 선택하세요</Text>
            <Text style={styles.sectionSubtitle}>관심 있는 임상 및 인생 고민을 선택하세요</Text>
          </View>

          <View style={styles.topicList}>
            {topics.map((topic, index) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => handleSelectTopic(topic)}
                activeOpacity={0.88}
              >
                {/* 상단 배지 행 */}
                <View style={styles.topicTopRow}>
                  <View style={styles.topicLeftBadges}>
                    <View style={[styles.badgePill, { backgroundColor: topic.badgeColor }]}>
                      <Text style={styles.badgePillText}>{topic.badge}</Text>
                    </View>
                    <Text style={styles.readTimePill}>{topic.estimatedReadTime}</Text>
                  </View>
                  <Text style={styles.indexNumber}>0{index + 1}</Text>
                </View>

                {/* 타이틀 & 설명 */}
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>

                {/* 태그 리스트 */}
                <View style={styles.tagRow}>
                  {topic.tags.map((tag) => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* 액션 버튼 유도 영역 */}
                <View style={styles.cardFooter}>
                  <Text style={[styles.actionBtnText, { color: category.themeColor }]}>
                    정밀 사주 감정 받기
                  </Text>
                  <Ionicons name="arrow-forward-circle" size={20} color={category.themeColor} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 정보 입력 팝업 모달 */}
      <SajuTopicInputModal
        visible={modalVisible}
        topic={selectedTopic || undefined}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAnalysisSubmit}
        isLoading={isAnalyzingManseryeok}
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
  navHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  masterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  masterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  masterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topicsCountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 12,
  },
  personaCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  personaCalloutText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  topicsSection: {
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  topicList: {
    gap: 16,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  topicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicLeftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  readTimePill: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  indexNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D1D5DB',
  },
  topicTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  topicSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  topicDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

