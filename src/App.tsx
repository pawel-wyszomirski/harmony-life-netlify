import { useState, useEffect } from 'react';
import { Container, useToast, useColorMode } from '@chakra-ui/react';
import { HarmonyModel } from './components/HarmonyModel';
import { FileUpload } from './components/FileUpload';
import { Summary } from './components/Summary';
import { ReloadPrompt } from './ReloadPrompt';
import { harmonyData } from './data/harmonyData';
import { Area } from './types/harmony';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { supabase } from './lib/supabase';

type AppState = 'auth' | 'start' | 'assessment' | 'summary';

export default function App() {
  const [state, setState] = useState<AppState>('auth');
  const [areas, setAreas] = useState<Area[]>(
    harmonyData.map((area, index) => ({
      ...area,
      score: 5,
      notes: '',
      order: index,
    }))
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const toast = useToast();
  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserPreferences();
        setState('start');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserPreferences();
        setState('start');
      } else {
        setState('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme_mode')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data?.theme_mode) {
        setColorMode(data.theme_mode);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme_mode: colorMode
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  useEffect(() => {
    saveUserPreferences();
  }, [colorMode]);

  const handleFileUpload = (data: any[]) => {
    const updatedAreas = areas.map((area, index) => {
      const uploadedArea = data.find(item => item.name === area.name);
      return {
        ...area,
        score: uploadedArea?.score ?? 5,
        notes: uploadedArea?.notes ?? '',
        order: uploadedArea?.order ?? index,
      };
    });
    setAreas(updatedAreas);
    setState('assessment');
  };

  const handleStart = () => setState('assessment');
  const handleComplete = () => setState('summary');
  const handleBack = () => setState('assessment');
  const handleAuthSuccess = () => setState('start');

  const handleSignOut = async () => {
    if (hasUnsavedChanges) {
      const isConfirmed = window.confirm(
        'Masz niezapisane zmiany. Czy na pewno chcesz się wylogować? Niezapisane zmiany zostaną utracone.'
      );
      if (!isConfirmed) return;
    }
    await supabase.auth.signOut();
    setState('auth');
    setHasUnsavedChanges(false);
  };

  return (
    <Layout 
      showThemeToggle={state !== 'auth'} 
      onSignOut={state !== 'auth' ? handleSignOut : undefined}
    >
      <Container maxW="container.lg" px={4}>
        {state === 'auth' && (
          <Auth onAuthSuccess={handleAuthSuccess} />
        )}
        {state === 'start' && (
          <FileUpload 
            onUpload={handleFileUpload} 
            onStart={handleStart}
            onSignOut={handleSignOut}
          />
        )}
        {state === 'assessment' && (
          <HarmonyModel
            areas={areas}
            onAreasChange={setAreas}
            onComplete={handleComplete}
            onSignOut={handleSignOut}
          />
        )}
        {state === 'summary' && (
          <Summary
            areas={areas}
            onAreasChange={setAreas}
            onBack={handleBack}
            onSignOut={handleSignOut}
            onSaveStateChange={setHasUnsavedChanges}
          />
        )}
      </Container>
      <ReloadPrompt />
    </Layout>
  );
}