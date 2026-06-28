import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Image, Modal, SafeAreaView as RNSafeAreaView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, BookOpen, Info, Trash2, ChartBar as BarChart3,
  Camera, Edit3, Check, X, Settings, ChevronRight, Sun, Moon, Smartphone,
  FileText, Copy, Download, CheckSquare, Square,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEstuday } from '@/contexts/StudayContext';
import { useTheme, ThemePreference } from '@/contexts/ThemeContext';
import { lightColors, darkColors } from '@/components/theme/colors';

export default function ProfileScreen() {
  const { state, dispatch, updateProfile } = useEstuday();
  const { preference, activeTheme, setTheme } = useTheme();
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.userProfile.nome);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  
  // NOVO: Estado para controlar quais campos vão ser exportados
  const [exportConfig, setExportConfig] = useState({
    data: true,
    horario: true,
    titulo: true,
    categoria: true,
    materia: true,
    descricao: true,
  });

  // ─── Limpar dados ────────────────────────────────────────────────────────────
  const handleClearData = () => {
    Alert.alert(
      'Limpar todos os dados',
      'Esta ação irá remover todos os seus compromissos, anotações e dados do perfil. Não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar', style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                '@estuday:compromissos', '@estuday:anotacoes', '@estuday:userProfile',
              ]);
              const defaultProfile = { nome: 'Estudante', fotoUri: undefined, isCustomized: false };
              dispatch({ type: 'LOAD_DATA', payload: { compromissos: [], anotacoes: [], userProfile: defaultProfile } });
              setTempName(defaultProfile.nome);
              setIsEditingName(false);
              Alert.alert('Sucesso', 'Todos os dados foram removidos.');
            } catch {
              Alert.alert('Erro', 'Erro ao limpar os dados. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  // ─── Foto ─────────────────────────────────────────────────────────────────
  const handleImagePicker = () => {
    Alert.alert('Escolher foto', 'Selecione uma opção', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: () => openImagePicker('camera') },
      { text: 'Galeria', onPress: () => openImagePicker('library') },
      ...(state.userProfile.fotoUri
        ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: removeProfileImage }]
        : []),
    ]);
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Erro', 'Permissão de câmera necessária!'); return; }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Erro', 'Permissão de galeria necessária!'); return; }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      }
      if (!result.canceled && result.assets[0]) {
        await updateProfile({ ...state.userProfile, fotoUri: result.assets[0].uri, isCustomized: true });
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const removeProfileImage = async () => {
    const isNameCustomized = state.userProfile.nome.trim() !== 'Estudante';
    await updateProfile({ ...state.userProfile, fotoUri: undefined, isCustomized: isNameCustomized });
    Alert.alert('Sucesso', 'Foto removida!');
  };

  // ─── Nome ─────────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!tempName.trim()) { Alert.alert('Erro', 'O nome não pode estar vazio.'); return; }
    const isNameCustomized = tempName.trim() !== 'Estudante';
    await updateProfile({ ...state.userProfile, nome: tempName.trim(), isCustomized: isNameCustomized || !!state.userProfile.fotoUri });
    setIsEditingName(false);
    Alert.alert('Sucesso', 'Nome atualizado!');
  };

  const handleCancelEdit = () => { setTempName(state.userProfile.nome); setIsEditingName(false); };

  // ─── Tema ─────────────────────────────────────────────────────────────────
  const themeOptions: { key: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Claro', icon: <Sun size={20} color={colors.primary} /> },
    { key: 'dark', label: 'Escuro', icon: <Moon size={20} color={colors.primary} /> },
    { key: 'system', label: 'Sistema', icon: <Smartphone size={20} color={colors.primary} /> },
  ];
  const currentThemeLabel = themeOptions.find(t => t.key === preference)?.label ?? 'Sistema';

  // ─── Funções de Lógica do Relatório ─────────────────────────────
  const handleOpenReport = () => {
    setSelectedReportIds(state.compromissos.map(c => c.id));
    setReportModalVisible(true);
  };

  const toggleSelectAllReport = () => {
    if (selectedReportIds.length === state.compromissos.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(state.compromissos.map(c => c.id));
    }
  };

  const toggleReportItem = (id: string) => {
    if (selectedReportIds.includes(id)) {
      setSelectedReportIds(selectedReportIds.filter(item => item !== id));
    } else {
      setSelectedReportIds([...selectedReportIds, id]);
    }
  };

  const toggleConfig = (key: keyof typeof exportConfig) => {
    setExportConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

const construirTextoRelatorio = () => {
    const selecionados = state.compromissos.filter(c => selectedReportIds.includes(c.id));
    if (selecionados.length === 0) return '';

    let texto = '';
    selecionados.forEach(c => {
      
      if (exportConfig.data) {
        let dataFormatada = 'Sem data';
        if (c.data && c.data.includes('-')) {
          const partes = c.data.split('-');
          if (partes.length === 3) {
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
          } else {
            dataFormatada = c.data;
          }
        } else if (c.data) {
          dataFormatada = c.data;
        }
        texto += `${dataFormatada}\n`;
      }

      if (exportConfig.horario) {
        texto += `${c.hora || 'Sem horário'}\n`;
      }

      if (exportConfig.titulo) {
        texto += `${c.titulo || 'Sem título'}\n`;
      }

      if (exportConfig.categoria) {
        texto += `Categoria: ${c.categoriaNome || c.categoria || 'Geral'}\n`;
      }

      if (exportConfig.materia) {
        texto += `matéria: ${c.materiaNome || c.materia || 'Geral'}\n`;
      }

      // Alterado: Remove completamente a linha se não houver descrição ou se for "Sem descrição"
      if (exportConfig.descricao) {
        const descricaoOriginal = c.descricao ? c.descricao.trim() : '';
        const temDescricaoValida = descricaoOriginal && descricaoOriginal.toLowerCase() !== 'sem descrição';
        
        if (temDescricaoValida) {
          texto += `Descrição: ${descricaoOriginal}\n`;
        }
      }

      texto +='__________ \n';
    });

    return texto.trim();
  };

  const handleCopiarRelatorio = async () => {
    const texto = construirTextoRelatorio();
    if (!texto) { Alert.alert('Aviso', 'Selecione ao menos um compromisso.'); return; }
    await Clipboard.setStringAsync(texto);
    Alert.alert('Copiado! ', 'O relatório formatado foi copiado com sucesso.');
  };

  const handleBaixarRelatorio = async () => {
    const texto = construirTextoRelatorio();
    if (!texto) { Alert.alert('Aviso', 'Selecione ao menos um compromisso.'); return; }

    try {
      // Cria a data atual para o nome do arquivo
      const now = new Date();
      const dia = String(now.getDate()).padStart(2, '0');
      const mes = String(now.getMonth() + 1).padStart(2, '0');
      const ano = now.getFullYear();
      const hora = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');

      // Formato substituindo barras por hífens para o sistema operacional aceitar o arquivo
      const filename = `Estuday-Relatório ${dia}-${mes}-${ano} ${hora}h${min}.txt`;

      if (Platform.OS === 'web') {
        const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const fileUri = FileSystem.cacheDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, texto, { encoding: FileSystem.EncodingType.UTF8 });

        const disponivel = await Sharing.isAvailableAsync();
        if (disponivel) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Salvar Relatório',
            UTI: 'public.plain-text',
          });
        } else {
          await Clipboard.setStringAsync(texto);
          Alert.alert('Download indisponível', 'O relatório foi copiado para a Área de Transferência!');
        }
      }
    } catch (error) {
      console.log(error);
      await Clipboard.setStringAsync(texto);
      Alert.alert('Aviso', 'Não foi possível baixar o arquivo.');
    }
  };

  const stats = {
    totalCompromissos: state.compromissos.length,
    compromissosConcluidos: state.compromissos.filter(c => c.concluido).length,
    totalAnotacoes: state.anotacoes.length,
    taxaConclusao: state.compromissos.length > 0
      ? Math.round((state.compromissos.filter(c => c.concluido).length / state.compromissos.length) * 100)
      : 0,
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.profileSection}>
            <TouchableOpacity style={s.avatarContainer} onPress={handleImagePicker}>
              {state.userProfile.fotoUri
                ? <Image source={{ uri: state.userProfile.fotoUri }} style={s.avatar} />
                : <View style={s.avatarPlaceholder}><User size={40} color={colors.primary} /></View>}
              <View style={s.cameraIcon}><Camera size={16} color="#fff" /></View>
            </TouchableOpacity>

            <View style={s.profileInfo}>
              {isEditingName ? (
                <View style={s.editNameContainer}>
                  <TextInput
                    style={s.nameInput} value={tempName} onChangeText={setTempName}
                    placeholder="Digite seu nome" maxLength={30} autoFocus
                    placeholderTextColor={colors.text.tertiary}
                  />
                  <View style={s.editButtons}>
                    <TouchableOpacity style={s.saveButton} onPress={handleSaveName}><Check size={16} color="#fff" /></TouchableOpacity>
                    <TouchableOpacity style={s.cancelButton} onPress={handleCancelEdit}><X size={16} color="#fff" /></TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={s.nameContainer}>
                  <Text style={s.profileName}>{state.userProfile.nome}</Text>
                  <TouchableOpacity style={s.editNameButton} onPress={() => setIsEditingName(true)}>
                    <Edit3 size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={s.profileSubtitle}>Usuário do Estuday</Text>
            </View>
          </View>
        </View>

        {/* ── Estatísticas ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Estatísticas</Text>
          <View style={s.statsGrid}>
            {[
              { icon: <BookOpen size={24} color={colors.primary} />, value: stats.totalCompromissos, label: 'Total de Compromissos' },
              { icon: <BarChart3 size={24} color={colors.success} />, value: stats.compromissosConcluidos, label: 'Concluídos' },
              { icon: <Settings size={24} color={colors.warning} />, value: stats.totalAnotacoes, label: 'Anotações' },
              { icon: <BarChart3 size={24} color="#8B5CF6" />, value: `${stats.taxaConclusao}%`, label: 'Taxa de Conclusão' },
            ].map((item, i) => (
              <View key={i} style={s.statCard}>
                {item.icon}
                <Text style={s.statNumber}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Configurações ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Configurações</Text>
          <TouchableOpacity style={s.settingsCard} onPress={() => setSettingsVisible(true)}>
            <View style={s.settingsRow}>
              <Settings size={20} color={colors.primary} />
              <Text style={s.settingsLabel}>Configurações</Text>
            </View>
            <ChevronRight size={18} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={s.settingsCard} onPress={handleOpenReport}>
            <View style={s.settingsRow}>
              <FileText size={20} color={colors.primary} />
              <Text style={s.settingsLabel}>Gerar Relatório de Compromissos</Text>
            </View>
            <ChevronRight size={18} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={s.dangerCard} onPress={handleClearData}>
            <Trash2 size={20} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={s.dangerTitle}>Limpar todos os dados</Text>
              <Text style={s.dangerText}>Remove todos os compromissos e anotações. Não pode ser desfeito.</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── MODAL: Configurações de Tema ── */}
      <Modal visible={settingsVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSettingsVisible(false)}>
        <RNSafeAreaView style={[s.modalContainer, { backgroundColor: colors.background.secondary }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]}>
            <TouchableOpacity onPress={() => setSettingsVisible(false)} style={{ padding: 4 }}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text.primary }]}>Configurações</Text>
            <View style={{ width: 32 }} />
          </View>
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <TouchableOpacity style={[s.settingsOptionCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]} onPress={() => setThemeModalVisible(true)}>
              <View style={s.settingsRow}>
                <Sun size={20} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.settingsOptionTitle, { color: colors.text.primary }]}>Tema</Text>
                  <Text style={[s.settingsOptionSub, { color: colors.text.secondary }]}>{currentThemeLabel}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </ScrollView>
        </RNSafeAreaView>
      </Modal>

      <Modal visible={themeModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setThemeModalVisible(false)}>
        <RNSafeAreaView style={[s.modalContainer, { backgroundColor: colors.background.secondary }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]}>
            <TouchableOpacity onPress={() => setThemeModalVisible(false)} style={{ padding: 4 }}><X size={24} color={colors.text.secondary} /></TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text.primary }]}>Tema</Text>
            <View style={{ width: 32 }} />
          </View>
          <View style={{ padding: 20, gap: 12 }}>
            {themeOptions.map((option) => {
              const selected = preference === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[s.themeOption, { backgroundColor: colors.background.primary, borderColor: selected ? colors.primary : colors.border.light }]}
                  onPress={async () => { await setTheme(option.key); setThemeModalVisible(false); }}
                >
                  <View style={s.settingsRow}>
                    {option.icon}
                    <Text style={[s.themeOptionLabel, { color: colors.text.primary, marginLeft: 12 }]}>{option.label}</Text>
                  </View>
                  {selected && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </RNSafeAreaView>
      </Modal>

      {/* ── MODAL: Gerar Relatório ── */}
      <Modal visible={reportModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setReportModalVisible(false)}>
        <RNSafeAreaView style={[s.modalContainer, { backgroundColor: colors.background.secondary }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]}>
            <TouchableOpacity onPress={() => setReportModalVisible(false)} style={{ padding: 4 }}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text.primary }]}>Exportar Relatório</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={{ flex: 1, padding: 20 }}>
            
            {/* Opções de quais informações exportar */}
            <Text style={[s.sectionTitle, { fontSize: 16, marginBottom: 8, color: colors.text.primary }]}>Informações para incluir:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.configScroll}>
              {Object.entries(exportConfig).map(([key, isEnabled]) => (
                <TouchableOpacity
                  key={key}
                  style={[s.configBadge, { backgroundColor: isEnabled ? colors.primary : colors.background.tertiary }]}
                  onPress={() => toggleConfig(key as keyof typeof exportConfig)}
                >
                  <Text style={{ color: isEnabled ? '#fff' : colors.text.secondary, fontWeight: '600' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Linha Selecionar Tudo */}
            {state.compromissos.length > 0 && (
              <TouchableOpacity style={[s.selectAllRow, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]} onPress={toggleSelectAllReport}>
                {selectedReportIds.length === state.compromissos.length ? <CheckSquare size={20} color={colors.primary} /> : <Square size={20} color={colors.text.secondary} />}
                <Text style={[s.selectAllText, { color: colors.text.primary }]}>
                  {selectedReportIds.length === state.compromissos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Lista de Compromissos */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {state.compromissos.length === 0 ? (
                <Text style={{ color: colors.text.tertiary, textAlign: 'center', marginTop: 40, fontSize: 15 }}>
                  Nenhum compromisso agendado.
                </Text>
              ) : (
                state.compromissos.map((item) => {
                  const isSelected = selectedReportIds.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[s.reportItemCard, { backgroundColor: colors.background.primary, borderColor: isSelected ? colors.primary : colors.border.light }]}
                      onPress={() => toggleReportItem(item.id)}
                    >
                      <View style={s.reportItemRow}>
                        {isSelected ? <CheckSquare size={20} color={colors.primary} /> : <Square size={20} color={colors.text.secondary} />}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[s.reportItemTitle, { color: colors.text.primary }]} numberOfLines={1}>{item.titulo || 'Sem título'}</Text>
                          <Text style={[s.reportItemSub, { color: colors.text.secondary }]}>{item.data || ''} {item.hora ? `às ${item.hora}` : ''}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {selectedReportIds.length > 0 && (
              <View style={s.footerButtons}>
                <TouchableOpacity style={[s.btnReportCopy, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]} onPress={handleCopiarRelatorio}>
                  <Copy size={18} color={colors.text.primary} style={{ marginRight: 6 }} />
                  <Text style={[s.btnTextPrimary, { color: colors.text.primary }]}>Copiar Texto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[s.btnReportDownload, { backgroundColor: colors.primary }]} onPress={handleBaixarRelatorio}>
                  <Download size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={s.btnTextWhite}>Baixar .TXT</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </RNSafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { backgroundColor: colors.background.primary, paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    profileSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 80, height: 80, borderRadius: 40 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, padding: 6, borderRadius: 15, borderWidth: 2, borderColor: colors.background.primary },
    profileInfo: { flex: 1 },
    nameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    profileName: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
    editNameButton: { padding: 4 },
    editNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    nameInput: { flex: 1, fontSize: 24, fontWeight: 'bold', color: colors.text.primary, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingVertical: 4 },
    editButtons: { flexDirection: 'row', gap: 4 },
    saveButton: { backgroundColor: colors.success, padding: 6, borderRadius: 6 },
    cancelButton: { backgroundColor: colors.danger, padding: 6, borderRadius: 6 },
    profileSubtitle: { fontSize: 16, color: colors.text.secondary },
    section: { paddingHorizontal: 20, paddingVertical: 24 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary, marginBottom: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.background.primary, padding: 20, borderRadius: 12, alignItems: 'center', gap: 8 },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
    statLabel: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', fontWeight: '500' },
    settingsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border.light },
    settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    settingsLabel: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
    dangerCard: { flexDirection: 'row', backgroundColor: colors.background.danger, padding: 16, borderRadius: 12, alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: colors.danger + '40' },
    dangerTitle: { fontSize: 16, fontWeight: '600', color: colors.danger, marginBottom: 4 },
    dangerText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: '600' },
    settingsOptionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
    settingsOptionTitle: { fontSize: 16, fontWeight: '600' },
    settingsOptionSub: { fontSize: 13, marginTop: 2 },
    themeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 2 },
    themeOptionLabel: { fontSize: 16, fontWeight: '500' },
    
    configScroll: { marginBottom: 16, maxHeight: 40 },
    configBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
    
    selectAllRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    selectAllText: { marginLeft: 12, fontWeight: '600', fontSize: 16 },
    reportItemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
    reportItemRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    reportItemTitle: { fontSize: 15, fontWeight: '600' },
    reportItemSub: { fontSize: 13, marginTop: 2 },
    footerButtons: { flexDirection: 'row', gap: 12, marginTop: 16, paddingBottom: 10 },
    btnReportCopy: { flex: 1, height: 48, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    btnReportDownload: { flex: 1, height: 48, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    btnTextWhite: { color: '#fff', fontWeight: '600', fontSize: 15 },
    btnTextPrimary: { fontWeight: '600', fontSize: 15 },
  });
}