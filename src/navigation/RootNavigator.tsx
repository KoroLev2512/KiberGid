import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import {
  isSupabaseToursTableMissingError,
  loadAllToursFromSupabase,
} from '../lib/supabaseTours';
import { colors } from '../theme';
import { useToursStore } from '../store/toursStore';
import { RootStackParamList } from './types';
import { supabase } from '../lib/supabase';
import { AuthScreen } from '../screens/AuthScreen';
import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { ToursListScreen } from '../screens/ToursListScreen';
import { TourEditorScreen } from '../screens/TourEditorScreen';
import { StepEditorScreen } from '../screens/StepEditorScreen';
import { LocalePickerScreen } from '../screens/pickers/LocalePickerScreen';
import { LocationPickerScreen } from '../screens/pickers/LocationPickerScreen';
import { CategoriesPickerScreen } from '../screens/pickers/CategoriesPickerScreen';
import { PointPickerScreen } from '../screens/pickers/PointPickerScreen';
import { PreviewTourScreen } from '../screens/PreviewTourScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const replaceTours = useToursStore((s) => s.replaceTours);
  const clearTours = useToursStore((s) => s.clearTours);
  const setIsLoadingTours = useToursStore((s) => s.setIsLoadingTours);
  const setSyncNotice = useToursStore((s) => s.setSyncNotice);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session ?? null);
        setReady(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setIsLoadingTours(false);
      clearTours();
      return;
    }

    let cancelled = false;
    setIsLoadingTours(true);
    loadAllToursFromSupabase()
      .then((tours) => {
        if (!cancelled) {
          replaceTours(tours);
          setIsLoadingTours(false);
        }
      })
      .catch((error) => {
        setIsLoadingTours(false);
        if (isSupabaseToursTableMissingError(error)) {
          setSyncNotice(error.message);
          return;
        }
        console.warn('Supabase load tours failed:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [session, replaceTours, clearTours, setIsLoadingTours, setSyncNotice]);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={session ? 'ToursList' : 'Auth'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPage },
        }}
      >
        {!session ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="ToursList" component={ToursListScreen} />
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
            <Stack.Screen name="TourEditor" component={TourEditorScreen} />
            <Stack.Screen name="StepEditor" component={StepEditorScreen} />
            <Stack.Screen
              name="LocalePicker"
              component={LocalePickerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="LocationPicker"
              component={LocationPickerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="CategoriesPicker"
              component={CategoriesPickerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="PointPicker"
              component={PointPickerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="PreviewTour" component={PreviewTourScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
