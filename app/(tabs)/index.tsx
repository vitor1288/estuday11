import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Calendar, Clock, CircleCheck as CheckCircle, TrendingUp, User, Plus } from 'lucide-react-native';
import { useStuday, getGreeting } from '@/contexts/StudayContext';
import { isFutureDate, isToday } from '@/utils/dateUtils';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { BaseButton } from '@/components/BaseButton/BaseButton';

export default function HomeScreen() {
  const { 
  compromissos = [], 
  anotacoes = [], 
  materias = [], 
  userProfile = {}, // <-- Isso garante que nunca seja undefined
  progresso = {} 
} = useStuday();
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={() => router.push('/profile')}>
              {userProfile.fotoUri ? (
                <Image source={{ uri: userProfile.fotoUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <User size={20} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={[typography.screenTitle, { color: colors.text.primary }]}>
                {getGreeting(userProfile.nome, userProfile.isCustomized)}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Como vão os estudos hoje?
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/profile')}>
            <BookOpen size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Cards de estatísticas */}
        <View style={styles.statsGrid}>
          {[
            { bg: colors.background.tertiary, icon: <Calendar size={24} color={colors.primary} />, value: compromissosHoje.length, label: 'Hoje' },
            { bg: colors.background.success, icon: <CheckCircle size={24} color={colors.success} />, value: compromissosConcluidos.length, label: 'Concluídos' },
            { bg: colors.background.warning, icon: <Clock size={24} color={colors.warning} />, value: compromissosFuturos.length, label: 'Pendentes' },
            { bg: colors.background.tertiary, icon: <TrendingUp size={24} color="#8B5CF6" />, value: totalAnotacoes, label: 'Anotações' },
          ].map((item, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: item.bg }]}>
              {item.icon}
              <Text style={[typography.screenTitle, { color: colors.text.primary }]}>{item.value}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Próximos compromissos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>
              Próximos Compromissos
            </Text>
            <TouchableOpacity onPress={() => router.push('/compromissos')} style={styles.seeAllButton}>
              <Text style={[typography.caption, { color: colors.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {proximosCompromissos.length > 0 ? (
            proximosCompromissos.map((compromisso) => (
              <TouchableOpacity
                key={compromisso.id}
                style={styles.compromissoItem}
                onPress={() => router.push('/compromissos')}
              >
                <View style={styles.compromissoContent}>
                  <Text style={[typography.cardTitle, { color: colors.text.primary }]}>
                    {compromisso.titulo}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {new Date(compromisso.data + 'T00:00:00').toLocaleDateString('pt-BR')} às {compromisso.hora}
                  </Text>
                </View>
                <View style={[styles.categoriaIndicator, { backgroundColor: getCategoriaColor(compromisso.categoria) }]} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={colors.border.medium} />
              <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center' }]}>
                Nenhum compromisso pendente
              </Text>
              <BaseButton variant="primary" onPress={() => router.push('/compromissos')}>
                Adicionar compromisso
              </BaseButton>
            </View>
          )}
        </View>

        {/* Ações rápidas */}
        <View style={styles.section}>
          <Text style={[typography.sectionTitle, { color: colors.text.primary, marginBottom: 16 }]}>
            Ações Rápidas
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/calendar')}>
              <Calendar size={24} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Calendário</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/compromissos')}>
              <Clock size={24} color={colors.success} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Compromissos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getCategoriaColor(categoria: string): string {
  switch (categoria) {
    case 'aula': return '#3B82F6';
    case 'prova': return '#EF4444';
    case 'trabalho': return '#F97316';
    case 'outro': return '#8B5CF6';
    default: return '#64748B';
  }
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    profileImageContainer: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden' },
    profileImage: { width: '100%', height: '100%', borderRadius: 25 },
    profileImagePlaceholder: { width: '100%', height: '100%', backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', borderRadius: 25 },
    greetingContainer: { flex: 1 },
    logoContainer: { backgroundColor: colors.background.tertiary, padding: 12, borderRadius: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
    statCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 12, alignItems: 'center', gap: 8 },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    seeAllButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.background.tertiary },
    compromissoItem: { flexDirection: 'row', backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
    compromissoContent: { flex: 1 },
    categoriaIndicator: { width: 4, height: 40, borderRadius: 2, marginLeft: 12 },
    emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
    quickActions: { flexDirection: 'row', gap: 12 },
    quickAction: { flex: 1, backgroundColor: colors.background.primary, padding: 20, borderRadius: 12, alignItems: 'center', gap: 8 },
  });
}