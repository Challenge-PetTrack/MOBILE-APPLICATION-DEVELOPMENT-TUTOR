import { useCallback } from "react";
import { Alert } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { chamadoService } from "@/services/chamadoService";
import { openWhatsApp } from "@/services/externalLinkService";
import { WHATSAPP_SUPORTE_TUTOR, WHATSAPP_SUPORTE_VET } from "@/constants/catalogos";

export function useMeusChamados() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chamados", user?.uid],
    queryFn: () => chamadoService.listByUser(user!.uid),
    enabled: !!user?.uid,
  });
}

export function useCreateChamado() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ assunto, mensagem }: { assunto: string; mensagem: string }) => {
      if (!user) throw new Error("Sessão inválida.");
      return chamadoService.create({
        userId: user.uid,
        userNome: user.nome,
        perfil: user.perfil,
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
        status: "aberto",
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chamados"] });
    },
  });
}

export function useSuporteWhatsApp() {
  const { user } = useAuth();
  return useCallback(async () => {
    const isVet = user?.perfil === "veterinario";
    const numero = isVet ? WHATSAPP_SUPORTE_VET : WHATSAPP_SUPORTE_TUTOR;
    const texto = isVet
      ? "Olá, sou um veterinário parceiro e preciso de suporte no app PetTrack."
      : "Olá, preciso de suporte no app PetTrack.";

    const ok = await openWhatsApp(numero, texto);
    if (!ok) {
      Alert.alert("Indisponível", "Não foi possível abrir o WhatsApp neste dispositivo.");
    }
  }, [user?.perfil]);
}
