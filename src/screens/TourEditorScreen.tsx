import React, { useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Input } from '../components/Input';
import { Row } from '../components/Row';
import { ScreenHeader } from '../components/ScreenHeader';
import { Section } from '../components/Section';
import { SegmentedControl } from '../components/SegmentedControl';
import { StatusBadge } from '../components/StatusBadge';
import { ToggleRow } from '../components/ToggleRow';
import { CATEGORIES, CURRENCIES, LOCALES } from '../constants/dictionaries';
import { useTour, useToursStore } from '../store/toursStore';
import { colors, radius, spacing, typography } from '../theme';
import { ScreenProps } from '../navigation/types';
import { validateTour } from '../utils/validation';

export const TourEditorScreen: React.FC<ScreenProps<'TourEditor'>> = ({
  route,
  navigation,
}) => {
  const { tourId } = route.params;
  const tour = useTour(tourId);
  const updateTour = useToursStore((s) => s.updateTour);
  const deleteTour = useToursStore((s) => s.deleteTour);
  const addStep = useToursStore((s) => s.addStep);
  const deleteStep = useToursStore((s) => s.deleteStep);
  const moveStep = useToursStore((s) => s.moveStep);

  const issues = useMemo(() => (tour ? validateTour(tour) : []), [tour]);
  const canPublish = issues.length === 0;

  if (!tour) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader
          title="Тур не найден"
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const localeLabel =
    LOCALES.find((l) => l.value === tour.locale)?.label ?? tour.locale;
  const geoLabel = [tour.city, tour.country].filter(Boolean).join(', ');
  const categoriesLabel =
    tour.categories
      .map((c) => CATEGORIES.find((it) => it.value === c)?.label ?? c)
      .join(', ') || '';

  const handleDelete = () => {
    Alert.alert('Удалить тур?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deleteTour(tour.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handlePublish = () => {
    if (!canPublish) {
      Alert.alert(
        'Нельзя опубликовать',
        issues.map((i) => `• ${i.message}`).join('\n')
      );
      return;
    }
    updateTour(tour.id, { status: 'ready' });
    Alert.alert('Отправлено', 'Тур отправлен на модерацию и ждёт одобрения админом.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Редактор тура"
        onBack={() => navigation.goBack()}
        right={<StatusBadge status={tour.status} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Базовая идентификация */}
          <Section label="Идентификация" title="Название тура">
            <Input
              variant="white"
              value={tour.title}
              onChangeText={(title) => updateTour(tour.id, { title })}
              placeholder="Например: «Тайны Петропавловки»"
            />
          </Section>

          {/* Вводные тексты */}
          <Section
            label="Вводные тексты"
            title="Введение и заключение"
            hint="Первый блок объясняет, зачем идёт пользователь. Последний — красиво завершает экскурсию."
          >
            <Input
              variant="white"
              label="Введение"
              value={tour.introduction}
              onChangeText={(introduction) =>
                updateTour(tour.id, { introduction })
              }
              placeholder="О чём этот маршрут и что увидит гость"
              multiline
            />
            <Input
              variant="white"
              label="Заключение"
              value={tour.conclusion}
              onChangeText={(conclusion) =>
                updateTour(tour.id, { conclusion })
              }
              placeholder="Что пользователь унесёт с собой после экскурсии"
              multiline
            />
          </Section>

          {/* Атрибуты для витрины */}
          <Section label="Атрибуты" title="Язык и гео-контекст">
            <Row
              label="Язык экскурсии"
              value={localeLabel}
              onPress={() =>
                navigation.navigate('LocalePicker', { tourId: tour.id })
              }
            />
            <Row
              label="Страна и город"
              value={geoLabel}
              placeholder="Не выбрано"
              onPress={() =>
                navigation.navigate('LocationPicker', { tourId: tour.id })
              }
            />
            <Row
              label="Категории"
              value={categoriesLabel}
              placeholder="Добавьте категории"
              onPress={() =>
                navigation.navigate('CategoriesPicker', { tourId: tour.id })
              }
            />
          </Section>

          {/* Правила откуда/куда */}
          <Section
            label="Маршрут"
            title="Откуда и куда"
            hint="Стартовая и конечная точки должны быть заданы. Если тур круговой — включите «Заканчивается там же»."
          >
            <Row
              label="Стартовая точка"
              value={pointLabel(tour.startPoint)}
              placeholder="Задать"
              onPress={() =>
                navigation.navigate('PointPicker', {
                  tourId: tour.id,
                  kind: 'start',
                  title: 'Стартовая точка',
                })
              }
            />
            <ToggleRow
              label="Заканчивается там же"
              description="Круговой маршрут — старт и финиш совпадают"
              value={tour.endSameAsStart}
              onValueChange={(endSameAsStart) =>
                updateTour(tour.id, {
                  endSameAsStart,
                  endPoint: endSameAsStart ? tour.startPoint : tour.endPoint,
                })
              }
            />
            {!tour.endSameAsStart && (
              <Row
                label="Конечная точка"
                value={pointLabel(tour.endPoint)}
                placeholder="Задать"
                onPress={() =>
                  navigation.navigate('PointPicker', {
                    tourId: tour.id,
                    kind: 'end',
                    title: 'Конечная точка',
                  })
                }
              />
            )}
          </Section>

          {/* Скелет маршрута — шаги */}
          <Section
            label="Скелет маршрута"
            title={`Шаги (${tour.steps.length})`}
            hint="Добавьте хотя бы одну остановку — иначе тур выглядит пустым."
          >
            {tour.steps.map((step, idx) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepBullet}>
                  <Text style={styles.stepBulletText}>{idx + 1}</Text>
                </View>
                <Pressable
                  style={styles.stepContent}
                  onPress={() =>
                    navigation.navigate('StepEditor', {
                      tourId: tour.id,
                      stepId: step.id,
                    })
                  }
                >
                  <Text style={styles.stepTitle} numberOfLines={1}>
                    {step.title || 'Без названия'}
                  </Text>
                  <Text style={styles.stepMeta} numberOfLines={1}>
                    {pointLabel(step.point) || 'Точка не задана'}
                  </Text>
                </Pressable>
                <View style={styles.stepActions}>
                  <Pressable
                    hitSlop={8}
                    disabled={idx === 0}
                    onPress={() => moveStep(tour.id, step.id, 'up')}
                  >
                    <Text
                      style={[
                        styles.stepArrow,
                        idx === 0 && { opacity: 0.3 },
                      ]}
                    >
                      ↑
                    </Text>
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    disabled={idx === tour.steps.length - 1}
                    onPress={() => moveStep(tour.id, step.id, 'down')}
                  >
                    <Text
                      style={[
                        styles.stepArrow,
                        idx === tour.steps.length - 1 && { opacity: 0.3 },
                      ]}
                    >
                      ↓
                    </Text>
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      Alert.alert('Удалить шаг?', step.title || 'Без названия', [
                        { text: 'Отмена', style: 'cancel' },
                        {
                          text: 'Удалить',
                          style: 'destructive',
                          onPress: () => deleteStep(tour.id, step.id),
                        },
                      ])
                    }
                  >
                    <Text style={[styles.stepArrow, { color: colors.danger }]}>
                      ×
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <Button
              title="+ Добавить шаг"
              variant="secondary"
              onPress={() => {
                const id = addStep(tour.id);
                navigation.navigate('StepEditor', {
                  tourId: tour.id,
                  stepId: id,
                });
              }}
            />
          </Section>

          {/* Режим продаж */}
          <Section label="Продажи" title="Билеты">
            <SegmentedControl
              options={[
                { value: 'free', label: 'Без билета' },
                { value: 'ticket', label: 'С билетом' },
              ]}
              value={tour.hasTicket ? 'ticket' : 'free'}
              onChange={(v) =>
                updateTour(tour.id, { hasTicket: v === 'ticket' })
              }
            />
            {tour.hasTicket && (
              <>
                <View style={styles.priceRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      variant="white"
                      label="Цена"
                      keyboardType="numeric"
                      value={
                        tour.ticketPrice != null
                          ? String(tour.ticketPrice)
                          : ''
                      }
                      onChangeText={(text) => {
                        const normalized = text.replace(',', '.');
                        const n = parseFloat(normalized);
                        updateTour(tour.id, {
                          ticketPrice: Number.isFinite(n) ? n : undefined,
                        });
                      }}
                      placeholder="0"
                    />
                  </View>
                  <View style={styles.currency}>
                    <Text style={styles.currencyLabel}>Валюта</Text>
                    <View style={styles.currencyRow}>
                      {CURRENCIES.map((cur) => (
                        <Chip
                          key={cur}
                          label={cur}
                          selected={tour.ticketCurrency === cur}
                          onPress={() =>
                            updateTour(tour.id, { ticketCurrency: cur })
                          }
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}
          </Section>

          {/* Статус */}
          <Section
            label="Статус готовности"
            title="Что видят пользователи"
            hint="После отправки на публикацию тур попадает в «Готовые». В «Опубликованные» его переводит админ."
          >
            <View style={styles.statusRow}>
              <StatusBadge status={tour.status} />
              {!canPublish ? (
                <Text style={styles.issuesHint}>
                  Не заполнено: {issues.length}
                </Text>
              ) : (
                <Text style={styles.readyHint}>Всё заполнено ✓</Text>
              )}
            </View>

            {issues.length > 0 && (
              <View style={styles.issues}>
                {issues.slice(0, 5).map((i) => (
                  <Text key={i.field + i.message} style={styles.issueText}>
                    • {i.message}
                  </Text>
                ))}
                {issues.length > 5 && (
                  <Text style={styles.issueText}>
                    … и ещё {issues.length - 5}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.actions}>
              <Button
                title="Предпросмотр"
                variant="secondary"
                onPress={() =>
                  navigation.navigate('PreviewTour', { tourId: tour.id })
                }
              />
              {tour.status !== 'published' && (
                <Button
                  title={
                    tour.status === 'ready'
                      ? 'На модерации у админа'
                      : 'Опубликовать тур'
                  }
                  variant="black"
                  onPress={handlePublish}
                  disabled={!canPublish || tour.status === 'ready'}
                />
              )}
              <Button
                title="Удалить тур"
                variant="danger"
                onPress={handleDelete}
              />
            </View>
          </Section>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function pointLabel(p: { address?: string; latitude?: number; longitude?: number }) {
  if (p.address) return p.address;
  if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
    return `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`;
  }
  return '';
}

// прячем неиспользованный импорт TextInput от линтера (оставлен для расширения)
void TextInput;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.md,
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
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body,
  },
  stepMeta: {
    ...typography.caption,
  },
  stepActions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  stepArrow: {
    fontSize: 22,
    color: colors.textPrimary,
    width: 24,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  currency: {
    flex: 1.2,
  },
  currencyLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  issuesHint: {
    ...typography.caption,
    color: colors.danger,
  },
  readyHint: {
    ...typography.caption,
    color: colors.location,
  },
  issues: {
    gap: spacing.xs,
  },
  issueText: {
    ...typography.caption,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
