import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationConfig {
  enabled: boolean;
  tempo: number; // quantidade de tempo
  unidade: 'minutos' | 'horas' | 'dias'; // unidade de tempo
}

export interface Compromisso {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  categoria: 'aula' | 'prova' | 'trabalho' | 'outro';
  concluido: boolean;
  notificationId?: string;
  notificationConfig?: NotificationConfig; // Nova propriedade para configuração da notificação
}

export interface AnotacaoCalendario {
  id: string;
  data: string;
  texto: string;
}

export interface UserProfile {
  nome: string;
  fotoUri?: string;
  isCustomized?: boolean; // Nova propriedade para saber se foi personalizado
}

interface EstudayState {
  compromissos: Compromisso[];
  anotacoes: AnotacaoCalendario[];
  userProfile: UserProfile;
  loading: boolean;
}

type EstudayAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { compromissos: Compromisso[]; anotacoes: AnotacaoCalendario[]; userProfile: UserProfile } }
  | { type: 'ADD_COMPROMISSO'; payload: Compromisso }
  | { type: 'UPDATE_COMPROMISSO'; payload: Compromisso }
  | { type: 'DELETE_COMPROMISSO'; payload: string }
  | { type: 'ADD_ANOTACAO'; payload: AnotacaoCalendario }
  | { type: 'UPDATE_ANOTACAO'; payload: AnotacaoCalendario }
  | { type: 'DELETE_ANOTACAO'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile };

const initialState: EstudayState = {
  compromissos: [],
  anotacoes: [],
  userProfile: {
    nome: 'Estudante',
    fotoUri: undefined,
    isCustomized: false,
  },
  loading: false,
};

// Configurar notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Opções de notificação predefinidas
export const NOTIFICATION_OPTIONS = [
  { label: 'Sem notificação', tempo: 0, unidade: 'minutos' as const, enabled: false },
  { label: '15 minutos antes', tempo: 15, unidade: 'minutos' as const, enabled: true },
  { label: '30 minutos antes', tempo: 30, unidade: 'minutos' as const, enabled: true },
  { label: '1 hora antes', tempo: 1, unidade: 'horas' as const, enabled: true },
  { label: '2 horas antes', tempo: 2, unidade: 'horas' as const, enabled: true },
  { label: '3 horas antes', tempo: 3, unidade: 'horas' as const, enabled: true },
  { label: '6 horas antes', tempo: 6, unidade: 'horas' as const, enabled: true },
  { label: '12 horas antes', tempo: 12, unidade: 'horas' as const, enabled: true },
  { label: '1 dia antes', tempo: 1, unidade: 'dias' as const, enabled: true },
  { label: '2 dias antes', tempo: 2, unidade: 'dias' as const, enabled: true },
  { label: '3 dias antes', tempo: 3, unidade: 'dias' as const, enabled: true },
  { label: '1 semana antes', tempo: 7, unidade: 'dias' as const, enabled: true },
];

