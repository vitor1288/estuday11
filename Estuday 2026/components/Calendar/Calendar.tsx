import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEstuday } from '@/contexts/StudayContext';
import { getMonthName, getDaysInMonth, getFirstDayOfMonth, createDateString, isToday } from '@/utils/dateUtils';
import { CalendarDay } from '@/components/Calendar/CalendarDay';

interface CalendarProps {
  onDayPress: (date: string) => void;
}

export function Calendar({ onDayPress }: CalendarProps) {
  const { state } = useEstuday();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getCompromissosForDate = (dateString: string) => {
    // Filtrar apenas compromissos não concluídos, igual ao DayModal
    return state.compromissos.filter(c => c.data === dateString && !c.concluido);
  };

  const getAnotacoesForDate = (dateString: string) => {
    return state.anotacoes.filter(a => a.data === dateString);
  };

  const renderCalendarWeeks = () => {
    const weeks = [];
    const totalCells = 42; // 6 semanas × 7 dias
    const allDays = [];
    
    // Espaços vazios para o início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      allDays.push(null);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      allDays.push(day);
    }
    
    // Preencher o resto com null para completar 42 células
    while (allDays.length < totalCells) {
      allDays.push(null);
    }
    
    // Dividir em semanas (6 semanas de 7 dias cada)
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const weekDays = [];
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const cellIndex = weekIndex * 7 + dayIndex;
        const day = allDays[cellIndex];
        
        if (day === null) {
          // Célula vazia
          weekDays.push(
            <View key={`empty-${cellIndex}`} style={styles.emptyDay} />
          );
        } else {
          // Dia com conteúdo
          const dateString = createDateString(year, month, day);
          const today = isToday(dateString);
          const compromissos = getCompromissosForDate(dateString);
          const anotacoes = getAnotacoesForDate(dateString);
          
          weekDays.push(
            <CalendarDay
              key={`day-${day}`}
              day={day}
              dateString={dateString}
              isToday={today}
              compromissos={compromissos}
              anotacoes={anotacoes}
              onPress={onDayPress}
            />
          );
        }
      }
      
      // Adicionar a semana completa
      weeks.push(
        <View key={`week-${weekIndex}`} style={styles.weekRow}>
          {weekDays}
        </View>
      );
    }
    
    return weeks;
  };

  return (
    <View style={styles.container}>
      {/* Header do calendário */}
      <View style={styles.header}>
        <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {getMonthName(month)} {year}
        </Text>
        
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <ChevronRight size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Dias da semana */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDay}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid do calendário - Ocupa o espaço restante */}
      <View style={styles.calendarGrid}>
        {renderCalendarWeeks()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  calendarGrid: {
    flex: 1,
    paddingHorizontal: 8,
  },
  weekRow: {
    flexDirection: 'row',
    flex: 1,
  },
  emptyDay: {
    width: '14.285714%',
    flex: 1,
  },
});

export { Calendar };