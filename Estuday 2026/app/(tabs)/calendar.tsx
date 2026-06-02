import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from '@/components/Calendar/Calendar';
import { DayModal } from '@/components/DayModal/DayModal';

export default function CalendarScreen() {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Calendar onDayPress={handleDayPress} />
      </View>

      {selectedDate && (
        <DayModal
          visible={modalVisible}
          date={selectedDate}
          onClose={handleCloseModal}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});