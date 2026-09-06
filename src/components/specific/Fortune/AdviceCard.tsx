import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { LeafIcon } from '../../common/Icon';

interface AdviceCardProps {
  advice?: string;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({
  advice = '"오늘 하루, 나 자신에게 \'수고했어\'라고 먼저 말해주세요. 작은 친절 하나가 병동 전체를 따뜻하게 만듭니다."',
}) => {
  return (
    <View style={styles.adviceCard}>
      <View style={styles.adviceIconWrapper}>
        <LeafIcon size={20} color={COLORS.primary} />
      </View>
      <View style={styles.adviceContent}>
        <Text style={styles.adviceTitle}>오늘의 조언</Text>
        <Text style={styles.adviceDesc}>{advice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF1F4',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  adviceIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceContent: {
    flex: 1,
    gap: 4,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  adviceDesc: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: '500',
  },
});

