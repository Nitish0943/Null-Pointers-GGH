export const colors = {
  background: '#F7FAFC',
  surface: '#FFFFFF',
  primary: '#17324D',
  secondary: '#0F766E',
  indigo: '#6366F1',
  text: '#17324D',
  bodyText: '#5D7182',
  mutedText: '#7B8D9B',
  border: '#D9E3E9',
  tealSurface: '#E8F3F2',
  indigoSurface: '#EEF0FF',
  accent: '#5EEAD4',
  danger: '#B42318',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  eyebrow: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export type Theme = typeof theme;
