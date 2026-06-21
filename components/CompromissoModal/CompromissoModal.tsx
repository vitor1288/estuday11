import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { X, Save } from 'lucide-react-native';
import { useEstuday, Compromisso } from '@/contexts/StudayContext';
import { formatDate } from '@/utils/dateUtils';
import { DatePicker } from '@/components/DatePicker/DatePicker';
import TimePicker from '@/components/TimePicker/TimePicker';
import { NotificationSelector, MultipleNotificationConfig } from '@/components/NotificationSelector/NotificationSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface CompromissoModalProps {
  visible: boolean;
  compromisso?: Compromisso | null;
  initialDate?: string;
  onClose: () => void;
  onSave: () => void;
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
    notifications: [{ enabled: false, tempo: 1, unidade: 'dias' }]
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (compromisso) {
        setTitulo(compromisso.titulo);
        setIsTituloEditado(true); // Se for edição, não atualiza o título automaticamente
        setDescricao(compromisso.descricao || '');
        setData(compromisso.data);
        setHora(compromisso.hora);
        setCategoriaId(compromisso.categoriaId || compromisso.categoria || listaCategorias[0]?.id || '');
        setMateriaId(compromisso.materiaId || listaMaterias[0]?.id || '');
        if (compromisso.notificacaoConfig) {
          setNotificationConfig(compromisso.notificacaoConfig);
        }
      } else {
        setTitulo('');
        setIsTituloEditado(false);
        setDescricao('');
        setData(initialDate || formatDate(new Date()));
        setHora('09:00');
        setCategoriaId(listaCategorias[0]?.id || '');
        setMateriaId(listaMaterias[0]?.id || '');
        setNotificationConfig({ notifications: [{ enabled: false, tempo: 1, unidade: 'dias' }] });
      }
    }
  }, [visible, compromisso, initialDate]);

  // Título Automático: [Categoria] de [Matéria]
  useEffect(() => {
    if (!isTituloEditado && !compromisso) {
      const cat = listaCategorias.find((c: any) => c.id === categoriaId);
      const mat = listaMaterias.find((m: any) => m.id === materiaId);
      if (cat && mat) {
        setTitulo(`${cat.nome} de ${mat.nome}`);
      }
    }
  }, [categoriaId, materiaId, isTituloEditado, compromisso]);

  const handleSave = async () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o compromisso.');
      return;
    }

    const compromissoData = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      data,
      hora,
      categoriaId,
      materiaId,
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
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o compromisso.');
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
            {compromisso ? 'Editar Compromisso' : 'Novo Compromisso'}
          </Text>
          <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Save size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.field}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Título</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={(text) => {
                setTitulo(text);
                setIsTituloEditado(true);
              }}
              placeholder="Ex: Prova de Matemática"
              placeholderTextColor={colors.text.tertiary}
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
                    onPress={() => setCategoriaId(cat.id)}
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
                    onPress={() => setMateriaId(mat.id)}
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
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowDatePicker(true)}>
                <Text style={[typography.body, { color: colors.text.primary }]}>
                  {data.split('-').reverse().join('/')}
                </Text>
              </TouchableOpacity>
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
            />
          </View>
        </ScrollView>
      </View>

      <DatePicker
        visible={showDatePicker}
        date={data}
        onClose={() => setShowDatePicker(false)}
        onSelect={(newDate) => {
          setData(newDate);
          setShowDatePicker(false);
        }}
      />

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
    </Modal>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
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