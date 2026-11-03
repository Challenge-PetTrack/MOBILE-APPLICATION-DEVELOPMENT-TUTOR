import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { consultaService } from "@/services/consultaService";
import { clinicaService, VALOR_CONSULTA_PADRAO } from "@/services/clinicaService";
import { notificationService } from "@/services/notificationService";
import { exportReceitaPdf } from "@/services/documents/receitaPdf";
import type { Clinica, Consulta, ConsultaStatus, Pet } from "@/types/models";

export function useTutorConsultas() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["consultas", "tutor", user?.uid],
    queryFn: () => consultaService.listByTutor(user!.uid),
    enabled: !!user?.uid && user.perfil === "tutor",
  });
}

export function useClinicaConsultas() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["consultas", "clinica"],
    queryFn: () => consultaService.listAll(),
    enabled: !!user?.uid && user.perfil === "veterinario",
  });
}

export function useCreateConsultaTutor() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pet,
      dataHora,
      motivo,
    }: {
      pet: Pick<Pet, "id" | "nome">;
      dataHora: Date;
      motivo: string;
    }) => {
      if (!user) throw new Error("Sessão inválida.");
      const created = await consultaService.create({
        tutorId: user.uid,
        tutorNome: user.nome,
        tutorTelefone: user.telefone,
        petId: pet.id,
        petNome: pet.nome,
        dataHora: dataHora.toISOString(),
        motivo: motivo.trim(),
        status: "pendente",
        origem: "tutor",
        vetId: null,
        vetNome: null,
        anexos: [],
        valor: null,
      });
      await notificationService.scheduleConsultaReminder(created);
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultas"] });
    },
  });
}

export function useRegistrarAtendimentoVet() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (fields: {
      pet?: Pet | null;
      petNome: string;
      tutorNome: string;
      diagnostico: string;
      prescricao?: string;
      valor?: number;
    }) => {
      if (!user) throw new Error("Sessão inválida.");
      const clinica = await clinicaService.get(user.uid);
      const valorFinal =
        fields.valor && fields.valor > 0
          ? fields.valor
          : clinica.valorConsulta || VALOR_CONSULTA_PADRAO;

      return consultaService.create({
        tutorId: fields.pet?.tutorId ?? "",
        tutorNome: (fields.pet?.tutorNome || fields.tutorNome).trim() || "Atendimento avulso",
        tutorTelefone: fields.pet?.tutorTelefone,
        petId: fields.pet?.id ?? null,
        petNome: (fields.pet?.nome || fields.petNome).trim(),
        dataHora: new Date().toISOString(),
        motivo: "Atendimento Clínico",
        status: "concluida",
        origem: "clinica",
        vetId: user.uid,
        vetNome: user.nome,
        diagnostico: fields.diagnostico.trim(),
        prescricao: fields.prescricao?.trim() || "",
        observacaoVet: fields.prescricao?.trim() || "",
        anexos: [],
        valor: valorFinal,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultas"] });
    },
  });
}

export function useUpdateConsultaVet() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      diagnostico,
      prescricao,
      observacaoVet,
      anexos,
      valor,
    }: {
      id: string;
      status: ConsultaStatus;
      diagnostico?: string;
      prescricao?: string;
      observacaoVet?: string;
      anexos?: string[];
      valor?: number | null;
    }) => {
      if (!user) throw new Error("Sessão inválida.");
      const clinica = await clinicaService.get(user.uid);
      const valorFinal =
        status === "concluida"
          ? valor && valor > 0
            ? valor
            : clinica.valorConsulta || VALOR_CONSULTA_PADRAO
          : valor ?? null;

      await consultaService.update(id, {
        status,
        diagnostico: diagnostico?.trim() ?? "",
        prescricao: prescricao?.trim() ?? "",
        observacaoVet: observacaoVet?.trim() ?? "",
        anexos: anexos ?? [],
        vetId: user.uid,
        vetNome: user.nome,
        valor: valorFinal,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultas"] });
    },
  });
}

export function useCancelConsulta() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (consultaId: string) => {
      await consultaService.update(consultaId, { status: "cancelada" });
      await notificationService.cancelConsultaReminder(consultaId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultas"] });
    },
  });
}

export function useExportReceita() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ consulta, clinica }: { consulta: Consulta; clinica?: Clinica }) =>
      exportReceitaPdf(consulta, {
        vetNome: consulta.vetNome || user?.nome || "Médico(a) Veterinário(a)",
        crmv: user?.crmv,
        clinica,
      }),
  });
}
