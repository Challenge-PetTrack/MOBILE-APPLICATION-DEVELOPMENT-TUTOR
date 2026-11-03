import {
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot, nowIso, sortByDate } from "./firestore";
import type { Consulta, ConsultaInput } from "@/types/models";

type Listener = (consultas: Consulta[]) => void;
type ErrorListener = (error: Error) => void;

const tutorQuery = (tutorId: string) =>
  query(collectionRef(COLLECTIONS.consultas), where("tutorId", "==", tutorId));

const clinicaQuery = () => query(collectionRef(COLLECTIONS.consultas));

function subscribe(q: Query<DocumentData>, onChange: Listener, onError?: ErrorListener) {
  return onSnapshot(
    q,
    (snap) => onChange(sortByDate(snap.docs.map((d) => fromSnapshot<Consulta>(d)), "dataHora")),
    (error) => onError?.(error)
  );
}

/**
 * Consultas/agendamentos compartilhados entre tutor e clínica.
 * Além do CRUD, expõe listeners em tempo real usados para disparar notificações.
 */
export const consultaService = {
  async listByTutor(tutorId: string): Promise<Consulta[]> {
    const snap = await getDocs(tutorQuery(tutorId));
    return sortByDate(snap.docs.map((d) => fromSnapshot<Consulta>(d)), "dataHora");
  },

  /** Todas as consultas da clínica (permitido apenas para veterinários pelas regras). */
  async listAll(): Promise<Consulta[]> {
    const snap = await getDocs(clinicaQuery());
    return sortByDate(snap.docs.map((d) => fromSnapshot<Consulta>(d)), "dataHora");
  },

  async create(data: ConsultaInput): Promise<Consulta> {
    const timestamp = nowIso();
    const payload = { ...data, createdAt: timestamp, updatedAt: timestamp };
    const ref = await addDoc(collectionRef(COLLECTIONS.consultas), payload);
    return { ...payload, id: ref.id };
  },

  async update(id: string, data: Partial<ConsultaInput>): Promise<void> {
    await updateDoc(docRef(COLLECTIONS.consultas, id), { ...data, updatedAt: nowIso() });
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(docRef(COLLECTIONS.consultas, id));
  },

  subscribeByTutor(tutorId: string, onChange: Listener, onError?: ErrorListener) {
    return subscribe(tutorQuery(tutorId), onChange, onError);
  },

  subscribeAll(onChange: Listener, onError?: ErrorListener) {
    return subscribe(clinicaQuery(), onChange, onError);
  },
};
