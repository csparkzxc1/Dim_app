import AsyncStorage from '@react-native-async-storage/async-storage';

export type WakeWindow = {
  start: string;
  end: string;
};

export type Settings = {
  wakeWindow: WakeWindow;
  autoEnter: boolean;
  wakeBrightness: number;
  color: 'amber';
  onboardingComplete: boolean;
  isPurchased: boolean;
};

const STORAGE_KEY = 'dim:settings:v2';

export const DEFAULT_SETTINGS: Settings = {
  wakeWindow: { start: '06:00', end: '07:00' },
  autoEnter: true,
  wakeBrightness: 0.4,
  color: 'amber',
  onboardingComplete: false,
  isPurchased: false,
};

export const WAKE_BRIGHTNESS_OPTIONS = [0.1, 0.2, 0.3, 0.4, 0.5] as const;

function isValidHHMM(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{2}:\d{2}$/.test(value) &&
    Number(value.slice(0, 2)) < 24 &&
    Number(value.slice(3, 5)) < 60
  );
}

function sanitize(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };
  const draft = raw as Partial<Settings>;
  const wake = draft.wakeWindow;
  const wakeWindow: WakeWindow =
    wake && isValidHHMM(wake.start) && isValidHHMM(wake.end)
      ? { start: wake.start, end: wake.end }
      : DEFAULT_SETTINGS.wakeWindow;

  return {
    wakeWindow,
    autoEnter:
      typeof draft.autoEnter === 'boolean'
        ? draft.autoEnter
        : DEFAULT_SETTINGS.autoEnter,
    wakeBrightness:
      typeof draft.wakeBrightness === 'number' &&
      draft.wakeBrightness >= 0.05 &&
      draft.wakeBrightness <= 1
        ? draft.wakeBrightness
        : DEFAULT_SETTINGS.wakeBrightness,
    color: 'amber',
    onboardingComplete:
      typeof draft.onboardingComplete === 'boolean'
        ? draft.onboardingComplete
        : DEFAULT_SETTINGS.onboardingComplete,
    isPurchased:
      typeof draft.isPurchased === 'boolean'
        ? draft.isPurchased
        : DEFAULT_SETTINGS.isPurchased,
  };
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(next: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function updateSettings(
  patch: Partial<Settings>,
): Promise<Settings> {
  const current = await loadSettings();
  const next = sanitize({ ...current, ...patch });
  await saveSettings(next);
  return next;
}

export function parseHHMM(value: string): { hour: number; minute: number } {
  return {
    hour: Number(value.slice(0, 2)),
    minute: Number(value.slice(3, 5)),
  };
}

export function formatHHMM(hour: number, minute: number): string {
  const h = String(((hour % 24) + 24) % 24).padStart(2, '0');
  const m = String(((minute % 60) + 60) % 60).padStart(2, '0');
  return `${h}:${m}`;
}
