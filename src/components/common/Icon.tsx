import React from 'react';
import Svg, { Path, G, Circle, SvgProps } from 'react-native-svg';

export interface IconProps extends SvgProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

// ── 1. 운세 (Fortune / Sparkles) ──────────────────────────
export const FortuneIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#6B7280',
  focused = false,
  ...props
}) => {
  const activeColor = focused ? '#FF507C' : color;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M19.5 8.66667L18.1458 5.6875L15.1667 4.33333L18.1458 2.97917L19.5 0L20.8542 2.97917L23.8333 4.33333L20.8542 5.6875L19.5 8.66667ZM19.5 23.8333L18.1458 20.8542L15.1667 19.5L18.1458 18.1458L19.5 15.1667L20.8542 18.1458L23.8333 19.5L20.8542 20.8542L19.5 23.8333ZM8.66667 20.5833L5.95833 14.625L0 11.9167L5.95833 9.20833L8.66667 3.25L11.375 9.20833L17.3333 11.9167L11.375 14.625L8.66667 20.5833ZM8.66667 15.3292L9.75 13L12.0792 11.9167L9.75 10.8333L8.66667 8.50417L7.58333 10.8333L5.25417 11.9167L7.58333 13L8.66667 15.3292Z"
        fill={activeColor}
      />
    </Svg>
  );
};

// ── 2. 친구 (Friends / 2 People) ──────────────────────────
export const FriendsIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#6B7280',
  focused = false,
  ...props
}) => {
  const activeColor = focused ? '#FF507C' : color;
  return (
    <Svg
      width={size}
      height={(size * 17.33) / 23.83}
      viewBox="0 0 23.8333 17.3333"
      fill="none"
      {...props}
    >
      <Path
        d="M0 17.3333V14.3C0 13.6861 0.157986 13.1219 0.473958 12.6073C0.789931 12.0927 1.20972 11.7 1.73333 11.4292C2.85278 10.8694 3.99028 10.4497 5.14583 10.1698C6.30139 9.88993 7.475 9.75 8.66667 9.75C9.85833 9.75 11.0319 9.88993 12.1875 10.1698C13.3431 10.4497 14.4806 10.8694 15.6 11.4292C16.1236 11.7 16.5434 12.0927 16.8594 12.6073C17.1753 13.1219 17.3333 13.6861 17.3333 14.3V17.3333H0ZM19.5 17.3333V14.0833C19.5 13.2889 19.2788 12.526 18.8365 11.7948C18.3941 11.0635 17.7667 10.4361 16.9542 9.9125C17.875 10.0208 18.7417 10.2059 19.5542 10.4677C20.3667 10.7295 21.125 11.05 21.8292 11.4292C22.4792 11.7903 22.9757 12.192 23.3188 12.6344C23.6618 13.0767 23.8333 13.5597 23.8333 14.0833V17.3333H19.5ZM8.66667 8.66667C7.475 8.66667 6.45486 8.24236 5.60625 7.39375C4.75764 6.54514 4.33333 5.525 4.33333 4.33333C4.33333 3.14167 4.75764 2.12153 5.60625 1.27292C6.45486 0.424306 7.475 0 8.66667 0C9.85833 0 10.8785 0.424306 11.7271 1.27292C12.5757 2.12153 13 3.14167 13 4.33333C13 5.525 12.5757 6.54514 11.7271 7.39375C10.8785 8.24236 9.85833 8.66667 8.66667 8.66667ZM19.5 4.33333C19.5 5.525 19.0757 6.54514 18.2271 7.39375C17.3785 8.24236 16.3583 8.66667 15.1667 8.66667C14.9681 8.66667 14.7153 8.6441 14.4083 8.59896C14.1014 8.55382 13.8486 8.50417 13.65 8.45C14.1375 7.87222 14.5122 7.23125 14.774 6.52708C15.0358 5.82292 15.1667 5.09167 15.1667 4.33333C15.1667 3.575 15.0358 2.84375 14.774 2.13958C14.5122 1.43542 14.1375 0.794444 13.65 0.216667C13.9028 0.126389 14.1556 0.0677083 14.4083 0.040625C14.6611 0.0135417 14.9139 0 15.1667 0C16.3583 0 17.3785 0.424306 18.2271 1.27292C19.0757 2.12153 19.5 3.14167 19.5 4.33333ZM2.16667 15.1667H15.1667V14.3C15.1667 14.1014 15.117 13.9208 15.0177 13.7583C14.9184 13.5958 14.7875 13.4694 14.625 13.3792C13.65 12.8917 12.666 12.526 11.6729 12.2823C10.6799 12.0385 9.67778 11.9167 8.66667 11.9167C7.65556 11.9167 6.65347 12.0385 5.66042 12.2823C4.66736 12.526 3.68333 12.8917 2.70833 13.3792C2.54583 13.4694 2.41493 13.5958 2.31562 13.7583C2.21632 13.9208 2.16667 14.1014 2.16667 14.3V15.1667ZM8.66667 6.5C9.2625 6.5 9.77257 6.28785 10.1969 5.86354C10.6212 5.43924 10.8333 4.92917 10.8333 4.33333C10.8333 3.7375 10.6212 3.22743 10.1969 2.80312C9.77257 2.37882 9.2625 2.16667 8.66667 2.16667C8.07083 2.16667 7.56076 2.37882 7.13646 2.80312C6.71215 3.22743 6.5 3.7375 6.5 4.33333C6.5 4.92917 6.71215 5.43924 7.13646 5.86354C7.56076 6.28785 8.07083 6.5 8.66667 6.5Z"
        fill={activeColor}
      />
    </Svg>
  );
};

