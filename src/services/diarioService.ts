import { addDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot, sortByDate } from "./firestore";
import type { DiarioEntrada } from "@/types/models";

export const diarioService = {
  async listByPet(tutorId: string, petId: string): Promise<DiarioEntrada[]> {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.diario), where("tutorId", "==", tutorId), where("petId", "==", petId))
    );
    return sortByDate(snap.docs.map((d) => fromSnapshot<DiarioEntrada>(d)), "data");
  },

  async create(data: Omit<DiarioEntrada, "id">): Promise<DiarioEntrada> {
    const ref = await addDoc(collectionRef(COLLECTIONS.diario), data);
    return { ...data, id: ref.id };
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(docRef(COLLECTIONS.diario, id));
  },
};
