import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEstuday } from '@/contexts/StudayContext';
import { getMonthName, getDaysInMonth, getFirstDayOfMonth, createDateString, isToday } from '@/utils/dateUtils';
import { CalendarDay } from '@/components/Calendar/CalendarDay';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface CalendarProps {
  onDayPress: (date: string) => void;
}

export function Calendar({ onDayPress }: CalendarProps) {
  const { state } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const previousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getCompromissosForDate = (dateString: string) =>
    state.compromissos.filter(c => c.data === dateString && !c.concluido);

  const getAnotacoesForDate = (dateString: string) =>
    state.anotacoes.filter(a => a.data === dateString);

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
          const dateString = createDateString(year, month, day);
          return (
            <CalendarDay
              key={`day-${day}`}
              day={day}
              dateString={dateString}
              isToday={isToday(dateString)}
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
        <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>
          {getMonthName(month)} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={[typography.small, { color: colors.text.secondary }]}>{day}</Text>
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

export { Calendar };