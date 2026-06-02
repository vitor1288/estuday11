import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

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

export function CalendarDay({ 
  day, 
  dateString, 
  isToday, 
  compromissos, 
  anotacoes,
  onPress 
}: CalendarDayProps) {
  const getClassificationColor = (categoria: string) => {
    const colors = {
      'aula': '#3B82F6',
      'prova': '#EF4444', 
      'trabalho': '#F97316',
      'outro': '#8B5CF6',
    };
    return colors[categoria as keyof typeof colors] || '#6B7280';
  };

  const getClassificationAbbr = (categoria: string) => {
    const abbr = {
      'aula': 'AULA',
      'prova': 'PROVA',
      'trabalho': 'TRAB',
      'outro': 'OUTRO',
    };
    return abbr[categoria as keyof typeof abbr] || categoria.substring(0, 4).toUpperCase();
  };

  // Função corrigida para verificar compromissos atrasados
  const hasOverdueCompromissos = () => {
    const now = new Date();
    
    // Normalizar a data atual para comparação (apenas data, sem hora)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Criar data do compromisso a partir da string dateString (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    const compromissoDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
    
    // Se a data do compromisso é anterior a hoje, há compromissos atrasados
    if (compromissoDate < today && compromissos.length > 0) {
      return true;
    }
    
    // Se é hoje, verificar se há compromissos com horário já passado
    if (compromissoDate.getTime() === today.getTime()) {
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      
      return compromissos.some(compromisso => {
        // Verificar se a hora é válida antes de processar
        if (!compromisso.hora || !compromisso.hora.includes(':')) {
          return false;
        }
        
        const [hora, minuto] = compromisso.hora.split(':').map(Number);
        
        // Verificar se hora e minuto são números válidos
        if (isNaN(hora) || isNaN(minuto)) {
          return false;
        }
        
        const compromissoTimeInMinutes = hora * 60 + minuto;
        return compromissoTimeInMinutes < currentTimeInMinutes;
      });
    }
    
    return false;
  };

  // Agrupar compromissos por categoria e contar
  const groupedCompromissos = compromissos.reduce((acc, compromisso) => {
    const key = compromisso.categoria;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key]++;
    return acc;
  }, {} as Record<string, number>);

  const isOverdue = hasOverdueCompromissos();
  const hasAnotacoes = anotacoes.length > 0;

  // Calcular quantos itens podem ser mostrados
  const totalCompromissoCategories = Object.keys(groupedCompromissos).length;
  const maxItemsToShow = hasAnotacoes ? 1 : 2; // Se tem anotações, mostrar menos compromissos
  const compromissosToShow = Object.entries(groupedCompromissos).slice(0, maxItemsToShow);
  const remainingItems = Math.max(0, totalCompromissoCategories - maxItemsToShow);

  return (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        isToday && styles.todayContainer,
      ]}
      onPress={() => onPress(dateString)}
      activeOpacity={0.7}
    >
      <View style={styles.dayContent}>
        {/* Número do dia com indicador de atraso */}
        <View style={styles.dayNumberContainer}>
          <Text style={[
            styles.dayNumber,
            isToday && styles.todayText,
          ]}>
            {day}
          </Text>
          {isOverdue && (
            <View style={styles.overdueIndicator}>
              <Text style={styles.overdueText}>!</Text>
            </View>
          )}
        </View>

        {/* Container para compromissos e anotações */}
        <View style={styles.itemsContainer}>
          {/* Anotações - Mostrar primeiro se existir */}
          {hasAnotacoes && (
            <View style={styles.anotacaoIndicator}>
              <Text style={styles.anotacaoText}>
                NOTA{anotacoes.length > 1 && ` ${anotacoes.length}`}
              </Text>
            </View>
          )}

          {/* Lista de categorias dos compromissos */}
          {compromissosToShow.map(([categoria, count]) => (
            <View
              key={categoria}
              style={[
                styles.classificacaoTag,
                { backgroundColor: getClassificationColor(categoria) }
              ]}
            >
              <Text style={styles.classificacaoText}>
                {getClassificationAbbr(categoria)}
                {count > 1 && (
                  <Text style={styles.countText}> {count}</Text>
                )}
              </Text>
            </View>
          ))}
          
          {/* Indicador de mais itens */}
          {remainingItems > 0 && (
            <View style={styles.moreIndicator}>
              <Text style={styles.moreText}>
                +{remainingItems}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    width: '14.285714%',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    margin: 1,
    backgroundColor: '#FAFAFA',
  },
  todayContainer: {
    backgroundColor: '#3B82F6',
  },
  dayContent: {
    flex: 1,
    width: '100%',
    padding: 4,
    alignItems: 'center',
  },
  dayNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  anotacaoIndicator: {
    backgroundColor: '#10B981',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 28,
    alignItems: 'center',
  },
  anotacaoText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  classificacaoTag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 28,
    alignItems: 'center',
  },
  classificacaoText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  countText: {
    fontSize: 8,
    fontWeight: '700',
  },
  moreIndicator: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 1,
  },
  moreText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#fff',
  },
  overdueIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export { CalendarDay };