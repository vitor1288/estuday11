import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Edit3, Trash2, CheckCircle, Circle, Bell, BellOff } from 'lucide-react-native';
import { Compromisso, getNotificationText } from '@/contexts/StudayContext';
import { formatDateBR, isExpired } from '@/utils/dateUtils';
import { BaseCard } from '@/components/BaseCard/BaseCard';
import { colors } from '@/components/theme/colors';
import { MultipleNotificationConfig } from '@/components/NotificationSelector/NotificationSelector';

interface CompromissoCardProps {
  compromisso: Compromisso;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  variant?: 'compromisso' | 'compromisso-modal';
  onPress?: () => void;
}

const getCategoriaColor = (categoria: string) => {
  switch (categoria) {
    case 'aula':
      return colors.category.aula;
    case 'prova':
      return colors.category.prova;
    case 'trabalho':
      return colors.category.trabalho;
    case 'outro':
      return colors.category.outro;
    default:
      return colors.text.secondary;
  }
};

const getCategoriaLabel = (categoria: string) => {
  switch (categoria) {
    case 'aula':
      return 'Aula';
    case 'prova':
      return 'Prova';
    case 'trabalho':
      return 'Trabalho';
    case 'outro':
      return 'Outro';
    default:
      return 'Outro';
  }
};

// Função para obter texto das múltiplas notificações
const getMultipleNotificationText = (config?: MultipleNotificationConfig): string => {
  if (!config || !config.notifications || config.notifications.length === 0) {
    return 'Sem notificação';
  }
  
  const enabledNotifications = config.notifications.filter(n => n.enabled);
  
  if (enabledNotifications.length === 0) {
    return 'Sem notificação';
  }
  
  if (enabledNotifications.length === 1) {
    return getNotificationText(enabledNotifications[0]);
  }
  
  return `${enabledNotifications.length} lembretes`;
};

export function CompromissoCard({ 
  compromisso, 
  onEdit, 
  onDelete, 
  onToggleComplete, 
  variant = 'compromisso',
  onPress 
}: CompromissoCardProps) {
  const categoriaColor = getCategoriaColor(compromisso.categoria);
  const isCompromissoExpired = isExpired(compromisso.data, compromisso.hora) && !compromisso.concluido;
  
  const getCardStatus = () => {
    if (compromisso.concluido) return 'completed';
    if (isCompromissoExpired) return 'expired';
    return 'normal';
  };

  // Converter notificationConfig antiga para nova estrutura se necessário
  const getNotificationConfig = (): MultipleNotificationConfig => {
    // Se já tem a nova estrutura (múltiplas notificações)
    if (compromisso.multipleNotificationConfig) {
      return compromisso.multipleNotificationConfig;
    }
    
    // Se tem a estrutura antiga (single notification)
    if (compromisso.notificationConfig) {
      return {
        notifications: compromisso.notificationConfig.enabled 
          ? [compromisso.notificationConfig]
          : []
      };
    }
    
    // Padrão: sem notificação
    return { notifications: [] };
  };

  const notificationConfig = getNotificationConfig();
  const hasNotifications = notificationConfig.notifications.length > 0;

  return (
    <BaseCard
      variant={variant}
      sideBarColor={categoriaColor}
      status={getCardStatus()}
      onPress={onPress}
    >
      {/* Header com título e ações */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onToggleComplete} style={styles.checkButton}>
          {compromisso.concluido ? (
            <CheckCircle size={20} color={colors.success} />
          ) : (
            <Circle size={20} color={colors.text.secondary} />
          )}
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[
            styles.titulo,
            compromisso.concluido && styles.tituloCompleted
          ]}>
            {compromisso.titulo}
          </Text>
          <View style={styles.categoria}>
            <View style={[styles.categoriaIndicator, { backgroundColor: categoriaColor }]} />
            <Text style={styles.categoriaText}>
              {getCategoriaLabel(compromisso.categoria)}
            </Text>
          </View>
        </View>

        {/* Mostrar ações apenas se não for modal ou se for modal sem onPress */}
        {(variant !== 'compromisso-modal' || !onPress) && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Informações de data, hora e notificação */}
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Clock size={14} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {formatDateBR(compromisso.data)} às {compromisso.hora}
            </Text>
          </View>
          
          {/* Indicador de notificação discreto */}
          <View style={styles.infoItem}>
            <View style={styles.bellContainer}>
              {hasNotifications ? (
                <>
                  <Bell size={12} color={colors.primary} />
                  {notificationConfig.notifications.length > 1 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{notificationConfig.notifications.length}</Text>
                    </View>
                  )}
                </>
              ) : (
                <BellOff size={12} color={colors.text.tertiary} />
              )}
            </View>
            <Text style={[
              styles.notificationText,
              !hasNotifications && styles.notificationTextDisabled
            ]}>
              {getMultipleNotificationText(notificationConfig)}
            </Text>
          </View>
        </View>
      </View>

      {/* Descrição */}
      {compromisso.descricao && (
        <Text style={[
          styles.descricao,
          compromisso.concluido && styles.descricaoCompleted
        ]}>
          {compromisso.descricao}
        </Text>
      )}

      {/* Mensagem "Pendente" para compromissos vencidos */}
      {isCompromissoExpired && (
        <Text style={styles.expiredText}>Pendente</Text>
      )}
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkButton: {
    marginRight: 12,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  tituloCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  categoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoriaIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoriaText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  info: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bellContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.danger,
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.text.white,
  },
  notificationText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  notificationTextDisabled: {
    color: colors.text.tertiary,
  },
  descricao: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  descricaoCompleted: {
    textDecorationLine: 'line-through',
  },
  expiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    marginTop: 8,
  },
});