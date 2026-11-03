import { addDoc, getDocs, query, where } from "firebase/firestore";
import { collectionRef, COLLECTIONS, fromSnapshot, sortByDate } from "./firestore";
import type { Chamado } from "@/types/models";

/** Chamados de suporte (SAC) abertos pelos usuários. */
export const chamadoService = {
  async listByUser(userId: string): Promise<Chamado[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.chamados), where("userId", "==", userId)));
    return sortByDate(snap.docs.map((d) => fromSnapshot<Chamado>(d)), "createdAt");
  },

  async create(data: Omit<Chamado, "id">): Promise<Chamado> {
    const ref = await addDoc(collectionRef(COLLECTIONS.chamados), data);
    return { ...data, id: ref.id };
  },
};
