import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { LOCALES } from '../../constants/dictionaries';
import { ScreenProps } from '../../navigation/types';
import { useTour, useToursStore } from '../../store/toursStore';
import { colors, spacing, typography } from '../../theme';

export const LocalePickerScreen: React.FC<ScreenProps<'LocalePicker'>> = ({
  route,
  navigation,
}) => {
  const tour = useTour(route.params.tourId);
  const updateTour = useToursStore((s) => s.updateTour);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Язык экскурсии"
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={LOCALES}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const selected = tour?.locale === item.value;
          return (
            <Pressable
              onPress={() => {
                if (tour) updateTour(tour.id, { locale: item.value });
                navigation.goBack();
              }}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: colors.bgStatCard },
              ]}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={styles.label}>{item.label}</Text>
              {selected ? (
                <Text style={styles.check}>✓</Text>
              ) : (
                <View style={{ width: 20 }} />
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  list: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  flag: {
    fontSize: 22,
  },
  label: {
    ...typography.body,
    flex: 1,
  },
  check: {
    ...typography.body,
    color: colors.primary,
    width: 20,
    textAlign: 'center',
  },
});
