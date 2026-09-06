import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { SHIFT_TYPES } from '../../constants/shiftTypes';

interface LandingScreenProps {
  onNavigateAdmin?: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigateAdmin }) => {
  const handleAdminClick = () => {
    if (onNavigateAdmin) {
      onNavigateAdmin();
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleDownloadClick = (store: 'ios' | 'android') => {
    alert(`우간다 ${store === 'ios' ? 'iOS App Store' : 'Google Play 스토어'} 출시 심사 준비 중입니다.\n관리자 페이지(/admin)에서 실시간 운영 지표를 확인하실 수 있습니다.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ── 1. 웹 네비게이션 헤더 ── */}
      <header style={styles.headerWrapper as any}>
        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoSymbol}>🩺</Text>
            </View>
            <Text style={styles.brandTitle}>
              우간다 <Text style={styles.brandSubtitle}>Weganda</Text>
            </Text>
          </View>

          <View style={styles.navRight}>
            <TouchableOpacity
              style={styles.adminNavBtn}
              onPress={handleAdminClick}
              activeOpacity={0.8}
            >
              <Text style={styles.adminNavText}>👑 관리자 페이지</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadNavBtn}
              onPress={() => handleDownloadClick('ios')}
              activeOpacity={0.85}
            >
              <Text style={styles.downloadNavText}>앱 다운로드</Text>
            </TouchableOpacity>
          </View>
        </View>
      </header>

      {/* ── 2. HERO SECTION ── */}
      <View style={styles.heroSection}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagBadgeText}>대한민국 No.1 3교대 간호사 라이프스타일 앱</Text>
        </View>

        <Text style={styles.heroTitle}>
          3교대 간호사의 고단한 하루를{'\n'}
          <Text style={styles.heroHighlight}>생동감과 신뢰</Text>로 채웁니다
        </Text>

        <Text style={styles.heroDesc}>
          복잡한 D/E/N 듀티 캘린더 정리, 오행 사주 기반 듀티 운세,{'\n'}
          100% 익명 간호사 커뮤니티, 야간 가산수당 자동 계산기까지 — 우간다 하나로 시작하세요.
        </Text>

        {/* CTA 버튼 그룹 */}
        <View style={styles.ctaButtonGroup}>
          <TouchableOpacity
            style={styles.primaryAppBtn}
            onPress={() => handleDownloadClick('ios')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIcon}></Text>
            <View style={styles.btnTextGroup}>
              <Text style={styles.btnSub}>App Store에서</Text>
              <Text style={styles.btnMain}>앱 다운로드</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAppBtn}
            onPress={() => handleDownloadClick('android')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIcon}>▶</Text>
            <View style={styles.btnTextGroup}>
              <Text style={styles.btnSub}>Google Play에서</Text>
              <Text style={styles.btnMain}>다운로드</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminCtaBtn}
            onPress={handleAdminClick}
            activeOpacity={0.85}
          >
            <Text style={styles.adminCtaText}>웹 관리자 콘솔 바로가기 ›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 3. 실물 모바일 UI 쇼케이스 목업 (Design.md 기반) ── */}
      <View style={styles.mockupSection}>
        <View style={styles.mockupPhoneContainer}>
          {/* 폰 상단 스피커 & 노치 */}
          <View style={styles.phoneNotch} />

          {/* 폰 내부 앱 화면 */}
          <View style={styles.phoneScreen}>
            {/* 앱 상단 헤더 */}
            <View style={styles.phoneAppHeader}>
              <View style={styles.phoneBrandRow}>
                <View style={styles.phoneLogoDot} />
                <Text style={styles.phoneBrandName}>우간다</Text>
              </View>
              <View style={styles.phoneHeaderIcons}>
                <Text style={styles.phoneHeaderIcon}>🔔</Text>
                <Text style={styles.phoneHeaderIcon}>👤</Text>
              </View>
            </View>

            {/* 인사 배너 */}
            <View style={styles.greetingBanner}>
              <Text style={styles.greetingTitle}>김간호 선생님, 힘내세요! 🌸</Text>
              <Text style={styles.greetingSub}>오늘도 안전하고 무탈한 근무 되시길 응원합니다.</Text>
            </View>

            {/* 2열 근무 카드 (오늘/내일 실제 토큰 적용) */}
            <View style={styles.shiftCardRow}>
              {/* 오늘: Day (#4F98CA) */}
              <View style={[styles.shiftCard, { backgroundColor: '#4F98CA' }]}>
                <View style={styles.shiftCardTop}>
                  <Text style={styles.shiftDateLabel}>오늘</Text>
                  <Text style={styles.shiftTime}>07:00 ~ 15:30</Text>
                </View>
                <Text style={styles.shiftCodeText}>D</Text>
                <Text style={styles.shiftNameText}>주간 근무 (Day)</Text>
              </View>

              {/* 내일: Evening (#E2703A) */}
              <View style={[styles.shiftCard, { backgroundColor: '#E2703A' }]}>
                <View style={styles.shiftCardTop}>
                  <Text style={styles.shiftDateLabel}>내일</Text>
                  <Text style={styles.shiftTime}>15:00 ~ 23:00</Text>
                </View>
                <Text style={styles.shiftCodeText}>E</Text>
                <Text style={styles.shiftNameText}>저녁 근무 (Evening)</Text>
              </View>
            </View>

            {/* 주간 7일 캘린더 스트립 */}
            <View style={styles.weekStrip}>
              {[
                { day: '일', shift: 'O', color: '#E84A5F' },
                { day: '월', shift: 'D', color: '#4F98CA', today: true },
                { day: '화', shift: 'D', color: '#4F98CA' },
                { day: '수', shift: 'E', color: '#E2703A' },
                { day: '목', shift: 'N', color: '#272727' },
                { day: '금', shift: 'O', color: '#E84A5F' },
                { day: '토', shift: 'O', color: '#E84A5F' },
              ].map((item, i) => (
                <View key={i} style={[styles.weekDayItem, item.today && styles.weekDayItemToday]}>
                  <Text style={styles.weekDayLabel}>{item.day}</Text>
                  <View style={[styles.shiftMiniBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.shiftMiniText}>{item.shift}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 간호사 듀티 운세 카드 */}
            <View style={styles.fortuneCard}>
              <View style={styles.fortuneTop}>
                <Text style={styles.fortuneTitle}>🌟 오늘의 임상 운세 지수: 94점</Text>
                <Text style={styles.fortuneBadge}>상승세</Text>
              </View>
              <Text style={styles.fortuneDesc}>
                동료 간호사와의 소통이 매끄러운 날입니다. 바쁜 오더 속에서도 침착함을 유지하면 칼퇴운이 따릅니다!
              </Text>
            </View>

            {/* 급여/수당 예측기 카드 (weganda+) */}
            <View style={styles.salaryCard}>
              <View style={styles.salaryTop}>
                <Text style={styles.salaryTitle}>👑 이번 달 야간·휴일 예상 수당</Text>
                <Text style={styles.salaryAmt}>+ 486,000원</Text>
              </View>
              <Text style={styles.salarySub}>나이트 8개 · 휴일 근무 2개 자동 합산 반영</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── 4. 5대 핵심 기능 카드 섹션 ── */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionBadge}>CORE FEATURES</Text>
          <Text style={styles.sectionMainTitle}>간호사만을 위해 설계된 특별한 기능</Text>
          <Text style={styles.sectionSubTitle}>
            군더더기 없는 토스 스타일의 Invisible UI로 필요한 정보만 빠르게 파악하세요.
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {/* Feature 1 */}
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🗓️</Text>
            <Text style={styles.featureTitle}>3교대 맞춤 듀티 캘린더</Text>
            <Text style={styles.featureDesc}>
              D, E, N, Off, 연차를 한눈에 파악하는 직관적인 컬러 시스템. 스마트폰 기본 캘린더와 실시간 원클릭 양방향 동기화를 지원합니다.
            </Text>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🔮</Text>
            <Text style={styles.featureTitle}>오행·사주 기반 듀티 운세</Text>
            <Text style={styles.featureDesc}>
              생년월일시 사주 분석을 통해 오늘 나의 임상 바이오리듬과 주의해야 할 환자 케어 포인트를 매일 아침 맞춤 제공합니다.
            </Text>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>💬</Text>
            <Text style={styles.featureTitle}>100% 안전한 익명 커뮤니티</Text>
            <Text style={styles.featureDesc}>
              병원별 익명 인증, 부서별 인계 꿀팁, 이직 상담까지. 악성 게시글 및 비방은 관리자 실시간 신고 필터링으로 철저히 보호됩니다.
            </Text>
          </View>

          {/* Feature 4 */}
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🤖</Text>
            <Text style={styles.featureTitle}>AI 임상 챗봇 & 의학 계산기</Text>
            <Text style={styles.featureDesc}>
              gtt/hr 수액 점적 속도 계산, 약물 용량 환산, 긴급 임상 질의응답을 AI가 즉시 답변해 바쁜 근무 시간 실수를 방지합니다.
            </Text>
          </View>

          {/* Feature 5 */}
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>💰</Text>
            <Text style={styles.featureTitle}>weganda+ 수당 & 월급 예측기</Text>
            <Text style={styles.featureDesc}>
              이번 달 야간 가산수당, 휴일 근무 수당이 얼마나 붙는지 정확하게 계산하여 실수령액을 미리 예측해 드립니다.
            </Text>
          </View>

          {/* Feature 6 */}
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🎨</Text>
            <Text style={styles.featureTitle}>5종 프리미엄 커스텀 테마</Text>
            <Text style={styles.featureDesc}>
              시그니처 비바 코랄 핑크 외에도 딥 그린, 딥 블루, 옐로우, 퍼플 등 나만의 감성으로 앱 테마를 자유롭게 바꿀 수 있습니다.
            </Text>
          </View>
        </View>
      </View>

      {/* ── 5. 실시간 라이브 지표 ── */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>290+</Text>
          <Text style={styles.statLabel}>등록된 현직 간호사 회원</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>11분</Text>
          <Text style={styles.statLabel}>세션당 평균 서비스 체류시간</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>76.4%</Text>
          <Text style={styles.statLabel}>높은 간호사 재방문율</Text>
        </View>
      </View>

      {/* ── 6. 하단 다운로드 배너 ── */}
      <View style={styles.bottomCtaSection}>
        <Text style={styles.bottomCtaTitle}>
          오늘부터 더 스마트한 간호사 라이프를 시작하세요
        </Text>
        <Text style={styles.bottomCtaDesc}>
          우간다는 전국의 모든 교대근무 간호사 선생님들을 응원합니다.
        </Text>

        <View style={styles.bottomBtnRow}>
          <TouchableOpacity
            style={styles.bottomAppBtn}
            onPress={() => handleDownloadClick('ios')}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomBtnText}> App Store 다운로드</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomAppBtnSecondary}
            onPress={() => handleDownloadClick('android')}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomBtnTextSecondary}>▶ Google Play 다운로드</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 7. 푸터 (Footer) ── */}
      <footer style={styles.footer as any}>
        <View style={styles.footerContent}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerBrand}>우간다 (Weganda)</Text>
            <Text style={styles.footerCompany}>우리 간호사가 간다 · 3교대 간호사 맞춤 플랫폼</Text>
            <Text style={styles.footerCopy}>© 2026 Weganda. All rights reserved.</Text>
          </View>

          <View style={styles.footerRight}>
            <TouchableOpacity onPress={handleAdminClick} activeOpacity={0.7}>
              <Text style={styles.footerAdminLink}>👑 관리자 페이지 (Admin Console)</Text>
            </TouchableOpacity>
            <Text style={styles.footerLinks}>이용약관 · 개인정보처리방침 · 고객센터</Text>
          </View>
        </View>
      </footer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 0,
  },
  headerWrapper: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    position: (Platform.OS === 'web' ? 'sticky' : 'relative') as any,
    top: 0,
    zIndex: 100,
  },
  header: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFE8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  adminNavText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '700',
  },
  downloadNavBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  downloadNavText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroSection: {
    maxWidth: 900,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    textAlign: 'center',
  },
  tagBadge: {
    backgroundColor: '#FFE8EE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  tagBadgeText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 56,
    letterSpacing: -1,
  },
  heroHighlight: {
    color: COLORS.primary,
  },
  heroDesc: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 20,
    maxWidth: 680,
  },
  ctaButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 36,
  },
  primaryAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    minWidth: 170,
  },
  secondaryAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    minWidth: 170,
  },
  btnIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  btnTextGroup: {
    alignItems: 'flex-start',
  },
  btnSub: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  btnMain: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminCtaBtn: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  adminCtaText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  mockupSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  mockupPhoneContainer: {
    width: 360,
    maxWidth: '92%',
    backgroundColor: '#111827',
    borderRadius: 40,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  phoneNotch: {
    width: 120,
    height: 18,
    backgroundColor: '#111827',
    borderRadius: 9,
    alignSelf: 'center',
    marginBottom: 6,
  },
  phoneScreen: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 16,
    overflow: 'hidden',
  },
  phoneAppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  phoneBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneLogoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  phoneBrandName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  phoneHeaderIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  phoneHeaderIcon: {
    fontSize: 16,
  },
  greetingBanner: {
    backgroundColor: '#FFF1F4',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  greetingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  greetingSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  shiftCardRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  shiftCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
  },
  shiftCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftDateLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  shiftTime: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
  },
  shiftCodeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  shiftNameText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 14,
    marginBottom: 12,
  },
  weekDayItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  weekDayItemToday: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weekDayLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  shiftMiniBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftMiniText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  fortuneCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  fortuneTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fortuneTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  fortuneBadge: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fortuneDesc: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 14,
  },
  salaryCard: {
    backgroundColor: '#1B4332',
    padding: 12,
    borderRadius: 14,
  },
  salaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryTitle: {
    color: '#D4A853',
    fontSize: 11,
    fontWeight: '700',
  },
  salaryAmt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  salarySub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    marginTop: 4,
  },
  featuresSection: {
    maxWidth: 1100,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 50,
  },
  sectionBadge: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionMainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sectionSubTitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  featureCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  statsSection: {
    backgroundColor: '#111827',
    paddingVertical: 50,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
  },
  bottomCtaSection: {
    backgroundColor: '#FFF1F4',
    paddingVertical: 70,
    paddingHorizontal: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  bottomCtaTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  bottomCtaDesc: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  bottomBtnRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  bottomAppBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bottomBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomAppBtnSecondary: {
    backgroundColor: '#111827',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bottomBtnTextSecondary: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  footerContent: {
    maxWidth: 1100,
    marginHorizontal: 'auto',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  footerLeft: {
    gap: 4,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footerCompany: {
    fontSize: 12,
    color: '#6B7280',
  },
  footerCopy: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  footerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  footerAdminLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  footerLinks: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
