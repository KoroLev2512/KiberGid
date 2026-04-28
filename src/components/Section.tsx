import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface SectionProps {
  label?: string;
  title?: string;
  hint?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  /** Убирает белый фон-карточку (для фоновых групп). */
  flat?: boolean;
}

/**
 * Базовая секция формы: опциональный uppercase-label сверху,
 * заголовок и карточка с контентом.
 */
export const Section: React.FC<SectionProps> = ({
  label,
  title,
  hint,
  children,
  style,
  flat,
}) => {
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={[flat ? styles.flatCard : styles.card]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xxl,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  flatCard: {
    gap: spacing.md,
  },
});
