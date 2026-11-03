import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { diarioService } from "@/services/diarioService";

export function usePetDiario(petId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["diario", user?.uid, petId],
    queryFn: () => diarioService.listByPet(user!.uid, petId!),
    enabled: !!user?.uid && !!petId,
  });
}

export function useCreateDiarioEntrada() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      petId,
      texto,
      fotoUri,
    }: {
      petId: string;
      texto: string;
      fotoUri?: string | null;
    }) => {
      if (!user) throw new Error("Sessão inválida.");
      return diarioService.create({
        petId,
        tutorId: user.uid,
        texto: texto.trim(),
        fotoUri: fotoUri ?? null,
        data: new Date().toISOString(),
      });
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["diario", user?.uid, vars.petId] });
    },
  });
}

export function useDeleteDiarioEntrada() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => diarioService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diario"] });
    },
  });
}
