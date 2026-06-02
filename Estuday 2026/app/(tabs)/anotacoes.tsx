import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, X } from 'lucide-react-native';
import { useEstuday, AnotacaoCalendario } from '@/contexts/StudayContext';
import { AnotacaoCard } from '@/components/AnotacaoCard/AnotacaoCard';
import { colors } from '@/components/theme/colors';

export default function AnotacoesScreen() {
  const { state, deleteAnotacao, updateAnotacao } = useEstuday();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAnotacao, setEditingAnotacao] = useState<AnotacaoCalendario | null>(null);
  const [editText, setEditText] = useState('');

  const sortedAnotacoes = useMemo(() => {
    return [...state.anotacoes].sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  }, [state.anotacoes]);

  const handleEditAnotacao = (anotacao: AnotacaoCalendario) => {
    setEditingAnotacao(anotacao);
    setEditText(anotacao.texto);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editingAnotacao && editText.trim()) {
      updateAnotacao({
        ...editingAnotacao,
        texto: editText.trim(),
      });
      setEditModalVisible(false);
      setEditingAnotacao(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingAnotacao(null);
    setEditText('');
  };

  const handleDeleteAnotacao = (anotacao: AnotacaoCalendario) => {
    const previewText = anotacao.texto.length > 50 ? anotacao.texto.substring(0, 50) + '...' : anotacao.texto;
    
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir esta anotação?\n\n"${previewText}"`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteAnotacao(anotacao.id),
        },
      ]
    );
  };

  const formatDateExtended = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FileText size={24} color={colors.note.primary} />
          <Text style={styles.headerTitle}>Anotações</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            {state.anotacoes.length} {state.anotacoes.length === 1 ? 'anotação' : 'anotações'}
          </Text>
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sortedAnotacoes.length > 0 ? (
          sortedAnotacoes.map((anotacao) => (
            <AnotacaoCard
              key={anotacao.id}
              anotacao={anotacao}
              onEdit={() => handleEditAnotacao(anotacao)}
              onDelete={() => handleDeleteAnotacao(anotacao)}
              showDate={true}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color={colors.border.medium} />
            <Text style={styles.emptyText}>Nenhuma anotação encontrada</Text>
            <Text style={styles.emptySubtext}>
              Adicione anotações através do calendário
            </Text>
            <View style={styles.emptyInstructions}>
              <Text style={styles.instructionTitle}>Como adicionar anotações:</Text>
              <Text style={styles.instructionText}>
                • Vá para a tela do calendário{'\n'}
                • Toque em qualquer dia{'\n'}
                • Use a seção "Anotações" para escrever suas observações
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de Edição */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit} style={styles.modalCancelButton}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Anotação</Text>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.modalSaveButton}>
              <Text style={styles.modalSaveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalDateLabel}>
              {editingAnotacao && formatDateExtended(editingAnotacao.data)}
            </Text>
            <TextInput
              style={styles.modalTextInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Digite sua anotação..."
              multiline
              textAlignVertical="top"
              autoFocus
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerStats: {
    backgroundColor: colors.note.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.note.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 250,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 250,
  },
  emptyInstructions: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.background.success,
    borderRadius: 12,
    maxWidth: 280,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.note.primary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: colors.success,
    lineHeight: 18,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCancelButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalSaveButton: {
    backgroundColor: colors.note.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveButtonText: {
    color: colors.text.white,
    fontWeight: '600',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDateLabel: {
    fontSize: 14,
    color: colors.note.primary,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  modalTextInput: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});