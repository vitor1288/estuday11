import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStuday } from '@/contexts/StudayContext';
import { X, Copy, Download, CheckSquare, Square } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ReportModal({ visible, onClose }: ReportModalProps) {
  const { colors, typography } = useTheme();
  
  // Resgatando dados do contexto global do Studay
  const { state } = useStuday();
  const compromissos = state?.compromissos || [];
  const materias = state?.materias || [];
  const categorias = state?.categorias || [];

  // Guarda quais compromissos estão selecionados por ID
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sempre que o modal abrir, marca TODOS por padrão
  useEffect(() => {
    if (visible) {
      setSelectedIds(compromissos.map((c) => c.id));
    }
  }, [visible, state?.compromissos]);

  // Alternador para selecionar / desmarcar tudo de uma vez
  const toggleSelectAll = () => {
    if (selectedIds.length === compromissos.length) {
      setSelectedIds([]); // Desmarca tudo
    } else {
      setSelectedIds(compromissos.map((c) => c.id)); // Seleciona tudo
    }
  };

  // Alternador de item individual
  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 📝 ALGORITMO: Formata a string baseada exatamente no seu exemplo
  const construirTextoRelatorio = () => {
    const selecionados = compromissos.filter((c) => selectedIds.includes(c.id));
    if (selecionados.length === 0) return '';

    let texto = '';
    selecionados.forEach((c) => {
      const materiaNome = materias.find((m) => m.id === c.materiaId)?.nome || 'Sem Matéria';
      const categoriaNome = categorias.find((cat) => cat.id === c.categoriaId || cat.id === c.categoria)?.nome || 'Sem Categoria';

      texto += '-------------\n';
      texto += `Data + horário: ${c.data} às ${c.hora}\n`;
      texto += `Título: ${c.titulo}\n`;
      texto += `Categoria + matéria: ${categoriaNome} | ${materiaNome}\n`;
      texto += `Descrição: ${c.descricao || 'Sem descrição'}\n`;
    });
    texto += '----------------';
    return texto;
  };

  // Copia a string montada direto para a área de transferência do celular
  const handleCopiarTexto = async () => {
    const texto = construirTextoRelatorio();
    if (!texto) {
      Alert.alert('Aviso', 'Selecione pelo menos um compromisso para copiar.');
      return;
    }
    await Clipboard.setStringAsync(texto);
    Alert.alert('Copiado! 📋', 'O texto do relatório foi copiado para sua área de transferência.');
  };

  // 💾 DOWNLOAD: Transforma o texto em arquivo .txt físico e abre salvamento nativo
  const handleBaixarArquivo = async () => {
    const texto = construirTextoRelatorio();
    if (!texto) {
      Alert.alert('Aviso', 'Selecione pelo menos um compromisso para baixar.');
      return;
    }

    try {
      const nomeArquivo = `relatorio_studay_${Date.now()}.txt`;
      const caminhoDoArquivo = FileSystem.documentDirectory + nomeArquivo;

      // Escreve os dados dentro de um arquivo .txt invisível temporariamente
      await FileSystem.writeAsStringAsync(caminhoDoArquivo, texto, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Abre a folha nativa permitindo ao usuário "Salvar em Arquivos", Drive, WhatsApp, etc.
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(caminhoDoArquivo, {
          mimeType: 'text/plain',
          dialogTitle: 'Baixar Relatório',
          UTI: 'public.plain-text',
        });
      } else {
        Alert.alert('Erro', 'O compartilhamento de arquivos não é compatível com este dispositivo.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu uma falha ao tentar criar o arquivo para download.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
          
          {/* Cabeçalho */}
          <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
            <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>Exportar Relatório</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Botão de Alternar Tudo */}
          {compromissos.length > 0 && (
            <TouchableOpacity style={[styles.selectAllRow, { borderBottomColor: colors.border.light }]} onPress={toggleSelectAll}>
              {selectedIds.length === compromissos.length ? (
                <CheckSquare size={20} color={colors.primary} />
              ) : (
                <Square size={20} color={colors.text.secondary} />
              )}
              <Text style={[styles.selectAllText, { color: colors.text.primary }]}>
                {selectedIds.length === compromissos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Lista com Checkboxes */}
          <FlatList
            data={compromissos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>Você não possui compromissos agendados.</Text>
            }
            renderItem={({ item }) => {
              const marcado = selectedIds.includes(item.id);
              return (
                <TouchableOpacity style={[styles.itemRow, { borderBottomColor: colors.border.light }]} onPress={() => toggleItem(item.id)}>
                  {marcado ? (
                    <CheckSquare size={18} color={colors.primary} />
                  ) : (
                    <Square size={18} color={colors.text.secondary} />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitulo, { color: colors.text.primary }]} numberOfLines={1}>{item.titulo}</Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{item.data} às {item.hora}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Botões de Ação Inferiores */}
          {selectedIds.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity style={[styles.btnAction, { backgroundColor: colors.background.secondary }]} onPress={handleCopiarTexto}>
                <Copy size={18} color={colors.text.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Copiar Texto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnAction, { backgroundColor: colors.primary }]} onPress={handleBaixarArquivo}>
                <Download size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Baixar .TXT</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '70%', paddingBottom: 35 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  selectAllText: { marginLeft: 12, fontWeight: '600', fontSize: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  itemInfo: { marginLeft: 14, flex: 1 },
  itemTitulo: { fontWeight: '500', fontSize: 15, marginBottom: 2 },
  footer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 15 },
  btnAction: { flex: 1, height: 48, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14, paddingHorizontal: 20 },
});