import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, {
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Rect,
  SvgProps,
} from 'react-native-svg';

export interface WegandaLogoProps extends SvgProps {
  size?: number;
  variant?: 'full' | 'symbol';
  symbolColor?: string;
  primaryColor?: string;
  style?: ViewStyle;
}

/**
 * 우간다 (Weganda) 공식 메인 로고
 * Figma Node ID: 19:2 (weganda_logo)
 * - 3교대 간호사의 심장 박동(ECG Vital)과 'W' 심볼이 결합된 브랜드 아이덴티티
 */
export const WegandaLogo: React.FC<WegandaLogoProps> = ({
  size = 32,
  variant = 'full',
  symbolColor,
  primaryColor,
  style,
  ...props
}) => {
  if (variant === 'symbol') {
    // 순수 심볼(ECG 펄스 파형)만 렌더링
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        style={style}
        {...props}
      >
        <Path
          d="M32.4956 101.15L48.9395 93.829L46.173 55.6538L92.8154 113.701L79.9742 40.6046L125.703 99.0586L122.023 61.2901L127.504 58.8497"
          stroke={symbolColor || primaryColor || '#FF507C'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Figma 원본 1:1 풀 스퀘어클(Squircle) 그라디언트 앱 로고
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      style={style}
      {...props}
    >
      <G clipPath="url(#weganda_clip)">
        {/* 베이스 비바 코랄 핑크 그라디언트 또는 동적 테마 컬러 */}
        <Path
          d="M124 0H36C16.1177 0 0 16.1177 0 36V124C0 143.882 16.1177 160 36 160H124C143.882 160 160 143.882 160 124V36C160 16.1177 143.882 0 124 0Z"
          fill={primaryColor || "url(#weganda_paint0)"}
        />
        {/* 소프트 하이라이트 오버레이 */}
        <Path
          d="M124 0H36C16.1177 0 0 16.1177 0 36V124C0 143.882 16.1177 160 36 160H124C143.882 160 160 143.882 160 124V36C160 16.1177 143.882 0 124 0Z"
          fill="url(#weganda_paint1)"
        />
        {/* 이너 보더 스트로크 */}
        <Path
          d="M124 0.5H36C16.3939 0.5 0.5 16.3939 0.5 36V124C0.5 143.606 16.3939 159.5 36 159.5H124C143.606 159.5 159.5 143.606 159.5 124V36C159.5 16.3939 143.606 0.5 124 0.5Z"
          stroke="#FFFFFF"
          strokeOpacity="0.3"
        />
        {/* 메인 화이트 펄스 파형 */}
        <Path
          d="M32.4956 101.15L48.9395 93.829L46.173 55.6538L92.8154 113.701L79.9742 40.6046L125.703 99.0586L122.023 61.2901L127.504 58.8497"
          stroke={symbolColor || 'url(#weganda_pulse_paint)'}
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <LinearGradient id="weganda_paint0" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FF638B" />
          <Stop offset="1" stopColor="#FF3E6D" />
        </LinearGradient>
        <LinearGradient id="weganda_paint1" x1="0" y1="0" x2="0" y2="160" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFFFFF" stopOpacity="0.35" />
          <Stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.05" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
        </LinearGradient>
        <LinearGradient
          id="weganda_pulse_paint"
          x1="17.8531"
          y1="68.2627"
          x2="119.012"
          y2="129.78"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#F6F7F9" />
        </LinearGradient>
        <ClipPath id="weganda_clip">
          <Rect width="160" height="160" fill="#FFFFFF" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default WegandaLogo;

