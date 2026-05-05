import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useBurnInProtection } from '@/hooks/useBurnInProtection';
import { useFadeIn } from '@/hooks/useFadeIn';
import { colors } from '@/theme/colors';

type AmberGlowProps = {
  progress: number;
  maxOpacity?: number;
};

export function AmberGlow({ progress, maxOpacity = 0.5 }: AmberGlowProps) {
  const { width, height } = useWindowDimensions();
  const { offsetX, offsetY, scale } = useBurnInProtection();

  const targetOpacity = Math.min(1, Math.max(0, progress)) * maxOpacity;
  const opacity = useFadeIn(targetOpacity, { durationMs: 800 });

  const { diameter, innerDiameter } = useMemo(() => {
    const baseDiameter = Math.min(width, height) * 0.55 * scale;
    return {
      diameter: baseDiameter,
      innerDiameter: baseDiameter * 0.5,
    };
  }, [width, height, scale]);

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
