import React from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { BaseCardProps } from '../types/card.types';
import { createCardStyles, baseCardStyles, variantStyles } from './BaseCard.styles';

export function BaseCard({
  variant,
  children,
  sideBarColor,
  status = 'normal',
  onPress,
  showShadow = true,
  style,
}: BaseCardProps) {
  const cardStyle = createCardStyles(variant, status, showShadow);
  
  // Determinar cor da barra lateral
  const getSideBarColor = () => {
    if (sideBarColor) return sideBarColor;
    
    switch (variant) {
      case 'anotacao':
        return colors.note.primary;
      case 'compromisso':
      case 'compromisso-modal':
        return colors.primary; // Cor padrão caso não seja especificada
      default:
        return colors.primary;
    }
  };

  // Determinar largura da barra lateral baseada na variante
  const getSideBarWidth = () => {
    switch (variant) {
      case 'compromisso':
      case 'compromisso-modal':
        return 4;
      case 'anotacao':
        return 4;
      default:
        return 4;
    }
  };

  // Estilo específico da variante
  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'compromisso':
        return variantStyles.compromissoContainer;
      case 'anotacao':
        return variantStyles.anotacaoContainer;
      case 'compromisso-modal':
        return variantStyles.compromissoModalContainer;
      default:
        return {};
    }
  };

  const renderCard = () => (
    <View style={[cardStyle, getVariantContainerStyle(), style]}>
      {/* Barra lateral colorida */}
      <View
        style={[
          baseCardStyles.sideBar,
          {
            backgroundColor: getSideBarColor(),
            width: getSideBarWidth(),
          },
        ]}
      />
      
      {/* Conteúdo do cartão */}
      <View style={baseCardStyles.content}>
        {children}
      </View>
    </View>
  );

  // Se houver onPress, envolver em um componente clicável
  if (onPress) {
    // Para compromisso-modal, usar Pressable com feedback visual
    if (variant === 'compromisso-modal') {
      return (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            variantStyles.modalPressable,
            pressed && variantStyles.modalPressed,
          ]}
        >
          {renderCard()}
        </Pressable>
      );
    }
    
    // Para outros casos, usar TouchableOpacity
    return (
      <TouchableOpacity
        onPress={onPress}
        style={baseCardStyles.pressable}
        activeOpacity={0.7}
      >
        {renderCard()}
      </TouchableOpacity>
    );
  }

  // Retornar cartão sem clique
  return renderCard();
}