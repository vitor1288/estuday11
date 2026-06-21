import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importamos APENAS a grade principal (que já fará todo o trabalho pesado)
import { Calendar } from '@/components/Calendar/Calendar'; 
import { DayModal } from '@/components/DayModal/DayModal'; 
import { useTheme } from '@/contexts/ThemeContext';

export default function CalendarScreen() {
  const { colors } = useTheme();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDayPress = (date: string) => { 
    setSelectedDate(date); 
    setModalVisible(true); 
  };
  
  const handleCloseModal = () => { 
    setModalVisible(false); 
    setSelectedDate(null); 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <View style={styles.container}>
        {/* Renderiza o componente Calendar.tsx que cuidará de tudo */}
        <Calendar onDayPress={handleDayPress} />
      </View>
      
      {selectedDate && (
        <DayModal visible={modalVisible} date={selectedDate} onClose={handleCloseModal} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});