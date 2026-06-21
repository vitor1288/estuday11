import React, { useState, useMemo } from 'react'; 
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { X, Plus, Edit3, Trash2, Calendar, CalendarPlus } from 'lucide-react-native';
import { useEstuday, Compromisso, AnotacaoCalendario } from '@/contexts/StudayContext';
import { formatDateBR } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { CompromissoCard } from '@/components/CompromissoCard/CompromissoCard';
import { CompromissoModal } from '@/components/CompromissoModal/CompromissoModal';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface DayModalProps {
  visible: boolean;
  date: string;
  onClose: () => void;
}

export function DayModal({ visible, date, onClose }: DayModalProps) {
  const router = useRouter();
  const { state, getAnotacoesPorData, getCompromissosPorData, addAnotacao, updateAnotacao, deleteAnotacao, toggleCompromisso } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [anotacaoEditando, setAnotacaoEditando] = useState<string | null>(null);
  const [textoEditando, setTextoEditando] = useState('');

  const [modalCompromissoVisible, setModalCompromissoVisible] = useState(false);
  const [compromissoEditando, setCompromissoEditando] = useState<Compromisso | null>(null);

  // Leitura segura com fallback para arrays vazios evitando crash
  const compromissos = useMemo(() => {
    if (!visible || !date) return [];
    return (getCompromissosPorData(date) || []).filter((c: any) => !c.concluido);
  }, [visible, date, state]);

  const anotacoes = useMemo(() => {
    if (!visible || !date) return [];
    return getAnotacoesPorData(date) || [];
  }, [visible, date, state]);

  const handleAddAnotacao = () => {
    if (novaAnotacao.trim()) {
      addAnotacao(date, novaAnotacao.trim());
      setNovaAnotacao('');
    }
  };

  const handleSaveEdit = (id: string) => {
    if (textoEditando.trim()) {
      updateAnotacao(id, textoEditando.trim());
      setAnotacaoEditando(null);
      setTextoEditando('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={[typography.subtitle, { color: colors.text.primary }]}>
            {formatDateBR(date)}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.shortcutContainer}>
          <TouchableOpacity 
            style={[styles.shortcutButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setCompromissoEditando(null);
              setModalCompromissoVisible(true);
            }}
          >
            <Plus size={18} color="#FFF" />
            <Text style={[typography.button, { color: '#FFF' }]}>Novo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[typography.subtitle, { color: colors.text.primary, marginBottom: 16 }]}>
              Compromissos do Dia
            </Text>
            {compromissos.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color={colors.border.light} />
                <Text style={[typography.body, { color: colors.text.tertiary, marginTop: 12, textAlign: 'center' }]}>
                  Nenhum compromisso pendente para este dia.
                </Text>
              </View>
            ) : (
              compromissos.map((compromisso: Compromisso) => (
                <CompromissoCard
                  key={compromisso.id}
                  compromisso={compromisso}
                  variant="compromisso-modal"
                  onEdit={() => {
                    setCompromissoEditando(compromisso);
                    setModalCompromissoVisible(true);
                  }}
                  onDelete={() => { /* Implemente se necessário na view */ }}
                  onToggleComplete={() => toggleCompromisso(compromisso.id)}
                />
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[typography.subtitle, { color: colors.text.primary, marginBottom: 16 }]}>
              Anotações
            </Text>
            
            <View style={styles.addAnotacaoContainer}>
              <TextInput
                style={styles.addAnotacaoInput}
                value={novaAnotacao}
                onChangeText={setNovaAnotacao}
                placeholder="Adicionar nova anotação..."
                placeholderTextColor={colors.text.tertiary}
                multiline
              />
              <TouchableOpacity 
                style={[styles.addButton, !novaAnotacao.trim() && styles.addButtonDisabled]}
                onPress={handleAddAnotacao}
                disabled={!novaAnotacao.trim()}
              >
                <Plus size={24} color={novaAnotacao.trim() ? '#FFF' : colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {anotacoes.map((anotacao: AnotacaoCalendario) => (
              <View key={anotacao.id} style={styles.anotacaoItem}>
                {anotacaoEditando === anotacao.id ? (
                  <View>
                    <TextInput
                      style={styles.editInput}
                      value={textoEditando}
                      onChangeText={setTextoEditando}
                      multiline
                      autoFocus
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={() => setAnotacaoEditando(null)}>
                        <Text style={[typography.button, { color: colors.text.secondary }]}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleSaveEdit(anotacao.id)}>
                        <Text style={[typography.button, { color: colors.primary }]}>Salvar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.anotacaoContent}>
                    <Text style={[typography.body, { color: colors.text.primary, flex: 1 }]}>
                      {anotacao.texto}
                    </Text>
                    <View style={styles.anotacaoActions}>
                      <TouchableOpacity 
                        onPress={() => {
                          setAnotacaoEditando(anotacao.id);
                          setTextoEditando(anotacao.texto);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Edit3 size={18} color={colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => {
                          Alert.alert('Excluir Anotação', 'Tem certeza que deseja excluir esta anotação?', [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Excluir', style: 'destructive', onPress: () => deleteAnotacao(anotacao.id) }
                          ]);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Trash2 size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <CompromissoModal
        visible={modalCompromissoVisible}
        compromisso={compromissoEditando}
        initialDate={date}
        onClose={() => {
          setModalCompromissoVisible(false);
          setCompromissoEditando(null);
        }}
        onSave={() => {
          setModalCompromissoVisible(false);
          setCompromissoEditando(null);
        }}
      />
    </Modal>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    shortcutContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    shortcutButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.light },
    content: { flex: 1, padding: 20 },
    section: { marginBottom: 24 },
    addAnotacaoContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
    addAnotacaoInput: { flex: 1, borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, padding: 12, fontSize: 16, maxHeight: 100, color: colors.text.primary, backgroundColor: colors.background.primary },
    addButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    addButtonDisabled: { backgroundColor: colors.border.light },
    anotacaoItem: { backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, marginBottom: 8 },
    anotacaoContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    anotacaoActions: { flexDirection: 'row', gap: 12, marginLeft: 12 },
    editInput: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, fontSize: 16, color: colors.text.primary, backgroundColor: colors.background.primary, minHeight: 80, textAlignVertical: 'top' },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 12 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  });
}