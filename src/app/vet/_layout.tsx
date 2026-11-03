import { Stack, Redirect } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";

export default function VetLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  if (user?.perfil === "tutor") return <Redirect href="/tutor/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
