import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Materia, OrderOption, OrderDirection } from '@/contexts/StudayContext';
import { Search, ArrowUpDown, BookOpen } from 'lucide-react-native'; // Certifique-se de ter a lucide-react-native instalada
import { lightColors } from '@/components/theme/colors';

interface FilterBarProps {
  busca: string;
  setBusca: (t: string) => void;
  materiaSelecionada: string | null;
  setMateriaSelecionada: (id: string | null) => void;
  ordenacao: OrderOption;
  setOrdenacao: (o: OrderOption) => void;
  direcao: OrderDirection;
  setDirecao: (d: OrderDirection) => void;
  materias: Materia[];
}

export function FilterBar({
  busca,
  setBusca,
  materiaSelecionada,
  setMateriaSelecionada,
  ordenacao,
  setOrdenacao,
  direcao,
  setDirecao,
  materias,
}: FilterBarProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  // Inverte a seta (↑↓) se clicar no filtro ativo, ou muda o tipo de ordenação
  const alternarOrdenacao = (novaOpcao: OrderOption) => {
    if (ordenacao === novaOpcao) {
      setDirecao(direcao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(novaOpcao);
      setDirecao('asc'); // Reseta para ascendente ao mudar de critério
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Caixa de Busca Estilo "Ctrl + F" */}
      <View style={styles.searchSection}>
        <Search size={18} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholder="Pesquisar por nome ou horário..."
          placeholderTextColor={colors.text.tertiary}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* 2. Carrossel de Chips para Filtro por Matéria */}
      <View style={styles.labelRow}>
        <BookOpen size={14} color={colors.text.secondary} />
        <Text style={[typography.small, { color: colors.text.secondary, marginLeft: 5 }]}>
          Filtrar por Matéria:
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.materiaScroll}>
        <TouchableOpacity
          style={[styles.chip, !materiaSelecionada && styles.chipActive]}
          onPress={() => setMateriaSelecionada(null)}
        >
          <Text style={[styles.chipText, !materiaSelecionada && styles.chipTextActive]}>Todas</Text>
        </TouchableOpacity>
        {materias.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.chip, materiaSelecionada === m.id && styles.chipActive]}
            onPress={() => setMateriaSelecionada(m.id)}
          >
            <Text style={[styles.chipText, materiaSelecionada === m.id && styles.chipTextActive]}>
              {m.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 3. Botões de Ordenação com Controle de Direção pelas Setas ↑↓ */}
      <View style={styles.orderSection}>
        <View style={styles.labelRow}>
          <ArrowUpDown size={14} color={colors.text.secondary} />
          <Text style={[typography.small, { color: colors.text.secondary, marginLeft: 5 }]}>
            Ordenar por:
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderRow}>
          {([
            { id: 'proximo', label: 'Mais Próximo' },
            { id: 'novo', label: 'Mais Novo' },
            { id: 'antigo', label: 'Mais Antigo' },
            { id: 'alfabetica', label: 'Alfabética' },
          ] as { id: OrderOption; label: string }[]).map((opcao) => {
            const ativo = ordenacao === opcao.id;
            const indicadorSeta = direcao === 'asc' ? ' ↑' : ' ↓';

            return (
              <TouchableOpacity
                key={opcao.id}
                style={[styles.orderButton, ativo && styles.orderButtonActive]}
                onPress={() => alternarOrdenacao(opcao.id)}
              >
                <Text style={[styles.orderButtonText, ativo && styles.orderButtonTextActive]}>
                  {opcao.label}
                  {ativo ? indicadorSeta : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: {
      padding: 15,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    searchSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.tertiary,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 44,
      marginBottom: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 0,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    materiaScroll: {
      marginBottom: 14,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.background.tertiary,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    chipTextActive: {
      color: '#FFF',
      fontWeight: '600',
    },
    orderSection: {
      marginTop: 2,
    },
    orderRow: {
      flexDirection: 'row',
      paddingVertical: 2,
    },
    orderButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.background.tertiary,
      marginRight: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    orderButtonActive: {
      backgroundColor: colors.primary + '1A', // Opacidade de 10% da cor primária
      borderColor: colors.primary,
    },
    orderButtonText: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    orderButtonTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
  });
}