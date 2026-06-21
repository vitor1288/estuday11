import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStuday } from '@/contexts/StudayContext';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check } from 'lucide-react-native';
import { lightColors } from '@/components/theme/colors';

interface ManageDataModalProps {
  visible: boolean;
  onClose: () => void;
}

const PALETA_CORES = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

export function ManageDataModal({ visible, onClose }: ManageDataModalProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  
  // Acessa o estado e a função dispatch do Reducer global
  const { state, dispatch } = useStuday();
  
  const materias = state?.materias || [];
  const categorias = state?.categorias || [];

  const [abaAtiva, setAbaAtiva] = useState<'materias' | 'categorias'>('materias');
  const [novoNomeMateria, setNovoNomeMateria] = useState('');
  const [novoNomeCategoria, setNovoNomeCategoria] = useState('');
  const [corCategoriaSel, setCorCategoriaSel] = useState(PALETA_CORES[0]);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  const handleCriarMateria = () => {
    if (!novoNomeMateria.trim()) return;
    dispatch({ type: 'ADD_MATERIA', payload: novoNomeMateria.trim() });
    setNovoNomeMateria('');
  };

  const handleCriarCategoria = () => {
    if (!novoNomeCategoria.trim()) return;
    dispatch({ type: 'ADD_CATEGORIA', payload: { nome: novoNomeCategoria.trim(), cor: corCategoriaSel } });
    setNovoNomeCategoria('');
  };

  const iniciarEdicao = (id: string, nomeAtual: string) => {
    setEditandoId(id);
    setTextoEdicao(nomeAtual);
  };

  const salvarEdicao = (id: string, tipo: 'materia' | 'categoria') => {
    if (!textoEdicao.trim()) return;
    if (tipo === 'materia') {
      dispatch({ type: 'UPDATE_MATERIA', payload: { id, nome: textoEdicao.trim() } });
    } else {
      dispatch({ type: 'UPDATE_CATEGORIA', payload: { id, nome: textoEdicao.trim(), cor: corCategoriaSel } });
    }
    setEditandoId(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>
              Gerenciar Organização
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, abaAtiva === 'materias' && styles.tabActive]} 
              onPress={() => { setAbaAtiva('materias'); setEditandoId(null); }}
            >
              <Text style={[styles.tabText, abaAtiva === 'materias' && styles.tabTextActive]}>Matérias</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, abaAtiva === 'categorias' && styles.tabActive]} 
              onPress={() => { setAbaAtiva('categorias'); setEditandoId(null); }}
            >
              <Text style={[styles.tabText, abaAtiva === 'categorias' && styles.tabTextActive]}>Classificações</Text>
            </TouchableOpacity>
          </View>

          {abaAtiva === 'materias' && (
            <View style={styles.content}>
              <View style={styles.addForm}>
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Nova matéria (ex: Biologia)..."
                  placeholderTextColor={colors.text.tertiary}
                  value={novoNomeMateria}
                  onChangeText={setNovoNomeMateria}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleCriarMateria}>
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={materias}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    {editandoId === item.id ? (
                      <TextInput
                        style={[styles.inlineInput, { color: colors.text.primary }]}
                        value={textoEdicao}
                        onChangeText={setTextoEdicao}
                        autoFocus
                      />
                    ) : (
                      <Text style={[typography.body, { color: colors.text.primary, flex: 1 }]}>{item.nome}</Text>
                    )}

                    <View style={styles.actionsRow}>
                      {editandoId === item.id ? (
                        <TouchableOpacity onPress={() => salvarEdicao(item.id, 'materia')} style={styles.iconBtn}>
                          <Check size={18} color={colors.success} />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => iniciarEdicao(item.id, item.nome)} style={styles.iconBtn}>
                          <Edit2 size={16} color={colors.text.secondary} />
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity onPress={() => dispatch({ type: 'MOVE_MATERIA', payload: { id: item.id, direcao: 'cima' } })} style={styles.iconBtn}>
                        <ArrowUp size={16} color={colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => dispatch({ type: 'MOVE_MATERIA', payload: { id: item.id, direcao: 'baixo' } })} style={styles.iconBtn}>
                        <ArrowDown size={16} color={colors.text.secondary} />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_MATERIA', payload: item.id })} style={styles.iconBtn}>
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {abaAtiva === 'categorias' && (
            <View style={styles.content}>
              <View style={[styles.addForm, { flexDirection: 'column', height: 'auto', gap: 10, alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={[styles.input, { color: colors.text.primary, flex: 1 }]}
                    placeholder="Nova categoria (ex: Simulado)..."
                    placeholderTextColor={colors.text.tertiary}
                    value={novoNomeCategoria}
                    onChangeText={setNovoNomeCategoria}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleCriarCategoria}>
                    <Plus size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  {PALETA_CORES.map((cor) => (
                    <TouchableOpacity
                      key={cor}
                      style={[
                        styles.colorDot, 
                        { backgroundColor: color },
                        corCategoriaSel === cor && { borderWidth: 2, borderColor: colors.text.primary }
                      ]}
                      onPress={() => setCorCategoriaSel(cor)}
                    />
                  ))}
                </ScrollView>
              </View>

              <FlatList
                data={categorias}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <View style={[styles.colorIndicator, { backgroundColor: item.cor }]} />
                    
                    {editandoId === item.id ? (
                      <TextInput
                        style={[styles.inlineInput, { color: colors.text.primary }]}
                        value={textoEdicao}
                        onChangeText={setTextoEdicao}
                        autoFocus
                      />
                    ) : (
                      <Text style={[typography.body, { color: colors.text.primary, flex: 1 }]}>{item.nome}</Text>
                    )}

                    <View style={styles.actionsRow}>
                      {editandoId === item.id ? (
                        <TouchableOpacity onPress={() => salvarEdicao(item.id, 'categoria')} style={styles.iconBtn}>
                          <Check size={18} color={colors.success} />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => iniciarEdicao(item.id, item.nome)} style={styles.iconBtn}>
                          <Edit2 size={16} color={colors.text.secondary} />
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity onPress={() => dispatch({ type: 'MOVE_CATEGORIA', payload: { id: item.id, direcao: 'cima' } })} style={styles.iconBtn}>
                        <ArrowUp size={16} color={colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => dispatch({ type: 'MOVE_CATEGORIA', payload: { id: item.id, direcao: 'baixo' } })} style={styles.iconBtn}>
                        <ArrowDown size={16} color={colors.text.secondary} />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_CATEGORIA', payload: item.id })} style={styles.iconBtn}>
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: colors.background.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%', paddingBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    tabContainer: { flexDirection: 'row', backgroundColor: colors.background.tertiary, padding: 4, marginHorizontal: 20, marginTop: 15, borderRadius: 8 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    tabActive: { backgroundColor: colors.background.primary },
    tabText: { fontSize: 14, color: colors.text.secondary },
    tabTextActive: { color: colors.primary, fontWeight: '600' },
    content: { flex: 1, paddingHorizontal: 20, marginTop: 15 },
    addForm: { flexDirection: 'row', height: 44, gap: 10, marginBottom: 15 },
    input: { flex: 1, backgroundColor: colors.background.tertiary, borderRadius: 8, paddingHorizontal: 12, fontSize: 14 },
    inlineInput: { flex: 1, borderBottomWidth: 1, borderColor: colors.primary, fontSize: 14, paddingVertical: 2, marginRight: 10 },
    addButton: { backgroundColor: colors.primary, width: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    colorDot: { width: 24, height: 24, borderRadius: 12 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconBtn: { padding: 6 },
  });
}