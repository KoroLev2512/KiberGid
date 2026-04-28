import React, { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ScreenHeader } from '../components/ScreenHeader';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme';

type AuthMode = 'signIn' | 'signUp';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === 'signIn' ? 'Вход в админку' : 'Регистрация'),
    [mode]
  );

  const submitLabel = mode === 'signIn' ? 'Войти' : 'Зарегистрироваться';

  const submit = async () => {
    if (!supabase) return;
    if (!email.trim() || password.length < 6) {
      Alert.alert('Проверьте данные', 'Введите email и пароль не короче 6 символов.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signIn') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.session) {
          Alert.alert('Готово', 'Аккаунт создан. Теперь можно войти.');
          setMode('signIn');
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось выполнить авторизацию.';
      Alert.alert('Ошибка авторизации', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!supabase) return;
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      Alert.alert('Введите email', 'Укажите email, на который отправить ссылку восстановления.');
      return;
    }

    setLoading(true);
    try {
      const configuredRedirect =
        process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL ??
        process.env.EXPO_PUBLIC_APP_URL;
      const redirectTo =
        configuredRedirect ||
        (Platform.OS === 'web' && typeof window !== 'undefined'
          ? `${window.location.origin}/`
          : undefined);
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });
      if (error) throw error;
      Alert.alert(
        'Письмо отправлено',
        'Проверьте почту: ссылка для смены пароля уже отправлена.'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось отправить письмо для восстановления.';
      Alert.alert('Ошибка восстановления', message);
    } finally {
      setLoading(false);
    }
  };


  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Supabase не настроен" subtitle="Добавьте env-переменные" />
        <View style={styles.card}>
          <Text style={styles.text}>
            Нужно задать `EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={title} subtitle="KiberGid Admin" />
      <View style={styles.form}>
        <Input
          label="Email"
          variant="gray"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <Input
          label="Пароль"
          variant="gray"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Минимум 6 символов"
        />
        <Button
          title={submitLabel}
          variant="black"
          onPress={submit}
          loading={loading}
        />
        <Button
          title={
            mode === 'signIn'
              ? 'Нет аккаунта? Зарегистрироваться'
              : 'Уже есть аккаунт? Войти'
          }
          variant="ghost"
          onPress={() =>
            setMode((prev) => (prev === 'signIn' ? 'signUp' : 'signIn'))
          }
        />
        {mode === 'signIn' ? (
          <Button
            title="Забыли пароль?"
            variant="ghost"
            onPress={handleForgotPassword}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderDefault,
    borderWidth: 1,
  },
  text: {
    ...typography.body,
  },
});
