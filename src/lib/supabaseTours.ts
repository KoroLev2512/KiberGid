import { Tour } from '../types/tour';
import { supabase } from './supabase';

const TOURS_TABLE = process.env.EXPO_PUBLIC_SUPABASE_TOURS_TABLE ?? 'tours';

type TourRow = {
  id: string;
  owner_id?: string | null;
  title?: string | null;
  introduction?: string | null;
  conclusion?: string | null;
  locale?: Tour['locale'] | null;
  country?: string | null;
  city?: string | null;
  categories?: Tour['categories'] | null;
  start_point?: Tour['startPoint'] | null;
  end_point?: Tour['endPoint'] | null;
  end_same_as_start?: boolean | null;
  steps?: Tour['steps'] | null;
  has_ticket?: boolean | null;
  ticket_price: number | null;
  ticket_currency: string | null;
  status?: Tour['status'] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function mapRowToTour(row: TourRow): Tour {
  return {
    id: row.id,
    ownerId: row.owner_id ?? undefined,
    title: row.title ?? '',
    introduction: row.introduction ?? '',
    conclusion: row.conclusion ?? '',
    locale: row.locale ?? 'ru',
    country: row.country ?? '',
    city: row.city ?? '',
    categories: row.categories ?? [],
    startPoint: row.start_point ?? {},
    endPoint: row.end_point ?? {},
    endSameAsStart: row.end_same_as_start ?? false,
    steps: row.steps ?? [],
    hasTicket: row.has_ticket ?? false,
    ticketPrice: row.ticket_price ?? undefined,
    ticketCurrency: row.ticket_currency ?? undefined,
    status: row.status ?? 'draft',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

export class SupabaseTourConflictError extends Error {
  code = 'REMOTE_NEWER';
}

export class SupabaseToursTableMissingError extends Error {
  code = 'TABLE_NOT_FOUND';
}

export class SupabaseToursSetupError extends Error {
  code = 'SETUP_ERROR';
}

export function isSupabaseTourConflictError(
  error: unknown
): error is SupabaseTourConflictError {
  return (
    error instanceof SupabaseTourConflictError ||
    (error instanceof Error && (error as { code?: string }).code === 'REMOTE_NEWER')
  );
}

export function isSupabaseToursTableMissingError(
  error: unknown
): error is SupabaseToursTableMissingError {
  return (
    error instanceof SupabaseToursTableMissingError ||
    (error instanceof Error && (error as { code?: string }).code === 'TABLE_NOT_FOUND')
  );
}

export function isSupabaseToursSetupError(
  error: unknown
): error is SupabaseToursSetupError {
  return (
    error instanceof SupabaseToursSetupError ||
    (error instanceof Error && (error as { code?: string }).code === 'SETUP_ERROR')
  );
}

function normalizeToursError(error: unknown): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'PGRST205'
  ) {
    throw new SupabaseToursTableMissingError(
      `В Supabase не найдена таблица public.${TOURS_TABLE}. Примени миграции или укажи EXPO_PUBLIC_SUPABASE_TOURS_TABLE.`
    );
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '42703'
  ) {
    throw new SupabaseToursSetupError(
      `В таблице public.${TOURS_TABLE} не хватает колонок для текущей модели тура. Примени совместимую миграцию.`
    );
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '42501'
  ) {
    throw new SupabaseToursSetupError(
      `Недостаточно прав для записи в public.${TOURS_TABLE}. Проверь RLS policy для owner_id = auth.uid().`
    );
  }
  throw error;
}

function mapTourToInsert(tour: Tour, ownerId: string) {
  return {
    id: tour.id,
    owner_id: ownerId,
    title: tour.title,
    introduction: tour.introduction,
    conclusion: tour.conclusion,
    locale: tour.locale,
    country: tour.country,
    city: tour.city,
    categories: tour.categories,
    start_point: tour.startPoint,
    end_point: tour.endPoint,
    end_same_as_start: tour.endSameAsStart,
    steps: tour.steps,
    has_ticket: tour.hasTicket,
    ticket_price: tour.ticketPrice ?? null,
    ticket_currency: tour.ticketCurrency ?? null,
    status: tour.status,
  };
}

export async function loadToursFromSupabase(): Promise<Tour[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TOURS_TABLE)
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) normalizeToursError(error);
  return (data as TourRow[]).map(mapRowToTour);
}

export async function loadAllToursFromSupabase(): Promise<Tour[]> {
  if (!supabase) return [];
  const tours = await loadToursFromSupabase();
  const ownerIds = Array.from(new Set(tours.map((t) => t.ownerId).filter(Boolean))) as string[];
  if (ownerIds.length === 0) return tours;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id,email')
    .in('id', ownerIds);
  if (error) {
    // Older schemas can have profiles without email column.
    if (error.code === '42703') return tours;
    return tours;
  }

  const emailByOwnerId = new Map((profiles ?? []).map((p) => [p.id as string, p.email as string | null]));
  return tours.map((tour) => ({
    ...tour,
    ownerEmail: tour.ownerId ? emailByOwnerId.get(tour.ownerId) ?? undefined : undefined,
  }));
}

export async function upsertTourToSupabase(tour: Tour): Promise<void> {
  if (!supabase) return;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Пользователь не авторизован.');

  const { data: existing, error: existingError } = await supabase
    .from(TOURS_TABLE)
    .select('updated_at')
    .eq('id', tour.id)
    .maybeSingle();
  if (existingError) normalizeToursError(existingError);

  if (existing?.updated_at) {
    const remoteUpdatedAt = new Date(existing.updated_at).getTime();
    if (remoteUpdatedAt > tour.updatedAt) {
      throw new SupabaseTourConflictError(
        'Тур был обновлен на другом устройстве. Подтянута более свежая версия.'
      );
    }
  }

  const { error } = await supabase
    .from(TOURS_TABLE)
    .upsert(mapTourToInsert(tour, user.id), { onConflict: 'id' });
  if (error) normalizeToursError(error);
}

export async function deleteTourFromSupabase(tourId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TOURS_TABLE).delete().eq('id', tourId);
  if (error) normalizeToursError(error);
}

export async function loadTourByIdFromSupabase(
  tourId: string
): Promise<Tour | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TOURS_TABLE)
    .select('*')
    .eq('id', tourId)
    .maybeSingle();
  if (error) normalizeToursError(error);
  if (!data) return null;
  return mapRowToTour(data as TourRow);
}

export async function approveTourPublication(tourId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from(TOURS_TABLE)
    .update({ status: 'published' })
    .eq('id', tourId);
  if (error) normalizeToursError(error);
}
