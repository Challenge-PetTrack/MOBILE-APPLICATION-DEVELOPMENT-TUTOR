import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { medicamentoService } from "@/services/medicamentoService";
import { cuidadoService } from "@/services/cuidadoService";
import { notificationService, computeDoseSchedule } from "@/services/notificationService";
import { addDays } from "@/utils/date";
import type { CuidadoPreventivo, Medicamento, Pet } from "@/types/models";

export { computeDoseSchedule };

export function useTutorMedicamentos() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["medicamentos", "tutor", user?.uid],
    queryFn: () => medicamentoService.listByTutor(user!.uid),
    enabled: !!user?.uid,
  });
}

export function useTutorCuidados() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cuidados", "tutor", user?.uid],
    queryFn: () => cuidadoService.listByTutor(user!.uid),
    enabled: !!user?.uid,
  });
}

export interface CreateMedicamentoFields {
  pet: Pick<Pet, "id" | "nome">;
  nome: string;
  dosagem: string;
  frequenciaHoras: number;
  horarioInicial: string;
  observacao?: string;
}

export function useCreateMedicamento() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (fields: CreateMedicamentoFields): Promise<Medicamento> => {
      if (!user) throw new Error("Sessão inválida.");
      const created = await medicamentoService.create({
        petId: fields.pet.id,
        petNome: fields.pet.nome,
        tutorId: user.uid,
        nome: fields.nome.trim(),
        dosagem: fields.dosagem.trim(),
        frequenciaHoras: fields.frequenciaHoras,
        horarioInicial: fields.horarioInicial.trim(),
        dataInicio: new Date().toISOString(),
        dataFim: null,
        observacao: fields.observacao?.trim() || "",
        ativo: true,
        ultimaDose: null,
      });
      await notificationService.scheduleMedicamento(created);
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicamentos"] });
    },
  });
}

export function useRegistrarDoseMedicamento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (med: Medicamento) => {
      const ultimaDose = new Date().toISOString();
      await medicamentoService.update(med.id, { ultimaDose });
      return ultimaDose;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicamentos"] });
    },
  });
}

export function useToggleMedicamentoAtivo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (med: Medicamento) => {
      const nextAtivo = !med.ativo;
      const updated: Medicamento = { ...med, ativo: nextAtivo };
      await medicamentoService.update(med.id, { ativo: nextAtivo });
      await notificationService.scheduleMedicamento(updated);
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicamentos"] });
    },
  });
}

export function useDeleteMedicamento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (medId: string) => {
      await notificationService.cancelMedicamento(medId);
      await medicamentoService.remove(medId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicamentos"] });
    },
  });
}

export function useRegistrarCuidado() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pet,
      tipo,
      intervaloDias,
    }: {
      pet: Pick<Pet, "id" | "nome">;
      tipo: string;
      intervaloDias: number;
    }): Promise<CuidadoPreventivo> => {
      if (!user) throw new Error("Sessão inválida.");
      const hoje = new Date();
      const proxima = addDays(hoje, intervaloDias);

      const saved = await cuidadoService.save({
        petId: pet.id,
        petNome: pet.nome,
        tutorId: user.uid,
        tipo,
        ultimaAplicacao: hoje.toISOString(),
        proximaAplicacao: proxima.toISOString(),
      });
      await notificationService.scheduleCuidadoPreventivo(saved);
      return saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cuidados"] });
    },
  });
}
