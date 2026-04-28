import { Platform } from 'react-native';
/**
 * KiberGid Admin — design tokens.
 * Источник истины: CSS-переменные, предоставленные дизайн-командой.
 * Любые изменения вносятся здесь, а не в отдельных компонентах.
 */

export const colors = {
  // Brand
  primary: '#4EABF5',
  primaryHover: '#2E96E8',
  black: '#1A1A1A',
  blackHover: '#333333',
  danger: '#E53935',
  dangerHover: '#C62828',

  // Semantic
  location: '#4CAF50',
  route: '#2979FF',
  rating: '#F0A500',
  favorite: '#E53935',

  // Backgrounds
  bgPage: '#F8F8F8',
  bgSurface: '#FFFFFF',
  bgInput: '#F0F0F0',
  bgInputWhite: '#FFFFFF',
  bgStatCard: '#EEEEEE',
  bgAmenity: '#EEEEEE',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textPlaceholder: '#999999',
  textLink: '#4EABF5',
  textOnPrimary: '#FFFFFF',
  textOnBlack: '#FFFFFF',
  textOnDanger: '#FFFFFF',

  // Borders
  borderDefault: '#E0E0E0',
  borderInput: '#DDDDDD',
  borderSubtle: 'rgba(0, 0, 0, 0.08)',
} as const;

export const fontFamily = {
  base: 'Inter',
} as const;

export const fontSize = {
  h1: 20,
  h2: 18,
  h3: 16,
  body: 16,
  caption: 13,
  link: 14,
  label: 12,
  btn: 14,
  btnBlack: 16,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
};

export const lineHeight = {
  heading: 1.2,
  body: 1.5,
  caption: 1.4,
} as const;

export const letterSpacing = {
  label: 1, // ~0.08em от 12px
  btnBlack: 0.64, // ~0.04em от 16px
} as const;

export const radius = {
  chip: 8,
  input: 12,
  btn: 12,
  card: 16,
  modal: 20,
  pill: 50,
  circle: 9999,
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

export const sizes = {
  btn: 52,
  btnSm: 40,
  input: 50,
  navBar: 64,
  avatar: 60,
  mapPin: 44,
  amenityIcon: 52,
  navIcon: 22,
} as const;

const nativeShadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

const webShadows = {
  card: {
    boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
  },
  modal: {
    boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
  },
  bottomSheet: {
    boxShadow: '0px -2px 16px rgba(0,0,0,0.08)',
  },
} as const;

export const shadows = Platform.OS === 'web' ? webShadows : nativeShadows;

export const theme = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  radius,
  spacing,
  sizes,
  shadows,
};

export type Theme = typeof theme;
