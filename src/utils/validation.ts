import { Tour } from '../types/tour';

export interface ValidationIssue {
  field: string;
  message: string;
}

/**
 * Проверяет, готов ли тур к публикации.
 * Источник правил — продуктовые требования:
 *  - есть название
 *  - заполнены введение и заключение
 *  - выбрана локаль
 *  - выбран базовый гео-контекст (страна + город)
 *  - выбрана хотя бы одна категория
 *  - задана стартовая точка
 *  - задана конечная точка (либо явно совпадает со стартом)
 *  - есть хотя бы один шаг маршрута
 *  - определён режим продаж (признак билета)
 */
export function validateTour(tour: Tour): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!tour.title.trim()) {
    issues.push({ field: 'title', message: 'Укажите название тура' });
  }

  if (!tour.introduction.trim()) {
    issues.push({
      field: 'introduction',
      message: 'Добавьте вводный текст — зачем пользователю этот маршрут',
    });
  }

  if (!tour.conclusion.trim()) {
    issues.push({
      field: 'conclusion',
      message: 'Добавьте финальный текст — чем вы завершаете экскурсию',
    });
  }

  if (!tour.locale) {
    issues.push({ field: 'locale', message: 'Выберите язык экскурсии' });
  }

  if (!tour.country.trim() || !tour.city.trim()) {
    issues.push({
      field: 'geo',
      message: 'Укажите страну и город проведения',
    });
  }

  if (!tour.categories || tour.categories.length === 0) {
    issues.push({
      field: 'categories',
      message: 'Добавьте хотя бы одну категорию',
    });
  }

  if (!hasCoordinates(tour.startPoint) && !tour.startPoint.address) {
    issues.push({
      field: 'startPoint',
      message: 'Задайте стартовую точку маршрута',
    });
  }

  if (!tour.endSameAsStart) {
    if (!hasCoordinates(tour.endPoint) && !tour.endPoint.address) {
      issues.push({
        field: 'endPoint',
        message:
          'Задайте конечную точку маршрута либо отметьте «завершается там же»',
      });
    }
  }

  if (!tour.steps || tour.steps.length === 0) {
    issues.push({
      field: 'steps',
      message: 'Добавьте хотя бы один шаг маршрута',
    });
  } else {
    tour.steps.forEach((step, index) => {
      if (!step.title.trim()) {
        issues.push({
          field: `steps[${index}].title`,
          message: `Шаг ${index + 1}: укажите название остановки`,
        });
      }
    });
  }

  if (typeof tour.hasTicket !== 'boolean') {
    issues.push({
      field: 'hasTicket',
      message: 'Выберите режим продаж (с билетом или без)',
    });
  } else if (tour.hasTicket) {
    if (!tour.ticketPrice || tour.ticketPrice <= 0) {
      issues.push({
        field: 'ticketPrice',
        message: 'Укажите цену билета',
      });
    }
    if (!tour.ticketCurrency) {
      issues.push({
        field: 'ticketCurrency',
        message: 'Выберите валюту',
      });
    }
  }

  return issues;
}

function hasCoordinates(p: Tour['startPoint']): boolean {
  return (
    typeof p.latitude === 'number' &&
    typeof p.longitude === 'number' &&
    !Number.isNaN(p.latitude) &&
    !Number.isNaN(p.longitude)
  );
}