// Função para converter tempo para milissegundos
const convertToMilliseconds = (tempo: number, unidade: 'minutos' | 'horas' | 'dias'): number => {
  switch (unidade) {
    case 'minutos':
      return tempo * 60 * 1000;
    case 'horas':
      return tempo * 60 * 60 * 1000;
    case 'dias':
      return tempo * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};

// Função para obter texto descritivo da notificação
export const getNotificationText = (config: NotificationConfig): string => {
  if (!config.enabled) return 'Sem notificação';
  
  const option = NOTIFICATION_OPTIONS.find(
    opt => opt.tempo === config.tempo && opt.unidade === config.unidade && opt.enabled
  );
  
  return option?.label || `${config.tempo} ${config.unidade} antes`;
};

// Função para obter saudação baseada na hora
export const getGreeting = (nome: string, isCustomized: boolean = false): string => {
  const hour = new Date().getHours();
  
  // Se não foi customizado, usa a saudação padrão
  if (!isCustomized) {
    if (hour >= 5 && hour < 12) {
      return 'Bom dia, seja bem vindo!';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde, seja bem vindo!';
    } else {
      return 'Boa noite, seja bem vindo!';
    }
  }
  
  // Se foi customizado, usa o nome personalizado
  if (hour >= 5 && hour < 12) {
    return `Bom dia, ${nome}!`;
  } else if (hour >= 12 && hour < 18) {
    return `Boa tarde, ${nome}!`;
  } else {
    return `Boa noite, ${nome}!`;
  }
};

function estudayReducer(state: EstudayState, action: EstudayAction): EstudayState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOAD_DATA':
      return {
        ...state,
        compromissos: action.payload.compromissos,
        anotacoes: action.payload.anotacoes,
        userProfile: action.payload.userProfile,
        loading: false,
      };
    case 'ADD_COMPROMISSO':
      return {
        ...state,
        compromissos: [...state.compromissos, action.payload],
      };
    case 'UPDATE_COMPROMISSO':
      return {
        ...state,
        compromissos: state.compromissos.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_COMPROMISSO':
      return {
        ...state,
        compromissos: state.compromissos.filter(c => c.id !== action.payload),
      };
    case 'ADD_ANOTACAO':
      return {
        ...state,
        anotacoes: [...state.anotacoes, action.payload],
      };
    case 'UPDATE_ANOTACAO':
      return {
        ...state,
        anotacoes: state.anotacoes.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ANOTACAO':
      return {
        ...state,
        anotacoes: state.anotacoes.filter(a => a.id !== action.payload),
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        userProfile: action.payload,
      };
    default:
      return state;
  }
}

interface EstudayContextType {
  state: EstudayState;
  dispatch: React.Dispatch<EstudayAction>;
  addCompromisso: (compromisso: Omit<Compromisso, 'id'>) => Promise<void>;
  updateCompromisso: (compromisso: Compromisso) => Promise<void>;
  deleteCompromisso: (id: string) => Promise<void>;
  addAnotacao: (anotacao: Omit<AnotacaoCalendario, 'id'>) => Promise<void>;
  updateAnotacao: (anotacao: AnotacaoCalendario) => Promise<void>;
  deleteAnotacao: (id: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  getAnotacoesPorData: (data: string) => AnotacaoCalendario[];
  getCompromissosPorData: (data: string) => Compromisso[];
}

const EstudayContext = createContext<EstudayContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPROMISSOS: '@estuday:compromissos',
  ANOTACOES: '@estuday:anotacoes',
  USER_PROFILE: '@estuday:userProfile',
};

// Função para agendar notificação personalizada
const scheduleNotification = async (compromisso: Omit<Compromisso, 'id' | 'notificationId'>): Promise<string | undefined> => {
  if (Platform.OS === 'web') {
    return undefined;
  }

  // Verificar se notificação está habilitada
  if (!compromisso.notificationConfig?.enabled) {
    return undefined;
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return undefined;
    }

    const compromissoDateTime = new Date(`${compromisso.data}T${compromisso.hora}`);
    const { tempo, unidade } = compromisso.notificationConfig;
    
    // Calcular tempo de antecedência em milissegundos
    const antecedenciaMs = convertToMilliseconds(tempo, unidade);
    const notificationTime = new Date(compromissoDateTime.getTime() - antecedenciaMs);

    if (notificationTime <= new Date()) {
      return undefined; // Não agendar se a data já passou
    }

    // Texto personalizado baseado no tempo de antecedência
    let bodyText = '';
    if (unidade === 'minutos') {
      bodyText = `${compromisso.titulo} começará em ${tempo} ${tempo === 1 ? 'minuto' : 'minutos'}`;
    } else if (unidade === 'horas') {
      bodyText = `${compromisso.titulo} começará em ${tempo} ${tempo === 1 ? 'hora' : 'horas'}`;
    } else {
      if (tempo === 1) {
        bodyText = `${compromisso.titulo} está agendado para amanhã às ${compromisso.hora}`;
      } else {
        bodyText = `${compromisso.titulo} está agendado para ${tempo} dias às ${compromisso.hora}`;
      }
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete de Compromisso',
        body: bodyText,
        data: { 
          compromissoId: Date.now().toString(),
          categoria: compromisso.categoria,
        },
      },
      trigger: notificationTime,
    });

    return notificationId;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return undefined;
  }
};

// Função para cancelar notificação
const cancelNotification = async (notificationId: string) => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
  }
};

