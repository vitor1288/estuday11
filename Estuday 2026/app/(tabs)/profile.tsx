import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, BookOpen, Settings, Info, Trash2, ChartBar as BarChart3, Camera, Edit3, Check, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEstuday } from '@/contexts/StudayContext';

export default function ProfileScreen() {
  const { state, dispatch, updateProfile } = useEstuday();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.userProfile.nome);

  const handleClearData = () => {
    Alert.alert(
      'Limpar todos os dados',
      'Esta ação irá remover todos os seus compromissos, anotações e dados do perfil (nome e foto). Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpar todos os dados do AsyncStorage, incluindo o perfil
              await AsyncStorage.multiRemove([
                '@estuday:compromissos',
                '@estuday:anotacoes',
                '@estuday:userProfile',
              ]);
              
              // Resetar o estado para os valores padrão
              const defaultProfile = {
                nome: 'Estudante',
                fotoUri: undefined,
                isCustomized: false,
              };
              
              dispatch({ 
                type: 'LOAD_DATA', 
                payload: { 
                  compromissos: [], 
                  anotacoes: [], 
                  userProfile: defaultProfile
                } 
              });
              
              // Resetar o estado local de edição
              setTempName(defaultProfile.nome);
              setIsEditingName(false);
              
              Alert.alert('Sucesso', 'Todos os dados foram removidos, incluindo nome e foto do perfil.');
            } catch (error) {
              console.error('Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Erro ao limpar os dados. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Escolher foto',
      'Selecione uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => openImagePicker('camera') },
        { text: 'Galeria', onPress: () => openImagePicker('library') },
        ...(state.userProfile.fotoUri ? [{ text: 'Remover foto', style: 'destructive', onPress: removeProfileImage }] : []),
      ]
    );
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Erro', 'Permissão de câmera é necessária!');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Erro', 'Permissão de galeria é necessária!');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const newProfile = {
          ...state.userProfile,
          fotoUri: result.assets[0].uri,
          isCustomized: true, // Importante: sempre marcar como customizado quando adiciona foto
        };
        await updateProfile(newProfile);
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const removeProfileImage = async () => {
    try {
      // Verificar se ainda deve ser considerado customizado (se o nome não é o padrão)
      const isNameCustomized = state.userProfile.nome.trim() !== 'Estudante';
      
      const newProfile = {
        ...state.userProfile,
        fotoUri: undefined,
        isCustomized: isNameCustomized, // Manter customizado se o nome foi alterado
      };
      await updateProfile(newProfile);
      Alert.alert('Sucesso', 'Foto de perfil removida!');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      Alert.alert('Erro', 'Erro ao remover imagem. Tente novamente.');
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim().length === 0) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    try {
      // Verificar se deve ser considerado customizado
      const isNameCustomized = tempName.trim() !== 'Estudante';
      const hasCustomPhoto = !!state.userProfile.fotoUri;
      
      const newProfile = {
        ...state.userProfile,
        nome: tempName.trim(),
        isCustomized: isNameCustomized || hasCustomPhoto,
      };
      await updateProfile(newProfile);
      setIsEditingName(false);
      Alert.alert('Sucesso', 'Nome atualizado!');
    } catch (error) {
      console.error('Erro ao salvar nome:', error);
      Alert.alert('Erro', 'Erro ao salvar nome. Tente novamente.');
    }
  };

  const handleCancelEdit = () => {
    setTempName(state.userProfile.nome);
    setIsEditingName(false);
  };

  const stats = {
    totalCompromissos: state.compromissos.length,
    compromissosConcluidos: state.compromissos.filter(c => c.concluido).length,
    totalAnotacoes: state.anotacoes.length,
    taxaConclusao: state.compromissos.length > 0 
      ? Math.round((state.compromissos.filter(c => c.concluido).length / state.compromissos.length) * 100)
      : 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
              {state.userProfile.fotoUri ? (
                <Image source={{ uri: state.userProfile.fotoUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#3B82F6" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              {isEditingName ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Digite seu nome"
                    maxLength={30}
                    autoFocus
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
                      <Check size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <Text style={styles.profileName}>{state.userProfile.nome}</Text>
                  <TouchableOpacity 
                    style={styles.editNameButton} 
                    onPress={() => setIsEditingName(true)}
                  >
                    <Edit3 size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.profileSubtitle}>Usuário do Estuday</Text>
            </View>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <BookOpen size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.totalCompromissos}</Text>
              <Text style={styles.statLabel}>Total de Compromissos</Text>
            </View>
            
            <View style={styles.statCard}>
              <BarChart3 size={24} color="#10B981" />
              <Text style={styles.statNumber}>{stats.compromissosConcluidos}</Text>
              <Text style={styles.statLabel}>Concluídos</Text>
            </View>
            
            <View style={styles.statCard}>
              <Settings size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{stats.totalAnotacoes}</Text>
              <Text style={styles.statLabel}>Anotações</Text>
            </View>
            
            <View style={styles.statCard}>
              <BarChart3 size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{stats.taxaConclusao}%</Text>
              <Text style={styles.statLabel}>Taxa de Conclusão</Text>
            </View>
          </View>
        </View>

        {/* Sobre o App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Estuday</Text>
          
          <View style={styles.infoCard}>
            <Info size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Versão do App</Text>
              <Text style={styles.infoText}>1.0.0</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <BookOpen size={20} color="#10B981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Sobre o Estuday</Text>
              <Text style={styles.infoText}>
                O Estuday é seu companheiro de estudos, ajudando você a organizar compromissos, 
                fazer anotações e manter o foco nos seus objetivos acadêmicos.
              </Text>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <TouchableOpacity style={styles.dangerCard} onPress={handleClearData}>
            <Trash2 size={20} color="#EF4444" />
            <View style={styles.infoContent}>
              <Text style={styles.dangerTitle}>Limpar todos os dados</Text>
              <Text style={styles.dangerText}>
                Remove todos os compromissos e anotações. Esta ação não pode ser desfeita.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Desenvolvido especialmente para estudantes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  editNameButton: {
    padding: 4,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingVertical: 4,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 6,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    padding: 6,
    borderRadius: 6,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  dangerCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  dangerText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});