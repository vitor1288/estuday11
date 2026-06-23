import '../utils/alertPolyfill';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { EstudayProvider } from '@/contexts/StudayContext'; // ✅ Corrigido para EstudayProvider (com E)
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function AppContent() {
  const { activeTheme } = useTheme();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <ThemeProvider>
      <EstudayProvider> {/* ✅ Corrigido aqui também */}
        <AppContent />
      </EstudayProvider>
    </ThemeProvider>
  );
}