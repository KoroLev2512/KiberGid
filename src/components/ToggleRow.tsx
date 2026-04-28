import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.borderDefault }}
        thumbColor={colors.bgSurface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  texts: {
    flex: 1,
  },
  label: {
    ...typography.body,
  },
  description: {
    ...typography.caption,
    marginTop: 2,
  },
});
