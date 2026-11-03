import { getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot, sortByDate } from "./firestore";
import type { RotinaDiaria } from "@/types/models";

/** Rotinas diárias de cuidado que alimentam o Score do pet. */
export const rotinaService = {
  async get(petId: string, dia: string): Promise<RotinaDiaria | null> {
    const snap = await getDoc(docRef(COLLECTIONS.rotinas, `${petId}_${dia}`));
    return snap.exists() ? fromSnapshot<RotinaDiaria>(snap) : null;
  },

  async listByPet(tutorId: string, petId: string): Promise<RotinaDiaria[]> {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.rotinas), where("tutorId", "==", tutorId), where("petId", "==", petId))
    );
    return sortByDate(snap.docs.map((d) => fromSnapshot<RotinaDiaria>(d)), "data");
  },

  async save(rotina: Omit<RotinaDiaria, "id">): Promise<RotinaDiaria> {
    const id = `${rotina.petId}_${rotina.data}`;
    await setDoc(docRef(COLLECTIONS.rotinas, id), rotina);
    return { ...rotina, id };
  },
};
