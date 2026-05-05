export const colors = {
  backgroundBase: '#0A0807',
  lightAmberStart: '#FFB870',
  lightAmberEnd: '#FFCB8A',
  textWarmGray: '#D4C4B0',
  accentAmber: '#C97B4F',
} as const;

export type ColorToken = keyof typeof colors;
