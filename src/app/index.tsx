import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { storage } from "@/service/storage";

export default function IndexScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const onboardingDone = await storage.getOnboardingStatus();
      if (!onboardingDone) {
        router.replace("/auth/onboarding");
        return;
      }

      const session = await storage.getSession();
      if (session) {
        if (session.perfil === "veterinario") {
          router.replace("/vet/home");
        } else {
          router.replace("/tutor/home");
        }
      } else {
        router.replace("/auth/login");
      }
    } catch (e) {
      router.replace("/auth/login");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color="#4f46e5" />
    </View>
  );
}
