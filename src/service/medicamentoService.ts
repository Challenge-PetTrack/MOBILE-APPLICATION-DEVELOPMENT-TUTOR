import api from './api';

export interface MedicamentoDTO {
  id?: number;
  nome: string;
  tipo: string;
  dosagem?: string;
  frequencia?: string;
  dataInicio?: string;
  dataFim?: string;
  petId?: number;
  observacao?: string;
}

export const medicamentoService = {
  getAll: () =>
    api.get<MedicamentoDTO[]>('/medicamento/todos'),

  getById: (id: number) =>
    api.get<MedicamentoDTO>(`/medicamento/${id}`),

  getByPet: (petId: number) =>
    api.get<MedicamentoDTO[]>(`/medicamento/pet/${petId}`),

  create: (data: Omit<MedicamentoDTO, 'id'>) =>
    api.post<MedicamentoDTO>('/medicamento', data),

  update: (id: number, data: Partial<MedicamentoDTO>) =>
    api.put<MedicamentoDTO>(`/medicamento/${id}`, data),

  delete: (id: number) =>
    api.delete(`/medicamento/${id}`),
};
