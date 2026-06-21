import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useStuday } from '@/contexts/StudayContext';
import { CalendarDay } from '@/components/Calendar/CalendarDay';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

export function Calendar({ onDayPress }: { onDayPress: (date: string) => void }) {
  const { state } = useStuday();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const previousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const getCompromissosForDate = (dateString: string) =>
    (state?.compromissos || []).filter((c: any) => c.data === dateString && !c.concluido);

  const getAnotacoesForDate = (dateString: string) =>
    (state?.anotacoes || []).filter((a: any) => a.data === dateString);

  const renderCalendarWeeks = () => {
    const allDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) allDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) allDays.push(day);
    while (allDays.length < 42) allDays.push(null);

    return Array.from({ length: 6 }, (_, weekIndex) => (
      <View key={`week-${weekIndex}`} style={styles.weekRow}>
        {Array.from({ length: 7 }, (_, dayIndex) => {
          const day = allDays[weekIndex * 7 + dayIndex];
          if (day === null) return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.emptyDay} />;
          
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          return (
            <CalendarDay
              key={`day-${day}`}
              day={day}
              dateString={dateString}
              isToday={dateString === hojeStr}
              compromissos={getCompromissosForDate(dateString)}
              anotacoes={getAnotacoesForDate(dateString)}
              onPress={onDayPress}
            />
          );
        })}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' }}>
          {monthNames[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '600' }}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {renderCalendarWeeks()}
      </View>
    </View>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    navButton: { padding: 8, borderRadius: 8, backgroundColor: colors.background.tertiary },
    weekDaysContainer: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    weekDayCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
    calendarGrid: { flex: 1, paddingHorizontal: 8 },
    weekRow: { flexDirection: 'row', flex: 1 },
    emptyDay: { width: '14.285714%', flex: 1 },
  });
}