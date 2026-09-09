import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { BotIcon } from '../../common/Icon';

interface StudyAiBannerProps {
  onPress: () => void;
}

export const StudyAiBanner: React.FC<StudyAiBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.askAiBanner}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.askAiLeft}>
        <View style={styles.aiIconCircle}>
          <BotIcon size={20} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.askAiTitle}>🤖 💡 임상 지식을 AI에게 물어보세요</Text>
          <Text style={styles.askAiSub}>💊 약물 투약법 · ⚡ ACLS 프로토콜 · 📋 SBAR 실시간 답변 ›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  askAiBanner: {
    backgroundColor: '#FFF1F4',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  askAiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  askAiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  askAiSub: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});

