import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit3, Trash2 } from 'lucide-react-native';
import { AnotacaoCalendario } from '@/contexts/StudayContext';
import { BaseCard } from '@/components/BaseCard/BaseCard';
import { colors } from '@/components/theme/colors';

interface AnotacaoCardProps {
  anotacao: AnotacaoCalendario;
  onEdit: () => void;
  onDelete: () => void;
  showDate?: boolean;
}

export function AnotacaoCard({ anotacao, onEdit, onDelete, showDate = true }: AnotacaoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateExtended = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <BaseCard
      variant="anotacao"
      sideBarColor={colors.note.primary}
      status="normal"
    >
      {/* Header com data e ações */}
      {showDate && (
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Text style={styles.anotacaoData}>
              {formatDate(anotacao.data)}
            </Text>
            <Text style={styles.anotacaoDataExtended}>
              {formatDateExtended(anotacao.data)}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Edit3 size={14} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Trash2 size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Conteúdo da anotação */}
      <View style={styles.content}>
        <Text style={styles.anotacaoTexto}>{anotacao.texto}</Text>
      </View>

      {/* Ações quando não mostra data (para uso em modais) */}
      {!showDate && (
        <View style={styles.inlineActions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Edit3 size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Trash2 size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  anotacaoData: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.note.primary,
    marginBottom: 2,
  },
  anotacaoDataExtended: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  anotacaoTexto: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
});