import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoClinicoService, EventoClinicoDTO } from '@/service/eventoClinicoService';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useEventosClinicos() {
  return useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const res = await eventoClinicoService.getAll();
      return res.data;
    },
  });
}

export function useEventoClinicoById(id: number) {
  return useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      const res = await eventoClinicoService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateEventoClinico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EventoClinicoDTO, 'id'>) =>
      eventoClinicoService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
}

export function useUpdateEventoClinico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EventoClinicoDTO> }) =>
      eventoClinicoService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eventos'] });
      qc.invalidateQueries({ queryKey: ['evento'] });
    },
  });
}

export function useDeleteEventoClinico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventoClinicoService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
}
