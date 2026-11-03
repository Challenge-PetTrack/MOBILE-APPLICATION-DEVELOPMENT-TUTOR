import { addDoc, deleteDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot, nowIso, sortByDate } from "./firestore";
import type { Medicamento, MedicamentoInput } from "@/types/models";

/** CRUD de tratamentos/medicamentos (coleção `medicamentos`). */
export const medicamentoService = {
  async listByTutor(tutorId: string): Promise<Medicamento[]> {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.medicamentos), where("tutorId", "==", tutorId))
    );
    return sortByDate(snap.docs.map((d) => fromSnapshot<Medicamento>(d)), "createdAt");
  },

  async listByPet(petId: string): Promise<Medicamento[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.medicamentos), where("petId", "==", petId)));
    return sortByDate(snap.docs.map((d) => fromSnapshot<Medicamento>(d)), "createdAt");
  },

  async create(data: MedicamentoInput): Promise<Medicamento> {
    const payload = { ...data, createdAt: nowIso() };
    const ref = await addDoc(collectionRef(COLLECTIONS.medicamentos), payload);
    return { ...payload, id: ref.id };
  },

  async update(id: string, data: Partial<MedicamentoInput>): Promise<void> {
    await updateDoc(docRef(COLLECTIONS.medicamentos, id), data);
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(docRef(COLLECTIONS.medicamentos, id));
  },
};
