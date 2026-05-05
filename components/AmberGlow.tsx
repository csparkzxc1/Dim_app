import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme/colors';

type AmberGlowProps = {
  active: boolean;
  durationMs?: number;
  maxOpacity?: number;
};

const BURN_IN_SHIFT_PX = 10;
const BURN_IN_SCALE_VARIATION = 0.05;

function jitter(maxAbs: number): number {
  return (Math.random() * 2 - 1) * maxAbs;
}

export function AmberGlow({
  active,
  durationMs = 30 * 60 * 1000,
  maxOpacity = 0.5,
}: AmberGlowProps) {
  const { width, height } = useWindowDimensions();
  const opacity = useSharedValue(0);

  const { offsetX, offsetY, diameter, innerDiameter } = useMemo(() => {
    const baseDiameter = Math.min(width, height) * 0.55;
    const scale = 1 + jitter(BURN_IN_SCALE_VARIATION);
    const finalDiameter = baseDiameter * scale;
    return {
      offsetX: jitter(BURN_IN_SHIFT_PX),
      offsetY: jitter(BURN_IN_SHIFT_PX),
      diameter: finalDiameter,
      innerDiameter: finalDiameter * 0.5,
    };
  }, [width, height]);

  useEffect(() => {
    opacity.value = withTiming(active ? maxOpacity : 0, {
      duration: active ? durationMs : 600,
      easing: Easing.inOut(Easing.quad),
    });
  }, [active, durationMs, maxOpacity, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        animatedStyle,
        { transform: [{ translateX: offsetX }, { translateY: offsetY }] },
      ]}
    >
      <View
        style={[
          styles.outerHalo,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
          },
        ]}
      />
      <View
        style={[
          styles.innerCore,
          {
            width: innerDiameter,
            height: innerDiameter,
            borderRadius: innerDiameter / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerHalo: {
    position: 'absolute',
    backgroundColor: colors.lightAmberStart,
    opacity: 0.35,
  },
  innerCore: {
    position: 'absolute',
    backgroundColor: colors.lightAmberEnd,
    opacity: 0.65,
  },
});
