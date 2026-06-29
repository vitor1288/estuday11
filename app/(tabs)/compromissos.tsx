import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStuday } from '@/contexts/StudayContext';
import { BaseCard } from '@/components/BaseCard/BaseCard';
import { ManageDataModal } from '@/components/ManageDataModal';
import { CompromissoModal } from '@/components/CompromissoModal/CompromissoModal'; 
import { filtrarEOrdenarCompromissos, OrderOption, OrderDirection } from '@/utils/filterUtils';
import { lightColors } from '@/components/theme/colors';
// 🟢 ADICIONADO: Importados Circle e CheckCircle para a bolinha de conclusão
import { Settings, Calendar as CalendarIcon, Clock, Plus, Filter, Search, X, Check, ArrowDownUp, Circle, CheckCircle } from 'lucide-react-native';

type StatusTab = 'todos' | 'pendente' | 'realizar' | 'hoje' | 'concluido';

export default function CompromissosScreen() {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  
  const { 
    compromissos = [], 
    materias = [], 
    categorias = [],
    toggleCompromisso 
  } = useStuday();

  // Estados dos Filtros Ativos
  const [busca, setBusca] = useState('');
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<string[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  
  // Estados de Ordenação
  const [ordenacao, setOrdenacao] = useState<OrderOption>('proximo');
  const [direcao, setDirecao] = useState<OrderDirection>('asc'); 
  const [statusFiltro, setStatusFiltro] = useState<StatusTab>('realizar');

  // Estados dos Modais
  const [modalGerenciarVisivel, setModalGerenciarVisivel] = useState(false);
  const [modalCriarVisivel, setModalCriarVisivel] = useState(false); 
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [modalOrdenacaoVisivel, setModalOrdenacaoVisivel] = useState(false);
  // 🟢 CORREÇÃO 4: Estado criado para armazenar o compromisso que vai ser editado
  const [compromissoEdicao, setCompromissoEdicao] = useState<any | null>(null);

  // Função utilitária para checar atrasos
  const verificarAtrasado = (item: any) => {
    if (item.concluido) return false;
    
    const agora = new Date();
    const [ano, mes, dia] = item.data.split('-').map(Number);
    const dataCompromisso = new Date(ano, mes - 1, dia);
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    
    if (dataCompromisso < hoje) return true;
    
    if (dataCompromisso.getTime() === hoje.getTime() && item.hora) {
      const [horas, minutos] = item.hora.split(':').map(Number);
      const horaCompromisso = new Date(ano, mes - 1, dia, horas, minutos);
      return horaCompromisso < agora;
    }
    
    return false;
  };

  // Motor base de busca, passando a direção e ordenação dinâmicas
  let compromissosFiltrados = filtrarEOrdenarCompromissos(
    compromissos,
    busca,
    null,
    null,
    ordenacao,
    direcao
  );

  // Filtro avançado para múltiplas matérias e categorias
  if (materiasSelecionadas.length > 0) {
    compromissosFiltrados = compromissosFiltrados.filter(item => materiasSelecionadas.includes(item.materiaId));
  }
  if (categoriasSelecionadas.length > 0) {
    compromissosFiltrados = compromissosFiltrados.filter(item => categoriasSelecionadas.includes(item.categoriaId || item.categoria));
  }

  // Filtro pelas Abas de Status
  const hojeStr = new Date().toISOString().split('T')[0];
  
  compromissosFiltrados = compromissosFiltrados.filter(item => {
    const atrasado = verificarAtrasado(item);
    switch (statusFiltro) {
      case 'pendente':
        return !item.concluido && atrasado;
      case 'realizar':
        return !item.concluido;
      case 'hoje':
        return item.data === hojeStr;
      case 'concluido':
        return item.concluido;
      case 'todos':
      default:
        return true;
    }
  });

  const getCategoria = (id: string) => categorias.find((c: any) => c.id === id);
  const getMateriaNome = (id: string) => materias.find((m: any) => m.id === id)?.nome || '';
  
  const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length !== 3) return dataStr;
    const [y, m, d] = partes;
    return `${d}/${m}/${y}`;
  };

  const alternarMateriaFiltro = (id: string) => {
    setMateriasSelecionadas(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const alternarCategoriaFiltro = (id: string) => {
    setCategoriasSelecionadas(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const limparTodosFiltros = () => {
    setMateriasSelecionadas([]);
    setCategoriasSelecionadas([]);
    setBusca('');
    setStatusFiltro('realizar');
  };

  // Nomes de ordenação atualizados
  const getLabelOrdenacao = () => {
    if (ordenacao === 'proximo' && direcao === 'asc') return 'Data crescente';
    if (ordenacao === 'proximo' && direcao === 'desc') return 'Data decrescente';
    if (ordenacao === 'alfabetica' && direcao === 'asc') return 'Nomes em A - Z';
    if (ordenacao === 'alfabetica' && direcao === 'desc') return 'Nomes em Z - A';
    return 'Ordenar';
  };

  const totalFiltrosAtivos = materiasSelecionadas.length + categoriasSelecionadas.length;

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Compromissos</Text>
        <TouchableOpacity style={styles.btnGerenciar} onPress={() => setModalGerenciarVisivel(true)}>
          <Settings size={18} color={colors.primary} />
          <Text style={styles.btnGerenciarText}>Gerenciar</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Busca + Filtro Avançado */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar compromisso..."
            placeholderTextColor={colors.text.tertiary}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        <TouchableOpacity 
          style={[styles.btnFiltrar, totalFiltrosAtivos > 0 && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]} 
          onPress={() => setModalFiltroVisivel(true)}
        >
          <Filter size={18} color={totalFiltrosAtivos > 0 ? colors.primary : colors.text.secondary} />
          <Text style={[styles.btnFiltrarText, { color: totalFiltrosAtivos > 0 ? colors.primary : colors.text.primary }]}>
            Filtrar por {totalFiltrosAtivos > 0 ? `(${totalFiltrosAtivos})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CARROSSEL DE ABAS */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {(['todos', 'pendente', 'realizar', 'hoje', 'concluido'] as StatusTab[]).map((tab) => {
            const isActive = statusFiltro === tab;
            const labels: Record<StatusTab, string> = { todos: 'Todos', pendente: 'Pendente', realizar: 'A Realizar', hoje: 'Hoje', concluido: 'Concluído' };
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setStatusFiltro(tab)}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{labels[tab]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Botões Auxiliares */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnNovoCompromisso} onPress={() => setModalCriarVisivel(true)} activeOpacity={0.8}>
          <Plus size={18} color="#FFF" />
          <Text style={[typography.button, styles.btnNovoCompromissoText]}>Novo Compromisso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDirection} onPress={() => setModalOrdenacaoVisivel(true)}>
          <ArrowDownUp size={16} color={colors.primary} />
          <Text style={styles.btnDirectionText}>{getLabelOrdenacao()}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista Principal de Cards */}
      <FlatList
        data={compromissosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center' }]}>
              Nenhum compromisso encontrado para os filtros selecionados.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const idCategoriaReal = item.categoriaId || item.categoria;
          const categoriaObj = getCategoria(idCategoriaReal);
          const corCard = categoriaObj ? categoriaObj.cor : colors.primary;
          const atrasado = verificarAtrasado(item);

          let statusCard: 'normal' | 'completed' | 'expired' = 'normal';
          if (item.concluido) statusCard = 'completed';
          else if (atrasado) statusCard = 'expired';

          return (
            // 🟢 CORREÇÃO 1 & 4: Definimos onPress como undefined para o card de fora não roubar o clique geral
            <BaseCard variant="compromisso" status={statusCard} sideBarColor={corCard} onPress={undefined} showShadow={true}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                
                {/* 🟢 CORREÇÃO 1: Bolinha interativa isolada apenas para concluir o item */}
                <TouchableOpacity 
                  onPress={() => toggleCompromisso(item.id)}
                  style={{ marginRight: 12, paddingVertical: 8, paddingHorizontal: 4 }}
                  activeOpacity={0.7}
                >
                  {item.concluido ? (
                    <CheckCircle size={22} color={colors.success} />
                  ) : (
                    <Circle size={22} color={atrasado ? colors.danger : colors.text.tertiary} />
                  )}
                </TouchableOpacity>

                {/* 🟢 CORREÇÃO 4: Todo o corpo restante agora abre o modal de edição ao ser clicado */}
                <TouchableOpacity 
                  style={{ flex: 1 }}
                  activeOpacity={0.8}
                  onPress={() => setCompromissoEdicao(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleColumn}>
                      <Text style={[typography.cardTitle, styles.cardTitle, item.concluido && styles.textConcluido]}>{item.titulo}</Text>
                      {item.materiaId ? <Text style={[typography.small, styles.materiaText]}>📚 {getMateriaNome(item.materiaId)}</Text> : null}
                    </View>
                    <View style={[styles.badge, { backgroundColor: corCard + '15' }]}>
                      <Text style={[styles.badgeText, { color: corCard }]}>{categoriaObj ? categoriaObj.nome : 'Outro'}</Text>
                    </View>
                  </View>

                  {item.descricao ? <Text style={[typography.body, styles.descricaoText]} numberOfLines={2}>{item.descricao}</Text> : null}

                  <View style={styles.cardFooter}>
                    <View style={styles.infoRow}>
                      <CalendarIcon size={14} color={colors.text.secondary} />
                      <Text style={[typography.caption, styles.infoText]}>{formatarData(item.data)}</Text>
                    </View>
                    {item.hora ? (
                      <View style={styles.infoRow}>
                        <Clock size={14} color={colors.text.secondary} />
                        <Text style={[typography.caption, styles.infoText]}>{item.hora}</Text>
                      </View>
                    ) : null}

                    {atrasado && <View style={styles.atrasadoBadge}><Text style={styles.atrasadoBadgeText}>ATRASADO</Text></View>}
                  </View>
                </TouchableOpacity>

              </View>
            </BaseCard>
          );
        }}
      />

      {/* JANELA MODAL DE ORDENAÇÃO COMPACTA */}
      <Modal visible={modalOrdenacaoVisivel} animationType="fade" transparent={true} onRequestClose={() => setModalOrdenacaoVisivel(false)}>
        <TouchableOpacity style={styles.modalOverlayCenter} activeOpacity={1} onPress={() => setModalOrdenacaoVisivel(false)}>
          {/* Caixa menor estilo dropdown */}
          <View style={styles.sortModalContainer}>
            <Text style={[typography.sectionTitle, styles.sortModalTitle]}>Ordenar por</Text>

            {[
              { label: 'Data crescente', ord: 'proximo', dir: 'asc' },
              { label: 'Data decrescente', ord: 'proximo', dir: 'desc' },
              { label: 'Nomes em A - Z', ord: 'alfabetica', dir: 'asc' },
              { label: 'Nomes em Z - A', ord: 'alfabetica', dir: 'desc' },
            ].map((opcao, index) => {
              const isActive = ordenacao === opcao.ord && direcao === opcao.dir;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.sortOptionRow, isActive && styles.sortOptionRowActive]}
                  onPress={() => {
                    setOrdenacao(opcao.ord as OrderOption);
                    setDirecao(opcao.dir as OrderDirection);
                    setModalOrdenacaoVisivel(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, isActive && styles.sortOptionTextActive]}>{opcao.label}</Text>
                  {isActive && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE FILTROS DUAS COLUNAS */}
      <Modal visible={modalFiltroVisivel} animationType="slide" transparent={true} onRequestClose={() => setModalFiltroVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContainer}>
            <View style={styles.filterModalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>Filtrar por</Text>
              <View style={styles.headerRightActions}>
                <TouchableOpacity onPress={limparTodosFiltros} style={styles.btnLimparTop}>
                  <Text style={[typography.button, { color: colors.danger, fontSize: 13 }]}>Limpar Filtro</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalFiltroVisivel(false)} style={styles.btnClose}>
                  <X size={22} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.splitContentContainer}>
              <View style={styles.columnSplit}>
                <Text style={[typography.cardTitle, styles.columnTitle]}>Matérias</Text>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollColumnContent}>
                  <View style={styles.optionsList}>
                    {materias.map((materia: any) => {
                      const selecionada = materiasSelecionadas.includes(materia.id);
                      return (
                        <TouchableOpacity key={materia.id} style={[styles.optionRow, selecionada && styles.optionRowSelected]} onPress={() => alternarMateriaFiltro(materia.id)}>
                          <View style={[styles.checkbox, selecionada && styles.checkboxChecked]}>{selecionada && <Check size={12} color="#FFF" strokeWidth={3} />}</View>
                          <Text style={[styles.optionText, selecionada && styles.optionTextSelected]} numberOfLines={1}>{materia.nome}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.columnSplit}>
                <Text style={[typography.cardTitle, styles.columnTitle]}>Categorias</Text>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollColumnContent}>
                  <View style={styles.optionsList}>
                    {categorias.map((categoria: any) => {
                      const selecionada = categoriasSelecionadas.includes(categoria.id);
                      return (
                        <TouchableOpacity key={categoria.id} style={[styles.optionRow, selecionada && styles.optionRowSelected]} onPress={() => alternarCategoriaFiltro(categoria.id)}>
                          <View style={[styles.checkbox, selecionada && { backgroundColor: categoria.cor, borderColor: categoria.cor }]}>{selecionada && <Check size={12} color="#FFF" strokeWidth={3} />}</View>
                          <View style={[styles.colorDot, { backgroundColor: categoria.cor }]} />
                          <Text style={[styles.optionText, selecionada && styles.optionTextSelected]} numberOfLines={1}>{categoria.nome}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={styles.filterModalFooter}>
              <TouchableOpacity style={styles.btnAplicarFiltros} onPress={() => setModalFiltroVisivel(false)}>
                <Text style={styles.btnAplicarFiltrosText}>Aplicar Filtro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ManageDataModal visible={modalGerenciarVisivel} onClose={() => setModalGerenciarVisivel(false)} />
      
      {/* 🟢 CORREÇÃO 4: Modal configurado para abrir tanto ao criar quanto ao passar um compromisso para edição */}
      <CompromissoModal 
        visible={modalCriarVisivel || !!compromissoEdicao} 
        compromisso={compromissoEdicao}
        onClose={() => {
          setModalCriarVisivel(false);
          setCompromissoEdicao(null);
        }} 
        onSave={() => {
          setModalCriarVisivel(false);
          setCompromissoEdicao(null);
        }} 
      />
    </View>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: colors.background.primary },
    btnGerenciar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '1A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    btnGerenciarText: { color: colors.primary, fontWeight: '600', marginLeft: 6, fontSize: 13 },
    
    searchFilterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 15, gap: 10, backgroundColor: colors.background.primary, paddingBottom: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 8, paddingHorizontal: 10 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 40, color: colors.text.primary, fontSize: 14 },
    btnFiltrar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, paddingHorizontal: 12, height: 40, gap: 6 },
    btnFiltrarText: { fontSize: 13, fontWeight: '600' },

    tabsWrapper: { backgroundColor: colors.background.primary, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    tabsScroll: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
    tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.light },
    tabButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabButtonText: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
    tabButtonTextActive: { color: '#FFF' },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
    btnNovoCompromisso: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
    btnNovoCompromissoText: { color: '#FFF' },
    btnDirection: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border.light, gap: 6, minWidth: 135, justifyContent: 'center' },
    btnDirectionText: { fontSize: 13, fontWeight: '600', color: colors.text.primary },

    listContent: { padding: 20, paddingBottom: 100 },
    emptyContainer: { paddingVertical: 40, alignItems: 'center' },
    
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titleColumn: { flex: 1, marginRight: 10 },
    cardTitle: { color: colors.text.primary },
    textConcluido: { textDecorationLine: 'line-through', opacity: 0.5, color: colors.text.secondary },
    materiaText: { color: colors.primary, marginTop: 4, fontWeight: '500' },
    descricaoText: { color: colors.text.secondary, fontSize: 14, marginBottom: 12, lineHeight: 18 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { color: colors.text.secondary },
    atrasadoBadge: { backgroundColor: colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    atrasadoBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
    filterModalContainer: { backgroundColor: colors.background.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '75%', paddingBottom: 20 },
    filterModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    btnLimparTop: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.danger + '0A' },
    btnClose: { padding: 6, marginLeft: 4 },
    splitContentContainer: { flex: 1, flexDirection: 'row', paddingHorizontal: 12, marginTop: 15 },
    columnSplit: { flex: 1, paddingHorizontal: 6 },
    columnTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 16, paddingHorizontal: 6, color: colors.text.primary },
    scrollColumnContent: { paddingBottom: 20 },
    optionsList: { gap: 10 },
    optionRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: colors.background.secondary, borderRadius: 8, gap: 10 },
    optionRowSelected: { backgroundColor: colors.primary + '0A' },
    colorDot: { width: 10, height: 10, borderRadius: 5 },
    optionText: { flex: 1, fontSize: 14, color: colors.text.primary, fontWeight: '500' },
    optionTextSelected: { color: colors.primary, fontWeight: '600' },
    checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: colors.border.dark, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    verticalDivider: { width: 1, backgroundColor: colors.border.light, marginVertical: 10 },
    filterModalFooter: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10, borderTopWidth: 1, borderTopColor: colors.border.light },
    btnAplicarFiltros: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnAplicarFiltrosText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

    modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    sortModalContainer: { 
      backgroundColor: colors.background.primary, 
      borderRadius: 16, 
      width: 260, 
      padding: 16, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.15, 
      shadowRadius: 10, 
      elevation: 5 
    },
    sortModalTitle: { color: colors.text.primary, marginBottom: 16, textAlign: 'center', fontSize: 18 },
    sortOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, marginBottom: 6, backgroundColor: colors.background.secondary },
    sortOptionRowActive: { backgroundColor: colors.primary + '1A', borderWidth: 1, borderColor: colors.primary + '30' },
    sortOptionText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
    sortOptionTextActive: { color: colors.primary, fontWeight: 'bold' }
  });
}