import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, User, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserProfile } from '@/contexts/StudayContext';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
}

export default function ProfileEditModal({
  visible,
  onClose,
  userProfile,
  onSave,
}: ProfileEditModalProps) {
  const [nome, setNome] = useState(userProfile.nome);
  const [fotoUri, setFotoUri] = useState(userProfile.fotoUri);
  const [loading, setLoading] = useState(false);

  const handleImagePicker = () => {
    Alert.alert(
      'Escolher foto',
      'Selecione uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => openImagePicker('camera') },
        { text: 'Galeria', onPress: () => openImagePicker('library') },
        ...(fotoUri ? [{ text: 'Remover foto', style: 'destructive', onPress: () => setFotoUri(undefined) }] : []),
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
        setFotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const handleSave = async () => {
    if (nome.trim().length === 0) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    try {
      setLoading(true);
      
      // Determina se foi customizado baseado no nome e foto
      const isNameCustomized = nome.trim() !== 'Estudante';
      const hasCustomPhoto = !!fotoUri;
      
      await onSave({
        nome: nome.trim(),
        fotoUri,
        isCustomized: isNameCustomized || hasCustomPhoto,
      });
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNome(userProfile.nome);
    setFotoUri(userProfile.fotoUri);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={loading}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            <Check size={20} color={loading ? '#94A3B8' : '#3B82F6'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Foto do perfil */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#94A3B8" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Toque para alterar foto</Text>
          </View>

          {/* Nome */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              maxLength={30}
              autoCapitalize="words"
            />
            <Text style={styles.inputHelper}>
              {nome.length}/30 caracteres
            </Text>
          </View>

          {/* Preview da saudação */}
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Prévia da saudação:</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewText}>
                {getGreetingPreview(
                  nome.trim() || 'Estudante', 
                  (nome.trim() !== 'Estudante' && nome.trim() !== '') || !!fotoUri
                )}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function getGreetingPreview(nome: string, isCustomized: boolean = true): string {
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  saveButton: {
    padding: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  inputHelper: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'right',
  },
  previewSection: {
    marginTop: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
});