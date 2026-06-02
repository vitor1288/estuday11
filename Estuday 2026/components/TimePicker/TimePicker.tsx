import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface TimePickerProps {
  initialHour?: number;
  initialMinute?: number;
  onTimeChange: (hour: number, minute: number) => void;
  style?: any;
}

const TimePicker: React.FC<TimePickerProps> = ({
  initialHour = 23,
  initialMinute = 59,
  onTimeChange,
  style,
}) => {
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  
  const ITEM_HEIGHT = 50;
  const VISIBLE_ITEMS = 3;
  const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  // Gerar arrays de horas (0-23) e minutos (0-59)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Função para centralizar o scroll no item selecionado
  const scrollToSelectedItem = (
    scrollRef: React.RefObject<ScrollView>,
    selectedIndex: number
  ) => {
    if (scrollRef.current) {
      const offsetY = selectedIndex * ITEM_HEIGHT;
      scrollRef.current.scrollTo({ y: offsetY, animated: true });
    }
  };

  // Efeito para centralizar os valores iniciais
  useEffect(() => {
    setTimeout(() => {
      scrollToSelectedItem(hourScrollRef, selectedHour);
      scrollToSelectedItem(minuteScrollRef, selectedMinute);
    }, 100);
  }, []);

  // Função para lidar com o scroll das horas
  const handleHourScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, hours.length - 1));
    
    if (clampedIndex !== selectedHour) {
      setSelectedHour(clampedIndex);
      onTimeChange(clampedIndex, selectedMinute);
    }
  };

  // Função para lidar com o scroll dos minutos
  const handleMinuteScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, minutes.length - 1));
    
    if (clampedIndex !== selectedMinute) {
      setSelectedMinute(clampedIndex);
      onTimeChange(selectedHour, clampedIndex);
    }
  };

  // Função para renderizar item do picker
  const renderPickerItem = (
    value: number,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.pickerItem,
        isSelected && styles.selectedPickerItem,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.pickerItemText,
          isSelected && styles.selectedPickerItemText,
        ]}
      >
        {value.toString().padStart(2, '0')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Selecione o horário</Text>
      
      <View style={styles.pickerContainer}>
        {/* Coluna das Horas */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>Horas</Text>
          <View style={styles.pickerWrapper}>
            <ScrollView
              ref={hourScrollRef}
              style={styles.picker}
              contentContainerStyle={styles.pickerContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleHourScroll}
              onScrollEndDrag={handleHourScroll}
            >
              {hours.map((hour) =>
                renderPickerItem(
                  hour,
                  hour === selectedHour,
                  () => {
                    setSelectedHour(hour);
                    onTimeChange(hour, selectedMinute);
                    scrollToSelectedItem(hourScrollRef, hour);
                  }
                )
              )}
            </ScrollView>
            
            {/* Indicador de seleção */}
            <View style={styles.selectionIndicator} />
          </View>
        </View>

        {/* Separador */}
        <Text style={styles.separator}>:</Text>

        {/* Coluna dos Minutos */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>Minutos</Text>
          <View style={styles.pickerWrapper}>
            <ScrollView
              ref={minuteScrollRef}
              style={styles.picker}
              contentContainerStyle={styles.pickerContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleMinuteScroll}
              onScrollEndDrag={handleMinuteScroll}
            >
              {minutes.map((minute) =>
                renderPickerItem(
                  minute,
                  minute === selectedMinute,
                  () => {
                    setSelectedMinute(minute);
                    onTimeChange(selectedHour, minute);
                    scrollToSelectedItem(minuteScrollRef, minute);
                  }
                )
              )}
            </ScrollView>
            
            {/* Indicador de seleção */}
            <View style={styles.selectionIndicator} />
          </View>
        </View>
      </View>

      {/* Display do horário selecionado */}
      <View style={styles.selectedTimeContainer}>
        <Text style={styles.selectedTimeLabel}>Horário selecionado:</Text>
        <Text style={styles.selectedTime}>
          {selectedHour.toString().padStart(2, '0')}:
          {selectedMinute.toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  column: {
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  pickerWrapper: {
    position: 'relative',
    height: 150,
    width: 80,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  picker: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: 0,
  },
  spacer: {
    height: ITEM_HEIGHT,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  selectedPickerItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  pickerItemText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '400',
  },
  selectedPickerItemText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    pointerEvents: 'none',
  },
  separator: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 30,
  },
  selectedTimeContainer: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  selectedTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default TimePicker;