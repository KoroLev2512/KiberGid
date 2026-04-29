/**
 * Доменная модель тура для KiberGid Admin.
 * Отражает минимальные требования к туру:
 *  - базовая идентификация (название)
 *  - вводные тексты (введение / заключение)
 *  - скелет маршрута (хотя бы один шаг)
 *  - атрибуты для витрины (язык, гео, категории)
 *  - правила "откуда/куда"
 *  - признак продажи билетов
 *  - статус готовности
 */

export type TourStatus = 'draft' | 'ready' | 'published';

export type TourLocale =
  | 'ru'
  | 'en'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'zh'
  | 'ja';

export type TourCategory =
  | 'history'
  | 'architecture'
  | 'art'
  | 'gastronomy'
  | 'nature'
  | 'religion'
  | 'modern'
  | 'literature'
  | 'music'
  | 'kids';

/** Точка на карте — координаты и опциональный человекочитаемый адрес. */
export interface GeoPoint {
  latitude?: number;
  longitude?: number;
  address?: string;
}

/** Один шаг маршрута — остановка или событие. */
export interface TourStep {
  id: string;
  title: string;
  description: string;
  point: GeoPoint;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
}

/** Полная модель тура. */
export interface Tour {
  id: string;
  ownerId?: string;
  ownerEmail?: string;
  // Базовая идентификация
  title: string;
  // Вводные тексты
  introduction: string;
  conclusion: string;

  // Атрибуты витрины
  locale: TourLocale;
  country: string;
  city: string;
  categories: TourCategory[];

  // Правила "откуда/куда"
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  /** Пользователь явно отметил, что конечная точка совпадает со стартовой. */
  endSameAsStart: boolean;

  // Шаги маршрута
  steps: TourStep[];

  // Режим продаж
  hasTicket: boolean;
  ticketPrice?: number;
  ticketCurrency?: string;

  // Статус
  status: TourStatus;

  createdAt: number;
  updatedAt: number;
}

/** Поля, которые пользователь заполняет при создании нового тура. */
export type TourDraftInput = Partial<
  Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'status'>
>;
