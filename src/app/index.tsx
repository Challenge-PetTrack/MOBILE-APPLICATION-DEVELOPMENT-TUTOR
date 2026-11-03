import { useEffect } from "react";
import { useRouter } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function IndexScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { isDone } = useOnboarding();

  useEffect(() => {
    if (isLoading || isDone === null) return;

    if (!isDone) {
      router.replace("/auth/onboarding");
      return;
    }

    if (user) {
      router.replace(user.perfil === "veterinario" ? "/vet/home" : "/tutor/home");
    } else {
      router.replace("/auth/login");
    }
  }, [isLoading, isDone, user, router]);

  return <LoadingScreen message="Iniciando PetTrack..." />;
}
