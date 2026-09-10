import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function VetLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Aguardando restauração da sessão
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Não autenticado → redireciona para login
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Autenticado como tutor → redireciona para área correta
  if (user?.perfil === 'tutor') {
    return <Redirect href="/tutor/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
