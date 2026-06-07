import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import { useEstuday, Compromisso } from '@/contexts/StudayContext';
import { CompromissoCard } from '@/components/CompromissoCard/CompromissoCard';
import { CompromissoModal } from '@/components/CompromissoModal/CompromissoModal';
import { formatDate } from '@/utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors, darkColors } from '@/components/theme/colors';

type FilterType = 'todos' | 'pendentes' | 'realizar' | 'concluidos' | 'hoje';

export default function CompromissosScreen() {
  const { state, updateCompromisso, deleteCompromisso } = useEstuday();
  const { activeTheme } = useTheme();
  const colors = activeTheme === 'dark' ? darkColors : lightColors;
  const styles = makeStyles(colors);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompromisso, setEditingCompromisso] = useState<Compromisso | null>(null);
  const [filter, setFilter] = useState<FilterType>('realizar');

  const isOverdue = (compromisso: Compromisso): boolean => {
    const now = new Date();
    const compromissoDateTime = new Date(`${compromisso.data}T${compromisso.hora}`);
    return compromissoDateTime < now;
  };

  const filteredCompromissos = useMemo(() => {
    let filtered = state.compromissos;
    switch (filter) {
      case 'pendentes': filtered = filtered.filter(c => !c.concluido && isOverdue(c)); break;
      case 'realizar': filtered = filtered.filter(c => !c.concluido); break;
      case 'concluidos': filtered = filtered.filter(c => c.concluido); break;
      case 'hoje': const today = formatDate(new Date()); filtered = filtered.filter(c => c.data === today); break;
    }
    return filtered.sort((a, b) => new Date(a.data + 'T' + a.hora).getTime() - new Date(b.data + 'T' + b.hora).getTime());
  }, [state.compromissos, filter]);

  const handleAddCompromisso = () => { setEditingCompromisso(null); setModalVisible(true); };
  const handleEditCompromisso = (compromisso: Compromisso) => { setEditingCompromisso(compromisso); setModalVisible(true); };
  const handleDeleteCompromisso = (compromisso: Compromisso) => {
    Alert.alert('Confirmar exclusão', `Tem certeza que deseja excluir "${compromisso.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteCompromisso(compromisso.id) },
    ]);
  };
  const handleToggleComplete = (compromisso: Compromisso) => {
    updateCompromisso({ ...compromisso, concluido: !compromisso.concluido });
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'realizar', label: 'Realizar' },
    { key: 'hoje', label: 'Hoje' },
    { key: 'concluidos', label: 'Concluídos' },
    { key: 'todos', label: 'Todos' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <CalendarIcon size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Compromissos</Text>
        </View>
        <TouchableOpacity onPress={handleAddCompromisso} style={styles.addButton}>
          <Plus size={20} color={colors.text.white} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {filterButtons.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
            >
              <Text style={[styles.filterButtonText, filter === item.key && styles.filterButtonTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCompromissos.length > 0 ? (
          filteredCompromissos.map((compromisso) => (
            <CompromissoCard
              key={compromisso.id}
              compromisso={compromisso}
              onEdit={() => handleEditCompromisso(compromisso)}
              onDelete={() => handleDeleteCompromisso(compromisso)}
              onToggleComplete={() => handleToggleComplete(compromisso)}
              variant="compromisso"
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <CalendarIcon size={64} color={colors.border.medium} />
            <Text style={styles.emptyText}>
              {filter === 'pendentes' && 'Nenhum compromisso pendente'}
              {filter === 'realizar' && 'Nenhum compromisso para realizar'}
              {filter === 'hoje' && 'Nenhum compromisso para hoje'}
              {filter === 'concluidos' && 'Nenhum compromisso concluído'}
              {filter === 'todos' && 'Nenhum compromisso cadastrado'}
            </Text>
            <TouchableOpacity onPress={handleAddCompromisso} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Adicionar compromisso</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CompromissoModal
        visible={modalVisible}
        compromisso={editingCompromisso}
        onClose={() => { setModalVisible(false); setEditingCompromisso(null); }}
        onSave={() => setEditingCompromisso(null)}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
    addButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    filterContainer: { backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    filterContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
    filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background.tertiary, marginRight: 8 },
    filterButtonActive: { backgroundColor: colors.primary },
    filterButtonText: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
    filterButtonTextActive: { color: colors.text.white },
    content: { flex: 1, padding: 20 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 16 },
    emptyText: { fontSize: 18, color: colors.text.secondary, textAlign: 'center', maxWidth: 250 },
    emptyButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
    emptyButtonText: { color: colors.text.white, fontWeight: '600', fontSize: 16 },
  });
}