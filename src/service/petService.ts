import api from './api';

export interface PetDTO {
  id?: number;
  nome: string;
  especie: string;
  raca: string;
  idade: string;
  peso: string;
  fotoUri?: string;
  tutorId?: number;
  sexo?: string;
}

export const petService = {
  getAll: () =>
    api.get<PetDTO[]>('/pet/todos'),

  getById: (id: number) =>
    api.get<PetDTO>(`/pet/${id}`),

  getByTutor: (tutorId: number) =>
    api.get<PetDTO[]>(`/pet/tutor/${tutorId}`),

  create: (data: Omit<PetDTO, 'id'>) =>
    api.post<PetDTO>('/pet', data),

  update: (id: number, data: Partial<PetDTO>) =>
    api.put<PetDTO>(`/pet/${id}`, data),

  delete: (id: number) =>
    api.delete(`/pet/${id}`),
};
