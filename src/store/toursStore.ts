import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand/index.js';
import { persist, createJSONStorage } from 'zustand/middleware.js';
import {
  deleteTourFromSupabase,
  isSupabaseTourConflictError,
  isSupabaseToursSetupError,
  isSupabaseToursTableMissingError,
  loadTourByIdFromSupabase,
  upsertTourToSupabase,
} from '../lib/supabaseTours';
import { Tour, TourStep } from '../types/tour';
import { makeId } from '../utils/id';

interface ToursState {
  tours: Tour[];
  isLoadingTours: boolean;
  syncNotice: string | null;
  setIsLoadingTours: (value: boolean) => void;
  setSyncNotice: (message: string | null) => void;
  replaceTours: (tours: Tour[]) => void;
  clearTours: () => void;
  createTour: () => string;
  updateTour: (id: string, patch: Partial<Tour>) => void;
  deleteTour: (id: string) => void;
  duplicateTour: (id: string) => string | null;

  addStep: (tourId: string, step?: Partial<TourStep>) => string;
  updateStep: (tourId: string, stepId: string, patch: Partial<TourStep>) => void;
  deleteStep: (tourId: string, stepId: string) => void;
  moveStep: (tourId: string, stepId: string, direction: 'up' | 'down') => void;
}

function makeEmptyTour(): Tour {
  const now = Date.now();
  return {
    id: makeId('tour'),
    title: '',
    introduction: '',
    conclusion: '',
    locale: 'ru',
    country: '',
    city: '',
    categories: [],
    startPoint: {},
    endPoint: {},
    endSameAsStart: false,
    steps: [],
    hasTicket: false,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

function touch<T extends { updatedAt: number }>(obj: T): T {
  return { ...obj, updatedAt: Date.now() };
}

function getReadableSyncError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Не удалось синхронизировать тур с Supabase.';
}

export const useToursStore = create<ToursState>()(
  persist(
    (set, get) => ({
      tours: [],
      isLoadingTours: false,
      syncNotice: null,
      setIsLoadingTours: (value) => set({ isLoadingTours: value }),
      setSyncNotice: (message) => set({ syncNotice: message }),
      replaceTours: (tours) => set({ tours }),
      clearTours: () => set({ tours: [], syncNotice: null }),
      // syncError handler is defined once to keep messages consistent

      createTour: () => {
        const tour = makeEmptyTour();
        set({ tours: [tour, ...get().tours] });
        void upsertTourToSupabase(tour).catch((error) => {
          if (isSupabaseToursTableMissingError(error) || isSupabaseToursSetupError(error)) {
            set({ syncNotice: error.message });
            return;
          }
          set({ syncNotice: getReadableSyncError(error) });
        });
        return tour.id;
      },

      updateTour: (id, patch) => {
        const currentTours = get().tours;
        let updatedTour: Tour | undefined;
        const nextTours = currentTours.map((t) => {
          if (t.id !== id) return t;
          const next = touch({ ...t, ...patch });
          updatedTour = next;
          return next;
        });
        set({ tours: nextTours });

        if (updatedTour) {
          const pendingTourId = updatedTour.id;
          void upsertTourToSupabase(updatedTour).catch(async (error) => {
            if (isSupabaseTourConflictError(error)) {
              try {
                const freshTour = await loadTourByIdFromSupabase(pendingTourId);
                if (!freshTour) return;
                set({
                  tours: get().tours.map((t) => (t.id === freshTour.id ? freshTour : t)),
                  syncNotice:
                    'Обнаружен конфликт: загружена более свежая версия тура из Supabase.',
                });
              } catch (refreshError) {
                console.warn('Supabase conflict refresh failed:', refreshError);
              }
              return;
            }
            if (isSupabaseToursTableMissingError(error)) {
              set({ syncNotice: error.message });
              return;
            }
            if (isSupabaseToursSetupError(error)) {
              set({ syncNotice: error.message });
              return;
            }
            set({ syncNotice: getReadableSyncError(error) });
          });
        }
      },

      deleteTour: (id) => {
        set({ tours: get().tours.filter((t) => t.id !== id) });
        void deleteTourFromSupabase(id).catch((error) => {
          if (isSupabaseToursTableMissingError(error) || isSupabaseToursSetupError(error)) {
            set({ syncNotice: error.message });
            return;
          }
          set({ syncNotice: getReadableSyncError(error) });
        });
      },

      duplicateTour: (id) => {
        const source = get().tours.find((t) => t.id === id);
        if (!source) return null;
        const copy: Tour = {
          ...source,
          id: makeId('tour'),
          title: source.title ? `${source.title} (копия)` : '',
          status: 'draft',
          steps: source.steps.map((s) => ({ ...s, id: makeId('step') })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ tours: [copy, ...get().tours] });
        void upsertTourToSupabase(copy).catch((error) => {
          if (isSupabaseToursTableMissingError(error) || isSupabaseToursSetupError(error)) {
            set({ syncNotice: error.message });
            return;
          }
          set({ syncNotice: getReadableSyncError(error) });
        });
        return copy.id;
      },

      addStep: (tourId, step) => {
        const newStep: TourStep = {
          id: makeId('step'),
          title: step?.title ?? '',
          description: step?.description ?? '',
          point: step?.point ?? {},
          audioUrl: step?.audioUrl,
          imageUrl: step?.imageUrl,
          videoUrl: step?.videoUrl,
        };
        set({
          tours: get().tours.map((t) => {
            if (t.id !== tourId) return t;
            const updated = touch({ ...t, steps: [...t.steps, newStep] });
            void upsertTourToSupabase(updated).catch((error) => {
              if (isSupabaseToursTableMissingError(error) || isSupabaseToursSetupError(error)) {
                set({ syncNotice: error.message });
                return;
              }
              set({ syncNotice: getReadableSyncError(error) });
            });
            return updated;
          }),
        });
        return newStep.id;
      },

      updateStep: (tourId, stepId, patch) => {
        set({
          tours: get().tours.map((t) => {
            if (t.id !== tourId) return t;
            const updated = touch({
              ...t,
              steps: t.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
            });
            void upsertTourToSupabase(updated).catch((error) => {
              if (isSupabaseToursTableMissingError(error) || isSupabaseToursSetupError(error)) {
                set({ syncNotice: error.message });
                return;
              }
              set({ syncNotice: getReadableSyncError(error) });
            });
            return updated;
          }),
        });
      },

      deleteStep: (tourId, stepId) => {
        set({
          tours: get().tours.map((t) => {
            if (t.id !== tourId) return t;
            const updated = touch({ ...t, steps: t.steps.filter((s) => s.id !== stepId) });
            void upsertTourToSupabase(updated).catch((error) => {
              if (isSupabaseToursTableMissingError(error) || isSupabaseToursSetupError(error)) {
                set({ syncNotice: error.message });
                return;
              }
              set({ syncNotice: getReadableSyncError(error) });
            });
            return updated;
          }),
        });
      },

      moveStep: (tourId, stepId, direction) => {
        set({
          tours: get().tours.map((t) => {
            if (t.id !== tourId) return t;
            const idx = t.steps.findIndex((s) => s.id === stepId);
            if (idx < 0) return t;
            const target = direction === 'up' ? idx - 1 : idx + 1;
            if (target < 0 || target >= t.steps.length) return t;
            const steps = [...t.steps];
            const [moved] = steps.splice(idx, 1);
            steps.splice(target, 0, moved);
            const updated = touch({ ...t, steps });
            void upsertTourToSupabase(updated).catch((error) => {
              if (isSupabaseToursTableMissingError(error) || isSupabaseToursSetupError(error)) {
                set({ syncNotice: error.message });
                return;
              }
              set({ syncNotice: getReadableSyncError(error) });
            });
            return updated;
          }),
        });
      },
    }),
    {
      name: 'kibergid-admin:tours',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useTour = (id: string | undefined) =>
  useToursStore((s) => s.tours.find((t) => t.id === id));