// ── 3. 홈 FAB (Stethoscope / 청진기) ───────────────────────
export const StethoscopeIcon: React.FC<IconProps> = ({
  size = 28,
  color = '#FFFFFF',
  ...props
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 28.3333 28.3333"
      fill="none"
      {...props}
    >
      <G id="Container">
        <Path
          id="Icon"
          d="M16.2917 28.3333C13.7417 28.3333 11.5694 27.4361 9.775 25.6417C7.98056 23.8472 7.08333 21.675 7.08333 19.125V18.3104C5.05278 17.9799 3.36458 17.0295 2.01875 15.4594C0.672917 13.8892 0 12.0417 0 9.91667V1.41667H4.25V0H7.08333V5.66667H4.25V4.25H2.83333V9.91667C2.83333 11.475 3.38819 12.809 4.49792 13.9187C5.60764 15.0285 6.94167 15.5833 8.5 15.5833C10.0583 15.5833 11.3924 15.0285 12.5021 13.9187C13.6118 12.809 14.1667 11.475 14.1667 9.91667V4.25H12.75V5.66667H9.91667V0H12.75V1.41667H17V9.91667C17 12.0417 16.3271 13.8892 14.9812 15.4594C13.6354 17.0295 11.9472 17.9799 9.91667 18.3104V19.125C9.91667 20.8958 10.5365 22.401 11.776 23.6406C13.0156 24.8802 14.5208 25.5 16.2917 25.5C18.0625 25.5 19.5677 24.8802 20.8073 23.6406C22.0469 22.401 22.6667 20.8958 22.6667 19.125V16.7521C21.8403 16.4687 21.1615 15.9611 20.6302 15.2292C20.099 14.4972 19.8333 13.6708 19.8333 12.75C19.8333 11.5694 20.2465 10.566 21.0729 9.73958C21.8993 8.91319 22.9028 8.5 24.0833 8.5C25.2639 8.5 26.2674 8.91319 27.0938 9.73958C27.9201 10.566 28.3333 11.5694 28.3333 12.75C28.3333 13.6708 28.0677 14.4972 27.5365 15.2292C27.0052 15.9611 26.3264 16.4687 25.5 16.7521V19.125C25.5 21.675 24.6028 23.8472 22.8083 25.6417C21.0139 27.4361 18.8417 28.3333 16.2917 28.3333Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

// ── 4. 학습 (Study / Graduation Cap) ──────────────────────
export const StudyIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#6B7280',
  focused = false,
  ...props
}) => {
  const activeColor = focused ? '#FF507C' : color;
  return (
    <Svg
      width={size}
      height={(size * 19.5) / 23.83}
      viewBox="0 0 23.8333 19.5"
      fill="none"
      {...props}
    >
      <Path
        d="M11.9167 19.5L4.33333 15.3833V8.88333L0 6.5L11.9167 0L23.8333 6.5V15.1667H21.6667V7.69167L19.5 8.88333V15.3833L11.9167 19.5ZM11.9167 10.5083L19.3375 6.5L11.9167 2.49167L4.49583 6.5L11.9167 10.5083ZM11.9167 17.0354L17.3333 14.1104V10.0208L11.9167 13L6.5 10.0208V14.1104L11.9167 17.0354Z"
        fill={activeColor}
      />
    </Svg>
  );
};

