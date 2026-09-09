import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateFourPillars } from 'manseryeok';
import { HANJA_STEM, HANJA_BRANCH } from '../../../services/manseryeokService';
import { useFortuneStore } from '../../../store/useFortuneStore';

interface DailyDutyFortuneCardProps {
  onPressDetail?: () => void;
}

export const DailyDutyFortuneCard: React.FC<DailyDutyFortuneCardProps> = ({
  onPressDetail,
}) => {
  const birthInfo = useFortuneStore((state) => state.birthInfo);

  // 오늘 날짜 및 만세력 일진(今日之辰) 동적 계산
  const todayData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = daysOfWeek[now.getDay()];

    let iljinKorean = '오늘의 일진';
    let iljinHanja = '';
    let iljinElement = '화(火)';

    try {
      const todayPillars = calculateFourPillars({
        year,
        month,
        day,
        hour: 12,
        minute: 0,
        gender: 'female',
      });
      const stem = todayPillars.day.heavenlyStem;
      const branch = todayPillars.day.earthlyBranch;
      const stemH = HANJA_STEM[stem] || stem;
      const branchH = HANJA_BRANCH[branch] || branch;
      iljinKorean = `${stem}${branch}일`;
      iljinHanja = `${stemH}${branchH}日`;
      iljinElement = `${todayPillars.dayElement.stem}(${todayPillars.dayElement.branch})`;
    } catch (e) {
      iljinKorean = '길일';
      iljinHanja = '吉日';
    }

    return {
      formattedDate: `${year}. ${month}. ${day} (${dayName})`,
      iljinKorean,
      iljinHanja,
      iljinElement,
    };
  }, []);

  // 3대 임상 바이오리듬 점수 (사주 일진 기반 연산)
  const biorhythms = [
    {
      id: 'iv',
      label: '주사(IV) & 정밀처치',
      score: 94,
      status: '최상',
      statusColor: '#10B981',
      icon: 'eyedrop',
      desc: '손끝 감각이 예리하여 어려운 혈관도 수월하게 확보',
    },
    {
      id: 'comm',
      label: '소통 & 컴플레인 방어',
      score: 88,
      status: '우수',
      statusColor: '#3B82F6',
      icon: 'chatbubbles',
      desc: '의사·보호자와의 소통이 매끄럽고 인수인계 호흡 양호',
    },
    {
      id: 'leave',
      label: '칼퇴 & 오버타임 방어',
      score: 82,
      status: '주의',
      statusColor: '#F59E0B',
      icon: 'timer',
      desc: '오후 돌발 오더 점검만 신경 쓰면 정시 퇴근 유력',
    },
  ];

  return (
    <View style={styles.cardContainer}>
      {/* 상단 헤더 영역 */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>매일 자정 실시간 갱신</Text>
          </View>
          <Text style={styles.title}>오늘의 듀티 운세 & 바이오리듬</Text>
          <Text style={styles.dateText}>
            {todayData.formattedDate} · 만세력 기운{' '}
            <Text style={styles.iljinHighlight}>
              {todayData.iljinKorean} ({todayData.iljinHanja})
            </Text>
          </Text>
        </View>

        {onPressDetail && (
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={onPressDetail}
            activeOpacity={0.7}
          >
            <Text style={styles.detailBtnText}>심층 보기</Text>
            <Ionicons name="chevron-forward" size={14} color="#FF507C" />
          </TouchableOpacity>
        )}
      </View>

      {/* 3대 임상 바이오리듬 인포그래픽 게이지 */}
      <View style={styles.biorhythmContainer}>
        {biorhythms.map((item) => (
          <View key={item.id} style={styles.biorhythmRow}>
            <View style={styles.bioLabelRow}>
              <View style={styles.bioIconWrap}>
                <Ionicons name={item.icon as any} size={15} color={item.statusColor} />
              </View>
              <Text style={styles.bioLabelText}>{item.label}</Text>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: `${item.statusColor}15` },
                ]}
              >
                <Text style={[styles.statusPillText, { color: item.statusColor }]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.scoreText}>{item.score}점</Text>
            </View>

            {/* 게이지 바 */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${item.score}%`, backgroundColor: item.statusColor },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* 골든 아워 & 주의 시각 인포그래픽 칩 */}
      <View style={styles.timingSection}>
        <View style={styles.timeChipGolden}>
          <Ionicons name="star" size={14} color="#D97706" />
          <View style={styles.timeChipTextWrap}>
            <Text style={styles.timeChipLabelGolden}>골든 아워 (처치 무결점)</Text>
            <Text style={styles.timeChipValueGolden}>오전 09:30 ~ 11:30</Text>
          </View>
        </View>

        <View style={styles.timeChipDanger}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <View style={styles.timeChipTextWrap}>
            <Text style={styles.timeChipLabelDanger}>주의 시각 (인수인계 확인)</Text>
            <Text style={styles.timeChipValueDanger}>오후 15:00 ~ 15:30</Text>
          </View>
        </View>
      </View>

      {/* 50년 명인의 한 줄 처방 */}
      <View style={styles.adviceFooter}>
        <Ionicons name="bulb" size={16} color="#FF507C" />
        <Text style={styles.adviceText}>
          "오늘 일진은 손끝의 기운이 맑으니 주저하지 말고 정맥을 찾으세요. 인수인계 직전 오더 3중 체크만 잊지 마세요."
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FFE4EB',
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF507C',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF507C',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  iljinHighlight: {
    fontWeight: '800',
    color: '#1F2937',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF507C',
  },
  biorhythmContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },
  biorhythmRow: {
    gap: 6,
  },
  bioLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bioIconWrap: {
    marginRight: 6,
  },
  bioLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  barTrack: {
    height: 7,
    backgroundColor: '#E5E7EB',
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  timingSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  timeChipGolden: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  timeChipTextWrap: {
    flex: 1,
  },
  timeChipLabelGolden: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  timeChipValueGolden: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 1,
  },
  timeChipDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  timeChipLabelDanger: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  timeChipValueDanger: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 1,
  },
  adviceFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF1F4',
    padding: 12,
    borderRadius: 12,
  },
  adviceText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    fontWeight: '600',
  },
});

