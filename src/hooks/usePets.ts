import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { petService } from "@/services/petService";
import { exportRgPetPdf } from "@/services/documents/rgPetPdf";
import type { Pet, PetInput, VacinaRegistro } from "@/types/models";

export function useTutorPets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pets", "tutor", user?.uid],
    queryFn: () => petService.listByTutor(user!.uid),
    enabled: !!user?.uid,
  });
}

export function useAllPets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pets", "all"],
    queryFn: () => petService.listAll(),
    enabled: user?.perfil === "veterinario",
  });
}

export function usePetById(id?: string) {
  return useQuery({
    queryKey: ["pet", id],
    queryFn: () => petService.getById(id!),
    enabled: !!id,
  });
}

export interface SavePetFields {
  nome: string;
  especie: string;
  raca?: string;
  idade?: string;
  peso?: string;
  sexo?: string;
  fotoUri?: string | null;
}

export function useCreatePet() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (fields: SavePetFields) => {
      if (!user) throw new Error("Sessão inválida.");
      const payload: PetInput = {
        ...fields,
        nome: fields.nome.trim(),
        especie: fields.especie.trim(),
        raca: fields.raca?.trim() || "",
        idade: fields.idade?.trim() || "",
        peso: fields.peso?.trim() || "",
        fotoUri: fields.fotoUri ?? null,
        tutorId: user.uid,
        tutorNome: user.nome,
        tutorTelefone: user.telefone,
      };
      return petService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}

export function useUpdatePet() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: SavePetFields }) => {
      if (!user) throw new Error("Sessão inválida.");
      await petService.update(id, {
        ...fields,
        nome: fields.nome.trim(),
        especie: fields.especie.trim(),
        raca: fields.raca?.trim() || "",
        idade: fields.idade?.trim() || "",
        peso: fields.peso?.trim() || "",
        fotoUri: fields.fotoUri ?? null,
        tutorNome: user.nome,
        tutorTelefone: user.telefone,
      });
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["pets"] });
      qc.invalidateQueries({ queryKey: ["pet", vars.id] });
    },
  });
}

export function useDeletePet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (pet: Pick<Pet, "id" | "tutorId">) => petService.remove(pet),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pets"] });
      qc.invalidateQueries({ queryKey: ["vacinas"] });
      qc.invalidateQueries({ queryKey: ["medicamentos"] });
      qc.invalidateQueries({ queryKey: ["cuidados"] });
      qc.invalidateQueries({ queryKey: ["diario"] });
    },
  });
}

export function useExportPetRg() {
  return useMutation({
    mutationFn: ({ pet, vacinas }: { pet: Pet; vacinas: VacinaRegistro[] }) =>
      exportRgPetPdf(pet, vacinas),
  });
}
