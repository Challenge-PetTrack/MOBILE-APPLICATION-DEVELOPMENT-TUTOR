import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { vacinaService } from "@/services/vacinaService";
import { notificationService } from "@/services/notificationService";
import { CATALOGO_VACINAS } from "@/constants/catalogos";
import { addDays } from "@/utils/date";
import type { Pet, VacinaRegistro } from "@/types/models";

export function useTutorVacinas() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vacinas", "tutor", user?.uid],
    queryFn: () => vacinaService.listByTutor(user!.uid),
    enabled: !!user?.uid,
  });
}

export function usePetVacinas(petId?: string) {
  return useQuery({
    queryKey: ["vacinas", "pet", petId],
    queryFn: () => vacinaService.listByPet(petId!),
    enabled: !!petId,
  });
}

export function useToggleVacina() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pet,
      vacinaId,
      currentlyTaken,
    }: {
      pet: Pick<Pet, "id" | "nome">;
      vacinaId: string;
      currentlyTaken: boolean;
    }): Promise<VacinaRegistro> => {
      if (!user) throw new Error("Sessão inválida.");
      const nextTaken = !currentlyTaken;
      const now = new Date();
      const catalogo = CATALOGO_VACINAS.find((v) => v.id === vacinaId);
      const proximaDose = nextTaken
        ? addDays(now, catalogo?.reforcoDias ?? 365).toISOString()
        : null;

      const saved = await vacinaService.save({
        petId: pet.id,
        petNome: pet.nome,
        tutorId: user.uid,
        vacinaId,
        tomada: nextTaken,
        dataAplicacao: nextTaken ? now.toISOString() : null,
        proximaDose,
      });

      await notificationService.scheduleVacinaBooster(saved);
      return saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vacinas"] });
    },
  });
}
