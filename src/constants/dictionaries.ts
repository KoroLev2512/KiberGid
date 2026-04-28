import { TourCategory, TourLocale } from '../types/tour';

/** Справочники для пикеров и бейджей. */

export const LOCALES: { value: TourLocale; label: string; flag: string }[] = [
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
];

export const CATEGORIES: { value: TourCategory; label: string }[] = [
  { value: 'history', label: 'История' },
  { value: 'architecture', label: 'Архитектура' },
  { value: 'art', label: 'Искусство' },
  { value: 'gastronomy', label: 'Гастрономия' },
  { value: 'nature', label: 'Природа' },
  { value: 'religion', label: 'Религия' },
  { value: 'modern', label: 'Современность' },
  { value: 'literature', label: 'Литература' },
  { value: 'music', label: 'Музыка' },
  { value: 'kids', label: 'Для детей' },
];

/** Базовый список популярных локаций для выбора страны/города. */
export const COUNTRY_CITY_SUGGESTIONS: { country: string; cities: string[] }[] =
  [
    {
      country: 'Россия',
      cities: [
        'Москва',
        'Санкт-Петербург',
        'Казань',
        'Екатеринбург',
        'Нижний Новгород',
        'Калининград',
      ],
    },
    {
      country: 'Германия',
      cities: ['Берлин', 'Мюнхен', 'Гамбург', 'Кёльн'],
    },
    {
      country: 'Италия',
      cities: ['Рим', 'Флоренция', 'Венеция', 'Милан'],
    },
    {
      country: 'Франция',
      cities: ['Париж', 'Лион', 'Ницца', 'Марсель'],
    },
    {
      country: 'Испания',
      cities: ['Мадрид', 'Барселона', 'Севилья', 'Валенсия'],
    },
  ];

export const CURRENCIES = ['RUB', 'EUR', 'USD', 'GBP', 'CNY'] as const;
