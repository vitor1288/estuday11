export type CardVariant = 'compromisso' | 'anotacao' | 'compromisso-modal';

export type CardStatus = 'normal' | 'completed' | 'expired';

export interface BaseCardProps {
  variant: CardVariant;
  children: React.ReactNode;
  sideBarColor?: string;
  status?: CardStatus;
  onPress?: () => void;
  showShadow?: boolean;
  style?: any;
}

export interface CardStyleConfig {
  backgroundColor: string;
  padding: number;
  marginBottom: number;
  borderRadius: number;
  shadowConfig: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  sideBarWidth: number;
}