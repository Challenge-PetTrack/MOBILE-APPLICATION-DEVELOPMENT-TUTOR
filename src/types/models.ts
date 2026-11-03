/**
 * Modelos de domínio do PetTrack.
 * Todos os documentos são persistidos no Cloud Firestore (ver src/services).
 * Datas são armazenadas como ISO-8601 (string) para facilitar ordenação e serialização.
 */

export type Perfil = "tutor" | "veterinario";

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  perfil: Perfil;
  telefone?: string;
  crmv?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  tutorId: string;
  tutorNome: string;
  tutorTelefone?: string;
  nome: string;
  especie: string;
  raca?: string;
  idade?: string;
  peso?: string;
  sexo?: string;
  /** Foto comprimida em data URI (base64) para ficar acessível em qualquer dispositivo. */
  fotoUri?: string | null;
  createdAt: string;
}

export type PetInput = Omit<Pet, "id" | "createdAt">;

export interface VacinaRegistro {
  /** `${petId}_${vacinaId}` */
  id: string;
  petId: string;
  petNome: string;
  tutorId: string;
  vacinaId: string;
  tomada: boolean;
  dataAplicacao?: string | null;
  proximaDose?: string | null;
}

/** Tratamento/medicamento com horários de administração (gera lembretes diários). */
export interface Medicamento {
  id: string;
  petId: string;
  petNome: string;
  tutorId: string;
  nome: string;
  dosagem: string;
  /** Intervalo entre doses em horas (6, 8, 12 ou 24). */
  frequenciaHoras: number;
  /** Horário da primeira dose do dia, formato HH:MM. */
  horarioInicial: string;
  dataInicio: string;
  /** Data de término (ISO). Sem data = uso contínuo. */
  dataFim?: string | null;
  observacao?: string;
  ativo: boolean;
  ultimaDose?: string | null;
  createdAt: string;
}

export type MedicamentoInput = Omit<Medicamento, "id" | "createdAt">;

/** Cuidado preventivo recorrente (antipulgas, vermífugo, banho, check-up). */
export interface CuidadoPreventivo {
  /** `${petId}_${tipo}` */
  id: string;
  petId: string;
  petNome: string;
  tutorId: string;
  tipo: string;
  ultimaAplicacao: string;
  proximaAplicacao: string;
}

export interface DiarioEntrada {
  id: string;
  petId: string;
  tutorId: string;
  texto: string;
  fotoUri?: string | null;
  data: string;
}

export interface Gasto {
  id: string;
  tutorId: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
}

export type ConsultaStatus = "pendente" | "confirmada" | "concluida" | "cancelada";
export type ConsultaOrigem = "tutor" | "clinica";

export interface Consulta {
  id: string;
  /** Pode ser vazio quando o veterinário registra atendimento de paciente não cadastrado. */
  tutorId: string;
  tutorNome: string;
  tutorTelefone?: string;
  petId?: string | null;
  petNome: string;
  /** Data/hora do atendimento (ISO). */
  dataHora: string;
  motivo: string;
  status: ConsultaStatus;
  origem: ConsultaOrigem;
  vetId?: string | null;
  vetNome?: string | null;
  diagnostico?: string;
  prescricao?: string;
  observacaoVet?: string;
  anexos?: string[];
  valor?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ConsultaInput = Omit<Consulta, "id" | "createdAt" | "updatedAt">;

export interface Clinica {
  vetId: string;
  nome: string;
  endereco: string;
  valorConsulta: number;
}

export interface Chamado {
  id: string;
  userId: string;
  userNome: string;
  perfil: Perfil;
  assunto: string;
  mensagem: string;
  status: "aberto" | "respondido";
  createdAt: string;
}

/** Rotina diária de cuidados (alimenta o Score do pet). */
export interface RotinaDiaria {
  /** `${petId}_${YYYY-MM-DD}` */
  id: string;
  petId: string;
  tutorId: string;
  data: string;
  tarefasConcluidas: string[];
  score: number;
}
