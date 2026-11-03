import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { rotinaService } from "@/services/rotinaService";
import { TAREFAS_ROTINA } from "@/constants/catalogos";
import { toDayKey } from "@/utils/date";

export function computeScore(tarefasConcluidas: string[]): number {
  return TAREFAS_ROTINA.filter((t) => tarefasConcluidas.includes(t.id)).reduce(
    (acc, t) => acc + t.points,
    0
  );
}

export function useRotinaHoje(petId?: string) {
  const dia = toDayKey();
  return useQuery({
    queryKey: ["rotina", petId, dia],
    queryFn: () => rotinaService.get(petId!, dia),
    enabled: !!petId,
  });
}

export function useToggleTarefaRotina() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      petId,
      tarefaId,
      atuais,
    }: {
      petId: string;
      tarefaId: string;
      atuais: string[];
    }) => {
      if (!user) throw new Error("Sessão inválida.");
      const dia = toDayKey();
      const next = atuais.includes(tarefaId)
        ? atuais.filter((id) => id !== tarefaId)
        : [...atuais, tarefaId];

      return rotinaService.save({
        petId,
        tutorId: user.uid,
        data: dia,
        tarefasConcluidas: next,
        score: computeScore(next),
      });
    },
    onSuccess: (saved) => {
      qc.setQueryData(["rotina", saved.petId, saved.data], saved);
    },
  });
}
