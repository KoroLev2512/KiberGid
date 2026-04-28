import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        selected ? styles.selected : styles.idle,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.textSelected : styles.textIdle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    borderWidth: 1,
  },
  idle: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderDefault,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    ...typography.link,
  },
  textIdle: {
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.textOnPrimary,
  },
});
