import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingFeatureSpotlights: React.FC = () => {
  const { isMobile } = useResponsive();

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]} nativeID="features">
      <View style={[styles.inner, isMobile && styles.innerMobile]}>
        {/* ── Feature 01: 동기 듀티 공유 ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          {/* Visual Left: Nurse Friends Shift Cards */}
          <View style={styles.visualCard}>
            <View style={[styles.friendsCard, isMobile && styles.cardMobile]}>
              <View style={styles.friendsCardHeader}>
                <Text style={styles.cardHeaderTitle}>동기 듀티 실시간 대조</Text>
                <View style={styles.matchBadgePill}>
                  <Text style={styles.matchBadgeText}>🎉 2명 동시 오프</Text>
                </View>
              </View>

              <View style={styles.friendsList}>
                {[
                  { name: '김민지 간호사', dept: '7병동 ICU', today: 'Day', tomorrow: 'Off', match: true },
                  { name: '박서연 간호사', dept: '응급의학과 ER', today: 'Night', tomorrow: 'Night', match: false },
                  { name: '최유진 간호사', dept: '외래간호팀', today: 'Evening', tomorrow: 'Off', match: true },
                ].map((friend, i) => (
                  <View key={i} style={styles.friendRow}>
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>{friend.name[0]}</Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendDept}>{friend.dept}</Text>
                    </View>
                    <View style={styles.shiftBadges}>
                      <View style={styles.shiftTagMuted}>
                        <Text style={styles.shiftTagMutedText}>{friend.today}</Text>
                      </View>
                      <View
                        style={[
                          styles.shiftTagHighlight,
                          friend.match ? styles.shiftTagGreen : styles.shiftTagNormal,
                        ]}
                      >
                        <Text
                          style={[
                            styles.shiftTagHighlightText,
                            friend.match && { color: '#15803D' },
                          ]}
                        >
                          {friend.tomorrow}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.friendsCardFooter}>
                <Text style={styles.footerNoteText}>
                  💡 이번 주 목요일 동기 2명과 함께 쉬는 날이에요!
                </Text>
              </View>
            </View>
          </View>

          {/* Content Right */}
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>동기 듀티 공유</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              동기들과 함께 쉬는 오프,{'\n'}
              이제 일일이 묻지 마세요
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              카카오톡 단톡방에 근무표 사진을 여러 장 올려놓고 맞추던 비효율을 없앴습니다.
              친구의 이번 달 스케줄을 한눈에 대조하고, 함께 쉴 수 있는 날을 자동으로 확인하세요.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>친구 근무표 실시간 비교</Text>
                  <Text style={styles.bulletSub}>동기들의 Day, Evening, Night, Off를 한 화면에서 대조합니다.</Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>겹치는 오프(Off) 자동 탐색</Text>
                  <Text style={styles.bulletSub}>함께 쉴 수 있는 골든 데이를 찾아 모임 약속을 추천해 드립니다.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Feature 02: 스마트 듀티 & 캘린더 ── */}
        <View style={[styles.spotlightRow, isMobile ? styles.spotlightRowMobile : styles.spotlightRowReverse]}>
          {/* Content Left */}
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>스마트 듀티 캘린더</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              터치 몇 번으로 끝나는{'\n'}
              이번 달 3교대 근무표 정리
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              복잡한 교대 근무 일정을 보기 쉬운 직관적인 캘린더로 변환합니다.
              오늘과 내일의 출퇴근 시간, 이번 주 스케줄 흐름을 한눈에 파악하세요.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>D / E / N / O 색상 코드 캘린더</Text>
                  <Text style={styles.bulletSub}>각 듀티별 명확한 색상 구분으로 월간 스케줄을 직관적으로 확인합니다.</Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>인수인계 데일리 메모</Text>
                  <Text style={styles.bulletSub}>주요 환자 상태와 병동 메모를 날짜별로 간편하게 기록하고 보관합니다.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Visual Right: Clean Calendar Card */}
          <View style={styles.visualCard}>
            <View style={[styles.calendarCard, isMobile && styles.cardMobile]}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>9월 듀티 캘린더</Text>
                <View style={styles.shiftCountRow}>
                  <Text style={[styles.shiftCountPill, { backgroundColor: '#FFE4E8', color: COLORS.primary }]}>D 12</Text>
                  <Text style={[styles.shiftCountPill, { backgroundColor: '#FEF3C7', color: '#D97706' }]}>E 8</Text>
                  <Text style={[styles.shiftCountPill, { backgroundColor: '#EDE9FE', color: '#7C3AED' }]}>N 4</Text>
                  <Text style={[styles.shiftCountPill, { backgroundColor: '#DCFCE7', color: '#16A34A' }]}>OFF 6</Text>
                </View>
              </View>

              <View style={styles.calendarGrid}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <Text key={i} style={styles.calendarDayHeader}>{day}</Text>
                ))}
                {[
                  { d: '1', s: 'D' }, { d: '2', s: 'D' }, { d: '3', s: 'E' }, { d: '4', s: 'E' },
                  { d: '5', s: 'O' }, { d: '6', s: 'O' }, { d: '7', s: 'D' }, { d: '8', s: 'N' },
                  { d: '9', s: 'N' }, { d: '10', s: 'O' }, { d: '11', s: 'O' }, { d: '12', s: 'D' },
                  { d: '13', s: 'D' }, { d: '14', s: 'E' },
                ].map((item, i) => (
                  <View key={i} style={styles.calCell}>
                    <Text style={styles.calDayNum}>{item.d}</Text>
                    <View
                      style={[
                        styles.calDot,
                        item.s === 'D' && { backgroundColor: COLORS.primary },
                        item.s === 'E' && { backgroundColor: '#F59E0B' },
                        item.s === 'N' && { backgroundColor: '#8B5CF6' },
                        item.s === 'O' && { backgroundColor: '#10B981' },
                      ]}
                    >
                      <Text style={styles.calDotText}>{item.s}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ── Feature 03: 임상 지식 & 약물 계산기 ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          {/* Visual Left: Drug Calculator Card */}
          <View style={styles.visualCard}>
            <View style={[styles.calcCard, isMobile && styles.cardMobile]}>
              <View style={styles.calcCardHeader}>
                <Text style={styles.calcBadge}>약물 계산 도우미</Text>
                <Text style={styles.calcStatus}>즉시 자동 환산</Text>
              </View>

              <View style={styles.calcQueryBox}>
                <Text style={styles.calcQueryLabel}>입력 처방</Text>
                <Text style={styles.calcQueryText}>
                  체중 60kg 환자, Dopamine 5mcg/kg/min (200mg/500mL 수액)
                </Text>
              </View>

              <View style={styles.calcResultBox}>
                <Text style={styles.calcResultLabel}>주입 펌프(Infusion Pump) 속도</Text>
                <Text style={styles.calcResultSpeed}>45.0 mL/hr</Text>
                <Text style={styles.calcFormula}>
                  • 분당 용량: 300 mcg/min → 시간당 18 mg/hr{'\n'}
                  • 약물 농도: 0.4 mg/mL → 18 ÷ 0.4 = 45 mL/hr
                </Text>
              </View>
            </View>
          </View>

          {/* Content Right */}
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>임상 계산 & 지침</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              투약 전 헷갈리는 점적 계산,{'\n'}
              1초 만에 확인하는 안심 계산기
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              환자 체중과 목표 용량을 입력하면 펌프 주입 속도(mL/hr)와 gtt/min을 즉시 계산합니다.
              긴박한 병동 현장에서 투약 오류 걱정 없이 안전하게 일할 수 있도록 돕습니다.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>Dopamine / Heparin 등 특수 점적 공식</Text>
                  <Text style={styles.bulletSub}>복잡한 비례식 계산 없이 체중과 처방량만 넣으면 끝납니다.</Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>필수 임상 술기 & 응급 프로토콜</Text>
                  <Text style={styles.bulletSub}>수혈 간호 체크리스트, 수술 후 바이탈 지침을 상시 제공합니다.</Text>
                </View>
              </View>
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
    paddingVertical: 88,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  containerMobile: {
    paddingVertical: 52,
    paddingHorizontal: 16,
  },
  inner: {
    maxWidth: 1140,
    width: '100%',
    gap: 96,
  },
  innerMobile: {
    gap: 56,
  },
  spotlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 56,
  },
  spotlightRowMobile: {
    flexDirection: 'column',
    gap: 32,
  },
  spotlightRowReverse: {
    flexDirection: 'row-reverse',
  },
  visualCard: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
    width: '100%',
  },
  contentColMobile: {
    alignItems: 'flex-start',
  },
  sectionCategory: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  sectionHeadline: {
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  sectionHeadlineMobile: {
    fontSize: 24,
    lineHeight: 34,
    marginBottom: 12,
  },
  sectionDesc: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    marginBottom: 24,
  },
  sectionDescMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
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
  // Friends Card
  friendsCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  cardMobile: {
    padding: 16,
    borderRadius: 18,
  },
  friendsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  matchBadgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  matchBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  friendsList: {
    gap: 10,
    marginBottom: 14,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 13,
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
  shiftBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  shiftTagMuted: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  shiftTagMutedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  shiftTagHighlight: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  shiftTagGreen: {
    backgroundColor: '#DCFCE7',
  },
  shiftTagNormal: {
    backgroundColor: '#F1F5F9',
  },
  shiftTagHighlightText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  friendsCardFooter: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  footerNoteText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '600',
  },
  // Calendar Card
  calendarCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  shiftCountRow: {
    flexDirection: 'row',
    gap: 4,
  },
  shiftCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 10,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  calCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calDayNum: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  calDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calDotText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Calculator Card
  calcCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  calcCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calcBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  calcStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  calcQueryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  calcQueryLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  calcQueryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 17,
  },
  calcResultBox: {
    backgroundColor: '#FFF0F3',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  calcResultLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  calcResultSpeed: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  calcFormula: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
});
