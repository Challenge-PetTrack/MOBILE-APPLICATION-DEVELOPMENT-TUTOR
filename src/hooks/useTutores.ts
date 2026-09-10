import { useQuery } from '@tanstack/react-query';
import { tutorService } from '@/service/tutorService';

export function useTutores() {
  return useQuery({
    queryKey: ['tutores'],
    queryFn: async () => {
      const res = await tutorService.getAll();
      return res.data;
    },
  });
}

export function useTutorById(id: number) {
  return useQuery({
    queryKey: ['tutor', id],
    queryFn: async () => {
      const res = await tutorService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}
