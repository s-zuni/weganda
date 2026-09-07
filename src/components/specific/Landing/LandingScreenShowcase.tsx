import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

type TabKey = 'home' | 'study' | 'community' | 'fortune' | 'friends';

interface TabMeta {
  key: TabKey;
  label: string;
  icon: string;
  badge: string;
  title: string;
  desc: string;
  bullets: string[];
}

const TABS: TabMeta[] = [
  {
    key: 'home',
    label: '스마트 듀티 홈',
    icon: '🏠',
    badge: '3교대 캘린더',
    title: '한눈에 파악하는 오늘과 내일의 듀티',
    desc: '복잡한 D/E/N/O 3교대 일정을 직관적인 Bento 그리드 카드로 제공합니다. 출퇴근 시간과 위클리 스트립으로 이번 주 스케줄을 1초 만에 확인하세요.',
    bullets: [
      'Bento 스타일의 오늘/내일 근무 시간 실시간 확인',
      '월화수목금토일 한눈에 보는 위클리 듀티 스트립',
      '캘린더 전체보기 및 간편 터치 스케줄 등록',
      '인수인계와 환자 상태를 기록하는 데일리 노트',
    ],
  },
  {
    key: 'study',
    label: '임상 학습 & AI',
    icon: '📚',
    badge: 'Ask AI 어시스턴트',
    title: '급할 때 1초 만에 답하는 간호 지식 AI',
    desc: '도파민, 헤파린 등 헷갈리기 쉬운 점적 약물 계산부터 최신 ACLS 알고리즘과 수술 후 바이탈 모니터링까지 임상 실무 지침을 바로 검색하세요.',
    bullets: [
      '자연어로 질의하는 간호 지식 AI 어시스턴트',
      '도파민(Dopamine) 점적 및 gtt/hr 자동 약물 계산기',
      'ACLS 응급 알고리즘 & 수혈 간호 퀵 체크리스트',
      '신규 간호사 독립을 지원하는 병동 실무 지침서',
    ],
  },
  {
    key: 'community',
    label: '익명 커뮤니티',
    icon: '💬',
    badge: '100% 익명 인증',
    title: '전국 50만 간호사들이 나누는 솔직한 이야기',
    desc: '병원생활의 고충, 태움 고민, 나이트 근무 꿀팁부터 이직 정보까지 완벽한 익명성이 보장되는 안전한 소통 공간입니다.',
    bullets: [
      '철저한 익명 보장 & 안심 커뮤니티 보안',
      '카테고리별 분류: 병원생활, 태움/고민, 이직/커리어, 꿀팁',
      '나이트 근무 생존법 & 국가고시 팁 실시간 공유',
      '클린 모니터링 시스템을 통한 안전한 게시판 운영',
    ],
  },
  {
    key: 'fortune',
    label: '듀티 운세 & 힐링',
    icon: '🔮',
    badge: '오행 사주 테라피',
    title: '지친 퇴근길, 마음을 어루만지는 듀티 사주',
    desc: '오늘의 행운 지수와 애정운, 직업운, 금전운을 확인하고 병동에서의 예상치 못한 스트레스를 긍정의 에너지로 바꿔보세요.',
    bullets: [
      '오늘의 행운 지수 (예: 88점) & 맞춤 긍정 메시지',
      '동료와의 협력 및 오후 근무 맞춤 직업운 분석',
      '가로 스크롤로 가볍게 넘겨보는 3대 세부 운세',
      '오늘의 힐링 행운 아이템 & 우간다 비바 코랄 핑크',
    ],
  },
  {
    key: 'friends',
    label: '동기 듀티 공유',
    icon: '👥',
    badge: '약속 플래너',
    title: '동기들과 겹치는 오프(Off), 1초 만에 찾기',
    desc: '동기들의 근무표를 실시간으로 비교하고, 함께 쉬는 날을 자동으로 탐색하여 실패 없는 모임 일정을 잡아보세요.',
    bullets: [
      '친구 및 동기 간호사 원클릭 검색 & 등록',
      '실시간 친구 근무표 (Day, Evening, Night, Off) 대조',
      '동기들과 오프가 겹치는 골든 데이 자동 추천',
      '카카오톡 및 이미지로 1초 만에 듀티 공유',
    ],
  },
];

