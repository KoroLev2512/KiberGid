import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Section } from '../../components/Section';
import { CATEGORIES } from '../../constants/dictionaries';
import { ScreenProps } from '../../navigation/types';
import { useTour, useToursStore } from '../../store/toursStore';
import { colors, spacing } from '../../theme';
import { TourCategory } from '../../types/tour';

export const CategoriesPickerScreen: React.FC<
  ScreenProps<'CategoriesPicker'>
> = ({ route, navigation }) => {
  const tour = useTour(route.params.tourId);
  const updateTour = useToursStore((s) => s.updateTour);
  const [selected, setSelected] = useState<TourCategory[]>(
    tour?.categories ?? []
  );

  const toggle = (value: TourCategory) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const handleSave = () => {
    if (!tour) return;
    updateTour(tour.id, { categories: selected });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Категории"
        subtitle="Выберите темы экскурсии"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section
          label="Темы"
          title={`Выбрано: ${selected.length}`}
          hint="Тур будет попадать в подборки по этим темам."
        >
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.value}
                label={c.label}
                selected={selected.includes(c.value)}
                onPress={() => toggle(c.value)}
              />
            ))}
          </View>
        </Section>
        <Button title="Сохранить" variant="black" onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
