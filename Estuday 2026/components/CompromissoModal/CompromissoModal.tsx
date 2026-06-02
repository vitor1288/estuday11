import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X, Tag } from 'lucide-react-native';
import { useEstuday, Compromisso } from '@/contexts/StudayContext';
import { NotificationSelector, MultipleNotificationConfig, DEFAULT_NEW_CONFIG } from '@/components/NotificationSelector/NotificationSelector';
import { formatDate, formatTimeFromDate } from '@/utils/dateUtils';
import { DatePicker } from '@/components/DatePicker/DatePicker';
import { colors } from '@/components/theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CompromissoModalProps {
  visible: boolean;
  compromisso?: Compromisso | null;
  onClose: () => void;
  onSave: () => void;
}

const categorias = [
  { value: 'aula', label: 'Aula', color: colors.category.aula },
  { value: 'prova', label: 'Prova', color: colors.category.prova },
  { value: 'trabalho', label: 'Trabalho', color: colors.category.trabalho },
  { value: 'outro', label: 'Outro', color: colors.category.outro },
] as const;

// Usar a configuração padrão importada do NotificationSelector
const DEFAULT_NOTIFICATION_CONFIG = DEFAULT_NEW_CONFIG;

export function CompromissoModal({ visible, compromisso, onClose, onSave }: CompromissoModalProps) {
  const { addCompromisso, updateCompromisso } = useEstuday();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('23:59');
  const [categoria, setCategoria] = useState<'aula' | 'prova' | 'trabalho' | 'outro'>('aula');
  const [notificationConfig, setNotificationConfig] = useState<MultipleNotificationConfig>(DEFAULT_NOTIFICATION_CONFIG);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const isEditing = !!compromisso;

  // Função para converter notificationConfig antiga para nova estrutura
  const convertToMultipleNotificationConfig = (compromisso: Compromisso): MultipleNotificationConfig => {
    // Se já tem a nova estrutura
    if (compromisso.multipleNotificationConfig) {
      return compromisso.multipleNotificationConfig;
    }
    
    // Se tem a estrutura antiga
    if (compromisso.notificationConfig) {
      return {
        notifications: compromisso.notificationConfig.enabled 
          ? [compromisso.notificationConfig]
          : []
      };
    }
    
    // Padrão apenas para novos compromissos (não para edição)
    return { notifications: [] };
  };

  useEffect(() => {
    if (compromisso) {
      // Editando compromisso existente - manter configurações atuais
      setTitulo(compromisso.titulo);
      setDescricao(compromisso.descricao);
      setData(compromisso.data);
      setHora(compromisso.hora || '23:59');
      setCategoria(compromisso.categoria);
      
      // Configurar notificação usando a estrutura existente (sem forçar padrão)
      setNotificationConfig(convertToMultipleNotificationConfig(compromisso));
      
      // Configurar tempTime com base na hora do compromisso
      const [hours, minutes] = (compromisso.hora || '23:59').split(':').map(Number);
      const time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
      time.setSeconds(0);
      setTempTime(time);
    } else {
      // Novo compromisso - usar valores padrão
      setTitulo('');
      setDescricao('');
      setData(formatDate(new Date()));
      setHora('23:59');
      setCategoria('aula');
      setNotificationConfig(DEFAULT_NOTIFICATION_CONFIG); // Apenas para novos compromissos
      
      // Configurar tempTime padrão (23:59)
      const defaultTime = new Date();
      defaultTime.setHours(23);
      defaultTime.setMinutes(59);
      defaultTime.setSeconds(0);
      setTempTime(defaultTime);
    }
  }, [compromisso, visible]);
  
  const handleSave = async () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Por favor, digite um título para o compromisso.');
      return;
    }

    if (!data) {
      Alert.alert('Erro', 'Por favor, selecione uma data.');
      return;
    }

    if (!hora) {
      Alert.alert('Erro', 'Por favor, selecione um horário.');
      return;
    }

    try {
      // Criar configuração compatível com a estrutura antiga
      const legacyNotificationConfig = notificationConfig.notifications.length > 0 
        ? notificationConfig.notifications[0] // Usar a primeira notificação para compatibilidade
        : { enabled: false, tempo: 0, unidade: 'minutos' as const };

      const compromissoData = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data,
        hora,
        categoria,
        concluido: compromisso?.concluido || false,
        notificationConfig: legacyNotificationConfig, // Para compatibilidade com o contexto atual
        multipleNotificationConfig: notificationConfig, // Nova estrutura
      };

      if (isEditing && compromisso) {
        await updateCompromisso({
          ...compromissoData,
          id: compromisso.id,
          notificationId: compromisso.notificationId,
        });
      } else {
        await addCompromisso(compromissoData);
      }

      onSave();
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar compromisso. Tente novamente.');
    }
  };

  const openTimePicker = () => {
    // Configurar tempTime com a hora atual antes de abrir o picker
    const [hours, minutes] = hora.split(':').map(Number);
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(0);
    setTempTime(time);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      // No Android, fechar o picker e atualizar a hora
      setShowTimePicker(false);
      if (selectedTime && event.type !== 'dismissed') {
        const timeString = formatTimeFromDate(selectedTime);
        setHora(timeString);
        setTempTime(selectedTime);
      }
    } else if (Platform.OS === 'ios') {
      // No iOS, apenas atualizar tempTime
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
    // Para web, o onChange é tratado diretamente no input HTML
  };

  const handleTimeSave = () => {
    // Aplicar a hora selecionada (para iOS e Web)
    if (Platform.OS !== 'android') {
      const timeString = formatTimeFromDate(tempTime);
      setHora(timeString);
    }
    setShowTimePicker(false);
  };

  const handleTimeCancel = () => {
    // Reverter para a hora original
    const [hours, minutes] = hora.split(':').map(Number);
    const originalTime = new Date();
    originalTime.setHours(hours);
    originalTime.setMinutes(minutes);
    originalTime.setSeconds(0);
    setTempTime(originalTime);
    setShowTimePicker(false);
  };

  const renderCleanTimePicker = () => {
    if (Platform.OS === 'android') {
      // Android usa o picker nativo
      return (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      );
    } else {
      // iOS e Web usam interface clean personalizada
      return (
        <Modal
          visible={showTimePicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleTimeCancel}
        >
          <View style={styles.cleanTimeModal}>
            {/* Header minimalista */}
            <View style={styles.cleanTimeHeader}>
              <TouchableOpacity onPress={handleTimeCancel}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.cleanTimeTitle}>Selecionar Horário</Text>
              <TouchableOpacity onPress={handleTimeSave}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
            
            {/* Container do picker com fundo clean */}
            <View style={styles.cleanPickerContainer}>
              {Platform.OS === 'web' ? (
                <View style={styles.webTimeContainer}>
                  <Text style={styles.selectTimeTitle}>Selecionar Horário</Text>
                  <View style={styles.webTimeInput}>
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        if (newTime) {
                          setHora(newTime);
                          // Atualizar tempTime também
                          const [hours, minutes] = newTime.split(':').map(Number);
                          const time = new Date();
                          time.setHours(hours);
                          time.setMinutes(minutes);
                          time.setSeconds(0);
                          setTempTime(time);
                        }
                      }}
                      style={styles.webInput}
                    />
                  </View>
                </View>
              ) : (
                // iOS com estilo clean
                <>
                  <Text style={styles.selectTimeTitle}>Selecionar Horário</Text>
                  <View style={styles.iosPickerContainer}>
                    <DateTimePicker
                      value={tempTime}
                      mode="time"
                      is24Hour={true}
                      display="wheels"
                      onChange={handleTimeChange}
                      style={styles.iosPicker}
                      textColor="#000"
                      themeVariant="light"
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Compromisso' : 'Novo Compromisso'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Título */}
          <View style={styles.field}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Digite o título do compromisso"
              placeholderTextColor={colors.text.tertiary}
              autoFocus
            />
          </View>

          {/* Descrição */}
          <View style={styles.field}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Digite uma descrição (opcional)"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Data com DatePicker */}
          <View style={styles.field}>
            <DatePicker
              label="Data *"
              value={data}
              onDateChange={setData}
              placeholder="dd/mm/yyyy"
            />
          </View>

          {/* Horário - Clique direto para abrir */}
          <View style={styles.field}>
            <Text style={styles.label}>Horário *</Text>
            <TouchableOpacity style={styles.cleanTimeField} onPress={openTimePicker}>
              <Text style={styles.cleanTimeText}>{hora}</Text>
            </TouchableOpacity>
          </View>

          {/* Notificação */}
          <NotificationSelector
            value={notificationConfig}
            onValueChange={setNotificationConfig}
            label="Notificação"
          />

          {/* Categoria */}
          <View style={styles.field}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoriaGrid}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoriaButton,
                    { borderColor: cat.color },
                    categoria === cat.value && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategoria(cat.value)}
                >
                  <Tag size={16} color={categoria === cat.value ? colors.text.white : cat.color} />
                  <Text
                    style={[
                      styles.categoriaText,
                      { color: categoria === cat.value ? colors.text.white : cat.color },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Time Picker Clean */}
        {showTimePicker && renderCleanTimePicker()}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Salvar' : 'Criar'}
            </Text>
          </TouchableOpacity>
        </View>
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Campo de horário clean - sem ícone
  cleanTimeField: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
  },
  cleanTimeText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'left',
  },
  categoriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 20,
    gap: 6,
  },
  categoriaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
  },
  
  // Estilos do Time Picker Clean
  cleanTimeModal: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  cleanTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  cancelText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  cleanTimeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  cleanPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  selectTimeTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
 // Web styles
 webTimeContainer: {
  alignItems: 'center',
  width: '100%',
},
webTimeInput: {
  backgroundColor: colors.background.primary,
  borderRadius: 16,
  padding: 40,
  shadowColor: colors.shadow.color,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 5,
},
webInput: {
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '32px',
  fontWeight: '300',
  color: colors.text.primary,
  outline: 'none',
  textAlign: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  minWidth: '120px',
  // Customizar o picker nativo do browser para ficar mais clean
  WebkitAppearance: 'none',
  MozAppearance: 'textfield',
} as any,
// iOS styles
iosPickerContainer: {
  backgroundColor: colors.background.primary,
  borderRadius: 16,
  marginHorizontal: 20,
  paddingVertical: 20,
  shadowColor: colors.shadow.color,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 5,
},
iosPicker: {
  height: 200,
  width: '100%',
},
});