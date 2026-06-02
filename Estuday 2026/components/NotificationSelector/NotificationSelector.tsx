import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Bell, BellOff, Check, X, Plus, Minus } from 'lucide-react-native';
import { NotificationConfig, NOTIFICATION_OPTIONS, getNotificationText } from '@/contexts/StudayContext';
import { colors } from '@/components/theme/colors';

// Novo tipo para múltiplas notificações
export interface MultipleNotificationConfig {
  notifications: NotificationConfig[];
}

interface NotificationSelectorProps {
  value?: MultipleNotificationConfig;
  onValueChange: (config: MultipleNotificationConfig) => void;
  label?: string;
}

// Valor padrão para evitar erros (1 dia antes)
const DEFAULT_CONFIG: MultipleNotificationConfig = {
  notifications: [
    {
      enabled: true,
      tempo: 1,
      unidade: 'dias'
    }
  ]
};

// Função para obter texto descritivo das múltiplas notificações
const getMultipleNotificationText = (config: MultipleNotificationConfig): string => {
  const notifications = config?.notifications || [];
  const enabledNotifications = notifications.filter(n => n.enabled);
  
  if (enabledNotifications.length === 0) {
    return 'Sem notificação';
  }
  
  if (enabledNotifications.length === 1) {
    return getNotificationText(enabledNotifications[0]);
  }
  
  return `${enabledNotifications.length} lembretes configurados`;
};

export function NotificationSelector({ 
  value = DEFAULT_CONFIG, 
  onValueChange, 
  label = 'Notificação' 
}: NotificationSelectorProps) {
  // Garantir que value sempre tenha a estrutura correta
  const safeValue = value && value.notifications ? value : DEFAULT_CONFIG;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelection, setTempSelection] = useState<MultipleNotificationConfig>(safeValue);

  // Atualizar tempSelection sempre que o valor prop mudar
  useEffect(() => {
    setTempSelection(safeValue);
  }, [value]);

  // Atualizar tempSelection quando o modal abrir para garantir que está sincronizado
  const handleOpenModal = () => {
    setTempSelection(safeValue);
    setModalVisible(true);
  };

  const handleSave = () => {
    onValueChange(tempSelection);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempSelection(safeValue);
    setModalVisible(false);
  };

  const handleOptionPress = (option: typeof NOTIFICATION_OPTIONS[0]) => {
    if (!option.enabled) {
      // Se for "Sem notificação", limpar todas as notificações
      setTempSelection({ notifications: [] });
      return;
    }

    const newConfig: NotificationConfig = {
      enabled: option.enabled,
      tempo: option.tempo,
      unidade: option.unidade,
    };

    const currentNotifications = tempSelection.notifications || [];
    const existingIndex = currentNotifications.findIndex(
      n => n.tempo === option.tempo && n.unidade === option.unidade
    );

    if (existingIndex >= 0) {
      // Remove se já existe
      const newNotifications = currentNotifications.filter((_, index) => index !== existingIndex);
      setTempSelection({ notifications: newNotifications });
    } else {
      // Adiciona se não existe
      setTempSelection({ 
        notifications: [...currentNotifications, newConfig]
      });
    }
  };

  const isOptionSelected = (option: typeof NOTIFICATION_OPTIONS[0]) => {
    const currentNotifications = tempSelection.notifications || [];
    
    if (!option.enabled) {
      return currentNotifications.length === 0;
    }
    
    return currentNotifications.some(
      n => n.tempo === option.tempo && n.unidade === option.unidade && n.enabled
    );
  };

  const hasNotifications = (safeValue.notifications || []).length > 0;

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity 
          style={styles.selector} 
          onPress={handleOpenModal}
        >
          <View style={styles.selectorContent}>
            {hasNotifications ? (
              <View style={styles.bellContainer}>
                <Bell size={20} color={colors.primary} />
                {(safeValue.notifications || []).length > 1 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{(safeValue.notifications || []).length}</Text>
                  </View>
                )}
              </View>
            ) : (
              <BellOff size={20} color={colors.text.tertiary} />
            )}
            <Text style={[
              styles.selectorText,
              !hasNotifications && styles.selectorTextDisabled
            ]}>
              {getMultipleNotificationText(safeValue)}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Lista de notificações selecionadas */}
        {hasNotifications && (
          <View style={styles.selectedList}>
            {(safeValue.notifications || []).map((notification, index) => (
              <View key={index} style={styles.selectedItem}>
                <Bell size={12} color={colors.primary} />
                <Text style={styles.selectedText}>
                  {getNotificationText(notification)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Configurar Notificações</Text>
            <TouchableOpacity onPress={handleSave} style={styles.modalButton}>
              <Check size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Quando você deseja ser lembrado?</Text>
            <Text style={styles.sectionSubtitle}>Você pode selecionar múltiplos horários</Text>
            
            <View style={styles.optionsList}>
              {NOTIFICATION_OPTIONS.map((option, index) => {
                const selected = isOptionSelected(option);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionItem,
                      selected && styles.optionItemSelected
                    ]}
                    onPress={() => handleOptionPress(option)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[
                        styles.optionIcon,
                        selected && styles.optionIconSelected
                      ]}>
                        {option.enabled ? (
                          <Bell size={20} color={selected ? colors.text.white : colors.primary} />
                        ) : (
                          <BellOff size={20} color={selected ? colors.text.white : colors.text.tertiary} />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                        !option.enabled && styles.optionTextDisabled
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                    
                    {selected && option.enabled ? (
                      <Minus size={20} color={colors.text.white} />
                    ) : selected && !option.enabled ? (
                      <Check size={20} color={colors.text.white} />
                    ) : option.enabled ? (
                      <Plus size={20} color={colors.text.secondary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Resumo das seleções */}
            {(tempSelection.notifications || []).length > 0 && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>📅 Resumo dos lembretes:</Text>
                {(tempSelection.notifications || []).map((notification, index) => (
                  <Text key={index} style={styles.summaryItem}>
                    • {getNotificationText(notification)}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 Dica</Text>
              <Text style={styles.infoText}>
                Você pode configurar múltiplos lembretes para o mesmo compromisso. Por exemplo: um lembrete 1 dia antes e outro 1 hora antes.
              </Text>
              <Text style={styles.infoText}>
                As notificações funcionam apenas no app mobile. No navegador web, você não receberá notificações push.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.white,
  },
  selectorText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  selectorTextDisabled: {
    color: colors.text.tertiary,
  },
  selectedList: {
    marginTop: 8,
    gap: 4,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsList: {
    gap: 8,
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    ...colors.shadow.light,
  },
  optionItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.text.white,
  },
  optionTextDisabled: {
    color: colors.text.tertiary,
  },
  summaryBox: {
    backgroundColor: colors.background.success,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: colors.success,
    marginBottom: 2,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 8,
  },
});