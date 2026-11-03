import { getDoc, setDoc } from "firebase/firestore";
import { docRef, COLLECTIONS } from "./firestore";
import type { Clinica } from "@/types/models";

export const VALOR_CONSULTA_PADRAO = 150;

/** Dados da clínica do veterinário (documento `clinicas/{vetId}`). */
export const clinicaService = {
  async get(vetId: string): Promise<Clinica> {
    const snap = await getDoc(docRef(COLLECTIONS.clinicas, vetId));
    if (!snap.exists()) {
      return { vetId, nome: "", endereco: "", valorConsulta: VALOR_CONSULTA_PADRAO };
    }
    return { ...(snap.data() as Clinica), vetId };
  },

  async save(clinica: Clinica): Promise<void> {
    await setDoc(docRef(COLLECTIONS.clinicas, clinica.vetId), clinica);
  },
};
