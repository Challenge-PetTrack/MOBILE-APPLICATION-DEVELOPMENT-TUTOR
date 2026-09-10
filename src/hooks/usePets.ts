import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petService, PetDTO } from '@/service/petService';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function usePets(tutorId?: number) {
  return useQuery({
    queryKey: ['pets', tutorId],
    queryFn: async () => {
      const res = tutorId
        ? await petService.getByTutor(tutorId)
        : await petService.getAll();
      return res.data;
    },
  });
}

export function usePetById(id: number) {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      const res = await petService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreatePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PetDTO, 'id'>) => petService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function useUpdatePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PetDTO> }) =>
      petService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
      qc.invalidateQueries({ queryKey: ['pet'] });
    },
  });
}

export function useDeletePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => petService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}
