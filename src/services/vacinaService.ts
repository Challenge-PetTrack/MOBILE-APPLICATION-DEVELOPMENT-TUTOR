import { getDocs, query, setDoc, where } from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot } from "./firestore";
import type { VacinaRegistro } from "@/types/models";

export const vacinaService = {
  async listByTutor(tutorId: string): Promise<VacinaRegistro[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.vacinas), where("tutorId", "==", tutorId)));
    return snap.docs.map((d) => fromSnapshot<VacinaRegistro>(d));
  },

  /** Usado pelo veterinário para consultar a carteira de vacinação de um paciente. */
  async listByPet(petId: string): Promise<VacinaRegistro[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.vacinas), where("petId", "==", petId)));
    return snap.docs.map((d) => fromSnapshot<VacinaRegistro>(d));
  },

  /** Cria ou substitui o registro de uma vacina do catálogo para um pet. */
  async save(registro: Omit<VacinaRegistro, "id">): Promise<VacinaRegistro> {
    const id = `${registro.petId}_${registro.vacinaId}`;
    await setDoc(docRef(COLLECTIONS.vacinas, id), registro);
    return { ...registro, id };
  },
};
