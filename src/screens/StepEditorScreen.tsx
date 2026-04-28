import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Row } from '../components/Row';
import { ScreenHeader } from '../components/ScreenHeader';
import { Section } from '../components/Section';
import { ScreenProps } from '../navigation/types';
import { useToursStore } from '../store/toursStore';
import { colors, spacing } from '../theme';

export const StepEditorScreen: React.FC<ScreenProps<'StepEditor'>> = ({
  route,
  navigation,
}) => {
  const { tourId, stepId } = route.params;
  const step = useToursStore((s) =>
    s.tours.find((t) => t.id === tourId)?.steps.find((x) => x.id === stepId)
  );
  const stepIndex = useToursStore((s) => {
    const tour = s.tours.find((t) => t.id === tourId);
    return tour ? tour.steps.findIndex((x) => x.id === stepId) : -1;
  });
  const updateStep = useToursStore((s) => s.updateStep);
  const deleteStep = useToursStore((s) => s.deleteStep);

  if (!step) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Шаг не найден" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('Удалить шаг?', step.title || 'Без названия', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deleteStep(tourId, stepId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={`Шаг ${stepIndex + 1}`}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Section label="Содержание" title="О чём эта остановка">
            <Input
              variant="white"
              label="Название"
              value={step.title}
              onChangeText={(title) => updateStep(tourId, stepId, { title })}
              placeholder="Например: «Нарышкинский бастион»"
            />
            <Input
              variant="white"
              label="Описание"
              multiline
              value={step.description}
              onChangeText={(description) =>
                updateStep(tourId, stepId, { description })
              }
              placeholder="Текст, который услышит или прочитает пользователь"
            />
          </Section>

          <Section label="Геолокация" title="Точка на карте">
            <Row
              label="Точка"
              value={pointLabel(step.point)}
              placeholder="Задать точку"
              onPress={() =>
                navigation.navigate('PointPicker', {
                  tourId,
                  kind: 'step',
                  stepId,
                  title: 'Точка шага',
                })
              }
            />
          </Section>

          <Section label="Медиа" title="Ссылки (необязательно)">
            <Input
              variant="white"
              label="Аудио (URL)"
              value={step.audioUrl ?? ''}
              autoCapitalize="none"
              keyboardType="url"
              onChangeText={(audioUrl) =>
                updateStep(tourId, stepId, { audioUrl })
              }
              placeholder="https://..."
            />
            <Input
              variant="white"
              label="Изображение (URL)"
              value={step.imageUrl ?? ''}
              autoCapitalize="none"
              keyboardType="url"
              onChangeText={(imageUrl) =>
                updateStep(tourId, stepId, { imageUrl })
              }
              placeholder="https://..."
            />
          </Section>

          <View style={styles.actions}>
            <Button
              title="Удалить шаг"
              variant="danger"
              onPress={handleDelete}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function pointLabel(p: {
  address?: string;
  latitude?: number;
  longitude?: number;
}) {
  if (p.address) return p.address;
  if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
    return `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`;
  }
  return '';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  actions: {
    marginTop: spacing.lg,
  },
});
