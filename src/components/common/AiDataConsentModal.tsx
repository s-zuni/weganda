import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, NEUTRAL, useAppTheme, type ThemeColors } from '../../constants/theme';
import { BotIcon, ShieldCheckIcon } from './Icon';

interface AiDataConsentModalProps {
  visible: boolean;
  featureName?: string;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Apple App Store Guidelines 5.1.1(i) & 5.1.2(i) 준수:
 * 제3자 AI 서비스(OpenAI, Google Gemini)로 데이터를 전송하기 전
 * 1) 전송 데이터 항목, 2) 수신자(제3자 AI 제공자), 3) 이용 목적 및 동등 수준 보호를 고지하고
 * 사용자의 명시적 사전 동의를 받는 모달.
 */
export const AiDataConsentModal: React.FC<AiDataConsentModalProps> = ({
  visible,
  featureName = 'AI 맞춤 기능',
  onAccept,
  onDecline,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { marginBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <BotIcon size={24} color={theme.primary} />
            </View>
            <Text style={styles.title}>제3자 AI 서비스 데이터 전송 동의</Text>
            <Text style={styles.subtitle}>
              '{featureName}' 이용을 위해 아래와 같이 외부 AI 서비스로 데이터가 전송됩니다. 동의 후 이용해 주세요.
            </Text>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>1. 데이터를 전송받는 제3자 (수신자)</Text>
              <Text style={styles.itemText}>
                • <Text style={styles.bold}>OpenAI, L.L.C.</Text> (미국) — OpenAI API{'\n'}
                • <Text style={styles.bold}>Google LLC</Text> (미국) — Google Gemini API
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>2. 전송되는 데이터 항목</Text>
              <Text style={styles.itemText}>
                • <Text style={styles.bold}>학습 AI 질문:</Text> 사용자가 입력한 질문 텍스트{'\n'}
                • <Text style={styles.bold}>워크스타일 리포트:</Text> 생년월일시, 성별, MBTI 및 대화 내용{'\n'}
                • <Text style={styles.bold}>근무표 OCR 스캔:</Text> 사용자가 업로드한 근무표 이미지
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>3. 이용 목적 및 데이터 보호 조치</Text>
              <Text style={styles.itemText}>
                • 입력하신 정보는 실시간 AI 답변, 리포트 생성 및 근무표 인식 목적으로만 TLS 암호화를 통해 전송됩니다.{'\n'}
                • 전송된 데이터는 제3자 AI 모델 학습(Training)에 활용되지 않으며, 우간다의 개인정보 처리방침과 <Text style={styles.bold}>동등하거나 그 이상의 보호 수준</Text>으로 안전하게 처리됩니다.
              </Text>
            </View>

            <View style={styles.shieldRow}>
              <ShieldCheckIcon size={16} color={COLORS.status.success} />
              <Text style={styles.shieldText}>
                동의하지 않으셔도 기본 듀티 캘린더, 수당 계산, 커뮤니티 열람 등 다른 기능은 그대로 이용하실 수 있습니다.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={onDecline}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="동의하지 않음"
            >
              <Text style={styles.declineBtnText}>동의하지 않음</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={onAccept}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="동의하고 AI 기능 사용하기"
            >
              <Text style={styles.acceptBtnText}>동의하고 사용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '85%',
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      elevation: 10,
    },
    header: {
      alignItems: 'center',
      marginBottom: 14,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
    },
    bodyScroll: {
      maxHeight: 330,
      marginBottom: 16,
    },
    infoBox: {
      backgroundColor: NEUTRAL.gray50,
      borderRadius: 14,
      padding: 13,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.textPrimary,
      marginBottom: 6,
    },
    itemText: {
      fontSize: 12.5,
      color: COLORS.textSecondary,
      lineHeight: 19,
    },
    bold: {
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    shieldRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      paddingHorizontal: 4,
      marginTop: 4,
      marginBottom: 4,
    },
    shieldText: {
      flex: 1,
      fontSize: 12,
      color: COLORS.textMuted,
      lineHeight: 17,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
    },
    declineBtn: {
      flex: 1,
      height: 48,
      borderRadius: 24,
      backgroundColor: NEUTRAL.gray100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    declineBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.textSecondary,
    },
    acceptBtn: {
      flex: 1.4,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acceptBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.onPrimaryText,
    },
  });

export default AiDataConsentModal;
