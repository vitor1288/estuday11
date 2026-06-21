import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface TimePickerProps {
  initialHour?: number;
  initialMinute?: number;
  onTimeChange: (hour: number, minute: number) => void;
  style?: any;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const WRAPPER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 150px total
const LOOP_COUNT = 10; // Blocos para rolagem infinita estável

const TimePicker: React.FC<TimePickerProps> = ({
  initialHour = 23,
  initialMinute = 59,
  onTimeChange,
  style,
}) => {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  // Refs de controle de valor em tempo real
  const hourRef = useRef(initialHour);
  const minuteRef = useRef(initialMinute);

  // Timers de debounce ultrarrápidos para o callback do componente pai
  const hourTimeoutRef = useRef<any>(null);
  const minuteTimeoutRef = useRef<any>(null);

  // Estados visuais com atualização instantânea durante o arraste
  const [displayHour, setDisplayHour] = useState(initialHour);
  const [displayMinute, setDisplayMinute] = useState(initialMinute);

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const hoursArray = Array.from({ length: 24 * LOOP_COUNT }, (_, i) => i % 24);
  const minutesArray = Array.from({ length: 60 * LOOP_COUNT }, (_, i) => i % 60);

  const scrollToValue = (scrollRef: React.RefObject<ScrollView>, index: number, animated = true) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated });
  };

  // Posicionamento inicial no bloco central do loop
  useEffect(() => {
    const centerHourIndex = 24 * Math.floor(LOOP_COUNT / 2) + initialHour;
    const centerMinuteIndex = 60 * Math.floor(LOOP_COUNT / 2) + initialMinute;

    const timer = setTimeout(() => {
      scrollToValue(hourScrollRef, centerHourIndex, false);
      scrollToValue(minuteScrollRef, centerMinuteIndex, false);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (hourTimeoutRef.current) clearTimeout(hourTimeoutRef.current);
      if (minuteTimeoutRef.current) clearTimeout(minuteTimeoutRef.current);
    };
  }, [initialHour, initialMinute]);

  // Captura inteligente e responsiva da rolagem ativa
  const handleScroll = (event: any, type: 'hour' | 'minute') => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(Math.round(yOffset / ITEM_HEIGHT), (type === 'hour' ? hoursArray.length : minutesArray.length) - 1));
    
    if (type === 'hour') {
      const actualHour = hoursArray[index];
      
      // 1. Atualização Visual INSTANTÂNEA ao passar pelas linhas (Zero Delay)
      if (actualHour !== undefined && actualHour !== displayHour) {
        setDisplayHour(actualHour);
      }
      
      // 2. Debounce super curto (40ms) apenas para disparar o evento pesado onTimeChange
      if (hourTimeoutRef.current) clearTimeout(hourTimeoutRef.current);
      hourTimeoutRef.current = setTimeout(() => {
        if (actualHour !== undefined && actualHour !== hourRef.current) {
          hourRef.current = actualHour;
          onTimeChange(actualHour, minuteRef.current);

          // Teleporte em segundo plano nas extremidades do loop infinito
          const currentLoop = Math.floor(index / 24);
          if (currentLoop < 2 || currentLoop > LOOP_COUNT - 3) {
            const targetIndex = 24 * Math.floor(LOOP_COUNT / 2) + actualHour;
            scrollToValue(hourScrollRef, targetIndex, false);
          }
        }
      }, 40);
    } else {
      const actualMinute = minutesArray[index];
      
      // 1. Atualização Visual INSTANTÂNEA
      if (actualMinute !== undefined && actualMinute !== displayMinute) {
        setDisplayMinute(actualMinute);
      }
      
      // 2. Debounce super curto (40ms)
      if (minuteTimeoutRef.current) clearTimeout(minuteTimeoutRef.current);
      minuteTimeoutRef.current = setTimeout(() => {
        if (actualMinute !== undefined && actualMinute !== minuteRef.current) {
          minuteRef.current = actualMinute;
          onTimeChange(hourRef.current, actualMinute);

          const currentLoop = Math.floor(index / 60);
          if (currentLoop < 2 || currentLoop > LOOP_COUNT - 3) {
            const targetIndex = 60 * Math.floor(LOOP_COUNT / 2) + actualMinute;
            scrollToValue(minuteScrollRef, targetIndex, false);
          }
        }
      }, 40);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[typography.cardTitle, { color: colors.text.primary, textAlign: 'center', marginBottom: 20 }]}>
        Selecione o horário
      </Text>

      <View style={styles.pickerContainer}>
        {/* Coluna Horas */}
        <View style={styles.column}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 10 }]}>Horas</Text>
          <View style={styles.pickerWrapper}>
            <ScrollView
              ref={hourScrollRef}
              style={[
                styles.picker, 
                Platform.OS === 'web' && { scrollSnapType: 'y mandatory' } as any
              ]}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              snapToAlignment="center"
              decelerationRate="fast"
              scrollEventThrottle={16} // Captura o movimento a 60 FPS com precisão máxima
              onScroll={(e) => handleScroll(e, 'hour')}
            >
              {hoursArray.map((hour, idx) => (
                <TouchableOpacity
                  key={`hour-${idx}`}
                  style={[
                    styles.pickerItem, 
                    Platform.OS === 'web' && { scrollSnapAlign: 'center' } as any
                  ]}
                  onPress={() => {
                    hourRef.current = hour;
                    setDisplayHour(hour);
                    onTimeChange(hour, minuteRef.current);
                    scrollToValue(hourScrollRef, idx, true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[typography.body, { 
                    color: hour === displayHour ? colors.primary : colors.text.secondary, 
                    fontWeight: hour === displayHour ? '600' : '400',
                    fontSize: 16
                  }]}>
                    {hour.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.selectionIndicator} />
          </View>
        </View>

        <Text style={[typography.sectionTitle, { color: colors.text.primary, marginHorizontal: 20, marginTop: 30 }]}>:</Text>

        {/* Coluna Minutos */}
        <View style={styles.column}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 10 }]}>Minutos</Text>
          <View style={styles.pickerWrapper}>
            <ScrollView
              ref={minuteScrollRef}
              style={[
                styles.picker, 
                Platform.OS === 'web' && { scrollSnapType: 'y mandatory' } as any
              ]}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              snapToAlignment="center"
              decelerationRate="fast"
              scrollEventThrottle={16}
              onScroll={(e) => handleScroll(e, 'minute')}
            >
              {minutesArray.map((minute, idx) => (
                <TouchableOpacity
                  key={`minute-${idx}`}
                  style={[
                    styles.pickerItem, 
                    Platform.OS === 'web' && { scrollSnapAlign: 'center' } as any
                  ]}
                  onPress={() => {
                    minuteRef.current = minute;
                    setDisplayMinute(minute);
                    onTimeChange(hourRef.current, minute);
                    scrollToValue(minuteScrollRef, idx, true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[typography.body, { 
                    color: minute === displayMinute ? colors.primary : colors.text.secondary, 
                    fontWeight: minute === displayMinute ? '600' : '400',
                    fontSize: 16
                  }]}>
                    {minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.selectionIndicator} />
          </View>
        </View>
      </View>

      <View style={styles.selectedTimeContainer}>
        <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 5 }]}>
          Horário selecionado:
        </Text>
        <Text style={[typography.screenTitle, { color: colors.primary }]}>
          {displayHour.toString().padStart(2, '0')}:{displayMinute.toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
};

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { backgroundColor: colors.background.primary, borderRadius: 12, padding: 20, margin: 10, shadowColor: colors.shadow.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    pickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    column: { alignItems: 'center' },
    pickerWrapper: { position: 'relative', height: WRAPPER_HEIGHT, width: 80, overflow: 'hidden', borderRadius: 8, backgroundColor: colors.background.tertiary },
    picker: { flex: 1 },
    scrollContainer: {
      paddingVertical: ITEM_HEIGHT,
    },
    pickerItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: '100%' },
    selectionIndicator: { position: 'absolute', top: ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.primary, backgroundColor: colors.primary + '0D', pointerEvents: 'none' },
    selectedTimeContainer: { alignItems: 'center', padding: 15, backgroundColor: colors.background.tertiary, borderRadius: 8 },
  });
}

export default TimePicker;