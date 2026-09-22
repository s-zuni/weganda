import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  PanResponder,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ViewStyle,
  StyleProp,
  ScrollView,
  ScrollViewProps,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DISMISS_DY_THRESHOLD = 70;
const DISMISS_VELOCITY_THRESHOLD = 0.35;

export interface BottomSheetContextType {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollOffsetRef: React.MutableRefObject<number>;
}

export const BottomSheetContext = React.createContext<BottomSheetContextType>({
  onScroll: () => {},
  scrollOffsetRef: { current: 0 },
});

export const useBottomSheetContext = () => React.useContext(BottomSheetContext);

export interface BottomSheetScrollViewProps extends ScrollViewProps {}

export const BottomSheetScrollView = React.forwardRef<ScrollView, BottomSheetScrollViewProps>(
  ({ onScroll, scrollEventThrottle = 16, ...props }, ref) => {
    const { onScroll: contextOnScroll } = useBottomSheetContext();
    return (
      <ScrollView
        ref={ref}
        scrollEventThrottle={scrollEventThrottle}
        onScroll={(e) => {
          contextOnScroll(e);
          onScroll?.(e);
        }}
        {...props}
      />
    );
  }
);
BottomSheetScrollView.displayName = 'BottomSheetScrollView';

export interface SwipeableBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | `${number}%`;
  maxHeight?: number | `${number}%`;
  containerStyle?: StyleProp<ViewStyle>;
  enableBackdropDismiss?: boolean;
  scrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
}

export const SwipeableBottomSheet: React.FC<SwipeableBottomSheetProps> = ({
  visible,
  onClose,
  children,
  height,
  maxHeight = '92%',
  containerStyle,
  enableBackdropDismiss = true,
  scrollOffset,
  onScrollOffsetChange,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scrollOffsetRef = useRef<number>(scrollOffset ?? 0);

  useEffect(() => {
    if (scrollOffset !== undefined) {
      scrollOffsetRef.current = scrollOffset;
    }
  }, [scrollOffset]);

  const handleChildScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollOffsetRef.current = y;
    onScrollOffsetChange?.(y);
  };

  // Open animation
  useEffect(() => {
    if (visible) {
      scrollOffsetRef.current = 0;
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 25,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const springBack = () => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 22,
      stiffness: 280,
      useNativeDriver: true,
    }).start();
  };

  // 1. 드래그 존(핸들 바) 전용 PanResponder — 스크롤 위치와 무관하게 즉시 캡처하여 아래로 드래그 시 닫기
  const dragZonePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_DY_THRESHOLD || gestureState.vy > DISMISS_VELOCITY_THRESHOLD) {
          handleDismiss();
        } else {
          springBack();
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        springBack();
      },
    })
  ).current;

  // 2. 시트 전체 컨테이너 PanResponder — 헤더, 본문 어디서든 스와이프 가능하되 스크롤뷰 최상단일 때만 아래로 드래그 캡처
  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isDownward = gestureState.dy > 8;
        const isVerticalDominant = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2;
        const isAtTop = scrollOffsetRef.current <= 1;
        return isDownward && isVerticalDominant && isAtTop;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // 버튼 탭(TouchableOpacity 등)을 가로채지 않도록 임계값을 24px 이상으로 키우고,
        // 확실히 아래로 드래그 중이면서 스크롤뷰 최상단일 때만 캡처
        const isDownward = gestureState.dy > 24;
        const isVerticalDominant = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 2.0;
        const isAtTop = scrollOffsetRef.current <= 0;
        return isDownward && isVerticalDominant && isAtTop;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_DY_THRESHOLD || gestureState.vy > DISMISS_VELOCITY_THRESHOLD) {
          handleDismiss();
        } else {
          springBack();
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        springBack();
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            },
          ]}
        >
          {enableBackdropDismiss && (
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleDismiss}
            />
          )}
        </Animated.View>

        {/* Sheet Container — 전체 시트 영역에 panHandlers 적용 */}
        <Animated.View
          {...sheetPanResponder.panHandlers}
          style={[
            styles.sheetContainer,
            {
              ...(height ? { height: height as any } : {}),
              maxHeight: maxHeight as any,
              transform: [{ translateY }],
            },
            containerStyle,
          ]}
        >
          {/* Pan drag grab bar zone — 상단 핸들 바 전용 panHandlers */}
          <View {...dragZonePanResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.handleBar} />
          </View>

          <BottomSheetContext.Provider value={{ onScroll: handleChildScroll, scrollOffsetRef }}>
            {children}
          </BottomSheetContext.Provider>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  dragZone: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
});

