import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationConfig {
  enabled: boolean;
  tempo: number;
  unidade: 'minutos' | 'horas' | 'dias';
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

export interface Materia {
  id: string;
  nome: string;
}

export interface Compromisso {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  categoria?: string;      
  categoriaId?: string;    
  materiaId?: string;      
  concluido: boolean;
  notificationId?: string;
  // CORRIGIDO: Nome idêntico ao backup (inglês) e tipo flexível para aceitar os dois formatos
  notificationConfig?: any; 
}

export interface AnotacaoCalendario {
  id: string;
  data: string;
  texto: string;
}

export interface UserProfile {
  nome: string;
  fotoUri?: string;
  isCustomized?: boolean;
}

interface EstudayState {
  compromissos: Compromisso[];
  anotacoes: AnotacaoCalendario[];
  userProfile: UserProfile;
  categorias: Categoria[]; 
  materias: Materia[];     
  loading: boolean;
}

type EstudayAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { compromissos: Compromisso[]; anotacoes: AnotacaoCalendario[]; userProfile: UserProfile; categorias: Categoria[]; materias: Materia[] } }
  | { type: 'ADD_COMPROMISSO'; payload: Compromisso }
  | { type: 'UPDATE_COMPROMISSO'; payload: Compromisso }
  | { type: 'DELETE_COMPROMISSO'; payload: string }
  | { type: 'TOGGLE_COMPROMISSO'; payload: string }
  | { type: 'ADD_ANOTACAO'; payload: AnotacaoCalendario }
  | { type: 'UPDATE_ANOTACAO'; payload: AnotacaoCalendario }
  | { type: 'DELETE_ANOTACAO'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'ADD_CATEGORIA'; payload: Categoria }
  | { type: 'UPDATE_CATEGORIA'; payload: Categoria }
  | { type: 'DELETE_CATEGORIA'; payload: string }
  | { type: 'ADD_MATERIA'; payload: Materia }
  | { type: 'UPDATE_MATERIA'; payload: Materia }
  | { type: 'DELETE_MATERIA'; payload: string };

const initialState: EstudayState = {
  compromissos: [],
  anotacoes: [],
  userProfile: { nome: 'Estudante' },
  categorias: [],
  materias: [],
  loading: true,
};

const MATERIAS_PADRAO: Materia[] = [
  { id: 'mat-1', nome: 'Matemática' },
  { id: 'mat-2', nome: 'Física' },
  { id: 'mat-3', nome: 'Química' },
  { id: 'mat-4', nome: 'Biologia' },
  { id: 'mat-5', nome: 'História' },
  { id: 'mat-6', nome: 'Geografia' },
  { id: 'mat-7', nome: 'Inglês' },
  { id: 'mat-8', nome: 'Língua Portuguesa' },
  { id: 'mat-9', nome: 'Literatura' },
  { id: 'mat-10', nome: 'Produção Textual' },
  { id: 'mat-11', nome: 'Filosofia' },
  { id: 'mat-12', nome: 'Educação Física' },
  { id: 'mat-13', nome: 'Computação' },
];

const CATEGORIAS_PADRAO: Categoria[] = [
  { id: 'cat-1', nome: 'Prova', cor: '#FF4A4A' },
  { id: 'cat-2', nome: 'Trabalho', cor: '#FF9F43' },
  { id: 'cat-3', nome: 'Apresentação', cor: '#4EA8DE' },
  { id: 'cat-4', nome: 'Atividade', cor: '#10AC84' },
  { id: 'cat-5', nome: 'Outro', cor: '#8395A7' },
];

