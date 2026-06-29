import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText } from 'lucide-react-native';
import { useEstuday, AnotacaoCalendario } from '@/contexts/StudayContext';
import { AnotacaoCard } from '@/components/AnotacaoCard/AnotacaoCard';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { BaseButton } from '@/components/BaseButton/BaseButton';

export default function AnotacoesScreen() {
  const { state, deleteAnotacao, updateAnotacao } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAnotacao, setEditingAnotacao] = useState<AnotacaoCalendario | null>(null);
  const [editText, setEditText] = useState('');

  const sortedAnotacoes = useMemo(() =>
    [...state.anotacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [state.anotacoes]
  );

  const handleEditAnotacao = (anotacao: AnotacaoCalendario) => {
    setEditingAnotacao(anotacao);
    setEditText(anotacao.texto);
    setEditModalVisible(true);
  };

   const handleSaveEdit = async () => {
    if (editingAnotacao && editText.trim()) {
      await updateAnotacao({ ...editingAnotacao, texto: editText.trim() });
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
    Alert.alert('Confirmar exclusão', `Tem certeza que deseja excluir esta anotação?\n\n"${previewText}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteAnotacao(anotacao.id) },
    ]);
  };

  const formatDateExtended = (dateString: string) =>
    new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FileText size={24} color={colors.success} />
          <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Anotações</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={[typography.small, { color: colors.success }]}>
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
            <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center' }]}>
              Nenhuma anotação encontrada
            </Text>
            <Text style={[typography.caption, { color: colors.text.tertiary, textAlign: 'center' }]}>
              Adicione anotações através do calendário
            </Text>
            <View style={styles.emptyInstructions}>
              <Text style={[typography.caption, { color: colors.success, fontWeight: '600', marginBottom: 8 }]}>
                Como adicionar anotações:
              </Text>
              <Text style={[typography.small, { color: colors.success, lineHeight: 18 }]}>
                • Vá para a tela do calendário{'\n'}
                • Toque em qualquer dia{'\n'}
                • Use a seção "Anotações" para escrever suas observações
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de Edição */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleCancelEdit}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <BaseButton variant="secondary" size="sm" onPress={handleCancelEdit}>
              Cancelar
            </BaseButton>
            <Text style={[typography.cardTitle, { color: colors.text.primary }]}>Editar Anotação</Text>
            <BaseButton variant="success" size="sm" onPress={handleSaveEdit}>
              Salvar
            </BaseButton>
          </View>
          <View style={styles.modalContent}>
            <Text style={[typography.caption, { color: colors.success, fontWeight: '600', marginBottom: 16, textTransform: 'capitalize' }]}>
              {editingAnotacao && formatDateExtended(editingAnotacao.data)}
            </Text>
            <TextInput
              style={styles.modalTextInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Digite sua anotação..."
              placeholderTextColor={colors.text.tertiary}
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

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerStats: { backgroundColor: colors.background.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    content: { flex: 1, padding: 20 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 16 },
    emptyInstructions: { marginTop: 20, padding: 16, backgroundColor: colors.background.success, borderRadius: 12, maxWidth: 280 },
    modalContainer: { flex: 1, backgroundColor: colors.background.secondary },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    modalContent: { flex: 1, padding: 20 },
    modalTextInput: { flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text.primary, borderWidth: 1, borderColor: colors.border.light },
  });
}