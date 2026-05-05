import { useEffect, useState } from 'react';

export type BurnInOffset = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

const DEFAULT_SHIFT_PX = 10;
const DEFAULT_SCALE_VARIATION = 0.05;
const DEFAULT_RESHUFFLE_MS = 5 * 60 * 1000;

function jitter(maxAbs: number): number {
  return (Math.random() * 2 - 1) * maxAbs;
}

function makeOffset(shiftPx: number, scaleVariation: number): BurnInOffset {
  return {
    offsetX: jitter(shiftPx),
    offsetY: jitter(shiftPx),
    scale: 1 + jitter(scaleVariation),
  };
}

type UseBurnInProtectionOptions = {
  shiftPx?: number;
  scaleVariation?: number;
  reshuffleMs?: number;
};

export function useBurnInProtection({
  shiftPx = DEFAULT_SHIFT_PX,
  scaleVariation = DEFAULT_SCALE_VARIATION,
  reshuffleMs = DEFAULT_RESHUFFLE_MS,
}: UseBurnInProtectionOptions = {}): BurnInOffset {
  const [offset, setOffset] = useState(() =>
    makeOffset(shiftPx, scaleVariation),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setOffset(makeOffset(shiftPx, scaleVariation));
    }, reshuffleMs);
    return () => clearInterval(id);
  }, [shiftPx, scaleVariation, reshuffleMs]);

  return offset;
}
