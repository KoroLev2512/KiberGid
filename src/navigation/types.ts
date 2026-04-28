import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Для пикеров мы не передаём колбэки (их нельзя сериализовать),
 * вместо этого передаём tourId (и при необходимости stepId / тип точки),
 * а сам пикер обновляет store напрямую.
 */
export type PointKind = 'start' | 'end' | 'step';

export type RootStackParamList = {
  Auth: undefined;
  ToursList: undefined;
  AdminPanel: undefined;
  TourEditor: { tourId: string };
  StepEditor: { tourId: string; stepId: string };
  LocalePicker: { tourId: string };
  LocationPicker: { tourId: string };
  CategoriesPicker: { tourId: string };
  PointPicker: {
    tourId: string;
    kind: PointKind;
    /** Обязателен только при kind === 'step'. */
    stepId?: string;
    title: string;
  };
  PreviewTour: { tourId: string };
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