export const LandingScreenShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const current = TABS.find((t) => t.key === activeTab) || TABS[0];

  return (
    <View style={styles.sectionContainer} nativeID="screens">
      <View style={styles.innerContainer}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>Figma 인터페이스 100% 구현</Text>
          </View>
          <Text style={styles.sectionTitle}>
            간호사의 하루에 꼭 필요한 5가지 화면
          </Text>
          <Text style={styles.sectionSubtitle}>
            탭을 클릭하여 우간다 모바일 앱의 실제 디자인과 기능을 미리 경험해보세요.
          </Text>
        </View>

        {/* Tab Selector Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Showcase Grid: Phone Mockup Left + Details Right */}
        <View style={styles.showcaseGrid}>
          {/* Phone Frame Mockup */}
          <View style={styles.phoneOuter}>
            <View style={styles.phoneSpeakerBar}>
              <View style={styles.speakerDot} />
              <View style={styles.cameraDot} />
            </View>

            <View style={styles.phoneScreen}>
              {activeTab === 'home' && <HomeMockupScreen />}
              {activeTab === 'study' && <StudyMockupScreen />}
              {activeTab === 'community' && <CommunityMockupScreen />}
              {activeTab === 'fortune' && <FortuneMockupScreen />}
              {activeTab === 'friends' && <FriendsMockupScreen />}
            </View>

            {/* Home Indicator */}
            <View style={styles.homeIndicatorBar}>
              <View style={styles.homeIndicator} />
            </View>
          </View>

          {/* Details Column Right */}
          <View style={styles.detailsColumn}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{current.badge}</Text>
            </View>
            <Text style={styles.detailTitle}>{current.title}</Text>
            <Text style={styles.detailDesc}>{current.desc}</Text>

            <View style={styles.bulletList}>
              {current.bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <View style={styles.bulletCheckCircle}>
                    <Text style={styles.bulletCheckText}>✓</Text>
                  </View>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quickTipBox}>
              <Text style={styles.quickTipTitle}>💡 우간다 팀의 한마디</Text>
              <Text style={styles.quickTipDesc}>
                {activeTab === 'home' && '새벽 출근길이나 피곤한 퇴근길에도 한눈에 스케줄을 알아볼 수 있도록 볼드 타이포그래피와 토스 감성 UI를 적용했습니다.'}
                {activeTab === 'study' && '약물 계산은 실수가 없어야 합니다. 점적 수식과 성인/소아 용량을 가장 안전하고 신속하게 계산할 수 있도록 최적화했습니다.'}
                {activeTab === 'community' && '병원 내 누구에게도 말할 수 없었던 고충을 안전하게 나누세요. 엄격한 필터링과 관리자 모니터링이 상시 가동됩니다.'}
                {activeTab === 'fortune' && '3교대 근무로 불규칙해진 바이오리듬과 감정을 케어하기 위해 사주 명리학에 기반한 따뜻한 한마디를 매일 아침 전합니다.'}
                {activeTab === 'friends' && '동기와 만날 날짜를 잡으려고 근무표 캡처 사진 10장씩 대조하던 비효율, 우간다에서는 1초면 충분합니다.'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

/* ── Figma 5 Screen Mockups ── */

const HomeMockupScreen: React.FC = () => (
  <ScrollView style={mockStyles.screenScroll} showsVerticalScrollIndicator={false}>
    <View style={mockStyles.screenHeader}>
      <Text style={mockStyles.screenHeaderTitle}>우간다</Text>
      <View style={mockStyles.headerIcons}>
        <Text style={mockStyles.iconEmoji}>🔔</Text>
        <Text style={mockStyles.iconEmoji}>👤</Text>
      </View>
    </View>

    {/* Greeting */}
    <View style={mockStyles.greetingBox}>
      <Text style={mockStyles.greetingText}>
        <Text style={{ fontWeight: '800' }}>이수진</Text> 간호사님, 오늘은{' '}
        <Text style={{ color: COLORS.primary, fontWeight: '800' }}>데이(D)</Text> 근무이시네요! 오늘도 화이팅하세요 ✨
      </Text>
    </View>

    {/* Bento Shift Cards */}
    <View style={mockStyles.bentoRow}>
      <View style={mockStyles.todayCard}>
        <Text style={mockStyles.bentoCardLabel}>오늘 (8/19) 근무</Text>
        <View style={mockStyles.shiftBigBadgeCoral}>
          <Text style={mockStyles.shiftBigLetter}>D</Text>
        </View>
        <Text style={mockStyles.shiftTimeText}>07:30 - 15:30</Text>
      </View>

      <View style={mockStyles.tomorrowCard}>
        <Text style={mockStyles.bentoCardLabel}>내일 (8/20) 근무</Text>
        <View style={mockStyles.shiftBigBadgeGreen}>
          <Text style={mockStyles.shiftBigLetter}>O</Text>
        </View>
        <Text style={mockStyles.shiftTimeText}>내일은 꿀오프! 🎉</Text>
      </View>
    </View>

    {/* Weekly Strip */}
    <View style={mockStyles.stripCard}>
      <Text style={mockStyles.stripTitle}>이번 주 근무 스케줄</Text>
      <View style={mockStyles.stripRow}>
        {[
          { d: '월', code: 'D', isToday: true },
          { d: '화', code: 'D' },
          { d: '수', code: 'D' },
          { d: '목', code: 'O' },
          { d: '금', code: 'O' },
          { d: '토', code: 'E' },
          { d: '일', code: 'N' },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[mockStyles.stripDayItem, item.isToday && mockStyles.stripDayItemActive]}
          >
            <Text style={[mockStyles.stripDayName, item.isToday && { color: COLORS.primary }]}>
              {item.d}
            </Text>
            <View
              style={[
                mockStyles.stripCodeCircle,
                item.code === 'D' && { backgroundColor: '#FFE4E8' },
                item.code === 'E' && { backgroundColor: '#FEF3C7' },
                item.code === 'N' && { backgroundColor: '#EDE9FE' },
                item.code === 'O' && { backgroundColor: '#DCFCE7' },
              ]}
            >
              <Text
                style={[
                  mockStyles.stripCodeText,
                  item.code === 'D' && { color: COLORS.primary },
                  item.code === 'E' && { color: '#D97706' },
                  item.code === 'N' && { color: '#7C3AED' },
                  item.code === 'O' && { color: '#16A34A' },
                ]}
              >
                {item.code}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>

    {/* Quick Action Buttons */}
    <View style={mockStyles.actionRow}>
      <TouchableOpacity style={mockStyles.actionBtnPrimary}>
        <Text style={mockStyles.actionBtnPrimaryText}>📅 전체 스케줄 보기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={mockStyles.actionBtnSecondary}>
        <Text style={mockStyles.actionBtnSecondaryText}>+ 듀티 추가</Text>
      </TouchableOpacity>
    </View>

    {/* Daily Note */}
    <View style={mockStyles.dailyNoteCard}>
      <Text style={mockStyles.dailyNoteHeader}>📝 데일리 노트</Text>
      <Text style={mockStyles.dailyNoteContent}>
        • 201호 수액 투여 속도 재확인{'\n'}• 3시 인수인계 시 lab 결과 보고
      </Text>
    </View>
  </ScrollView>
);

const StudyMockupScreen: React.FC = () => (
  <ScrollView style={mockStyles.screenScroll} showsVerticalScrollIndicator={false}>
    <View style={mockStyles.screenHeader}>
      <Text style={mockStyles.screenHeaderTitle}>학습 & Ask AI</Text>
      <Text style={mockStyles.iconEmoji}>🔍</Text>
    </View>

    {/* AI Search Banner */}
    <View style={mockStyles.aiBanner}>
      <Text style={mockStyles.aiBannerBadge}>⚡ Ask AI 어시스턴트</Text>
      <Text style={mockStyles.aiBannerTitle}>간호 지식을 AI에게 물어보세요</Text>
      <Text style={mockStyles.aiBannerSub}>
        "도파민 5mcg/kg/min 점적 계산해줘"
      </Text>
    </View>

    {/* Category Chips */}
    <View style={mockStyles.chipsRow}>
      {['전체', '약물계산', '바이탈', '간호술기', '응급처치'].map((chip, idx) => (
        <View
          key={idx}
          style={[mockStyles.categoryChip, idx === 0 && mockStyles.categoryChipActive]}
        >
          <Text
            style={[mockStyles.categoryChipText, idx === 0 && mockStyles.categoryChipTextActive]}
          >
            {chip}
          </Text>
        </View>
      ))}
    </View>

    {/* Guide Cards */}
    <View style={mockStyles.guideCard}>
      <View style={mockStyles.guideBadgeRow}>
        <Text style={mockStyles.guideTag}>약리학 · 계산기</Text>
        <Text style={mockStyles.guideTime}>2일 전</Text>
      </View>
      <Text style={mockStyles.guideTitle}>도파민(Dopamine) 점적 계산법</Text>
      <Text style={mockStyles.guideDesc}>
        환자 체중 60kg 기준 gtt/min 및 cc/hr 자동 환산 공식 정리
      </Text>
    </View>

    <View style={mockStyles.guideCard}>
      <View style={mockStyles.guideBadgeRow}>
        <Text style={mockStyles.guideTag}>응급 · ACLS</Text>
        <Text style={mockStyles.guideTime}>1주일 전</Text>
      </View>
      <Text style={mockStyles.guideTitle}>ACLS 알고리즘 퀵 레퍼런스</Text>
      <Text style={mockStyles.guideDesc}>
        VF/pVT 및 PEA/Asystole 약물 투여 주기 및 에피네프린 프로토콜
      </Text>
    </View>

    <View style={mockStyles.guideCard}>
      <View style={mockStyles.guideBadgeRow}>
        <Text style={mockStyles.guideTag}>간호술기 · 체크리스트</Text>
        <Text style={mockStyles.guideTime}>3일 전</Text>
      </View>
      <Text style={mockStyles.guideTitle}>수혈 간호 체크리스트</Text>
      <Text style={mockStyles.guideDesc}>
        수혈 시작 15분 바이탈 체크 및 부작용 발생 시 즉각 대처 가이드
      </Text>
    </View>
  </ScrollView>
);

const CommunityMockupScreen: React.FC = () => (
  <ScrollView style={mockStyles.screenScroll} showsVerticalScrollIndicator={false}>
    <View style={mockStyles.screenHeader}>
      <Text style={mockStyles.screenHeaderTitle}>간호사 커뮤니티</Text>
      <TouchableOpacity style={mockStyles.writePostBtn}>
        <Text style={mockStyles.writePostBtnText}>+ 글쓰기</Text>
      </TouchableOpacity>
    </View>

    {/* Filter tabs */}
    <View style={mockStyles.chipsRow}>
      {['전체', '병원생활', '태움/고민', '이직/커리어', '꿀팁'].map((cat, idx) => (
        <View
          key={idx}
          style={[mockStyles.categoryChip, idx === 0 && mockStyles.categoryChipActive]}
        >
          <Text
            style={[mockStyles.categoryChipText, idx === 0 && mockStyles.categoryChipTextActive]}
          >
            {cat}
          </Text>
        </View>
      ))}
    </View>

    {/* Post Items */}
    <View style={mockStyles.postCard}>
      <View style={mockStyles.postMetaRow}>
        <Text style={mockStyles.postCategory}>응급실(ER)</Text>
        <Text style={mockStyles.postTime}>12분 전</Text>
      </View>
      <Text style={mockStyles.postTitle}>ER 간호사 연장 근무 팁 질문드려요</Text>
      <Text style={mockStyles.postSnippet}>
        오늘 환자분들이 몰려서 오버타임 3시간 했는데 다들 체력 어떻게 관리하시나요?
      </Text>
      <View style={mockStyles.postFooter}>
        <Text style={mockStyles.postStat}>❤️ 공감 42</Text>
        <Text style={mockStyles.postStat}>💬 댓글 18</Text>
      </View>
    </View>

    <View style={mockStyles.postCard}>
      <View style={mockStyles.postMetaRow}>
        <Text style={mockStyles.postCategory}>병동(Ward)</Text>
        <Text style={mockStyles.postTime}>45분 전</Text>
      </View>
      <Text style={mockStyles.postTitle}>나이트 근무 살아남기 생존 꿀팁 공유</Text>
      <Text style={mockStyles.postSnippet}>
        수면 패턴 무너질 때 암막커튼이랑 수면 유도 ASMR 꿀조합 추천합니다!
      </Text>
      <View style={mockStyles.postFooter}>
        <Text style={mockStyles.postStat}>❤️ 공감 89</Text>
        <Text style={mockStyles.postStat}>💬 댓글 34</Text>
      </View>
    </View>

    <View style={mockStyles.postCard}>
      <View style={mockStyles.postMetaRow}>
        <Text style={mockStyles.postCategory}>중환자실(ICU)</Text>
        <Text style={mockStyles.postTime}>2시간 전</Text>
      </View>
      <Text style={mockStyles.postTitle}>선배님의 따뜻한 격려 한마디에 울컥했네요</Text>
      <Text style={mockStyles.postSnippet}>
        오늘 인수인계 끝나고 수고했다고 커피 건네주셔서 하루 피로가 다 녹았어요.
      </Text>
      <View style={mockStyles.postFooter}>
        <Text style={mockStyles.postStat}>❤️ 공감 120</Text>
        <Text style={mockStyles.postStat}>💬 댓글 56</Text>
      </View>
    </View>
  </ScrollView>
);

const FortuneMockupScreen: React.FC = () => (
  <ScrollView style={mockStyles.screenScroll} showsVerticalScrollIndicator={false}>
    <View style={mockStyles.screenHeader}>
      <Text style={mockStyles.screenHeaderTitle}>듀티 운세</Text>
      <Text style={mockStyles.iconEmoji}>✨</Text>
    </View>

    {/* Main Fortune Card */}
    <View style={mockStyles.fortuneMainCard}>
      <Text style={mockStyles.fortuneDate}>2026. 8. 29 (토)</Text>
      <View style={mockStyles.fortuneScoreRow}>
        <Text style={mockStyles.fortuneScoreNumber}>88</Text>
        <Text style={mockStyles.fortuneScoreLabel}>오늘의 행운 지수</Text>
      </View>
      <Text style={mockStyles.fortuneQuote}>
        "오늘은 새로운 시작을 알리는 날이에요 ✨"
      </Text>
      <Text style={mockStyles.fortuneDetail}>
        동료와의 협력이 빛을 발하는 하루입니다. 오후 근무 중 예상치 못한 긍정적인 소식이 있을 수 있어요.
      </Text>
    </View>

    {/* Sub Fortune Cards */}
    <Text style={mockStyles.subFortuneTitle}>세부 듀티 운세</Text>
    <View style={mockStyles.subFortuneGrid}>
      <View style={mockStyles.subFortuneItem}>
        <Text style={mockStyles.subFortuneEmoji}>💖 애정운</Text>
        <Text style={mockStyles.subFortuneDesc}>
          가까운 동료와의 대화가 큰 행운을 부릅니다.
        </Text>
      </View>
      <View style={mockStyles.subFortuneItem}>
        <Text style={mockStyles.subFortuneEmoji}>💼 직업운</Text>
        <Text style={mockStyles.subFortuneDesc}>
          팀워크가 빛나는 날. 양보가 최고의 미덕입니다.
        </Text>
      </View>
      <View style={mockStyles.subFortuneItem}>
        <Text style={mockStyles.subFortuneEmoji}>💰 금전운</Text>
        <Text style={mockStyles.subFortuneDesc}>
          뜻밖의 작은 보너스나 이득이 생길 수 있습니다.
        </Text>
      </View>
      <View style={mockStyles.subFortuneItem}>
        <Text style={mockStyles.subFortuneEmoji}>🎨 행운의 색</Text>
        <Text style={mockStyles.subFortuneDesc}>
          우간다 비바 코랄 핑크 (#FF507C)
        </Text>
      </View>
    </View>
  </ScrollView>
);

const FriendsMockupScreen: React.FC = () => (
  <ScrollView style={mockStyles.screenScroll} showsVerticalScrollIndicator={false}>
    <View style={mockStyles.screenHeader}>
      <Text style={mockStyles.screenHeaderTitle}>동기 & 친구 듀티</Text>
      <Text style={mockStyles.iconEmoji}>👥</Text>
    </View>

    {/* Friend Search Bar */}
    <View style={mockStyles.searchBar}>
      <Text style={mockStyles.searchPlaceholder}>🔍 동기 이름 검색하기</Text>
    </View>

    {/* Golden Match Banner */}
    <View style={mockStyles.matchBanner}>
      <Text style={mockStyles.matchBannerBadge}>🎉 오프 매칭 알림</Text>
      <Text style={mockStyles.matchBannerTitle}>이번 주 목요일(8/22) 김민지님과 동시 오프!</Text>
      <Text style={mockStyles.matchBannerSub}>약속 잡기 좋은 날이에요 ☕</Text>
    </View>

    {/* Friends List */}
    <Text style={mockStyles.friendsListTitle}>연동된 동기 목록 (3명)</Text>

    {[
      { name: '김민지', dept: '7병동 ICU', today: 'D', tomorrow: 'O', match: true },
      { name: '박서연', dept: '응급의학과 ER', today: 'N', tomorrow: 'N', match: false },
      { name: '최유진', dept: '외래간호팀', today: 'E', tomorrow: 'D', match: false },
    ].map((friend, idx) => (
      <View key={idx} style={mockStyles.friendCard}>
        <View style={mockStyles.friendAvatar}>
          <Text style={mockStyles.friendAvatarText}>{friend.name[0]}</Text>
        </View>
        <View style={mockStyles.friendInfo}>
          <Text style={mockStyles.friendName}>{friend.name}</Text>
          <Text style={mockStyles.friendDept}>{friend.dept}</Text>
        </View>
        <View style={mockStyles.friendShifts}>
          <View style={mockStyles.shiftSmallBadge}>
            <Text style={mockStyles.shiftSmallText}>오늘: {friend.today}</Text>
          </View>
          <View
            style={[
              mockStyles.shiftSmallBadge,
              friend.match && { backgroundColor: '#DCFCE7' },
            ]}
          >
            <Text
              style={[
                mockStyles.shiftSmallText,
                friend.match && { color: '#16A34A', fontWeight: '800' },
              ]}
            >
              내일: {friend.tomorrow}
            </Text>
          </View>
        </View>
      </View>
    ))}
  </ScrollView>
);

/* ── Screen Mockup Styling ── */
const mockStyles = StyleSheet.create({
  screenScroll: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  screenHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconEmoji: {
    fontSize: 18,
  },
  greetingBox: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  greetingText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  todayCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFE4E8',
    alignItems: 'center',
  },
  tomorrowCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  bentoCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  shiftBigBadgeCoral: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftBigBadgeGreen: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftBigLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  shiftTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  stripCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stripTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  stripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stripDayItem: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
  },
  stripDayItemActive: {
    backgroundColor: '#FFF0F3',
  },
  stripDayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  stripCodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripCodeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  actionBtnPrimary: {
    flex: 1.2,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  dailyNoteCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  dailyNoteHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  dailyNoteContent: {
    fontSize: 11,
    lineHeight: 16,
    color: '#B45309',
  },
  // Study Screen
  aiBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  aiBannerBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 4,
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiBannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  guideBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  guideTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  guideTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  guideDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  // Community Screen
  writePostBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  writePostBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  postMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  postCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  postTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  postTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  postSnippet: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 14,
  },
  postStat: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  // Fortune Screen
  fortuneMainCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  fortuneDate: {
    fontSize: 12,
    color: '#C7D2FE',
    marginBottom: 10,
  },
  fortuneScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  fortuneScoreNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FDE047',
  },
  fortuneScoreLabel: {
    fontSize: 13,
    color: '#E0E7FF',
    fontWeight: '600',
  },
  fortuneQuote: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  fortuneDetail: {
    fontSize: 11,
    lineHeight: 17,
    color: '#C7D2FE',
  },
  subFortuneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subFortuneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  subFortuneItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  subFortuneEmoji: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subFortuneDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  // Friends Screen
  searchBar: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchPlaceholder: {
    fontSize: 12,
    color: '#94A3B8',
  },
  matchBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  matchBannerBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  matchBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  matchBannerSub: {
    fontSize: 10,
    color: '#3B82F6',
  },
  friendsListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
    gap: 10,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  friendDept: {
    fontSize: 11,
    color: '#64748B',
  },
  friendShifts: {
    flexDirection: 'row',
    gap: 6,
  },
  shiftSmallBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shiftSmallText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
});

/* ── Main Component Styles ── */
const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  innerContainer: {
    maxWidth: 1140,
    width: '100%',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 36,
    textAlign: 'center' as any,
  },
  badgePill: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  badgePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 600,
  },
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 44,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  showcaseGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  phoneOuter: {
    width: 320,
    height: 640,
    backgroundColor: '#1E293B',
    borderRadius: 44,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    borderWidth: 4,
    borderColor: '#0F172A',
  },
  phoneSpeakerBar: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  speakerDot: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  cameraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 32,
    overflow: 'hidden',
  },
  homeIndicatorBar: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIndicator: {
    width: 100,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
  },
  detailsColumn: {
    flex: 1,
    maxWidth: 520,
    alignItems: 'flex-start',
  },
  detailBadge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailTitle: {
    fontSize: Platform.OS === 'web' ? 28 : 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  detailDesc: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    marginBottom: 24,
  },
  bulletList: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletCheckText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16A34A',
  },
  bulletText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  quickTipBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  quickTipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  quickTipDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },
});

