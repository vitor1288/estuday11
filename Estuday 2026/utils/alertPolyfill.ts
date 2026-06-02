// utils/alertPolyfill.ts
import { Platform, Alert } from 'react-native';

// Sobrescrever o Alert apenas para web
if (Platform.OS === 'web') {
  const originalAlert = Alert.alert;
  
  Alert.alert = (title: string, message?: string, buttons?: any[]) => {
    const confirmMessage = message ? `${title}\n\n${message}` : title;
    
    if (buttons && buttons.length > 1) {
      // Se tem mais de um botão, usar confirm
      const result = window.confirm(confirmMessage);
      
      if (result) {
        // Procurar botão que não seja 'cancel'
        const actionButton = buttons.find(btn => btn.style !== 'cancel');
        if (actionButton && actionButton.onPress) {
          actionButton.onPress();
        }
      } else {
        // Procurar botão de cancelar
        const cancelButton = buttons.find(btn => btn.style === 'cancel');
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else if (buttons && buttons.length === 1) {
      // Se tem apenas um botão, usar alert simples
      window.alert(confirmMessage);
      if (buttons[0].onPress) {
        buttons[0].onPress();
      }
    } else {
      // Sem botões, apenas alert
      window.alert(confirmMessage);
    }
  };
}