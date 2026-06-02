import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, Plus, Edit3, Trash2, Calendar } from 'lucide-react-native';
import { useEstuday, Compromisso, AnotacaoCalendario } from '@/contexts/StudayContext';
import { formatDateBR } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { CompromissoCard } from '@/components/CompromissoCard/CompromissoCard';
import { AnotacaoCard } from '@/components/AnotacaoCard/AnotacaoCard';
import { colors } from '@/components/theme/colors';

interface DayModalProps {
  visible: boolean;
  date: string;
  onClose: () => void;
}

export function DayModal({ visible, date, onClose }: DayModalProps) {
  const router = useRouter();
  const { getAnotacoesPorData, getCompromissosPorData, addAnotacao, updateAnotacao, deleteAnotacao } = useEstuday();
  const [anotacoes, setAnotacoes] = useState<AnotacaoCalendario[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [editandoAnotacao, setEditandoAnotacao] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  useEffect(() => {
    if (visible && date) {
      setAnotacoes(getAnotacoesPorData(date));
      // Filtrar apenas compromissos não concluídos
      const todosCompromissos = getCompromissosPorData(date);
      const compromissosAtivos = todosCompromissos.filter(compromisso => !compromisso.concluido);
      setCompromissos(compromissosAtivos);
    }
  }, [visible, date]);

  const handleAddAnotacao = async () => {
    if (novaAnotacao.trim()) {
      await addAnotacao({
        data: date,
        texto: novaAnotacao.trim(),
      });
      setNovaAnotacao('');
      setAnotacoes(getAnotacoesPorData(date));
    }
  };

  const handleEditAnotacao = (anotacao: AnotacaoCalendario) => {
    setEditandoAnotacao(anotacao.id);
    setTextoEdicao(anotacao.texto);
  };

  const handleSaveEdit = async () => {
    if (editandoAnotacao && textoEdicao.trim()) {
      const anotacao = anotacoes.find(a => a.id === editandoAnotacao);
      if (anotacao) {
        await updateAnotacao({
          ...anotacao,
          texto: textoEdicao.trim(),
        });
        setEditandoAnotacao(null);
        setTextoEdicao('');
        setAnotacoes(getAnotacoesPorData(date));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditandoAnotacao(null);
    setTextoEdicao('');
  };

  const handleDeleteAnotacao = (anotacao: AnotacaoCalendario) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta anotação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteAnotacao(anotacao.id);
            setAnotacoes(getAnotacoesPorData(date));
          },
        },
      ]
    );
  };

  // Função para navegar ao clicar no compromisso
  const handleCompromissoPress = (compromisso: Compromisso) => {
    onClose(); // Fechar o modal primeiro
    router.push('/compromissos'); // Navegar para a aba de compromissos
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Calendar size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>
              {formatDateBR(date)}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Compromissos do dia */}
          {compromissos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compromissos</Text>
              {compromissos.map((compromisso) => (
                <CompromissoCard
                  key={compromisso.id}
                  compromisso={compromisso}
                  onEdit={() => handleCompromissoPress(compromisso)}
                  onDelete={() => handleCompromissoPress(compromisso)}
                  onToggleComplete={() => handleCompromissoPress(compromisso)}
                  variant="compromisso-modal"
                  onPress={() => handleCompromissoPress(compromisso)}
                />
              ))}
            </View>
          )}

          {/* Anotações do dia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anotações</Text>
            
            {/* Adicionar nova anotação */}
            <View style={styles.addAnotacaoContainer}>
              <TextInput
                style={styles.addAnotacaoInput}
                placeholder="Adicionar anotação..."
                value={novaAnotacao}
                onChangeText={setNovaAnotacao}
                multiline
                placeholderTextColor={colors.text.tertiary}
              />
              <TouchableOpacity
                onPress={handleAddAnotacao}
                style={[
                  styles.addButton,
                  !novaAnotacao.trim() && styles.addButtonDisabled
                ]}
                disabled={!novaAnotacao.trim()}
              >
                <Plus size={20} color={novaAnotacao.trim() ? colors.text.white : colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Lista de anotações */}
            {anotacoes.map((anotacao) => (
              <View key={anotacao.id} style={styles.anotacaoItem}>
                {editandoAnotacao === anotacao.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={textoEdicao}
                      onChangeText={setTextoEdicao}
                      multiline
                      autoFocus
                      placeholderTextColor={colors.text.tertiary}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Salvar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.anotacaoContent}>
                    <Text style={styles.anotacaoTexto}>{anotacao.texto}</Text>
                    <View style={styles.anotacaoActions}>
                      <TouchableOpacity
                        onPress={() => handleEditAnotacao(anotacao)}
                        style={styles.actionButton}
                      >
                        <Edit3 size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteAnotacao(anotacao)}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {anotacoes.length === 0 && (
              <Text style={styles.emptyText}>Nenhuma anotação para este dia</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  addAnotacaoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  addAnotacaoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.border.light,
  },
  anotacaoItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  anotacaoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  anotacaoTexto: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 20,
  },
  anotacaoActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 4,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: colors.text.white,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});