// ── 5. 커뮤니티 (Community / Chat Bubbles) ────────────────
export const CommunityIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#6B7280',
  focused = false,
  ...props
}) => {
  const activeColor = focused ? '#FF507C' : color;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 21.6667 21.6667"
      fill="none"
      {...props}
    >
      <Path
        d="M21.6667 21.6667L17.3333 17.3333H6.5C5.90417 17.3333 5.3941 17.1212 4.96979 16.6969C4.54549 16.2726 4.33333 15.7625 4.33333 15.1667V14.0833H16.25C16.8458 14.0833 17.3559 13.8712 17.7802 13.4469C18.2045 13.0226 18.4167 12.5125 18.4167 11.9167V4.33333H19.5C20.0958 4.33333 20.6059 4.54549 21.0302 4.96979C21.4545 5.3941 21.6667 5.90417 21.6667 6.5V21.6667ZM2.16667 11.0229L3.43958 9.75H14.0833V2.16667H2.16667V11.0229ZM0 16.25V2.16667C0 1.57083 0.212153 1.06076 0.636458 0.636458C1.06076 0.212153 1.57083 0 2.16667 0H14.0833C14.6792 0 15.1892 0.212153 15.6135 0.636458C16.0378 1.06076 16.25 1.57083 16.25 2.16667V9.75C16.25 10.3458 16.0378 10.8559 15.6135 11.2802C15.1892 11.7045 14.6792 11.9167 14.0833 11.9167H4.33333L0 16.25Z"
        fill={activeColor}
      />
    </Svg>
  );
};

// ── 6. 밴드 로고 (Bandage / 우간다 심볼) ────────────────────
export const BandageIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18.2875 18.2875"
      fill="none"
      {...props}
    >
      <G id="Container">
        <Path
          d="M9.14375 14.3229L5.70625 17.7604C5.35486 18.1118 4.92708 18.2875 4.42292 18.2875C3.91875 18.2875 3.49097 18.1118 3.13958 17.7604L0.527083 15.1479C0.175694 14.7965 0 14.3687 0 13.8646C0 13.3604 0.175694 12.9326 0.527083 12.5813L3.96458 9.14375L0.527083 5.70625C0.175694 5.35486 0 4.92708 0 4.42292C0 3.91875 0.175694 3.49097 0.527083 3.13958L3.13958 0.527083C3.49097 0.175694 3.91875 0 4.42292 0C4.92708 0 5.35486 0.175694 5.70625 0.527083L9.14375 3.96458L12.5813 0.527083C12.9326 0.175694 13.3604 0 13.8646 0C14.3687 0 14.7965 0.175694 15.1479 0.527083L17.7604 3.13958C18.1118 3.49097 18.2875 3.91875 18.2875 4.42292C18.2875 4.92708 18.1118 5.35486 17.7604 5.70625L14.3229 9.14375L17.7604 12.5813C18.1118 12.9326 18.2875 13.3604 18.2875 13.8646C18.2875 14.3687 18.1118 14.7965 17.7604 15.1479L15.1479 17.7604C14.7965 18.1118 14.3687 18.2875 13.8646 18.2875C13.3604 18.2875 12.9326 18.1118 12.5813 17.7604L9.14375 14.3229ZM9.14375 8.22708C9.40347 8.22708 9.62118 8.13924 9.79688 7.96354C9.97257 7.78785 10.0604 7.57014 10.0604 7.31042C10.0604 7.05069 9.97257 6.83299 9.79688 6.65729C9.62118 6.4816 9.40347 6.39375 9.14375 6.39375C8.88403 6.39375 8.66632 6.4816 8.49063 6.65729C8.31493 6.83299 8.22708 7.05069 8.22708 7.31042C8.22708 7.57014 8.31493 7.78785 8.49063 7.96354C8.66632 8.13924 8.88403 8.22708 9.14375 8.22708ZM5.24792 7.86042L7.86042 5.24792L4.42292 1.81042L1.81042 4.42292L5.24792 7.86042ZM7.31042 10.0604C7.57014 10.0604 7.78785 9.97257 7.96354 9.79688C8.13924 9.62118 8.22708 9.40347 8.22708 9.14375C8.22708 8.88403 8.13924 8.66632 7.96354 8.49063C7.78785 8.31493 7.57014 8.22708 7.31042 8.22708C7.05069 8.22708 6.83299 8.31493 6.65729 8.49063C6.4816 8.66632 6.39375 8.88403 6.39375 9.14375C6.39375 9.40347 6.4816 9.62118 6.65729 9.79688C6.83299 9.97257 7.05069 10.0604 7.31042 10.0604ZM9.14375 11.8938C9.40347 11.8938 9.62118 11.8059 9.79688 11.6302C9.97257 11.4545 10.0604 11.2368 10.0604 10.9771C10.0604 10.7174 9.97257 10.4997 9.79688 10.324C9.62118 10.1483 9.40347 10.0604 9.14375 10.0604C8.88403 10.0604 8.66632 10.1483 8.49063 10.324C8.31493 10.4997 8.22708 10.7174 8.22708 10.9771C8.22708 11.2368 8.31493 11.4545 8.49063 11.6302C8.66632 11.8059 8.88403 11.8938 9.14375 11.8938ZM10.9771 10.0604C11.2368 10.0604 11.4545 9.97257 11.6302 9.79688C11.8059 9.62118 11.8938 9.40347 11.8938 9.14375C11.8938 8.88403 11.8059 8.66632 11.6302 8.49063C11.4545 8.31493 11.2368 8.22708 10.9771 8.22708C10.7174 8.22708 10.4997 8.31493 10.324 8.49063C10.1483 8.66632 10.0604 8.88403 10.0604 9.14375C10.0604 9.40347 10.1483 9.62118 10.324 9.79688C10.4997 9.97257 10.7174 10.0604 10.9771 10.0604ZM10.4271 13.0396L13.8646 16.4771L16.4771 13.8646L13.0396 10.4271L10.4271 13.0396Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

