import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { CustomShiftCode } from '../../../../types/shift';

interface ScheduleUploadTabProps {
  month: number;
  year: number;
  customCodes: Record<string, CustomShiftCode>;
  isScanning: boolean;
  uploadingFileType: string | null;
  scanResult: Record<string, string> | null;
  onStartUpload: (type: 'pdf' | 'excel' | 'image') => void;
  onApplyScanResult: () => void;
  onGoToCustomCodeTab?: () => void;
  onGoToManualTab?: () => void;
}

export const ScheduleUploadTab: React.FC<ScheduleUploadTabProps> = ({
  month,
  year,
  customCodes,
  isScanning,
  uploadingFileType,
  scanResult,
  onStartUpload,
  onApplyScanResult,
  onGoToCustomCodeTab,
  onGoToManualTab,
}) => {
  return (
    <View>
      {/* 준비 중 안내 공지 배너 */}
      <View style={styles.noticeBanner}>
        <View style={styles.noticeBadge}>
          <Text style={styles.noticeBadgeText}>기능 준비 중</Text>
        </View>
        <Text style={styles.noticeTitle}>
          스마트 파일 자동 인식은 고도화 작업 중입니다
        </Text>
        <Text style={styles.noticeDesc}>
          다양한 병원별 근무표 서식을 더욱 정밀하게 자동 판독하기 위해 열심히 준비하고 있어요.
          현재는 [직접 퀵 입력] 탭을 이용해 주시면 빠르게 등록하실 수 있습니다!
        </Text>
        {onGoToManualTab && (
          <TouchableOpacity
            style={styles.goManualBtn}
            onPress={onGoToManualTab}
            activeOpacity={0.8}
          >
            <Text style={styles.goManualBtnText}>직접 퀵 입력으로 이동하기 ›</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.tabDesc}>
        지원 예정인 파일 형식 (준비 중):
      </Text>

      <View style={styles.uploadButtonGroup}>
        <TouchableOpacity
          style={[styles.uploadOptionCard, styles.uploadOptionDisabled]}
          onPress={() => onStartUpload('image')}
          activeOpacity={0.8}
        >
          <View style={styles.uploadIconBadge}>
            <Text style={styles.uploadEmoji}>📷</Text>
          </View>
          <View style={styles.uploadInfo}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.uploadOptionTitle}>근무표 사진 / 캡처</Text>
              <View style={styles.preparingTag}>
                <Text style={styles.preparingTagText}>준비 중</Text>
              </View>
            </View>
            <Text style={styles.uploadOptionSub}>갤러리 사진 또는 카메라 촬영 인식</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadOptionCard, styles.uploadOptionDisabled]}
          onPress={() => onStartUpload('excel')}
          activeOpacity={0.8}
        >
          <View style={styles.uploadIconBadge}>
            <Text style={styles.uploadEmoji}>📊</Text>
          </View>
          <View style={styles.uploadInfo}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.uploadOptionTitle}>Excel 파일 (.xlsx / .csv)</Text>
              <View style={styles.preparingTag}>
                <Text style={styles.preparingTagText}>준비 중</Text>
              </View>
            </View>
            <Text style={styles.uploadOptionSub}>병동 엑셀 파일 표 추출</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadOptionCard, styles.uploadOptionDisabled]}
          onPress={() => onStartUpload('pdf')}
          activeOpacity={0.8}
        >
          <View style={styles.uploadIconBadge}>
            <Text style={styles.uploadEmoji}>📄</Text>
          </View>
          <View style={styles.uploadInfo}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.uploadOptionTitle}>PDF 문서</Text>
              <View style={styles.preparingTag}>
                <Text style={styles.preparingTagText}>준비 중</Text>
              </View>
            </View>
            <Text style={styles.uploadOptionSub}>공식 인쇄용 듀티 PDF</Text>
          </View>
        </TouchableOpacity>
      </View>

      {onGoToCustomCodeTab && (
        <TouchableOpacity
          style={styles.customCodeShortcut}
          onPress={onGoToCustomCodeTab}
          activeOpacity={0.8}
        >
          <Text style={styles.customCodeShortcutText}>
            💡 특수 근무(슬립, F 등)를 인식시키려면?{' '}
            <Text style={styles.customCodeShortcutLink}>커스텀 코드 관리 ›</Text>
          </Text>
        </TouchableOpacity>
      )}

      {/* AI 스캔 로딩 애니메이션 */}
      {isScanning && (
        <View style={styles.scanningCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.scanningTitle}>AI가 근무표를 분석하고 있어요...</Text>
          <Text style={styles.scanningFile}>{uploadingFileType}</Text>
          <Text style={styles.scanningSub}>병동별 근무 코드 및 날짜 매핑 중 (약 1.5초)</Text>
        </View>
      )}

      {/* 스캔 결과 미리보기 및 확정 */}
      {scanResult && !isScanning && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>인식 완료! (31일 스케줄 추출)</Text>
            <Text style={styles.resultSub}>{uploadingFileType}</Text>
          </View>

          <Text style={styles.previewNotice}>
            인식된 근무를 확인하신 후 [스케줄 적용하기]를 눌러주세요.
          </Text>

          {/* 간이 7일치 미리보기 */}
          <View style={styles.previewGrid}>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const dStr = String(d).padStart(2, '0');
              const mStr = String(month + 1).padStart(2, '0');
              const code = scanResult[`${year}-${mStr}-${dStr}`] || 'D';
              const info = customCodes[code] || { color: COLORS.primary, textColor: '#FFF' };
              return (
                <View key={d} style={styles.previewItem}>
                  <Text style={styles.previewDayText}>{d}일</Text>
                  <View style={[styles.previewBadge, { backgroundColor: info.color }]}>
                    <Text style={[styles.previewBadgeText, { color: info.textColor }]}>
                      {code}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={onApplyScanResult}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>내 캘린더에 스케줄 적용하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  noticeBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  noticeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  noticeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#191F28',
    marginBottom: 6,
  },
  noticeDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 12,
  },
  goManualBtn: {
    backgroundColor: '#FFF1F4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  goManualBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    lineHeight: 19,
    marginBottom: 12,
  },
  uploadButtonGroup: {
    gap: 10,
    marginBottom: 20,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preparingTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  preparingTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  uploadOptionDisabled: {
    opacity: 0.85,
  },
  uploadOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  uploadIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadEmoji: {
    fontSize: 22,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  uploadOptionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scanningCard: {
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  scanningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  scanningFile: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scanningSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginVertical: 12,
  },
  resultHeader: {
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resultSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  previewNotice: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  previewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  previewItem: {
    alignItems: 'center',
    gap: 4,
  },
  previewDayText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  previewBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  customCodeShortcut: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  customCodeShortcutText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  customCodeShortcutLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
