import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const LandingFeatureSpotlights: React.FC = () => {
  return (
    <View style={styles.container} nativeID="spotlight">
      <View style={styles.inner}>
        {/* Spotlight 01: Duty Calendar & Synchronization */}
        <View style={styles.spotlightRow}>
          {/* Visual Left */}
          <View style={styles.visualCard}>
            <View style={styles.calendarMiniCard}>
              <View style={styles.calendarMiniHeader}>
                <Text style={styles.calendarMonthText}>2026년 9월 듀티 캘린더</Text>
                <View style={styles.shiftTagGroup}>
                  <Text style={[styles.shiftTag, { backgroundColor: '#FFE4E8', color: COLORS.primary }]}>D 12</Text>
                  <Text style={[styles.shiftTag, { backgroundColor: '#FEF3C7', color: '#D97706' }]}>E 8</Text>
                  <Text style={[styles.shiftTag, { backgroundColor: '#EDE9FE', color: '#7C3AED' }]}>N 4</Text>
                  <Text style={[styles.shiftTag, { backgroundColor: '#DCFCE7', color: '#16A34A' }]}>OFF 6</Text>
                </View>
              </View>

              {/* Mini Calendar Grid */}
              <View style={styles.calendarGrid}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <Text key={i} style={styles.dayOfWeekText}>{day}</Text>
                ))}
                {[
                  { d: '1', s: 'D' }, { d: '2', s: 'D' }, { d: '3', s: 'E' }, { d: '4', s: 'E' },
                  { d: '5', s: 'O' }, { d: '6', s: 'O' }, { d: '7', s: 'D' }, { d: '8', s: 'N' },
                  { d: '9', s: 'N' }, { d: '10', s: 'O' }, { d: '11', s: 'O' }, { d: '12', s: 'D' },
                  { d: '13', s: 'D' }, { d: '14', s: 'E' },
                ].map((item, i) => (
                  <View key={i} style={styles.dayCell}>
                    <Text style={styles.dayNumText}>{item.d}</Text>
                    <View
                      style={[
                        styles.shiftDot,
                        item.s === 'D' && { backgroundColor: COLORS.primary },
                        item.s === 'E' && { backgroundColor: '#F59E0B' },
                        item.s === 'N' && { backgroundColor: '#8B5CF6' },
                        item.s === 'O' && { backgroundColor: '#10B981' },
                      ]}
                    >
                      <Text style={styles.shiftDotText}>{item.s}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.syncStatusRow}>
                <Text style={styles.syncPulseDot}>●</Text>
                <Text style={styles.syncStatusText}>동기 3명의 근무표와 실시간 동기화 중</Text>
              </View>
            </View>
          </View>

          {/* Content Right */}
          <View style={styles.contentCol}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>스마트 듀티 관리</Text>
            </View>
            <Text style={styles.headline}>
              한 번의 터치로 완성되는{'\n'}
              <Text style={{ color: COLORS.primary }}>스마트 듀티 캘린더</Text>
            </Text>
            <Text style={styles.description}>
              복잡한 3교대 표를 보며 달력에 일일이 적던 번거로움은 이제 그만.{'\n'}
              터치 한 번으로 D/E/N/O를 등록하고, 친구들의 스케줄과 비교하여 겹치는 오프를 실시간으로 탐색합니다.
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Text style={styles.featureEmoji}>⚡</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>30초 만에 끝나는 한 달 듀티 입력</Text>
                  <Text style={styles.featureSub}>반복 입력 및 프리셋으로 터치 몇 번에 한 달 일정이 완성됩니다.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Text style={styles.featureEmoji}>👥</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>동기들과의 실시간 오프 매칭</Text>
                  <Text style={styles.featureSub}>친구와 듀티를 비교해 함께 쉬는 날을 찾아 모임 날짜를 추천합니다.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Spotlight 02: AI Clinical Assistant & Calculations */}
        <View style={[styles.spotlightRow, styles.spotlightRowReverse]}>
          {/* Content Left */}
          <View style={styles.contentCol}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>임상 AI & 스마트 계산기</Text>
            </View>
            <Text style={styles.headline}>
              급할 때 1초 만에 답하는{'\n'}
              <Text style={{ color: COLORS.primary }}>실시간 간호 지식 AI</Text>
            </Text>
            <Text style={styles.description}>
              손으로 계산하기 복잡한 점적 약물 용량부터 응급 상황 ACLS 처치 순서까지,{'\n'}
              환자 안전을 위한 필수 임상 가이드를 자연어로 즉시 확인하세요.
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Text style={styles.featureEmoji}>💊</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>Dopamine / Heparin 점적 약물 계산기</Text>
                  <Text style={styles.featureSub}>환자 체중과 목표 투여량 입력 시 cc/hr 및 gtt/min을 자동 환산합니다.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Text style={styles.featureEmoji}>📋</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>신규 간호사 독립 필수 임상 가이드</Text>
                  <Text style={styles.featureSub}>수혈 간호 체크리스트, 수술 후 바이탈 프로토콜을 상시 열람할 수 있습니다.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Visual Right: AI Chat Card */}
          <View style={styles.visualCard}>
            <View style={styles.aiChatCard}>
              <View style={styles.aiChatHeader}>
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </View>
                <View>
                  <Text style={styles.aiNameText}>우간다 임상 어시스턴트</Text>
                  <Text style={styles.aiStatusText}>실시간 응답 가능 • 전문 지침 기반</Text>
                </View>
              </View>

              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>
                  "체중 60kg 환자, 도파민 5mcg/kg/min 처방인데 200mg/500mL 수액일 때 Infusion pump 주입 속도는?"
                </Text>
              </View>

              <View style={styles.aiBubble}>
                <Text style={styles.aiBubbleText}>
                  💡 <Text style={{ fontWeight: '800' }}>계산 결과: 45 cc/hr</Text>{'\n\n'}
                  • 분당 필요량 = 60kg × 5mcg = 300mcg/min{'\n'}
                  • 시간당 필요량 = 18,000 mcg/hr (18 mg/hr){'\n'}
                  • 농도 = 200mg / 500mL = 0.4 mg/mL{'\n'}
                  • 최종 주입 속도 = 18 ÷ 0.4 = <Text style={{ color: COLORS.primary, fontWeight: '800' }}>45 mL/hr</Text>
                </Text>
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
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  inner: {
    maxWidth: 1140,
    width: '100%',
    gap: 80,
  },
  spotlightRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    gap: 56,
  },
  spotlightRowReverse: {
    flexDirection: Platform.OS === 'web' ? 'row-reverse' : 'column',
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
  eyebrow: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  eyebrowText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headline: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    lineHeight: Platform.OS === 'web' ? 46 : 34,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    marginBottom: 28,
  },
  featureList: {
    gap: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  featureSub: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  // Calendar Card
  calendarMiniCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  calendarMiniHeader: {
    marginBottom: 16,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  shiftTagGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  shiftTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayOfWeekText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayNumText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  shiftDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  syncPulseDot: {
    color: '#10B981',
    fontSize: 12,
  },
  syncStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  // AI Chat Card
  aiChatCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  aiChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  aiAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAvatarText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 14,
  },
  aiNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  aiStatusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  userBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  userBubbleText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
  },
  aiBubble: {
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  aiBubbleText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
});

