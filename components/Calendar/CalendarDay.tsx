import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface Compromisso {
  id: string;
  data: string;
  categoria: string;
  titulo: string;
  hora: string;
}

interface AnotacaoCalendario {
  id: string;
  data: string;
  texto: string;
}

interface CalendarDayProps {
  day: number;
  dateString: string;
  isToday: boolean;
  compromissos: Compromisso[];
  anotacoes: AnotacaoCalendario[];
  onPress: (date: string) => void;
}

export function CalendarDay({ day, dateString, isToday, compromissos, anotacoes, onPress }: CalendarDayProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const getClassificationColor = (categoria: string) => {
    const map: Record<string, string> = {
      aula: colors.category.aula,
      prova: colors.category.prova,
      trabalho: colors.category.trabalho,
      outro: colors.category.outro,
    };
    return map[categoria] || colors.text.tertiary;
  };

  const getClassificationAbbr = (categoria: string) => {
    const abbr: Record<string, string> = { aula: 'AULA', prova: 'PROVA', trabalho: 'TRAB', outro: 'OUTRO' };
    return abbr[categoria] || categoria.substring(0, 4).toUpperCase();
  };

  const hasOverdueCompromissos = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [y, m, d] = dateString.split('-').map(Number);
    const compromissoDate = new Date(y, m - 1, d);

    if (compromissoDate < today && compromissos.length > 0) return true;

    if (compromissoDate.getTime() === today.getTime()) {
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      return compromissos.some(c => {
        if (!c.hora?.includes(':')) return false;
        const [hora, minuto] = c.hora.split(':').map(Number);
        if (isNaN(hora) || isNaN(minuto)) return false;
        return hora * 60 + minuto < currentTimeInMinutes;
      });
    }
    return false;
  };

  const groupedCompromissos = compromissos.reduce((acc, c) => {
    acc[c.categoria] = (acc[c.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isOverdue = hasOverdueCompromissos();
  const hasAnotacoes = anotacoes.length > 0;
  const maxItemsToShow = hasAnotacoes ? 1 : 2;
  const compromissosToShow = Object.entries(groupedCompromissos).slice(0, maxItemsToShow);
  const remainingItems = Math.max(0, Object.keys(groupedCompromissos).length - maxItemsToShow);

  return (
    <TouchableOpacity
      style={[styles.dayContainer, isToday && styles.todayContainer]}
      onPress={() => onPress(dateString)}
      activeOpacity={0.7}
    >
      <View style={styles.dayContent}>
        <View style={styles.dayNumberContainer}>
          <Text style={[styles.dayNumber, isToday && styles.todayText]}>{day}</Text>
          {isOverdue && (
            <View style={styles.overdueIndicator}>
              <Text style={styles.overdueText}>!</Text>
            </View>
          )}
        </View>

        <View style={styles.itemsContainer}>
          {hasAnotacoes && (
            <View style={[styles.tag, { backgroundColor: colors.success }]}>
              <Text style={styles.tagText}>NOTA{anotacoes.length > 1 && ` ${anotacoes.length}`}</Text>
            </View>
          )}
          {compromissosToShow.map(([categoria, count]) => (
            <View key={categoria} style={[styles.tag, { backgroundColor: getClassificationColor(categoria) }]}>
              <Text style={styles.tagText}>
                {getClassificationAbbr(categoria)}{count > 1 && ` ${count}`}
              </Text>
            </View>
          ))}
          {remainingItems > 0 && (
            <View style={[styles.tag, { backgroundColor: colors.text.tertiary }]}>
              <Text style={styles.tagText}>+{remainingItems}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    dayContainer: { 
      width: '14.285714%', 
      flex: 1, 
      justifyContent: 'flex-start', 
      alignItems: 'center', 
      borderRadius: 8, 
      margin: 1, 
      backgroundColor: colors.background.secondary 
    },
    todayContainer: { 
      backgroundColor: colors.calendar.todayBackground, // Cor dinâmica puxada do seu tema
    },
    dayContent: { flex: 1, width: '100%', padding: 4, alignItems: 'center' },
    dayNumberContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    dayNumber: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
    todayText: { color: colors.text.white, fontWeight: 'bold' },
    itemsContainer: { flex: 1, width: '100%', alignItems: 'center', gap: 2 },
    tag: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6, minWidth: 28, alignItems: 'center' },
    tagText: { fontSize: 9, fontWeight: '600', color: '#fff', textAlign: 'center' },
    overdueIndicator: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center', marginLeft: 2 },
    overdueText: { fontSize: 10, fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 12 },
  });
}

export { CalendarDay };