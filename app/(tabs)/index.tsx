import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Calendar, Clock, CircleCheck as CheckCircle, TrendingUp, User, Plus } from 'lucide-react-native';
import { useStuday } from '@/contexts/StudayContext';
import { isFutureDate, isToday } from '@/utils/dateUtils';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { BaseButton } from '@/components/BaseButton/BaseButton';

export default function HomeScreen() {
  // Coletando os estados de dentro da propriedade 'state' ou diretamente do hook useStuday
  const context = useStuday();
  
  // Extraindo os dados blindando contra undefined
  const compromissos = context?.state?.compromissos || context?.compromissos || [];
  const anotacoes = context?.state?.anotacoes || context?.anotacoes || [];
  const materias = context?.state?.materias || context?.materias || [];
  const userProfile = context?.state?.userProfile || context?.userProfile || { nome: 'Estudante' };

  // Pegando a função de saudação com uma de backup caso não exista no contexto
  const obterSaudacao = context?.getGreeting || ((nome?: string) => {
    const hour = new Date().getHours();
    let saudacao = 'Boa noite';
    if (hour >= 5 && hour < 12) saudacao = 'Bom dia';
    else if (hour >= 12 && hour < 18) saudacao = 'Boa tarde';
    return nome ? `${saudacao}, ${nome}` : saudacao;
  });

  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const compromissosHoje = compromissos.filter(c => isToday(c.data));
  const compromissosFuturos = compromissos.filter(c => isFutureDate(c.data) && !c.concluido);
  const compromissosConcluidos = compromissos.filter(c => c.concluido);
  const totalAnotacoes = anotacoes.length;

  const proximosCompromissos = compromissosFuturos
    .sort((a, b) => new Date(a.data + 'T' + a.hora).getTime() - new Date(b.data + 'T' + b.hora).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/profile')}>
              {userProfile?.fotoUri ? (
                <Image source={{ uri: userProfile.fotoUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <User size={24} color={colors.text.secondary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={[typography.body, { color: colors.text.secondary }]}>
                {obterSaudacao(userProfile?.nome)}
              </Text>
              <Text style={[typography.h2, { color: colors.text.primary, fontWeight: '700' }]}>
                Vamos estudar?
              </Text>
            </View>
          </View>
        </View>

        {/* Estatísticas resumidas */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.background.primary }]} onPress={() => router.push('/compromissos')}>
            <Clock size={24} color={colors.primary} />
            <Text style={[typography.h2, { color: colors.text.primary }]}>{compromissosHoje.length}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Hoje</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.background.primary }]} onPress={() => router.push('/calendar')}>
            <Calendar size={24} color={colors.success} />
            <Text style={[typography.h2, { color: colors.text.primary }]}>{compromissosFuturos.length}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Próximos</Text>
          </TouchableOpacity>

          <View style={[styles.statCard, { backgroundColor: colors.background.primary }]}>
            <CheckCircle size={24} color={colors.info} />
            <Text style={[typography.h2, { color: colors.text.primary }]}>{compromissosConcluidos.length}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Feitos</Text>
          </View>

          <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.background.primary }]} onPress={() => router.push('/anotacoes')}>
            <BookOpen size={24} color={colors.warning} />
            <Text style={[typography.h2, { color: colors.text.primary }]}>{totalAnotacoes}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Anotações</Text>
          </TouchableOpacity>
        </View>

        {/* Próximos Compromissos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h3, { color: colors.text.primary, fontWeight: '600' }]}>Agenda Próxima</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/calendar')}>
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {proximosCompromissos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[typography.body, { color: colors.text.tertiary, marginBottom: 12 }]}>
                Nenhum compromisso agendado
              </Text>
              <BaseButton 
                title="Criar Compromisso" 
                onPress={() => router.push('/calendar')} 
                variant="outline" 
                size="small"
              >
                <Plus size={16} color={colors.primary} />
              </BaseButton>
            </View>
          ) : (
            proximosCompromissos.map((item) => (
              <TouchableOpacity key={item.id} style={styles.compromissoItem} onPress={() => router.push('/calendar')}>
                <View style={styles.compromissoContent}>
                  <Text style={[typography.body, { color: colors.text.primary, fontWeight: '600' }]} numberOfLines={1}>
                    {item.titulo}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {item.hora}
                  </Text>
                </View>
                <View style={[styles.categoriaIndicator, { backgroundColor: colors.primary }]} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 🗺️ ADICIONADO: Atalhos para Telas (Reposicionado após Compromissos) */}
        <View style={styles.section}>
          <Text style={[typography.h3, { color: colors.text.primary, fontWeight: '600', marginBottom: 16 }]}>
            Atalhos para Telas
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/calendar')}>
              <Calendar size={22} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.text.primary, fontWeight: '600' }]}>Calendário</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/compromissos')}>
              <Clock size={22} color={colors.success} />
              <Text style={[typography.caption, { color: colors.text.primary, fontWeight: '600' }]}>Compromissos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/anotacoes')}>
              <BookOpen size={22} color={colors.warning} />
              <Text style={[typography.caption, { color: colors.text.primary, fontWeight: '600' }]}>Anotações</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/profile')}>
              <User size={22} color={colors.info} />
              <Text style={[typography.caption, { color: colors.text.primary, fontWeight: '600' }]}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 24 },
    profileSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarButton: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden' },
    profileImage: { width: '100%', height: '100%', borderRadius: 25 },
    profileImagePlaceholder: { width: '100%', height: '100%', backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', borderRadius: 25 },
    greetingContainer: { flex: 1 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
    statCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 12, alignItems: 'center', gap: 8 },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    seeAllButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.background.tertiary },
    compromissoItem: { flexDirection: 'row', backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
    compromissoContent: { flex: 1 },
    categoriaIndicator: { width: 4, height: 40, borderRadius: 2, marginLeft: 12 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background.primary, borderRadius: 12, borderWidth: 1, borderColor: colors.border.light, borderStyle: 'dashed' },
    
    // Configurações visuais dos Atalhos em formato de grade
    quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    quickActionItem: { flex: 1, minWidth: '45%', backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border.light },
  });
}