import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { storage } from '@/service/storage';

export default function IndexScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    checkAndRedirect();
  }, [isLoading, isAuthenticated]);

  const checkAndRedirect = async () => {
    try {
      const onboardingDone = await storage.getOnboardingStatus();
      if (!onboardingDone) {
        router.replace('/auth/onboarding');
        return;
      }

      if (isAuthenticated && user) {
        if (user.perfil === 'veterinario') {
          router.replace('/vet/home');
        } else {
          router.replace('/tutor/home');
        }
      } else {
        router.replace('/auth/login');
      }
    } catch (e) {
      router.replace('/auth/login');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color="#4f46e5" />
    </View>
  );
}
