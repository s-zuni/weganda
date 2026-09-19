import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface VerifiedNurseBadgeProps {
  size?: number;
  style?: ViewStyle;
  color?: string;
}

/**
 * 인스타그램 스타일의 간호사 인증 블루 체크 뱃지
 * - 사용자 이름 우측/우상단에 조그마하게 배치되어 전문 임상 간호사 신원을 증명
 */
export const VerifiedNurseBadge: React.FC<VerifiedNurseBadgeProps> = ({
  size = 14,
  style,
  color = '#0064FF',
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <Circle cx="8" cy="8" r="8" fill={color} />
        <Path
          d="M4.5 8.2L6.8 10.5L11.5 5.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default VerifiedNurseBadge;

