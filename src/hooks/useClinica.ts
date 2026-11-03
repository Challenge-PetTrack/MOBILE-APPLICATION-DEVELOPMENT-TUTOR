import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useClinicaConsultas } from "./useConsultas";
import { clinicaService, VALOR_CONSULTA_PADRAO } from "@/services/clinicaService";
import { isSameMonth } from "@/utils/date";
import type { Clinica } from "@/types/models";

export function useClinicaVet() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["clinica", user?.uid],
    queryFn: () => clinicaService.get(user!.uid),
    enabled: !!user?.uid && user.perfil === "veterinario",
  });
}

export function useSaveClinica() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (fields: Omit<Clinica, "vetId">) => {
      if (!user) throw new Error("Sessão inválida.");
      const payload: Clinica = {
        vetId: user.uid,
        nome: fields.nome.trim(),
        endereco: fields.endereco.trim(),
        valorConsulta:
          Number.isFinite(fields.valorConsulta) && fields.valorConsulta > 0
            ? fields.valorConsulta
            : VALOR_CONSULTA_PADRAO,
      };
      await clinicaService.save(payload);
      return payload;
    },
    onSuccess: (saved) => {
      qc.setQueryData(["clinica", saved.vetId], saved);
    },
  });
}

export function useVetDashboardMetrics() {
  const clinicaQuery = useClinicaVet();
  const consultasQuery = useClinicaConsultas();

  const metrics = useMemo(() => {
    const todas = consultasQuery.data ?? [];
    const valorPadrao = clinicaQuery.data?.valorConsulta ?? VALOR_CONSULTA_PADRAO;
    const agora = new Date();

    const concluidas = todas.filter((c) => c.status === "concluida");
    const concluidasMes = concluidas.filter((c) => isSameMonth(new Date(c.dataHora), agora));
    const faturamentoMes = concluidasMes.reduce(
      (acc, c) => acc + (c.valor && c.valor > 0 ? c.valor : valorPadrao),
      0
    );
    const pendentesCount = todas.filter((c) => c.status === "pendente").length;

    return {
      valorPadrao,
      concluidasMes,
      consultasMesCount: concluidasMes.length,
      faturamentoMes,
      pendentesCount,
      ultimasConcluidas: concluidas.slice(0, 5),
    };
  }, [clinicaQuery.data, consultasQuery.data]);

  return {
    ...metrics,
    clinica: clinicaQuery.data,
    isLoading: clinicaQuery.isLoading || consultasQuery.isLoading,
    isError: clinicaQuery.isError || consultasQuery.isError,
    refetch: () => {
      clinicaQuery.refetch();
      consultasQuery.refetch();
    },
  };
}
