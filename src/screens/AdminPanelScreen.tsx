import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { supabase } from '../lib/supabase';
import { loadUsersForAdmin } from '../lib/supabaseAdmin';
import {
  approveTourPublication,
  loadAllToursFromSupabase,
} from '../lib/supabaseTours';
import { ScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { Tour } from '../types/tour';

type UserRow = { id: string; email: string | null; role: 'user' | 'admin' };

export const AdminPanelScreen: React.FC<ScreenProps<'AdminPanel'>> = ({
  navigation,
}) => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const readyTours = useMemo(
    () => tours.filter((t) => t.status === 'ready'),
    [tours]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allTours] = await Promise.all([
        loadUsersForAdmin(),
        loadAllToursFromSupabase(),
      ]);
      setUsers(allUsers);
      setTours(allTours);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить данные админки.';
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsAdmin(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.app_metadata?.role === 'admin');
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void loadData();
  }, [isAdmin]);

  if (isAdmin === false) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Админка" onBack={() => navigation.goBack()} />
        <View style={styles.section}>
          <Text style={styles.empty}>
            Доступ запрещен: только пользователи с ролью admin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleApprove = async (tourId: string) => {
    try {
      await approveTourPublication(tourId);
      Alert.alert('Готово', 'Экскурсия одобрена и опубликована.');
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось одобрить публикацию.';
      Alert.alert('Ошибка', message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Админка" subtitle="Пользователи и модерация" onBack={() => navigation.goBack()} />
      <View style={styles.actions}>
        <Button
          title="Обновить"
          variant="secondary"
          size="sm"
          fullWidth={false}
          loading={loading}
          onPress={() => void loadData()}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>На модерации ({readyTours.length})</Text>
        <FlatList
          data={readyTours}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Нет туров, ожидающих публикации.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title || 'Без названия'}</Text>
              <Text style={styles.meta}>Автор: {item.ownerEmail ?? item.ownerId ?? 'неизвестно'}</Text>
              <Button
                title="Одобрить публикацию"
                variant="black"
                size="sm"
                onPress={() => void handleApprove(item.id)}
              />
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Пользователи ({users.length})</Text>
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <Text style={styles.userEmail}>{item.email ?? item.id}</Text>
              <Text style={styles.userRole}>{item.role}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'flex-end',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  list: { gap: spacing.sm },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    gap: spacing.sm,
  },
  title: { ...typography.body },
  meta: { ...typography.caption },
  empty: { ...typography.caption },
  userRow: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  userEmail: { ...typography.body, flex: 1 },
  userRole: { ...typography.label },
});
