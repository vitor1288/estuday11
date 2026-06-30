// components/CustomAlert.tsx  (substitua o conteúdo)
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onClose,
  onConfirm,
}: CustomAlertProps) {
  const { colors, typography } = useTheme();

  if (!visible) return null;

  const isConfirm = type === 'confirm' || (type === 'warning' && !!onConfirm);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={48} color={colors.success || '#10B981'} />;
      case 'error': return <AlertCircle size={48} color="#EF4444" />;
      case 'warning':
      case 'confirm': return <AlertTriangle size={48} color={colors.warning || '#F59E0B'} />;
      default: return <Info size={48} color={colors.primary} />;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <X size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>{getIcon()}</View>

          <Text style={[typography.h3, { color: colors.text.primary, textAlign: 'center', marginTop: 16 }]}>
            {title}
          </Text>

          <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 8 }]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            {isConfirm && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.background.tertiary }]}
                onPress={onClose}
              >
                <Text style={[typography.body, { color: colors.text.primary, fontWeight: '600' }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: type === 'error' || type === 'confirm' ? '#EF4444' : colors.primary },
              ]}
              onPress={handleConfirm}
            >
              <Text style={[typography.body, { color: '#FFF', fontWeight: '600' }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  closeIcon: { position: 'absolute', top: 16, right: 16 },
  iconContainer: { marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 28, width: '100%' },
  button: { flex: 1, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});