// ── 7. 알림 벨 (Notification Bell) ──────────────────────────
export const BellIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#404944',
  ...props
}) => {
  return (
    <Svg
      width={(size * 16) / 20}
      height={size}
      viewBox="0 0 16 20"
      fill="none"
      {...props}
    >
      <G id="Container">
        <Path
          d="M0 17V15H2V8C2 6.61667 2.41667 5.3875 3.25 4.3125C4.08333 3.2375 5.16667 2.53333 6.5 2.2V1.5C6.5 1.08333 6.64583 0.729167 6.9375 0.4375C7.22917 0.145833 7.58333 0 8 0C8.41667 0 8.77083 0.145833 9.0625 0.4375C9.35417 0.729167 9.5 1.08333 9.5 1.5V2.2C10.8333 2.53333 11.9167 3.2375 12.75 4.3125C13.5833 5.3875 14 6.61667 14 8V15H16V17H0ZM8 20C7.45 20 6.97917 19.8042 6.5875 19.4125C6.19583 19.0208 6 18.55 6 18H10C10 18.55 9.80417 19.0208 9.4125 19.4125C9.02083 19.8042 8.55 20 8 20ZM4 15H12V8C12 6.9 11.6083 5.95833 10.825 5.175C10.0417 4.39167 9.1 4 8 4C6.9 4 5.95833 4.39167 5.175 5.175C4.39167 5.95833 4 6.9 4 8V15Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

// ── 8. 사용자 프로필 (User Profile) ────────────────────────
export const UserIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#404944',
  ...props
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <G id="Container">
        <Path
          d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

// ── 9. 시계 (Clock / 알람 맞추기) ──────────────────────────
export const ClockIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFFFFF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 6V12L15.5 14"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 10. 연필 / 작성 (Pencil / 특이사항 / 새 글) ─────────────
export const PencilIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37144 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73736 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 11. 서류가방 / 키트 (Briefcase / 업무 가이드) ─────────────
export const BriefcaseIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 12. 눈 / 조회수 (Eye / Views) ──────────────────────────
export const EyeIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#9CA3AF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 13. 하트 / 좋아요 (Heart / Likes) ──────────────────────
export const HeartIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#9CA3AF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 14. 말풍선 / 댓글 (Comment / Chat bubble) ───────────────
export const CommentIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#9CA3AF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 15. 코인 / 금전 (Coins / Wealth) ────────────────────────
export const CoinsIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 16. 팔레트 / 컬러 (Palette / Lucky Color) ───────────────
export const PaletteIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#404944',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.64-.24-1.22-.64-1.66-.4-.44-.66-1.02-.66-1.66 0-1.38 1.12-2.5 2.5-2.5H18c3.31 0 6-2.69 6-6 0-4.97-4.48-9.18-12-7.68z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 17. 해시 / 숫자 (Hash / Lucky Number) ───────────────────
export const HashIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#404944',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 18. 나침반 / 방향 (Compass / Lucky Direction) ────────────
export const CompassIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#404944',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.2"
    />
  </Svg>
);

// ── 19. 나뭇잎 / 조언 (Leaf / Daily Advice) ──────────────────
export const LeafIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M11 20A7 7 0 0 1 4 13C4 6.13 9.42 2.72 16.74 2.03c.57-.05 1.08.38 1.13.95.7 7.32-2.7 12.74-9.57 12.74h-.3M2 22l10-10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 20. 스파클 / 탄생 (Sparkles / Birth Info) ─────────────────
export const SparklesIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 3v3m0 12v3M3 12h3m12 0h3M5.636 5.636l2.122 2.122m8.485 8.485l2.122 2.122M5.636 18.364l2.122-2.122m8.485-8.485l2.122-2.122"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 21. 별 / 즐겨찾기 (Star / Favorite) ──────────────────────
export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = 18,
  color = '#FFB800',
  filled = true,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 22. 검색 돋보기 (Search) ─────────────────────────────────
export const SearchIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#9CA3AF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 21L16.65 16.65"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 23. 더하기 (Plus / Add Friend) ───────────────────────────
export const PlusIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFFFFF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 24. 단체 / 그룹 (Users / Group Chat) ─────────────────────
export const UsersIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21v-2a4 4 0 0 0-3-3.87"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13a4 4 0 0 1 0 7.75"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 25. 전송 (Send / Chat Message) ───────────────────────────
export const SendIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 26. 맞교환 (Repeat / Shift Swap) ─────────────────────────
export const RepeatIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M17 1l4 4-4 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 13v2a4 4 0 0 1-4 4H3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 27. 캘린더 (Calendar / Schedule Table) ───────────────────
export const CalendarIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 28. 공유 (Share / Share Post) ───────────────────────────
export const ShareIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#6B7280',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 29. 깃발 / 신고 (Flag / Report) ──────────────────────────
export const FlagIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#E11D48',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 30. 차단 (Block / Ban User) ─────────────────────────────
export const BlockIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#6B7280',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.93 4.93l14.14 14.14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 31. 사진 / 이미지 첨부 (Image / Attachment) ─────────────
export const ImageIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#6B7280',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 32. 자물쇠 / 비밀글 (Lock / Anonymous Secret) ───────────
export const LockIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#6B7280',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 33. 더보기 (More Vertical) ──────────────────────────────
export const MoreVerticalIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#6B7280',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 34. 대댓글 화살표 (Corner Down Right / Nested Reply) ────
export const CornerDownRightIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#9CA3AF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M15 10l5 5-5 5M4 4v7a4 4 0 0 0 4 4h12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 35. 북마크 / 보관함 (Bookmark / Scraps) ─────────────────
export const BookmarkIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = 18,
  color = '#FF507C',
  filled = false,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 36. 병원 인증 뱃지 (Badge Check / Verified Hospital) ────
export const BadgeCheckIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#0284C7',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill={color}
      fillOpacity="0.15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 37. 불꽃 / 인기글 (Fire / HOT Topics) ────────────────────
export const FireIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 38. 계산기 (Calculator / Drug Dose) ──────────────────────
export const CalculatorIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 6h8M16 14v4M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 39. 플라스크 / 약물 (Flask / Pharmacology) ───────────────
export const FlaskIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M10 2v7.31L4.15 19.1A2 2 0 0 0 5.86 22h12.28a2 2 0 0 0 1.71-2.9L14 9.31V2h-4z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 2h7M6.5 15h11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 40. 번개 / 응급 (Zap / ACLS) ─────────────────────────────
export const ZapIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#F59E0B',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 41. 심전도 / 바이탈 (Activity / Vital Signs) ──────────────
export const ActivityIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#E11D48',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M22 12h-4l-3 9L9 3l-3 9H2"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 42. 책 / 매뉴얼 (BookOpen / Protocol Guide) ──────────────
export const BookOpenIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#4F98CA',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 43. 봇 / AI 질문 (Bot / AI Clinical Q&A) ─────────────────
export const BotIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 2v2M8 4h8M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 13v.01M15 13v.01M9 17h6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 44. 휴지통 / 삭제 (Trash / Delete Notification) ──────────
export const TrashIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#9CA3AF',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 45. 프리미엄 배지 (Crown / Premium) ──────────────────────
export const CrownIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#D4A853',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M2 20h20v2H2v-2zM4 10l4 4 4-6 4 6 4-4v8H4v-8z"
      fill={color}
    />
  </Svg>
);

// ── 46. 구독 확인 (Shield Check / Verified) ──────────────────
export const ShieldCheckIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#10B981',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 47. 차트 / 연봉 예측 (Chart Bar / Salary) ─────────────────
export const ChartBarIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FF507C',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M18 20V10M12 20V4M6 20v-6"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
