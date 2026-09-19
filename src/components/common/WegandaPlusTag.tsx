import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface WegandaPlusTagProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'gold' | 'minimal';
}

/**
 * weganda+ 프리미엄 기능 마이크로 태그
 * - 서비스 타이틀 우상단에 작고 단정하게 배치되어 프리미엄 멤버십 기능임을 표시
 */
export const WegandaPlusTag: React.FC<WegandaPlusTagProps> = ({
  style,
  textStyle,
  variant = 'gold',
}) => {
  const isGold = variant === 'gold';

  return (
    <View style={[styles.container, isGold ? styles.goldContainer : styles.minimalContainer, style]}>
      <Text style={[styles.text, isGold ? styles.goldText : styles.minimalText, textStyle]}>
        weganda+
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  goldContainer: {
    backgroundColor: '#FFF8E7',
    borderWidth: 0.5,
    borderColor: '#F5E6C8',
  },
  minimalContainer: {
    backgroundColor: '#F1F5F9',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  goldText: {
    color: '#B8922E', // PREMIUM_COLORS.goldText
  },
  minimalText: {
    color: '#475569',
  },
});

export default WegandaPlusTag;

