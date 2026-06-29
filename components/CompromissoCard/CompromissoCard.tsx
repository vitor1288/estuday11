import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit3, Trash2, CheckCircle, Circle, Bell, BellOff } from 'lucide-react-native';
import { Compromisso, getNotificationText, useEstuday } from '@/contexts/StudayContext';
import { formatDateBR, isExpired } from '@/utils/dateUtils';
import { BaseCard } from '@/components/BaseCard/BaseCard';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { MultipleNotificationConfig } from '@/components/NotificationSelector/NotificationSelector';

interface CompromissoCardProps {
  compromisso: Compromisso;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  variant?: 'compromisso' | 'compromisso-modal';
  onPress?: () => void;
}

const getMultipleNotificationText = (config?: MultipleNotificationConfig): string => {
  if (!config?.notifications?.length) return 'Sem notificação';
  const enabled = config.notifications.filter(n => n.enabled);
  if (!enabled.length) return 'Sem notificação';
  if (enabled.length === 1) return getNotificationText(enabled[0]);
  return `${enabled.length} lembretes`;
};

export function CompromissoCard({ 
  compromisso, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  variant = 'compromisso',
  onPress
}: CompromissoCardProps) {
  const { colors, typography } = useTheme();
  const { categorias, categories } = useEstuday(); // Puxa as categorias dinâmicas
  const styles = makeStyles(colors);

  // Busca a categoria correta pelo ID
  const listaCategorias = categorias || (categories as any) || [];
  const categoriaObj = listaCategorias.find((c: any) => c.id === compromisso.categoriaId || c.id === compromisso.categoria);
  const corCategoria = categoriaObj ? categoriaObj.cor : colors.primary;
  const nomeCategoria = categoriaObj ? categoriaObj.nome : (compromisso.categoria || 'Outro');

  const isCompromissoExpired = !compromisso.concluido && isExpired(compromisso.data, compromisso.hora);
  const notificationsEnabled = compromisso.notificacaoConfig?.notifications?.some(n => n.enabled);

 return (
    <BaseCard
      variant={variant}
      status={compromisso.concluido ? 'completed' : (isCompromissoExpired ? 'expired' : 'normal')}
      sideBarColor={corCategoria}
      // 🟢 Passamos undefined para o BaseCard não criar o Touchable global por fora e não "roubar" os cliques
      onPress={undefined} 
      showShadow={true}
    >
      {/* 🟢 Criamos um container interativo interno: clicar no texto/corpo abre a edição */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onEdit}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          {/* 🟢 A bolinha fica totalmente isolada para apenas marcar como concluído */}
          <TouchableOpacity 
            onPress={onToggleComplete} 
            style={styles.checkButton}
            activeOpacity={0.7}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            {compromisso.concluido ? (
              <CheckCircle size={24} color={colors.success} />
            ) : (
              <Circle size={24} color={isCompromissoExpired ? colors.danger : colors.text.tertiary} />
            )}
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[
              typography.subtitle,
              { color: colors.text.primary, marginBottom: 4 },
              compromisso.concluido && { textDecorationLine: 'line-through', color: colors.text.secondary }
            ]} numberOfLines={2}>
              {compromisso.titulo}
            </Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={styles.categoria}>
                  <View style={[styles.categoriaIndicator, { backgroundColor: corCategoria }]} />
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {nomeCategoria}
                  </Text>
                </View>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {compromisso.hora}
              </Text>
            </View>
          </View>

          {/* Botões de ação da direita */}
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); onEdit(); }} 
              style={styles.actionButton}
            >
              <Edit3 size={18} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); onDelete(); }} 
              style={styles.actionButton}
            >
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.infoRow, { marginTop: 8 }]}>
          <View style={styles.infoItem}>
            <View style={styles.bellContainer}>
              {compromisso.notificacaoConfig?.notifications?.some(n => n.enabled) ? (
                <Bell size={14} color={colors.primary} />
              ) : (
                <BellOff size={14} color={colors.text.tertiary} />
              )}
            </View>
            <Text style={[typography.caption, { color: compromisso.notificacaoConfig?.notifications?.some(n => n.enabled) ? colors.primary : colors.text.tertiary }]}>
              {getMultipleNotificationText(compromisso.notificacaoConfig)}
            </Text>
          </View>
        </View>

        {compromisso.descricao && (
          <Text style={[
            typography.caption,
            { color: colors.text.secondary, lineHeight: 18, marginTop: 8 },
            compromisso.concluido && { textDecorationLine: 'line-through' },
          ]}>
            {compromisso.descricao}
          </Text>
        )}

        {isCompromissoExpired && !compromisso.concluido && (
          <Text style={[typography.caption, { color: colors.danger, fontWeight: '600', marginTop: 8 }]}>
            Pendente
          </Text>
        )}
      </TouchableOpacity>
    </BaseCard>
  );r
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    checkButton: { marginRight: 12, marginTop: 2 },
    titleContainer: { flex: 1 },
    categoria: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    categoriaIndicator: { width: 8, height: 8, borderRadius: 4 },
    actions: { flexDirection: 'row', gap: 8 },
    actionButton: { padding: 4 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    bellContainer: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
    badge: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger, borderRadius: 6, minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontSize: 8, color: '#FFF', fontWeight: 'bold' }
  });
}