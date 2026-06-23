import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorScheme } from '@/components/theme/colors';
import { typography } from '@/components/theme/typography';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
  preference: ThemePreference;
  activeTheme: ActiveTheme;
  colors: ColorScheme;
  typography: typeof typography;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = '@estuday:themePreference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark' || val === 'system') setPreference(val);
    });
  }, []);

  const activeTheme: ActiveTheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const colors: ColorScheme = activeTheme === 'dark' ? darkColors : lightColors;

  const setTheme = async (theme: ThemePreference) => {
    setPreference(theme);
    await AsyncStorage.setItem(STORAGE_KEY, theme);
  };

  return (
    <ThemeContext.Provider value={{ preference, activeTheme, colors, typography, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// 🛡️ O ESCUDO PROTETOR QUE ESTAVA FALTANDO:
export default ThemeProvider;