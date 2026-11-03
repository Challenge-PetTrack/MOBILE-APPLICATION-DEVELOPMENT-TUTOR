import {
  addDoc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot, nowIso, sortByDate } from "./firestore";
import type { Pet, PetInput } from "@/types/models";

/** Coleções que guardam dados vinculados a um pet e devem ser limpas ao excluí-lo. */
const PET_DEPENDENT_COLLECTIONS = [
  COLLECTIONS.vacinas,
  COLLECTIONS.medicamentos,
  COLLECTIONS.cuidados,
  COLLECTIONS.diario,
  COLLECTIONS.rotinas,
] as const;

export const petService = {
  async listByTutor(tutorId: string): Promise<Pet[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.pets), where("tutorId", "==", tutorId)));
    return sortByDate(snap.docs.map((d) => fromSnapshot<Pet>(d)), "createdAt", "asc");
  },

  /** Lista todos os pacientes (uso exclusivo do veterinário, garantido pelas regras do Firestore). */
  async listAll(): Promise<Pet[]> {
    const snap = await getDocs(collectionRef(COLLECTIONS.pets));
    return snap.docs.map((d) => fromSnapshot<Pet>(d)).sort((a, b) => a.nome.localeCompare(b.nome));
  },

  async getById(id: string): Promise<Pet | null> {
    const snap = await getDoc(docRef(COLLECTIONS.pets, id));
    return snap.exists() ? fromSnapshot<Pet>(snap) : null;
  },

  async create(data: PetInput): Promise<Pet> {
    const payload = { ...data, createdAt: nowIso() };
    const ref = await addDoc(collectionRef(COLLECTIONS.pets), payload);
    return { ...payload, id: ref.id };
  },

  async update(id: string, data: Partial<PetInput>): Promise<void> {
    await updateDoc(docRef(COLLECTIONS.pets, id), data);
  },

  /** Exclui o pet e todos os registros dependentes (vacinas, tratamentos, diário...). */
  async remove(pet: Pick<Pet, "id" | "tutorId">): Promise<void> {
    const batch = writeBatch(db);
    for (const name of PET_DEPENDENT_COLLECTIONS) {
      const snap = await getDocs(
        query(collectionRef(name), where("tutorId", "==", pet.tutorId), where("petId", "==", pet.id))
      );
      snap.docs.forEach((d) => batch.delete(d.ref));
    }
    batch.delete(docRef(COLLECTIONS.pets, pet.id));
    await batch.commit();
  },
};
