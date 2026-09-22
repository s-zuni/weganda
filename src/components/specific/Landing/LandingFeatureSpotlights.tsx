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
          <Text style={styles.sectionHeaderTitle}>우간다 실제 앱 기능 미리보기</Text>
          <Text style={styles.sectionHeaderSub}>
            간호사의 일과 삶을 지켜주는 우간다 모바일 앱의 6대 핵심 기능을 소개합니다.
          </Text>
        </View>

        {/* ── Feature 01: 스마트 듀티 홈 & 캘린더 (screen_home.png) ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/landing/screen_home.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>

          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>01. 스마트 듀티 홈 & 캘린더</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              터치 몇 번으로 끝나는{'\n'}
              이번 달 3교대 근무표 정리
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              복잡한 D/E/N/O 3교대 일정을 직관적인 카드와 캘린더로 정리하고,
              오늘과 내일의 근무 시간, 주간 흐름, 출근 알람을 자동으로 맞춰드립니다.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>오늘·내일 근무 카드 & 출근 알람</Text>
                  <Text style={styles.bulletSub}>
                    오늘 근무와 다음 근무 일정, 남은 교대 시간을 한눈에 확인하고 알람을 설정합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>인수인계 메모 & 데일리 노트</Text>
                  <Text style={styles.bulletSub}>
                    환자 특이사항과 인수인계 주요 내용을 날짜별 데일리 메모로 간편하게 기록합니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Feature 02: 동기 듀티 & 실시간 채팅 (screen_friends.png) ── */}
        <View style={[styles.spotlightRow, isMobile ? styles.spotlightRowMobile : styles.spotlightRowReverse]}>
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>02. 동기 듀티 & 실시간 채팅</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              동기들과 함께 쉬는 오프,{'\n'}
              이제 일일이 묻지 마세요
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              단톡방에서 근무표 사진을 여러 장 올려놓고 맞추던 번거로움을 없앴습니다.
              친구의 이번 달 스케줄을 한눈에 대조하고, 함께 쉴 수 있는 날을 자동으로 확인해 바로 대화를 시작하세요.
            </Text>

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
                  <Text style={styles.bulletTitle}>겹치는 오프 자동 탐색 & 실시간 채팅</Text>
                  <Text style={styles.bulletSub}>
                    함께 쉬는 날을 자동으로 찾아주고, 병동 동기들과 대화하며 모임 약속을 손쉽게 잡습니다.
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
                  source={require('../../../assets/images/landing/screen_friends.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>
        </View>

        {/* ── Feature 03: 24시간 임상 AI 챗봇 (screen_ai_chat.png) ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/landing/screen_ai_chat.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>

          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>03. 24시간 임상 AI 챗봇</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              바쁜 병동에서 헷갈릴 때,{'\n'}
              24시간 실시간 임상 질의응답
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              선배 간호사 눈치 볼 필요 없이, 투약 프로토콜·의학 용어·검사 수치 의미·환자 처치 방법을
              언제든 편하게 물어보고 즉시 답변을 확인하세요.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>1:1 실시간 임상 가이드</Text>
                  <Text style={styles.bulletSub}>
                    환자 바이탈 이상 징후, 약물 상호작용, 임상 간호 처치법을 즉시 답변합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>신규부터 경력직까지 안심 동행</Text>
                  <Text style={styles.bulletSub}>
                    바쁜 업무 중에도 핵심만 빠르게 정리해 주어 임상 현장의 불안감을 덜어줍니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Feature 04: 임상 실무 & 약물 계산기 (screen_study.png) ── */}
        <View style={[styles.spotlightRow, isMobile ? styles.spotlightRowMobile : styles.spotlightRowReverse]}>
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>04. 임상 실무 & 약물 계산기</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              투약 전 헷갈리는 점적 계산,{'\n'}
              1초 만에 확인하는 안심 계산기
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              손으로 계산하기 까다로운 gtt/min과 주입 속도(cc/hr)를 환자 체중과 목표량 입력 즉시
              자동으로 환산하고, 필수 간호 지침을 상시 확인하세요.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>점적 속도 & 펌프 주입량 자동 환산</Text>
                  <Text style={styles.bulletSub}>
                    Dopamine, Heparin 등 고위험 약물 용량과 펌프 주입 속도를 1초 만에 자동 계산합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>핵심 임상 실무 지침서</Text>
                  <Text style={styles.bulletSub}>
                    수혈 간호 체크리스트, 응급 대응 가이드, EKG 판독 팁 등 실무 지침을 상시 열람합니다.
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
                  source={require('../../../assets/images/landing/screen_study.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>
        </View>

        {/* ── Feature 05: 간호사·간호학생 인증 안심 커뮤니티 (screen_community.png) ── */}
        <View style={[styles.spotlightRow, isMobile && styles.spotlightRowMobile]}>
          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/landing/screen_community.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
            </View>
          </View>

          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>05. 간호사·간호학생 인증 커뮤니티</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              면허·학생증 인증 회원만 이용하는{'\n'}
              100% 안심 익명 소통 공간
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              철저한 신원 인증을 거친 간호사와 간호학생만 입장할 수 있어,
              외부 유출이나 악성 글 걱정 없이 진짜 우리들의 이야기를 나눌 수 있습니다.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>철저한 인증제 & 맞춤 게시판</Text>
                  <Text style={styles.bulletSub}>
                    간호사는 전체 게시판을 이용하며, 간호학생은 학생 라운지·취업·임상 3대 전용 게시판을 이용합니다.
                  </Text>
                </View>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletTitle}>100% 보장되는 익명성과 공감</Text>
                  <Text style={styles.bulletSub}>
                    병동 고충, 나이트 생존법, 이직과 진로 고민을 안심하고 털어놓으며 소통합니다.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Feature 06: 3교대 듀티 사주 운세 (screen_fortune.png) ── */}
        <View style={[styles.spotlightRow, isMobile ? styles.spotlightRowMobile : styles.spotlightRowReverse]}>
          <View style={[styles.contentCol, isMobile && styles.contentColMobile]}>
            <Text style={styles.sectionCategory}>06. 3교대 듀티 사주 운세</Text>
            <Text style={[styles.sectionHeadline, isMobile && styles.sectionHeadlineMobile]}>
              지친 퇴근길, 마음을 달래는{'\n'}
              간호사 맞춤 듀티 운세
            </Text>
            <Text style={[styles.sectionDesc, isMobile && styles.sectionDescMobile]}>
              3교대 근무로 불규칙해진 바이오리듬을 케어하기 위해,
              매일 아침 오늘의 행운 지수와 병동 협력운, 따뜻한 힐링 조언을 전해드립니다.
            </Text>

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

          <View style={styles.visualCard}>
            <View style={[styles.phoneFrame, isMobile && styles.phoneFrameMobile]}>
              <View style={styles.phoneSpeaker}>
                <View style={styles.speakerDot} />
              </View>
              <View style={styles.screenWrap}>
                <Image
                  source={require('../../../assets/images/landing/screen_fortune.png')}
                  style={styles.screenImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.homeBar} />
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
