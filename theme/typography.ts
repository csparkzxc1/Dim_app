import type { TextStyle } from 'react-native';

export const fontFamilies = {
  regular: 'Lora_400Regular',
  bold: 'Lora_700Bold',
} as const;

export const typography = {
  headline: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 17,
    lineHeight: 26,
  },
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 20,
  },
} satisfies Record<string, TextStyle>;