export function EstudayProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(estudayReducer, initialState);

  // Carregar dados do AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  // Salvar dados sempre que o estado mudar (exceto loading)
  useEffect(() => {
    if (!state.loading) {
      saveData();
    }
  }, [state.compromissos, state.anotacoes, state.userProfile, state.loading]);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [compromissosData, anotacoesData, userProfileData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.COMPROMISSOS),
        AsyncStorage.getItem(STORAGE_KEYS.ANOTACOES),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
      ]);

      const compromissos = compromissosData ? JSON.parse(compromissosData) : [];
      const anotacoes = anotacoesData ? JSON.parse(anotacoesData) : [];
      const userProfile = userProfileData ? JSON.parse(userProfileData) : { 
        nome: 'Estudante', 
        fotoUri: undefined,
        isCustomized: false 
      };

      // Migrar dados antigos se não tiverem a propriedade isCustomized
      if (userProfile.isCustomized === undefined) {
        userProfile.isCustomized = (userProfile.nome !== 'Estudante') || !!userProfile.fotoUri;
      }

      // Migrar compromissos antigos sem configuração de notificação
      const compromissosMigrados = compromissos.map((c: any) => ({
        ...c,
        notificationConfig: c.notificationConfig || {
          enabled: true,
          tempo: 1,
          unidade: 'dias'
        }
      }));

      dispatch({ type: 'LOAD_DATA', payload: { compromissos: compromissosMigrados, anotacoes, userProfile } });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.COMPROMISSOS, JSON.stringify(state.compromissos)),
        AsyncStorage.setItem(STORAGE_KEYS.ANOTACOES, JSON.stringify(state.anotacoes)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(state.userProfile)),
      ]);
      console.log('Dados salvos com sucesso:', state.userProfile); // Debug
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const addCompromisso = async (compromisso: Omit<Compromisso, 'id'>) => {
    // Se não tem configuração de notificação, usar padrão (1 dia antes)
    const compromissoComNotificacao = {
      ...compromisso,
      notificationConfig: compromisso.notificationConfig || {
        enabled: true,
        tempo: 1,
        unidade: 'dias' as const
      }
    };

    const notificationId = await scheduleNotification(compromissoComNotificacao);
    const novoCompromisso: Compromisso = {
      ...compromissoComNotificacao,
      id: Date.now().toString(),
      notificationId,
    };
    dispatch({ type: 'ADD_COMPROMISSO', payload: novoCompromisso });
  };

  const updateCompromisso = async (compromisso: Compromisso) => {
    // Cancelar notificação anterior se existir
    if (compromisso.notificationId) {
      await cancelNotification(compromisso.notificationId);
    }

    // Agendar nova notificação
    const notificationId = await scheduleNotification(compromisso);
    const compromissoAtualizado = { ...compromisso, notificationId };
    
    dispatch({ type: 'UPDATE_COMPROMISSO', payload: compromissoAtualizado });
  };

  const deleteCompromisso = async (id: string) => {
    const compromisso = state.compromissos.find(c => c.id === id);
    if (compromisso?.notificationId) {
      await cancelNotification(compromisso.notificationId);
    }
    dispatch({ type: 'DELETE_COMPROMISSO', payload: id });
  };

  const addAnotacao = async (anotacao: Omit<AnotacaoCalendario, 'id'>) => {
    const novaAnotacao: AnotacaoCalendario = {
      ...anotacao,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_ANOTACAO', payload: novaAnotacao });
  };

  const updateAnotacao = async (anotacao: AnotacaoCalendario) => {
    dispatch({ type: 'UPDATE_ANOTACAO', payload: anotacao });
  };

  const deleteAnotacao = async (id: string) => {
    dispatch({ type: 'DELETE_ANOTACAO', payload: id });
  };

  const updateProfile = async (profile: UserProfile) => {
    console.log('Atualizando perfil:', profile); // Debug
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  };

  const getAnotacoesPorData = (data: string): AnotacaoCalendario[] => {
    return state.anotacoes.filter(anotacao => anotacao.data === data);
  };

  const getCompromissosPorData = (data: string): Compromisso[] => {
    return state.compromissos.filter(compromisso => compromisso.data === data);
  };

  return (
    <EstudayContext.Provider
      value={{
        state,
        dispatch,
        addCompromisso,
        updateCompromisso,
        deleteCompromisso,
        addAnotacao,
        updateAnotacao,
        deleteAnotacao,
        updateProfile,
        getAnotacoesPorData,
        getCompromissosPorData,
      }}
    >
      {children}
    </EstudayContext.Provider>
  );
}

export function useEstuday() {
  const context = useContext(EstudayContext);
  if (context === undefined) {
    throw new Error('useEstuday must be used within a EstudayProvider');
  }
  return context;
}