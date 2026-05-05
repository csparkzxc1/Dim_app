import { useEffect, useState } from 'react';

import { parseHHMM, type WakeWindow } from '@/services/settings';

export type WakeWindowState = {
  active: boolean;
  progress: number;
  msUntilStart: number;
  msUntilEnd: number;
};

const TICK_MS = 30 * 1000;

function minutesOfDay(hour: number, minute: number): number {
  return hour * 60 + minute;
}

function nowMinutesOfDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

export function computeWakeWindowState(
  window: WakeWindow,
  now: Date = new Date(),
): WakeWindowState {
  const start = parseHHMM(window.start);
  const end = parseHHMM(window.end);
  const startMin = minutesOfDay(start.hour, start.minute);
  const endMin = minutesOfDay(end.hour, end.minute);
  const current = nowMinutesOfDay(now);

  const crossesMidnight = endMin <= startMin;
  let active = false;
  let progress = 0;

  if (!crossesMidnight) {
    active = current >= startMin && current < endMin;
    if (active) {
      progress = (current - startMin) / Math.max(1, endMin - startMin);
    }
  } else {
    const dayMinutes = 24 * 60;
    const adjustedEnd = endMin + dayMinutes;
    const adjustedCurrent = current < startMin ? current + dayMinutes : current;
    active = adjustedCurrent >= startMin && adjustedCurrent < adjustedEnd;
    if (active) {
      progress =
        (adjustedCurrent - startMin) / Math.max(1, adjustedEnd - startMin);
    }
  }

  const minuteToMs = (m: number) => m * 60 * 1000;
  const msUntilStart = active
    ? 0
    : minuteToMs(
        crossesMidnight
          ? current < startMin
            ? startMin - current
            : 24 * 60 - current + startMin
          : current < startMin
            ? startMin - current
            : 24 * 60 - current + startMin,
      );

  const msUntilEnd = active
    ? minuteToMs(
        crossesMidnight
          ? (current < startMin ? endMin : endMin + 24 * 60) - current
          : endMin - current,
      )
    : 0;

  return {
    active,
    progress: Math.min(1, Math.max(0, progress)),
    msUntilStart,
    msUntilEnd,
  };
}

export function useWakeWindow(window: WakeWindow): WakeWindowState {
  const [state, setState] = useState<WakeWindowState>(() =>
    computeWakeWindowState(window),
  );

  useEffect(() => {
    setState(computeWakeWindowState(window));
    const id = setInterval(() => {
      setState(computeWakeWindowState(window));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [window.start, window.end]);

  return state;
}
