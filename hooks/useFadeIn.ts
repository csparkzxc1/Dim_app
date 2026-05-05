import { useEffect } from 'react';
import {
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

type UseFadeInOptions = {
  durationMs?: number;
};

export function useFadeIn(
  target: number,
  { durationMs = 600 }: UseFadeInOptions = {},
): SharedValue<number> {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(target, {
      duration: durationMs,
      easing: Easing.inOut(Easing.quad),
    });
  }, [target, durationMs, value]);

  return value;
}
