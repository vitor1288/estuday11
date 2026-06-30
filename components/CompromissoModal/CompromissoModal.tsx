import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useEstuday, Compromisso } from '@/contexts/StudayContext';
import { formatDate } from '@/utils/dateUtils';
import { DatePicker } from '@/components/DatePicker/DatePicker';
import TimePicker from '@/components/TimePicker/TimePicker';
import { NotificationSelector, MultipleNotificationConfig } from '@/components/NotificationSelector/NotificationSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { CustomAlert } from '@/components/CustomAlert';

interface CompromissoModalProps {
  visible: boolean;
  compromisso?: Compromisso | null;
  initialDate?: string;
  onClose: () => void;
  onSave: () => void;
}

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
}

export function CompromissoModal({ visible, compromisso, initialDate, onClose, onSave }: CompromissoModalProps) {
  const { addCompromisso, updateCompromisso, categorias, categories, materias } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const listaCategorias = categorias || (categories as any) || [];
  const listaMaterias = materias || [];

  const [titulo, setTitulo] = useState('');
  const [isTituloEditado, setIsTituloEditado] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(formatDate(new Date()));
  const [hora, setHora] = useState('09:00');

  const [categoriaId, setCategoriaId] = useState('');
  const [materiaId, setMateriaId] = useState('');

  const [notificationConfig, setNotificationConfig] = useState<MultipleNotificationConfig>({
    notifications: [{ enabled: true, tempo: 1, unidade: 'dias' }]
  });

  const [showTimePicker, setShowTimePicker] = useState(false);

  // 🟢 NOVO: Estado do CustomAlert (substitui o Alert.alert do sistema)
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertState({ visible: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (visible) {
      if (compromisso) {
        setTitulo(compromisso.titulo);
        setIsTituloEditado(true);
        setDescricao(compromisso.descricao || '');
        setData(compromisso.data);
        setHora(compromisso.hora);
        setCategoriaId(compromisso.categoriaId || compromisso.categoria || '');
        setMateriaId(compromisso.materiaId || compromisso.materia || '');
        if (compromisso.notificacaoConfig) {
          setNotificationConfig(compromisso.notificacaoConfig);
        }
      } else {
        setTitulo('');
        setIsTituloEditado(false);
        setDescricao('');
        setData(initialDate || formatDate(new Date()));
        setHora('09:00');
        setCategoriaId('');
        setMateriaId('');
        setNotificationConfig({ notifications: [{ enabled: true, tempo: 1, unidade: 'dias' }] });
      }
    }
  }, [visible, compromisso, initialDate]);

  // 🟢 ALTERADO: Atualiza o título dinamicamente se a trava manual estiver desativada
  useEffect(() => {
    if (!isTituloEditado) {
      const cat = listaCategorias.find((c: any) => c.id === categoriaId);
      const mat = listaMaterias.find((m: any) => m.id === materiaId);

      if (cat && mat) {
        setTitulo(`${cat.nome} de ${mat.nome}`);
      } else if (cat) {
        setTitulo(cat.nome);
      } else if (mat) {
        setTitulo(mat.nome);
      } else {
        setTitulo('');
      }
    }
  }, [categoriaId, materiaId, isTituloEditado, listaCategorias, listaMaterias]);

  const handleSave = async () => {
    if (!titulo.trim()) {
      showAlert('Erro', 'Por favor, insira um título para o compromisso.', 'error');
      return;
    }

    const catSelecionada = listaCategorias.find((c: any) => c.id === categoriaId);
    const matSelecionada = listaMaterias.find((m: any) => m.id === materiaId);

    const compromissoData = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      data,
      hora,
      categoriaId: categoriaId || '',
      materiaId: materiaId || '',
      categoria: catSelecionada ? catSelecionada.nome : '',
      materia: matSelecionada ? matSelecionada.nome : '',
      notificacaoConfig: notificationConfig,
      concluido: compromisso?.concluido || false
    };

    try {
      if (compromisso) {
        await updateCompromisso(compromisso.id, compromissoData);
      } else {
        await addCompromisso(compromissoData);
      }
      onSave();
    } catch (error) {
      showAlert('Erro', 'Ocorreu um erro ao salvar o compromisso.', 'error');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.titleWrapper}>
            <Text style={[typography.h3, { color: colors.text.primary }]} numberOfLines={1}>
              {compromisso ? 'Editar Compromisso' : 'Novo Compromisso'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveButtonHeader}>
            <Text style={styles.saveButtonTextHeader}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          <View style={styles.field}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Título</Text>
            <TextInput
               style={styles.input}
               value={titulo}
               // 🟢 ALTERADO: Se o usuário limpar o input manualmente, desativamos a trava para o automático voltar a reinar
               onChangeText={(text) => {
                 setTitulo(text);
                 if (text.trim() === '') {
                   setIsTituloEditado(false);
                 } else {
                   setIsTituloEditado(true);
                 }
               }}
               placeholder="Ex: Prova de Matemática"
               placeholderTextColor={colors.text.tertiary}

               // ⌨️ Atalho Inteligente para Salvar com Enter na Web
               onKeyPress={(e: any) => {
                 if (Platform.OS === 'web') {
                   // Se pressionar Enter SOZINHO (sem o Shift), salva o compromisso
                   if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                     e.preventDefault(); // Impede o comportamento padrão
                     handleSave();       // ⚠️ Verifique se sua função de salvar o compromisso se chama 'handleSave'
                   }
                 }
               }}
             />
          </View>

          <View style={styles.field}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriaContainer}>
                {listaCategorias.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoriaButton,
                      categoriaId === cat.id && { backgroundColor: cat.cor, borderColor: cat.cor }
                    ]}
                    onPress={() => setCategoriaId(prev => prev === cat.id ? '' : cat.id)}
                  >
                    <Text style={[typography.caption, { color: categoriaId === cat.id ? '#FFF' : colors.text.primary }]}>
                      {cat.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Matéria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriaContainer}>
                {listaMaterias.map((mat: any) => (
                  <TouchableOpacity
                    key={mat.id}
                    style={[
                      styles.categoriaButton,
                      materiaId === mat.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setMateriaId(prev => prev === mat.id ? '' : mat.id)}
                  >
                    <Text style={[typography.caption, { color: materiaId === mat.id ? '#FFF' : colors.text.primary }]}>
                      {mat.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Data</Text>
              <DatePicker value={data} onDateChange={setData} />
            </View>

            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Hora</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                <Text style={[typography.body, { color: colors.text.primary }]}>{hora}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <NotificationSelector value={notificationConfig} onValueChange={setNotificationConfig} />
          </View>

          <View style={[styles.field, { marginBottom: 40 }]}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Descrição</Text>
           <TextInput
             style={[styles.input, styles.textArea]}
             value={descricao}
             onChangeText={setDescricao}
             placeholder="Adicione detalhes ao seu compromisso..."
             placeholderTextColor={colors.text.tertiary}
             multiline
             numberOfLines={4}

             // ⌨️ Atalho Inteligente para Salvar com Enter na Web
             onKeyPress={(e: any) => {
               if (Platform.OS === 'web') {
                 // Se pressionar Enter SOZINHO (sem o Shift), salva o compromisso
                 if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                   e.preventDefault(); // Impede a quebra de linha automática do multiline
                   handleSave();       // ⚠️ Lembre-se de verificar se sua função de salvar se chama 'handleSave'
                 }
               }
             }}
           />
          </View>
        </ScrollView>
      </View>

      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.timePickerContainer, { backgroundColor: colors.background.primary }]}>
            <Text style={[typography.subtitle, { color: colors.text.primary, marginBottom: 20 }]}>Selecione a Hora</Text>
            <TimePicker
              initialHour={parseInt(hora.split(':')[0])}
              initialMinute={parseInt(hora.split(':')[1])}
              onTimeChange={(h, m) => setHora(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)}
            />
            <TouchableOpacity style={[styles.timePickerButton, { backgroundColor: colors.primary }]} onPress={() => setShowTimePicker(false)}>
              <Text style={[typography.button, { color: '#FFF' }]}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🟢 NOVO: CustomAlert no lugar do Alert.alert do sistema */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={closeAlert}
      />
    </Modal>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: 64,
      paddingHorizontal: 16, 
      backgroundColor: colors.background.primary, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border.light,
      position: 'relative'
    },
    titleWrapper: {
      maxWidth: '55%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: { 
      position: 'absolute',
      left: 16,
      padding: 6,
    },
    saveButtonHeader: {
      position: 'absolute',
      right: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonTextHeader: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    content: { flex: 1, padding: 20 },
    field: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.text.primary, backgroundColor: colors.background.primary },
    textArea: { height: 100, textAlignVertical: 'top' },
    categoriaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoriaButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: colors.border.light, backgroundColor: colors.background.primary },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    timeButton: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background.primary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    timePickerContainer: { width: '80%', borderRadius: 16, padding: 20, alignItems: 'center' },
    timePickerButton: { width: '100%', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  });
}
