import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, sizes, spacing, typography } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  /**
   * "gray"  — инпут с серым фоном (экраны авторизации).
   * "white" — инпут с белым фоном и бордером (экраны создания маршрута).
   */
  variant?: 'gray' | 'white';
  multiline?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  variant = 'white',
  multiline,
  style,
  ...rest
}) => {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textPlaceholder}
        {...rest}
        multiline={multiline}
        style={[
          styles.input,
          variant === 'gray' ? styles.gray : styles.white,
          multiline && styles.multiline,
          error ? styles.errorBorder : null,
          style,
        ]}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    minHeight: sizes.input,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  gray: {
    backgroundColor: colors.bgInput,
  },
  white: {
    backgroundColor: colors.bgInputWhite,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorBorder: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
