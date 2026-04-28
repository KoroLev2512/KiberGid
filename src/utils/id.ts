import 'react-native-get-random-values';

/**
 * Простой генератор коротких уникальных идентификаторов.
 * Используем crypto.getRandomValues (доступный через react-native-get-random-values),
 * чтобы не тянуть полноценный UUID-пакет.
 */
export function makeId(prefix = 'id'): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(8);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}
