import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Section } from '../../components/Section';
import { COUNTRY_CITY_SUGGESTIONS } from '../../constants/dictionaries';
import { ScreenProps } from '../../navigation/types';
import { useTour, useToursStore } from '../../store/toursStore';
import { colors, radius, spacing, typography } from '../../theme';

export const LocationPickerScreen: React.FC<ScreenProps<'LocationPicker'>> = ({
  route,
  navigation,
}) => {
  const tour = useTour(route.params.tourId);
  const updateTour = useToursStore((s) => s.updateTour);

  const [country, setCountry] = useState(tour?.country ?? '');
  const [city, setCity] = useState(tour?.city ?? '');

  useEffect(() => {
    setCountry(tour?.country ?? '');
    setCity(tour?.city ?? '');
  }, [tour?.country, tour?.city]);

  const matchingCities = useMemo(() => {
    const match = COUNTRY_CITY_SUGGESTIONS.find(
      (c) => c.country.toLowerCase() === country.trim().toLowerCase()
    );
    return match?.cities ?? [];
  }, [country]);

  const handleSave = () => {
    if (!tour) return;
    updateTour(tour.id, { country: country.trim(), city: city.trim() });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Гео-контекст" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section label="Страна" title="Где проходит тур">
          <Input
            variant="white"
            value={country}
            onChangeText={setCountry}
            placeholder="Например: Россия"
          />
          <View style={styles.chipRow}>
            {COUNTRY_CITY_SUGGESTIONS.map((c) => (
              <Pressable
                key={c.country}
                onPress={() => setCountry(c.country)}
                style={[
                  styles.suggestion,
                  country === c.country && styles.suggestionActive,
                ]}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    country === c.country && styles.suggestionTextActive,
                  ]}
                >
                  {c.country}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section label="Город" title="Базовый гео-контекст">
          <Input
            variant="white"
            value={city}
            onChangeText={setCity}
            placeholder="Например: Санкт-Петербург"
          />
          {matchingCities.length > 0 && (
            <View style={styles.chipRow}>
              {matchingCities.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCity(c)}
                  style={[
                    styles.suggestion,
                    city === c && styles.suggestionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      city === c && styles.suggestionTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
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
  suggestion: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  suggestionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  suggestionText: {
    ...typography.link,
    color: colors.textPrimary,
  },
  suggestionTextActive: {
    color: colors.textOnPrimary,
  },
});
