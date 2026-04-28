import { TextStyle } from 'react-native';
import { colors, fontSize, fontWeight, letterSpacing } from './tokens';

/**
 * Готовые пресеты текстовых стилей, построенные по дизайн-токенам.
 * Используйте их в компонентах вместо ручной сборки свойств текста.
 */
export const typography = {
  h1: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.h1 * 1.2,
    color: colors.textPrimary,
  } satisfies TextStyle,

  h2: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.h2 * 1.2,
    color: colors.textPrimary,
  } satisfies TextStyle,

  h3: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.h3 * 1.2,
    color: colors.textPrimary,
  } satisfies TextStyle,

  body: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.body * 1.5,
    color: colors.textPrimary,
  } satisfies TextStyle,

  caption: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.caption * 1.4,
    color: colors.textSecondary,
  } satisfies TextStyle,

  link: {
    fontSize: fontSize.link,
    fontWeight: fontWeight.medium,
    color: colors.textLink,
  } satisfies TextStyle,

  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  } satisfies TextStyle,

  btn: {
    fontSize: fontSize.btn,
    fontWeight: fontWeight.medium,
    color: colors.textOnPrimary,
  } satisfies TextStyle,

  btnBlack: {
    fontSize: fontSize.btnBlack,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.btnBlack,
    color: colors.textOnBlack,
  } satisfies TextStyle,
};
