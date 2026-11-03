import { useCallback } from "react";
import { Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { userService } from "@/services/userService";
import { openWhatsApp } from "@/services/externalLinkService";

export function useTutores() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutores"],
    queryFn: () => userService.listByPerfil("tutor"),
    enabled: user?.perfil === "veterinario",
  });
}

export function useContactWhatsApp() {
  return useCallback(async (telefone?: string, mensagem?: string) => {
    if (!telefone?.trim()) {
      Alert.alert("Sem WhatsApp", "Este tutor ainda não cadastrou um número de WhatsApp.");
      return;
    }
    const ok = await openWhatsApp(telefone, mensagem);
    if (!ok) {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp neste dispositivo.");
    }
  }, []);
}
