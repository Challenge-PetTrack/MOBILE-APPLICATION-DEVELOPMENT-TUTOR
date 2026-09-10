import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicamentoService, MedicamentoDTO } from '@/service/medicamentoService';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useMedicamentos(petId?: number) {
  return useQuery({
    queryKey: ['medicamentos', petId],
    queryFn: async () => {
      const res = petId
        ? await medicamentoService.getByPet(petId)
        : await medicamentoService.getAll();
      return res.data;
    },
  });
}

export function useMedicamentoById(id: number) {
  return useQuery({
    queryKey: ['medicamento', id],
    queryFn: async () => {
      const res = await medicamentoService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateMedicamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MedicamentoDTO, 'id'>) => medicamentoService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicamentos'] });
    },
  });
}

export function useUpdateMedicamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MedicamentoDTO> }) =>
      medicamentoService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicamentos'] });
      qc.invalidateQueries({ queryKey: ['medicamento'] });
    },
  });
}

export function useDeleteMedicamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => medicamentoService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicamentos'] });
    },
  });
}
