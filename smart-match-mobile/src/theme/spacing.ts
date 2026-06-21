import { Platform, ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 44
};

// Calmer, more professional corners than the previous heavily-rounded look.
export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999
};

const nativeShadow = {
  xs: {
    shadowColor: '#0B1430',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1
  },
  soft: {
    shadowColor: '#0B1430',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3
  },
  medium: {
    shadowColor: '#0B1430',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 6
  },
  brand: {
    shadowColor: '#1F3BE0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6
  }
} satisfies Record<string, ViewStyle>;

type WebShadowStyle = ViewStyle & { boxShadow: string };

const webShadow: Record<keyof typeof nativeShadow, WebShadowStyle> = {
  xs: { boxShadow: '0px 2px 6px rgba(11, 20, 48, 0.05)' },
  soft: { boxShadow: '0px 6px 16px rgba(11, 20, 48, 0.07)' },
  medium: { boxShadow: '0px 12px 24px rgba(11, 20, 48, 0.13)' },
  brand: { boxShadow: '0px 10px 20px rgba(31, 59, 224, 0.28)' }
};

/** Subtle elevation; uses boxShadow on web to avoid react-native-web deprecation warnings. */
export const shadow = Platform.OS === 'web' ? webShadow : nativeShadow;

// Type scale for consistent hierarchy across screens.
export const typography = {
  display: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.6, lineHeight: 36 },
  h1: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.4, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.3, lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 23 },
  body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '700' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  caption: { fontSize: 11.5, fontWeight: '700' as const, letterSpacing: 0.3, lineHeight: 15 }
};
