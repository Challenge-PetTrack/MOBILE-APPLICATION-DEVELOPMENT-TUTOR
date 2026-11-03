import { getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { collectionRef, docRef, COLLECTIONS, fromSnapshot } from "./firestore";
import type { Perfil, UserProfile } from "@/types/models";

type ProfileDoc = UserProfile & { id: string };

/** Acesso aos perfis de usuário (coleção `users`, id = uid do Firebase Auth). */
export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(docRef(COLLECTIONS.users, uid));
    if (!snap.exists()) return null;
    const { id: _id, ...profile } = fromSnapshot<ProfileDoc>(snap);
    return { ...profile, uid };
  },

  async createProfile(profile: UserProfile): Promise<void> {
    await setDoc(docRef(COLLECTIONS.users, profile.uid), profile);
  },

  async updateProfile(uid: string, data: Partial<Omit<UserProfile, "uid" | "perfil" | "email">>) {
    await updateDoc(docRef(COLLECTIONS.users, uid), data);
  },

  async listByPerfil(perfil: Perfil): Promise<UserProfile[]> {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.users), where("perfil", "==", perfil)));
    return snap.docs
      .map((d) => {
        const { id, ...profile } = fromSnapshot<ProfileDoc>(d);
        return { ...profile, uid: id };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  },
};
