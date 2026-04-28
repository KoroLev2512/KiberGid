import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, sizes, spacing, typography } from '../theme';

type Variant = 'primary' | 'black' | 'danger' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth = true,
  leftIcon,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        variantStyles[variant].container,
        fullWidth && styles.fullWidth,
        variant === 'black' && styles.pill,
        pressed && !isDisabled && variantStyles[variant].pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].loader} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text style={[variantStyles[variant].text, variant === 'black' && typography.btnBlack]}>
            {variant === 'black' ? title.toUpperCase() : title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sizeMd: { height: sizes.btn },
  sizeSm: { height: sizes.btnSm },
  fullWidth: { alignSelf: 'stretch' },
  pill: { borderRadius: radius.pill },
  disabled: { opacity: 0.5 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: { marginRight: spacing.xs },
});

const variantStyles: Record<
  Variant,
  {
    container: ViewStyle;
    pressed: ViewStyle;
    text: ReturnType<typeof Object.assign>;
    loader: string;
  }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    pressed: { backgroundColor: colors.primaryHover },
    text: { ...typography.btn, color: colors.textOnPrimary },
    loader: colors.textOnPrimary,
  },
  black: {
    container: { backgroundColor: colors.black },
    pressed: { backgroundColor: colors.blackHover },
    text: { ...typography.btnBlack, color: colors.textOnBlack },
    loader: colors.textOnBlack,
  },
  danger: {
    container: { backgroundColor: colors.danger },
    pressed: { backgroundColor: colors.dangerHover },
    text: { ...typography.btn, color: colors.textOnDanger },
    loader: colors.textOnDanger,
  },
  secondary: {
    container: {
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderDefault,
    },
    pressed: { backgroundColor: colors.bgStatCard },
    text: { ...typography.btn, color: colors.textPrimary },
    loader: colors.textPrimary,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    pressed: { backgroundColor: colors.bgStatCard },
    text: { ...typography.link, color: colors.textLink },
    loader: colors.textLink,
  },
};
