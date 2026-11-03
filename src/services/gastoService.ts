import { addDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot, sortByDate } from "./firestore";
import type { Gasto } from "@/types/models";

export const gastoService = {
  async listByTutor(tutorId: string): Promise<Gasto[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.gastos), where("tutorId", "==", tutorId)));
    return sortByDate(snap.docs.map((d) => fromSnapshot<Gasto>(d)), "data");
  },

  async create(data: Omit<Gasto, "id">): Promise<Gasto> {
    const ref = await addDoc(collectionRef(COLLECTIONS.gastos), data);
    return { ...data, id: ref.id };
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(docRef(COLLECTIONS.gastos, id));
  },
};
