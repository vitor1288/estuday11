import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStuday } from '@/contexts/StudayContext';
import { FilterBar } from '@/components/FilterBar';
import { ManageDataModal } from '@/components/ManageDataModal';
import { filtrarEOrdenarCompromissos, OrderOption, OrderDirection } from '@/utils/filterUtils';
import { lightColors } from '@/components/theme/colors';
import { Settings, Calendar as CalendarIcon, Clock } from 'lucide-react-native';

export default function CompromissosScreen() {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  const { 
  compromissos = [], 
  materias = [], 
  categorias = [] 
} = useStuday();

  // Estados dos Filtros e Ordenação
  const [busca, setBusca] = useState('');
  const [materiaSelecionada, setMateriaSelecionada] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<OrderOption>('proximo');
  const [direcao, setDirecao] = useState<OrderDirection>('asc');

  // Estado do Modal de Gerenciamento
  const [modalGerenciarVisivel, setModalGerenciarVisivel] = useState(false);

  // Aplica o motor matemático de busca e ordenação
  const compromissosFiltrados = filtrarEOrdenarCompromissos(
    compromissos,
    busca,
    materiaSelecionada,
    null, // Não estamos filtrando por data fixa nesta aba geral
    ordenacao,
    direcao
  );

  // Funções de auxílio para resgatar dados dos IDs
  const getCategoria = (id: string) => categorias.find(c => c.id === id);
  
  // Formata a data (YYYY-MM-DD -> DD/MM/YYYY)
  const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    const [y, m, d] = dataStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho Customizado da Tela */}
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.text.primary }]}>Meus Compromissos</Text>
        <TouchableOpacity 
          style={styles.btnGerenciar} 
          onPress={() => setModalGerenciarVisivel(true)}
        >
          <Settings size={20} color={colors.primary} />
          <Text style={styles.btnGerenciarText}>Gerenciar</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Filtros Premium Unificada */}
      <FilterBar
        busca={busca}
        setBusca={setBusca}
        materiaSelecionada={materiaSelecionada}
        setMateriaSelecionada={setMateriaSelecionada}
        ordenacao={ordenacao}
        setOrdenacao={setOrdenacao}
        direcao={direcao}
        setDirecao={setDirecao}
        materias={materias}
      />

      {/* Lista de Compromissos Filtrada */}
      <FlatList
        data={compromissosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center' }]}>
              Nenhum compromisso encontrado com os filtros atuais.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const categoriaObj = getCategoria(item.categoriaId);
          const corCard = categoriaObj ? categoriaObj.cor : colors.primary;

          return (
            <View style={[styles.card, { borderLeftColor: corCard }]}>
              <View style={styles.cardHeader}>
                <Text style={[typography.subtitle, styles.cardTitle]}>{item.titulo}</Text>
                <View style={[styles.badge, { backgroundColor: corCard + '20' }]}>
                  <Text style={[styles.badgeText, { color: corCard }]}>
                    {categoriaObj ? categoriaObj.nome : 'Outro'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.infoRow}>
                  <CalendarIcon size={14} color={colors.text.secondary} />
                  <Text style={[typography.small, styles.infoText]}>{formatarData(item.data)}</Text>
                </View>
                {item.hora ? (
                  <View style={styles.infoRow}>
                    <Clock size={14} color={colors.text.secondary} />
                    <Text style={[typography.small, styles.infoText]}>{item.hora}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      {/* Modal Central de Gerenciamento de Matérias/Categorias */}
      <ManageDataModal
        visible={modalGerenciarVisivel}
        onClose={() => setModalGerenciarVisivel(false)}
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
    listContent: { padding: 20, paddingBottom: 100 },
    emptyContainer: { paddingVertical: 40, alignItems: 'center' },
    card: { backgroundColor: colors.background.primary, borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { flex: 1, color: colors.text.primary, marginRight: 10 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { color: colors.text.secondary },
  });
}