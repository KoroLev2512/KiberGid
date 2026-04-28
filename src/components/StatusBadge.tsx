import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { TourStatus } from '../types/tour';

interface StatusBadgeProps {
  status: TourStatus;
}

const labels: Record<TourStatus, string> = {
  draft: 'Черновик',
  ready: 'Готов к публикации',
  published: 'Опубликован',
};

const palette: Record<TourStatus, { bg: string; fg: string }> = {
  draft: { bg: colors.bgStatCard, fg: colors.textSecondary },
  ready: { bg: '#E3F2FD', fg: colors.primaryHover },
  published: { bg: '#E8F5E9', fg: colors.location },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const c = palette[status];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Text numberOfLines={1} style={[styles.text, { color: c.fg }]}>
        {labels[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 4,
    borderRadius: radius.chip,
    overflow: 'visible',
    flexShrink: 0,
  },
  text: {
    ...typography.label,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
});
