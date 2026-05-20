import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export default function IndexScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const onboardingDone = await AsyncStorage.getItem("@onboarding_done");
      if (!onboardingDone) {
        router.replace("/auth/onboarding");
        return;
      }

      const session = await AsyncStorage.getItem("@session");
      if (session) {
        const user = JSON.parse(session);
        if (user.perfil === "veterinario") {
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
