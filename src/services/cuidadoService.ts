import { getDocs, query, setDoc, where } from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot } from "./firestore";
import type { CuidadoPreventivo } from "@/types/models";

/** Cuidados preventivos recorrentes (antipulgas, vermífugo, banho, check-up). */
export const cuidadoService = {
  async listByTutor(tutorId: string): Promise<CuidadoPreventivo[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.cuidados), where("tutorId", "==", tutorId)));
    return snap.docs.map((d) => fromSnapshot<CuidadoPreventivo>(d));
  },

  async save(cuidado: Omit<CuidadoPreventivo, "id">): Promise<CuidadoPreventivo> {
    const id = `${cuidado.petId}_${cuidado.tipo}`;
    await setDoc(docRef(COLLECTIONS.cuidados, id), cuidado);
    return { ...cuidado, id };
  },
};