function reducer(state: EstudayState, action: EstudayAction): EstudayState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'LOAD_DATA': return { ...state, ...action.payload, loading: false };
    case 'ADD_COMPROMISSO': return { ...state, compromissos: [...state.compromissos, action.payload] };
    case 'UPDATE_COMPROMISSO': return { ...state, compromissos: state.compromissos.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_COMPROMISSO': return { ...state, compromissos: state.compromissos.filter(c => c.id !== action.payload) };
    case 'TOGGLE_COMPROMISSO': return { ...state, compromissos: state.compromissos.map(c => c.id === action.payload ? { ...c, concluido: !c.concluido } : c) };
    case 'ADD_ANOTACAO': return { ...state, anotacoes: [...state.anotacoes, action.payload] };
    case 'UPDATE_ANOTACAO': return { ...state, anotacoes: state.anotacoes.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_ANOTACAO': return { ...state, anotacoes: state.anotacoes.filter(a => a.id !== action.payload) };
    case 'UPDATE_PROFILE': return { ...state, userProfile: action.payload };
    case 'ADD_CATEGORIA': return { ...state, categorias: [...state.categorias, action.payload] };
    case 'UPDATE_CATEGORIA': return { ...state, categorias: state.categorias.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORIA': return { ...state, categorias: state.categorias.filter(c => c.id !== action.payload) };
    case 'ADD_MATERIA': return { ...state, materias: [...state.materias, action.payload] };
    case 'UPDATE_MATERIA': return { ...state, materias: state.materias.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'DELETE_MATERIA': return { ...state, materias: state.materias.filter(m => m.id !== action.payload) };
    default: return state;
  }
}

export const NOTIFICATION_OPTIONS = [
  { id: '1', tempo: 5, unidade: 'minutos', label: '5 minutos antes' },
  { id: '2', tempo: 15, unidade: 'minutos', label: '15 minutos antes' },
  { id: '3', tempo: 30, unidade: 'minutos', label: '30 minutos antes' },
  { id: '4', tempo: 1, unidade: 'horas', label: '1 hora antes' },
  { id: '5', tempo: 1, unidade: 'dias', label: '1 dia antes' },
];

// FUNÇÃO INTELIGENTE/HÍBRIDA: Lê tanto o formato de objeto único do backup quanto o formato de array do selector
export const getNotificationText = (config?: any): string => {
  if (!config) return 'Sem notificação';
  
  // Se for o formato do NotificationSelector (Objeto com array de notificações)
  if (config.notifications && Array.isArray(config.notifications)) {
    const enabled = config.notifications.filter((n: any) => n.enabled);
    if (!enabled.length) return 'Sem notificação';
    if (enabled.length === 1) return getNotificationText(enabled[0]);
    return `${enabled.length} lembretes`;
  }

  // Se for o formato simples/antigo (Objeto direto de configuração)
  if (!config.enabled) return 'Sem notificação';
  const item = NOTIFICATION_OPTIONS.find(o => o.tempo === config.tempo && o.unidade === config.unidade);
  if (item) return item.label;
  return `${config.tempo} ${config.unidade} antes`;
};

export const EstudayContext = createContext<any>(null);
export const StudayContext = EstudayContext;

export function EstudayProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem('@compromissos', JSON.stringify(state.compromissos));
      AsyncStorage.setItem('@anotacoes', JSON.stringify(state.anotacoes));
      AsyncStorage.setItem('@profile', JSON.stringify(state.userProfile));
      AsyncStorage.setItem('@categorias', JSON.stringify(state.categorias));
      AsyncStorage.setItem('@materias', JSON.stringify(state.materias));
    }
  }, [state]);

  const loadData = async () => {
    try {
      const compromissosData = await AsyncStorage.getItem('@compromissos');
      const anotacoesData = await AsyncStorage.getItem('@anotacoes');
      const profileData = await AsyncStorage.getItem('@profile');
      const categoriasData = await AsyncStorage.getItem('@categorias');
      const materiasData = await AsyncStorage.getItem('@materias');

      const compromissos = compromissosData ? JSON.parse(compromissosData) : [];
      const anotacoes = anotacoesData ? JSON.parse(anotacoesData) : [];
      const userProfile = profileData ? JSON.parse(profileData) : { nome: 'Estudante' };
      const categorias = categoriasData ? JSON.parse(categoriasData) : CATEGORIAS_PADRAO;
      const materias = materiasData ? JSON.parse(materiasData) : MATERIAS_PADRAO;

      dispatch({ type: 'LOAD_DATA', payload: { compromissos, anotacoes, userProfile, categorias, materias } });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addCompromisso = async (compromisso: Omit<Compromisso, 'id' | 'concluido'>) => {
    const novoCompromisso: Compromisso = { ...compromisso, id: Date.now().toString(), concluido: false };
    dispatch({ type: 'ADD_COMPROMISSO', payload: novoCompromisso });
  };

  const updateCompromisso = async (id: string, compromissoData: Partial<Compromisso>) => {
    const compromisso = state.compromissos.find(c => c.id === id);
    if (compromisso) dispatch({ type: 'UPDATE_COMPROMISSO', payload: { ...compromisso, ...compromissoData } });
  };

  const deleteCompromisso = async (id: string) => dispatch({ type: 'DELETE_COMPROMISSO', payload: id });
  const toggleCompromisso = async (id: string) => dispatch({ type: 'TOGGLE_COMPROMISSO', payload: id });
  
  const addAnotacao = async (data: string, texto: string) => {
    const novaAnotacao: AnotacaoCalendario = { id: Date.now().toString(), data, texto };
    dispatch({ type: 'ADD_ANOTACAO', payload: novaAnotacao });
  };

  const updateAnotacao = async (id: string, texto: string) => {
    const anotacao = state.anotacoes.find(a => a.id === id);
    if (anotacao) dispatch({ type: 'UPDATE_ANOTACAO', payload: { ...anotacao, texto } });
  };

  const deleteAnotacao = async (id: string) => dispatch({ type: 'DELETE_ANOTACAO', payload: id });
  const updateProfile = async (profile: UserProfile) => dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  const getAnotacoesPorData = (data: string): AnotacaoCalendario[] => state.anotacoes.filter(anotacao => anotacao.data === data);
  const getCompromissosPorData = (data: string): Compromisso[] => state.compromissos.filter(compromisso => compromisso.data === data);

  return (
    <EstudayContext.Provider
      value={{
        state,
        dispatch,
        categorias: state.categorias,
        categories: state.categorias,
        materias: state.materias,
        addCompromisso,
        adicionarCompromisso: addCompromisso,
        updateCompromisso,
        deleteCompromisso,
        toggleCompromisso,
        addAnotacao,
        updateAnotacao,
        deleteAnotacao,
        updateProfile,
        getAnotacoesPorData,
        getCompromissosPorData,
        addMateria: (nome: string) => dispatch({ type: 'ADD_MATERIA', payload: { id: Date.now().toString(), nome } }),
        deleteMateria: (id: string) => dispatch({ type: 'DELETE_MATERIA', payload: id }),
        addCategoria: (nome: string, cor: string) => dispatch({ type: 'ADD_CATEGORIA', payload: { id: Date.now().toString(), nome, cor } }),
        deleteCategoria: (id: string) => dispatch({ type: 'DELETE_CATEGORIA', payload: id })
      }}
    >
      {children}
    </EstudayContext.Provider>
  );
}

export const StudayProvider = EstudayProvider;
export default EstudayProvider;

export const useEstuday = () => useContext(EstudayContext);
export const useStuday = useEstuday;