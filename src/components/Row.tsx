import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface RowProps {
  label: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
}

/**
 * Строка в карточке формы с текстовым значением справа
 * и разделителем снизу — как в iOS-настройках.
 */
export const Row: React.FC<RowProps> = ({
  label,
  value,
  placeholder,
  onPress,
  right,
  destructive,
}) => {
  const hasValue = Boolean(value);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? { opacity: 0.6 } : null,
      ]}
    >
      <Text style={[styles.label, destructive && { color: colors.danger }]}>
        {label}
      </Text>
      <View style={styles.right}>
        {right ?? (
          <Text
            numberOfLines={1}
            style={[
              styles.value,
              !hasValue && { color: colors.textPlaceholder },
            ]}
          >
            {hasValue ? value : placeholder ?? 'Не задано'}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  label: {
    ...typography.body,
    flexShrink: 0,
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  value: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
