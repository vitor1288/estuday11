import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { MaterialTopTabNavigationOptions, MaterialTopTabNavigationEventMap } from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { Chrome as Home, Calendar, Clock, FileText, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors, darkColors } from '@/components/theme/colors';

// 🟢 NOVO: Adapta o Material Top Tabs (que tem swipe nativo) para funcionar com o expo-router
const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const { activeTheme } = useTheme();
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  return (
    <MaterialTopTabs
      // 🟢 NOVO: posiciona a barra embaixo (igual Tabs padrão) mas mantém o gesto de swipe
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 0.7,
        // 🟢 NOVO: remove a barrinha indicadora do material tabs (não faz sentido numa tab bar inferior)
        tabBarIndicatorStyle: { height: 0 },
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          borderBottomWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textTransform: 'none',
          marginTop: 2,
        },
        tabBarIconStyle: {
          width: 24,
          height: 24,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ color }) => <Home size={24} color={color} /> }}
      />
      <MaterialTopTabs.Screen
        name="calendar"
        options={{ title: 'Calendário', tabBarIcon: ({ color }) => <Calendar size={24} color={color} /> }}
      />
      <MaterialTopTabs.Screen
        name="compromissos"
        options={{ title: 'Compromissos', tabBarIcon: ({ color }) => <Clock size={24} color={color} /> }}
      />
      <MaterialTopTabs.Screen
        name="anotacoes"
        options={{ title: 'Anotações', tabBarIcon: ({ color }) => <FileText size={24} color={color} /> }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <User size={24} color={color} /> }}
      />
    </MaterialTopTabs>
  );
}
