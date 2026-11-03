import {
  collection,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/config/firebase";

/** Nomes centralizados das coleções do Firestore. */
export const COLLECTIONS = {
  users: "users",
  pets: "pets",
  vacinas: "vacinas",
  medicamentos: "medicamentos",
  cuidados: "cuidados",
  diario: "diario",
  gastos: "gastos",
  consultas: "consultas",
  clinicas: "clinicas",
  chamados: "chamados",
  rotinas: "rotinas",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export const collectionRef = (name: CollectionName) => collection(db, name);
export const docRef = (name: CollectionName, id: string) => doc(db, name, id);

/** Converte um snapshot do Firestore no modelo tipado, incluindo o id do documento. */
export function fromSnapshot<T extends { id: string }>(
  snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): T {
  return { ...(snap.data() as Omit<T, "id">), id: snap.id } as T;
}

export const nowIso = () => new Date().toISOString();

/** Ordena uma lista por um campo ISO de data (mais recente primeiro por padrão). */
export function sortByDate<T>(list: T[], field: keyof T, direction: "asc" | "desc" = "desc"): T[] {
  return [...list].sort((a, b) => {
    const va = String(a[field] ?? "");
    const vb = String(b[field] ?? "");
    return direction === "desc" ? vb.localeCompare(va) : va.localeCompare(vb);
  });
}
