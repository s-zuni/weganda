import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingFeatureSpotlights: React.FC = () => {
  const { isMobile } = useResponsive();

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]} nativeID="features">
      <View style={[styles.inner, isMobile && styles.innerMobile]}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>우간다 실제 앱 기능 미리보기</Text>
          <Text style={styles.sectionHeaderSub}>
            실제 개발 중인 우간다 모바일 앱의 5대 주요 화면과 핵심 기능을 소개합니다.
          </Text>
        </View>

        {/* ── Feature 01: 동기 듀티 공유 (friends.png) ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/screens/friends.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>

          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>01. 동기 듀티 공유</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              동기들과 함께 쉬는 오프,{'\n'}
              이제 일일이 묻지 마세요
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              단톡방에서 근무표 사진을 여러 장 올려놓고 맞추던 번거로움을 없앴습니다.
              친구의 이번 달 스케줄을 한눈에 대조하고, 함께 쉴 수 있는 날을 자동으로 확인하세요.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>친구 근무표 실시간 대조</Text>
                  <Text style={styles.bulletSub}>
                    동기들의 Day, Evening, Night, Off 듀티를 한 화면에서 즉시 확인합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>겹치는 근무 & 오프 자동 탐색</Text>
                  <Text style={styles.bulletSub}>
                    "이번 주 민지님과 3번의 데이(Day) 근무가 겹쳐요!" 알림으로 모임 약속을 손쉽게 잡습니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Feature 02: 스마트 듀티 & 캘린더 (home.png) ── */}
        <View style={[styles.spotlightRow, isMobile ? styles.spotlightRowMobile : styles.spotlightRowReverse]}>
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>02. 스마트 듀티 홈</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              터치 몇 번으로 끝나는{'\n'}
              이번 달 3교대 근무표 정리
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              복잡한 교대 근무 일정을 직관적인 Bento 그리드 카드로 한눈에 파악합니다.
              오늘(D)과 내일(O) 근무 시간, 위클리 스트립, 그리고 출근 전 알람까지 원클릭으로 맞출 수 있습니다.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>Bento 스타일 근무 카드 & 주간 스트립</Text>
                  <Text style={styles.bulletSub}>
                    오늘/내일 근무와 월화수목금토일 주간 듀티 흐름을 선명하게 보여줍니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>인수인계 특이사항 & 업무 가이드 메모</Text>
                  <Text style={styles.bulletSub}>
                    주요 환자 상태와 병동 프로토콜을 날짜별 데일리 노트로 간편하게 기록합니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/screens/home.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>
        </View>

        {/* ── Feature 03: 임상 학습 & Ask AI (study.png) ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/screens/study.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>

          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>03. 임상 학습 & Ask AI</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              투약 전 헷갈리는 점적 계산,{'\n'}
              1초 만에 확인하는 안심 지침서
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              손으로 계산하기 복잡한 점적 약물 용량부터 전해질 불균형 중재, 응급 상황 ACLS 알고리즘까지
              환자 안전을 위한 필수 임상 지침을 자연어로 즉시 검색하고 북마크하세요.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>도파민(Dopamine) 점적 계산법 & 특수 약물</Text>
                  <Text style={styles.bulletSub}>
                    환자 체중과 목표 투여량 입력 시 펌프 주입 속도(mL/hr)와 gtt/min을 자동 환산합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>수혈 간호 체크리스트 & 수술 후 바이탈</Text>
                  <Text style={styles.bulletSub}>
                    신규 간호사 독립을 지원하는 실무 가이드와 EKG 판독 팁을 상시 열람할 수 있습니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Feature 04: 듀티 운세 & 힐링 (fortune.png) ── */}
        <View style={[styles.spotlightRow, isMobile ? styles.spotlightRowMobile : styles.spotlightRowReverse]}>
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>04. 듀티 사주 운세</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              지친 퇴근길, 마음을 달래는{'\n'}
              간호사 맞춤 듀티 운세
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              3교대 근무로 불규칙해진 바이오리듬과 감정을 케어하기 위해 사주 명리학에 기반한
              오늘의 행운 지수와 맞춤 테라피 메시지를 매일 아침 전해드립니다.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>오늘의 행운 지수 (88점) & 세부 운세</Text>
                  <Text style={styles.bulletSub}>
                    동료와의 협력, 오후 근무 주의점, 애정운과 직업운을 가볍게 확인합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>행운의 색상 '우간다 핑크' & 오늘의 조언</Text>
                  <Text style={styles.bulletSub}>
                    병동에서의 긴장감을 덜어주는 따뜻한 조언으로 하루를 긍정적으로 시작합니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/screens/fortune.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>
        </View>

        {/* ── Feature 05: 간호사 익명 커뮤니티 (community.png) ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/screens/community.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>

          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>05. 100% 익명 커뮤니티</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              병원 내 누구에게도 말 못 한{'\n'}
              진짜 우리들의 이야기
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              철저한 익명성이 보장되는 안전한 공간에서 나이트 근무 생존법, 선배/동료와의 고충,
              이직 커리어 상담, 국가고시 팁까지 전국 간호사들과 자유롭게 소통하세요.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>카테고리별 맞춤 게시판</Text>
                  <Text style={styles.bulletSub}>
                    커리어 상담, 교대 근무, 한풀이, 자유 게시판 등 목적에 맞게 소통합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>안전한 클린 모니터링</Text>
                  <Text style={styles.bulletSub}>
                    비방 및 부적절한 게시글을 신속히 차단하여 건강하고 따뜻한 커뮤니티 문화를 유지합니다.
                  </Text>
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
    gap: 104,
  },
  innerMobile: {
    gap: 64,
  },
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center' as any,
    marginBottom: -20,
  },
  sectionHeaderTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  sectionHeaderSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 580,
  },
  spotlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 64,
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
  // Sleek Phone Frame for Real Screenshot
  phoneFrame: {
    width: 290,
    height: 600,
    backgroundColor: '#0F172A',
    borderRadius: 40,
    padding: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    borderWidth: 3.5,
    borderColor: '#1E293B',
  },
  phoneFrameMobile: {
    width: 270,
    height: 550,
    borderRadius: 34,
    padding: 6,
  },
  phoneSpeaker: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerDot: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  screenWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    overflow: 'hidden',
  },
  screenImage: {
    width: '100%',
    height: '100%',
  },
  homeBar: {
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
});
