import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { DailyPatientNote } from '../../../mocks/dailyNotes';

interface SbarSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  notes: DailyPatientNote[];
  currentDate: string;
}

interface SbarParsedItem {
  patient: string;
  diagnosis: string;
  rawNote: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export const SbarSummaryModal: React.FC<SbarSummaryModalProps> = ({
  visible,
  onClose,
  notes,
  currentDate,
}) => {
  const theme = useAppTheme();
  const [selectedPatientIdx, setSelectedPatientIdx] = useState<number>(0);

  // 환자 메모를 기반으로 SBAR 구조화 (스마트 파싱 로직)
  const sbarItems: SbarParsedItem[] = useMemo(() => {
    return notes.map((item) => {
      const text = item.note;
      
      // 키워드 기반 스마트 분기 or 기본 지능형 구조화
      let situation = `${item.patient}님, ${item.diagnosis} 주호소 관련 상태 점검 중`;
      let background = `진단: ${item.diagnosis} / 등록일자: ${item.date}`;
      let assessment = '특이 생체징후 및 주관적 호소 점검 필요';
      let recommendation = '다음 듀티 정기 모니터링 및 추가 오더 확인 요망';

      // 메모 본문 분석
      if (text.includes('바이탈') || text.includes('BP') || text.includes('BT') || text.includes('통증') || text.includes('NRS')) {
        assessment = `환자 상태 및 V/S: ${text}`;
      } else {
        assessment = `임상 관찰: ${text}`;
      }

      if (text.includes('투약') || text.includes('수액') || text.includes('fluid') || text.includes('검사') || text.includes('내일') || text.includes('확인')) {
        recommendation = `인계 사항: ${text} 관련 다음 듀티 추적 관찰 및 조치`;
        situation = `${item.patient}님 현재 특이 변동사항 인계`;
      } else {
        situation = `${item.patient}님 (${item.diagnosis}) 안정적 유지 중`;
      }

      return {
        patient: item.patient,
        diagnosis: item.diagnosis,
        rawNote: item.note,
        situation,
        background,
        assessment,
        recommendation,
      };
    });
  }, [notes]);

  const activeItem = sbarItems[selectedPatientIdx] || sbarItems[0];

  // 전체 인수인계 텍스트 생성
  const generateFullClipboardText = () => {
    if (sbarItems.length === 0) return '';
    let result = `📋 [우간다 AI SBAR 인수인계 요약] - ${currentDate}\n`;
    result += `총 환자 수: ${sbarItems.length}명\n`;
    result += `=========================================\n\n`;

    sbarItems.forEach((item, idx) => {
      result += `[환자 #${idx + 1}] ${item.patient} (${item.diagnosis})\n`;
      result += `• S (Situation 상황): ${item.situation}\n`;
      result += `• B (Background 배경): ${item.background}\n`;
      result += `• A (Assessment 사정): ${item.assessment}\n`;
      result += `• R (Recommendation 제안): ${item.recommendation}\n`;
      result += `• 원문 메모: ${item.rawNote}\n\n`;
    });

    result += `=========================================\n`;
    result += `인수인계 완료 시각: ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}\n`;
    return result;
  };

  const handleCopyFull = async () => {
    const text = generateFullClipboardText();
    if (!text) {
      Alert.alert('알림', '복사할 인수인계 데이터가 없습니다.');
      return;
    }
    await Clipboard.setStringAsync(text);
    Alert.alert(
      '복사 완료',
      '전체 환자의 표준 SBAR 인수인계 시트가 클립보드에 복사되었습니다.\n\n카카오톡 또는 EMR 간호일지에 바로 붙여넣어 활용하세요!'
    );
  };

  const handleCopyCurrent = async () => {
    if (!activeItem) return;
    const text = `📋 [SBAR 인계] ${activeItem.patient} (${activeItem.diagnosis})\n• S: ${activeItem.situation}\n• B: ${activeItem.background}\n• A: ${activeItem.assessment}\n• R: ${activeItem.recommendation}`;
    await Clipboard.setStringAsync(text);
    Alert.alert('복사 완료', `${activeItem.patient} 환자의 SBAR 요약이 복사되었습니다.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.closeBtn, { color: theme.primary }]}>‹ 닫기</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>AI SBAR 인수인계 요약</Text>
            <View style={styles.proTag}>
              <Text style={styles.proTagText}>weganda+</Text>
            </View>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* 상단 안내 배너 */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoBannerTitle}>표준 SBAR 프로토콜 자동 정돈</Text>
              <Text style={styles.infoBannerSub}>
                당일 기록된 환자 메모를 Situation, Background, Assessment, Recommendation 표준 양식으로 요약했습니다.
              </Text>
            </View>
          </View>

          {notes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>요약할 특이사항이 없습니다</Text>
              <Text style={styles.emptySub}>
                환자 특이사항 메모를 먼저 1건 이상 등록하시면 AI가 SBAR 시트로 정돈해 드립니다.
              </Text>
            </View>
          ) : (
            <>
              {/* 환자 선택 탭 (환자가 2명 이상일 때) */}
              {sbarItems.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.patientTabs}
                >
                  {sbarItems.map((item, idx) => {
                    const isSelected = idx === selectedPatientIdx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.patientTab,
                          isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                        ]}
                        onPress={() => setSelectedPatientIdx(idx)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.patientTabText,
                            isSelected && { color: theme.onPrimaryText, fontWeight: '800' },
                          ]}
                        >
                          {item.patient}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* 활성 환자 SBAR 카드 */}
              {activeItem && (
                <View style={styles.sbarCard}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardPatientName}>{activeItem.patient}</Text>
                      <Text style={styles.cardDiagnosis}>{activeItem.diagnosis}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardCopyBtn}
                      onPress={handleCopyCurrent}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cardCopyBtnText}>이 환자만 복사</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.quadrantGrid}>
                    {/* S: Situation */}
                    <View style={[styles.quadrantBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <View style={styles.quadrantLabelRow}>
                        <Text style={[styles.quadrantLetter, { color: '#1D4ED8' }]}>S</Text>
                        <Text style={[styles.quadrantTitle, { color: '#1E40AF' }]}>Situation (현재 상황)</Text>
                      </View>
                      <Text style={styles.quadrantDesc}>{activeItem.situation}</Text>
                    </View>

                    {/* B: Background */}
                    <View style={[styles.quadrantBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                      <View style={styles.quadrantLabelRow}>
                        <Text style={[styles.quadrantLetter, { color: '#15803D' }]}>B</Text>
                        <Text style={[styles.quadrantTitle, { color: '#166534' }]}>Background (배경 정보)</Text>
                      </View>
                      <Text style={styles.quadrantDesc}>{activeItem.background}</Text>
                    </View>

                    {/* A: Assessment */}
                    <View style={[styles.quadrantBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                      <View style={styles.quadrantLabelRow}>
                        <Text style={[styles.quadrantLetter, { color: '#B45309' }]}>A</Text>
                        <Text style={[styles.quadrantTitle, { color: '#92400E' }]}>Assessment (사정/관찰)</Text>
                      </View>
                      <Text style={styles.quadrantDesc}>{activeItem.assessment}</Text>
                    </View>

                    {/* R: Recommendation */}
                    <View style={[styles.quadrantBox, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
                      <View style={styles.quadrantLabelRow}>
                        <Text style={[styles.quadrantLetter, { color: '#BE123C' }]}>R</Text>
                        <Text style={[styles.quadrantTitle, { color: '#9F1239' }]}>Recommendation (제안/인계)</Text>
                      </View>
                      <Text style={styles.quadrantDesc}>{activeItem.recommendation}</Text>
                    </View>
                  </View>

                  {/* 원문 메모 박스 */}
                  <View style={styles.rawNoteBox}>
                    <Text style={styles.rawNoteTitle}>작성 원문 메모</Text>
                    <Text style={styles.rawNoteContent}>{activeItem.rawNote}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* 하단 전체 복사 버튼 */}
        {notes.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.copyAllBtn, { backgroundColor: theme.primary }]}
              onPress={handleCopyFull}
              activeOpacity={0.88}
            >
              <Text style={[styles.copyAllBtnText, { color: theme.onPrimaryText }]}>
                📋 전체 SBAR 인수인계 시트 복사 ({notes.length}명)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  proTag: {
    backgroundColor: '#D4A853',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoBannerIcon: {
    fontSize: 24,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  infoBannerSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  patientTabs: {
    gap: 8,
    paddingBottom: 4,
  },
  patientTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  patientTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  sbarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  cardPatientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  cardDiagnosis: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  cardCopyBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cardCopyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  quadrantGrid: {
    gap: 10,
  },
  quadrantBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  quadrantLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  quadrantLetter: {
    fontSize: 14,
    fontWeight: '900',
  },
  quadrantTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  quadrantDesc: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  rawNoteBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rawNoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  rawNoteContent: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  copyAllBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyAllBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
