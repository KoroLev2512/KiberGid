import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusBadge } from '../components/StatusBadge';
import { SegmentedControl } from '../components/SegmentedControl';
import { supabase } from '../lib/supabase';
import { useToursStore } from '../store/toursStore';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { Tour, TourStatus } from '../types/tour';
import { ScreenProps } from '../navigation/types';

type Filter = 'all' | TourStatus;

export const ToursListScreen: React.FC<ScreenProps<'ToursList'>> = ({
  navigation,
}) => {
  const tours = useToursStore((s) => s.tours);
  const syncNotice = useToursStore((s) => s.syncNotice);
  const setSyncNotice = useToursStore((s) => s.setSyncNotice);
  const createTour = useToursStore((s) => s.createTour);
  const deleteTour = useToursStore((s) => s.deleteTour);
  const duplicateTour = useToursStore((s) => s.duplicateTour);
  const [filter, setFilter] = useState<Filter>('all');
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAdmin(data.user?.app_metadata?.role === 'admin');
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!syncNotice) return;
    const timer = setTimeout(() => setSyncNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [syncNotice, setSyncNotice]);

  const filtered = useMemo(() => {
    const sorted = [...tours].sort((a, b) => b.updatedAt - a.updatedAt);
    if (filter === 'all') return sorted;
    return sorted.filter((t) => t.status === filter);
  }, [tours, filter]);

  const handleCreate = () => {
    const id = createTour();
    navigation.navigate('TourEditor', { tourId: id });
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Ошибка выхода', error.message);
    }
  };

  const handleLongPress = (tour: Tour) => {
    Alert.alert(tour.title || 'Без названия', 'Действия с туром', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Дублировать',
        onPress: () => duplicateTour(tour.id),
      },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Удалить тур?', 'Это действие нельзя отменить.', [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Удалить',
              style: 'destructive',
              onPress: () => deleteTour(tour.id),
            },
          ]),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Мои туры" subtitle="KiberGid Admin" />
      <View style={styles.authBar}>
        <View style={styles.authActions}>
          {admin ? (
            <Button
              title="Админка"
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={() => navigation.navigate('AdminPanel')}
            />
          ) : null}
          <Button
            title="Выйти"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={handleSignOut}
          />
        </View>
      </View>
      {syncNotice ? (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>{syncNotice}</Text>
          <Button
            title="Ок"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => setSyncNotice(null)}
          />
        </View>
      ) : null}

      <View style={styles.filter}>
        <SegmentedControl<Filter>
          options={[
            { value: 'all', label: 'Все' },
            { value: 'draft', label: 'Черновики' },
            { value: 'ready', label: 'Готовы' },
            { value: 'published', label: 'Опубликованные' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Пока ни одного тура"
            description="Создайте первый маршрут — мы проведём вас по всем шагам."
          >
            <Button
              title="Создать первый тур"
              variant="black"
              onPress={handleCreate}
            />
          </EmptyState>
        }
        renderItem={({ item }) => (
          <TourCard
            tour={item}
            onPress={() =>
              navigation.navigate('TourEditor', { tourId: item.id })
            }
            onLongPress={() => handleLongPress(item)}
          />
        )}
      />

      {filtered.length > 0 && (
        <View style={styles.bottomBar}>
          <Button title="Создать тур" variant="black" onPress={handleCreate} />
        </View>
      )}
    </SafeAreaView>
  );
};

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
  onLongPress: () => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, onPress, onLongPress }) => {
  const geo = [tour.city, tour.country].filter(Boolean).join(', ');
  const stepsCount = tour.steps.length;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
    >
      <View style={styles.cardHeader}>
        <StatusBadge status={tour.status} />
        {tour.hasTicket ? (
          <Text style={styles.ticket}>С билетом</Text>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {tour.title || 'Без названия'}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {geo ? `${geo} · ` : ''}
        {stepsCount} {pluralSteps(stepsCount)} · {localeLabel(tour.locale)}
      </Text>
    </Pressable>
  );
};

function pluralSteps(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'шаг';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'шага';
  return 'шагов';
}

function localeLabel(l: Tour['locale']) {
  return l.toUpperCase();
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  filter: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  authBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'flex-end',
  },
  authActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  noticeBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.bgSurface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  noticeText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
  },
  ticket: {
    ...typography.label,
    color: colors.primaryHover,
    marginLeft: 'auto',
  },
  bottomBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
  },
});
