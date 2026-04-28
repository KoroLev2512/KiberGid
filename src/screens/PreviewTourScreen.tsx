import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../components/Chip';
import { ScreenHeader } from '../components/ScreenHeader';
import { Section } from '../components/Section';
import { StatusBadge } from '../components/StatusBadge';
import { CATEGORIES, LOCALES } from '../constants/dictionaries';
import { ScreenProps } from '../navigation/types';
import { useTour } from '../store/toursStore';
import { colors, radius, spacing, typography } from '../theme';
import { validateTour } from '../utils/validation';

export const PreviewTourScreen: React.FC<ScreenProps<'PreviewTour'>> = ({
  route,
  navigation,
}) => {
  const tour = useTour(route.params.tourId);
  const issues = useMemo(() => (tour ? validateTour(tour) : []), [tour]);

  if (!tour) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title="Тур не найден"
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const localeLabel = LOCALES.find((l) => l.value === tour.locale);
  const geoLabel = [tour.city, tour.country].filter(Boolean).join(', ');
  const priceLabel =
    tour.hasTicket && tour.ticketPrice && tour.ticketCurrency
      ? `${tour.ticketPrice} ${tour.ticketCurrency}`
      : tour.hasTicket
        ? 'С билетом'
        : 'Бесплатно';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Предпросмотр"
        onBack={() => navigation.goBack()}
        right={<StatusBadge status={tour.status} />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{tour.title || 'Без названия'}</Text>
          <Text style={styles.heroMeta}>
            {geoLabel || '—'} · {localeLabel?.flag ?? ''} {localeLabel?.label ?? tour.locale}
          </Text>
          <View style={styles.heroTags}>
            {tour.categories.map((c) => (
              <Chip
                key={c}
                label={CATEGORIES.find((it) => it.value === c)?.label ?? c}
              />
            ))}
          </View>
          <Text style={styles.price}>{priceLabel}</Text>
        </View>

        {tour.introduction ? (
          <Section label="Введение" title="" flat>
            <Text style={typography.body}>{tour.introduction}</Text>
          </Section>
        ) : null}

        <Section label="Маршрут" title={`Шаги (${tour.steps.length})`}>
          {tour.steps.length === 0 ? (
            <Text style={typography.caption}>Шаги пока не добавлены.</Text>
          ) : (
            tour.steps.map((s, idx) => (
              <View key={s.id} style={styles.step}>
                <View style={styles.stepBullet}>
                  <Text style={styles.stepBulletText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>
                    {s.title || 'Без названия'}
                  </Text>
                  {s.description ? (
                    <Text style={typography.caption}>{s.description}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </Section>

        {tour.conclusion ? (
          <Section label="Заключение" title="" flat>
            <Text style={typography.body}>{tour.conclusion}</Text>
          </Section>
        ) : null}

        <Section label="Диагностика" title="Готовность к публикации">
          {issues.length === 0 ? (
            <Text style={{ ...typography.body, color: colors.location }}>
              ✓ Всё заполнено, тур можно публиковать.
            </Text>
          ) : (
            issues.map((i) => (
              <Text key={i.field + i.message} style={typography.caption}>
                • {i.message}
              </Text>
            ))
          )}
        </Section>
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
  hero: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  heroTitle: {
    ...typography.h1,
  },
  heroMeta: {
    ...typography.caption,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepBullet: {
    width: 28,
    height: 28,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBulletText: {
    ...typography.btn,
    color: colors.textOnPrimary,
  },
  stepTitle: {
    ...typography.body,
    fontWeight: '500',
  },
});
