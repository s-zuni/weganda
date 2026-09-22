import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingFeatureSpotlights: React.FC = () => {
  const { isMobile } = useResponsive();

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]} nativeID="features">
      <View style={[styles.inner, isMobile && styles.innerMobile]}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderBadge}>CORE FEATURES</Text>
          <Text style={[styles.sectionHeaderTitle, isMobile && styles.sectionHeaderTitleMobile]}>
            간호사의 하루를 바꾸는 우간다
          </Text>
          <Text style={[styles.sectionHeaderSub, isMobile && styles.sectionHeaderSubMobile]}>
            출퇴근 스케줄 관리부터 임상 실무와 동기 소통까지, 꼭 필요한 기능만 선별했습니다.
          </Text>
        </View>

        {/* ── 01. Center-Stage Bento: 스마트 듀티 홈 & 캘린더 ── */}
        <View style={[styles.centerStageCard, isMobile && styles.centerStageCardMobile]}>
          <View style={styles.centerStageHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>01. 스마트 듀티 홈 & 캘린더</Text>
            </View>
            <Text style={[styles.centerStageTitle, isMobile && styles.centerStageTitleMobile]}>
              터치 몇 번으로 끝나는{'\n'}이번 달 3교대 근무표 정리
            </Text>
            <Text style={[styles.centerStageDesc, isMobile && styles.centerStageDescMobile]}>
              복잡한 D/E/N/O 3교대 일정을 직관적인 카드와 캘린더로 정리하고,{'\n'}
              오늘과 내일의 근무 시간, 주간 흐름, 출근 알람을 자동으로 맞춰드립니다.
            </Text>
          </View>

          {/* 3 Highlight Pills */}
          <View style={[styles.pillRow, isMobile && styles.pillRowMobile]}>
            <View style={styles.featurePill}>
              <Text style={styles.pillIcon}>⏰</Text>
              <Text style={styles.pillText}>오늘·내일 근무 & 출근 알람</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.pillIcon}>📝</Text>
              <Text style={styles.pillText}>인수인계 메모 & 데일리 노트</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.pillIcon}>💰</Text>
              <Text style={styles.pillText}>D/E/N 야간수당 실시간 예측</Text>
            </View>
          </View>

          {/* Large Center Mockup */}
          <View style={styles.centerMockupContainer}>
            <Image
              source={require('../../../assets/images/landing/screen_home.png')}
              style={[styles.centerMockupImage, isMobile && styles.centerMockupImageMobile]}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── 02. Asymmetric Split: 동기 듀티 & 실시간 채팅 ── */}
        <View style={[styles.splitCard, isMobile ? styles.splitCardMobile : styles.splitCardReverse]}>
          <View style={[styles.splitContentCol, isMobile && styles.splitContentColMobile]}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>02. 동기 듀티 & 실시간 채팅</Text>
            </View>
            <Text style={[styles.splitHeadline, isMobile && styles.splitHeadlineMobile]}>
              동기들과 함께 쉬는 오프,{'\n'}이제 일일이 묻지 마세요
            </Text>
            <Text style={[styles.splitDesc, isMobile && styles.splitDescMobile]}>
              단톡방에서 근무표 사진을 여러 장 올려놓고 맞추던 번거로움을 없앴습니다.
              친구의 이번 달 스케줄을 한눈에 대조하고, 함께 쉴 수 있는 날을 자동으로 확인해 바로 대화를 시작하세요.
            </Text>

            {/* Smart Off-Matching Mini Callout */}
            <View style={styles.miniCalloutCard}>
              <View style={styles.miniCalloutHeader}>
                <Text style={styles.miniCalloutIcon}>✨</Text>
                <Text style={styles.miniCalloutTitle}>함께 쉬는 오프 자동 탐색</Text>
              </View>
              <Text style={styles.miniCalloutDesc}>
                "이번 주 동기 민지님과 2번의 오프(Off)가 겹쳐요!" 알림으로 번개 모임 약속을 손쉽게 잡습니다.
              </Text>
            </View>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>동기 근무표 실시간 대조</Text>
                  <Text style={styles.bulletSub}>
                    동기들의 Day, Evening, Night, Off 듀티를 한 화면에서 즉시 비교합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>병동 동기 단톡방 & 1:1 대화</Text>
                  <Text style={styles.bulletSub}>
                    근무표 화면에서 바로 채팅방으로 넘어가 맛집 약속과 근무 교대 이야기를 나눕니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.splitMockupCol}>
            <Image
              source={require('../../../assets/images/landing/screen_friends.png')}
              style={[styles.sideMockupImage, isMobile && styles.sideMockupImageMobile]}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── 03 & 04. 2-Column Side-by-Side Bento Grid: 임상 어시스턴트 듀오 ── */}
        <View style={styles.duoSection}>
          <View style={styles.duoSectionHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.categoryBadgeText, { color: '#0F172A' }]}>CLINICAL SUITE</Text>
            </View>
            <Text style={[styles.duoSectionTitle, isMobile && styles.duoSectionTitleMobile]}>
              바쁜 병동의 든든한 임상 파트너
            </Text>
            <Text style={[styles.duoSectionSub, isMobile && styles.duoSectionSubMobile]}>
              선배 눈치 볼 필요 없는 24시간 실시간 AI 답변과 1초 만에 끝나는 점적 약물 계산기
            </Text>
          </View>

          <View style={[styles.duoGrid, isMobile && styles.duoGridMobile]}>
            {/* Card Left: 03. 임상 AI 챗봇 */}
            <View style={[styles.duoCard, isMobile && styles.duoCardMobile]}>
              <View style={styles.duoCardHeader}>
                <View style={styles.cardTag}>
                  <Text style={styles.cardTagText}>03. 24시간 임상 AI 챗봇</Text>
                </View>
                <Text style={styles.duoCardHeadline}>
                  선배 눈치 보지 않는{'\n'}24시간 임상 질의응답
                </Text>
                <Text style={styles.duoCardDesc}>
                  투약 프로토콜·의학 약어·검사 수치 의미·환자 처치법을 언제든 편하게 물어보세요.
                </Text>
              </View>
              <View style={styles.duoMockupWrap}>
                <Image
                  source={require('../../../assets/images/landing/screen_ai_chat.png')}
                  style={[styles.duoMockupImage, isMobile && styles.duoMockupImageMobile]}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Card Right: 04. 약물 계산기 */}
            <View style={[styles.duoCard, isMobile && styles.duoCardMobile]}>
              <View style={styles.duoCardHeader}>
                <View style={styles.cardTag}>
                  <Text style={styles.cardTagText}>04. 임상 실무 & 약물 계산기</Text>
                </View>
                <Text style={styles.duoCardHeadline}>
                  투약 전 헷갈릴 때,{'\n'}1초 만에 확인하는 안심 계산기
                </Text>
                <Text style={styles.duoCardDesc}>
                  Dopamine, Heparin 등 고위험 약물 주입 속도(cc/hr)와 gtt/min을 환자 체중 기준 자동 환산합니다.
                </Text>
              </View>
              <View style={styles.duoMockupWrap}>
                <Image
                  source={require('../../../assets/images/landing/screen_study.png')}
                  style={[styles.duoMockupImage, isMobile && styles.duoMockupImageMobile]}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── 05. High-Trust Split: 인증 안심 커뮤니티 ── */}
        <View style={[styles.splitCard, isMobile && styles.splitCardMobile]}>
          <View style={styles.splitMockupCol}>
            <Image
              source={require('../../../assets/images/landing/screen_community.png')}
              style={[styles.sideMockupImage, isMobile && styles.sideMockupImageMobile]}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.splitContentCol, isMobile && styles.splitContentColMobile]}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>05. 간호사·간호학생 인증 커뮤니티</Text>
            </View>
            <Text style={[styles.splitHeadline, isMobile && styles.splitHeadlineMobile]}>
              면허·학생증 인증 회원만 이용하는{'\n'}100% 안심 익명 소통 공간
            </Text>
            <Text style={[styles.splitDesc, isMobile && styles.splitDescMobile]}>
              철저한 신원 인증을 거친 간호사와 간호학생만 입장할 수 있어,
              외부 유출이나 악성 글 걱정 없이 진짜 우리들의 이야기를 나눌 수 있습니다.
            </Text>

            {/* Role Distinction Dual Cards */}
            <View style={[styles.roleGrid, isMobile && styles.roleGridMobile]}>
              <View style={styles.roleCard}>
                <Text style={styles.roleTitle}>👩‍⚕️ 간호사 (RN)</Text>
                <Text style={styles.roleDesc}>자유, 고민, 이직/커리어 등 모든 게시판 전체 이용 가능</Text>
              </View>
              <View style={styles.roleCard}>
                <Text style={styles.roleTitle}>🎓 간호학생 (SN)</Text>
                <Text style={styles.roleDesc}>학생 라운지, 채용/취업, 임상 질문 3대 전용 게시판 이용</Text>
              </View>
            </View>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>철저한 익명성과 안심 모니터링</Text>
                  <Text style={styles.bulletSub}>
                    병동 고충, 나이트 생존법, 진로 고민을 안심하고 털어놓으며 소통합니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── 06. Warm Therapy Finale: 3교대 듀티 운세 ── */}
        <View style={[styles.therapyCard, isMobile && styles.therapyCardMobile]}>
          <View style={[styles.therapyInnerRow, isMobile && styles.therapyInnerRowMobile]}>
            <View style={[styles.therapyContentCol, isMobile && styles.therapyContentColMobile]}>
              <View style={[styles.categoryBadge, { backgroundColor: '#FFE4E6' }]}>
                <Text style={[styles.categoryBadgeText, { color: '#E11D48' }]}>06. 3교대 듀티 사주 운세</Text>
              </View>
              <Text style={[styles.splitHeadline, isMobile && styles.splitHeadlineMobile]}>
                지친 퇴근길, 마음을 달래는{'\n'}간호사 맞춤 듀티 운세
              </Text>
              <Text style={[styles.splitDesc, isMobile && styles.splitDescMobile]}>
                3교대 근무로 불규칙해진 바이오리듬을 케어하기 위해,
                매일 아침 오늘의 행운 지수와 병동 협력운, 따뜻한 힐링 조언을 전해드립니다.
              </Text>

              {/* Heartwarming Quote Box */}
              <View style={styles.quoteBox}>
                <Text style={styles.quoteIcon}>💬</Text>
                <Text style={styles.quoteText}>
                  "오늘도 환자의 안녕을 위해 치열하게 헌신한 당신,{'\n'}
                  우간다가 당신의 내일과 소중한 오프를 응원합니다."
                </Text>
              </View>

              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>✓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bulletTitle}>오늘의 행운 지수 & 세부 운세</Text>
                    <Text style={styles.bulletSub}>
                      동료와의 호흡, 오후 근무 주의점, 오늘의 행운 컬러를 가볍게 확인합니다.
                    </Text>
                  </View>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>✓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bulletTitle}>마음 치유 힐링 메시지</Text>
                    <Text style={styles.bulletSub}>
                      하루의 시작과 끝을 함께하는 따뜻한 격려 문구로 교대 근무 피로를 덜어드립니다.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.therapyMockupCol}>
              <Image
                source={require('../../../assets/images/landing/screen_fortune.png')}
                style={[styles.sideMockupImage, isMobile && styles.sideMockupImageMobile]}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 96,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  containerMobile: {
    paddingVertical: 56,
    paddingHorizontal: 16,
  },
  inner: {
    maxWidth: 1140,
    width: '100%',
    gap: 80,
  },
  innerMobile: {
    gap: 56,
  },

  // Section Header
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center' as any,
    marginBottom: 8,
  },
  sectionHeaderBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionHeaderTitle: {
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  sectionHeaderTitleMobile: {
    fontSize: 26,
    lineHeight: 36,
  },
  sectionHeaderSub: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 620,
  },
  sectionHeaderSubMobile: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Category Badge Common
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 14,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.2,
  },

  // ── 01. Center Stage Bento Card ──
  centerStageCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 36,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
  },
  centerStageCardMobile: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  centerStageHeader: {
    alignItems: 'center',
    textAlign: 'center' as any,
    maxWidth: 680,
    marginBottom: 28,
  },
  centerStageTitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  centerStageTitleMobile: {
    fontSize: 24,
    lineHeight: 34,
  },
  centerStageDesc: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    textAlign: 'center',
  },
  centerStageDescMobile: {
    fontSize: 14,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  pillRowMobile: {
    gap: 8,
    marginBottom: 24,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  pillIcon: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  centerMockupContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMockupImage: {
    width: 380,
    height: 680,
  },
  centerMockupImageMobile: {
    width: 310,
    height: 550,
  },

  // ── 02 & 05. Split Card Layout ──
  splitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 64,
    width: '100%',
  },
  splitCardMobile: {
    flexDirection: 'column',
    gap: 36,
  },
  splitCardReverse: {
    flexDirection: 'row-reverse',
  },
  splitContentCol: {
    flex: 1.1,
    width: '100%',
  },
  splitContentColMobile: {
    alignItems: 'flex-start',
  },
  splitMockupCol: {
    flex: 0.9,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitHeadline: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  splitHeadlineMobile: {
    fontSize: 24,
    lineHeight: 34,
    marginBottom: 12,
  },
  splitDesc: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    marginBottom: 24,
  },
  splitDescMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  sideMockupImage: {
    width: 370,
    height: 660,
  },
  sideMockupImageMobile: {
    width: 300,
    height: 535,
  },

  // Mini Callout Card (Friends Duty)
  miniCalloutCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  miniCalloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  miniCalloutIcon: {
    fontSize: 16,
  },
  miniCalloutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  miniCalloutDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },

  // ── 03 & 04. 2-Column Duo Grid ──
  duoSection: {
    width: '100%',
    gap: 36,
  },
  duoSectionHeader: {
    alignItems: 'center',
    textAlign: 'center' as any,
  },
  duoSectionTitle: {
    fontSize: 30,
    lineHeight: 42,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  duoSectionTitleMobile: {
    fontSize: 24,
    lineHeight: 34,
  },
  duoSectionSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 600,
  },
  duoSectionSubMobile: {
    fontSize: 14,
    lineHeight: 22,
  },
  duoGrid: {
    flexDirection: 'row',
    gap: 28,
    width: '100%',
  },
  duoGridMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  duoCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 36,
    paddingBottom: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
  },
  duoCardMobile: {
    paddingTop: 28,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  duoCardHeader: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  duoCardHeadline: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  duoCardDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
  },
  duoMockupWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  duoMockupImage: {
    width: 320,
    height: 570,
  },
  duoMockupImageMobile: {
    width: 280,
    height: 500,
  },

  // Role Grid (Community)
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  roleGridMobile: {
    flexDirection: 'column',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  // ── 06. Therapy Finale Card ──
  therapyCard: {
    width: '100%',
    backgroundColor: '#FFF5F6',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    padding: 48,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
  },
  therapyCardMobile: {
    padding: 24,
    borderRadius: 24,
  },
  therapyInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 56,
  },
  therapyInnerRowMobile: {
    flexDirection: 'column',
    gap: 32,
  },
  therapyContentCol: {
    flex: 1.1,
    width: '100%',
  },
  therapyContentColMobile: {
    alignItems: 'flex-start',
  },
  therapyMockupCol: {
    flex: 0.9,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 18,
    marginBottom: 24,
    width: '100%',
  },
  quoteIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
    color: '#9A3412',
    fontStyle: 'italic',
  },

  // Bullet List Common
  bulletList: {
    gap: 14,
    width: '100%',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  bulletTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  bulletSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});

