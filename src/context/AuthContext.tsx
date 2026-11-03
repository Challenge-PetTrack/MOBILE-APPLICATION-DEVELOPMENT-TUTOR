import React, { createContext, useState, useEffect, useRef, ReactNode } from "react";
import { useRouter, useSegments } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import { queryClient } from "@/config/queryClient";
import { userService } from "@/services/userService";
import { nowIso } from "@/services/firestore";
import type { Perfil, UserProfile } from "@/types/models";

export interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
  telefone?: string;
  crmv?: string;
}

export interface UpdateProfileInput {
  nome: string;
  telefone?: string;
  crmv?: string;
}

interface AuthContextData {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

async function resolveOrBootstrapProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const existing = await userService.getProfile(firebaseUser.uid);
  if (existing) return existing;

  const fallback: UserProfile = {
    uid: firebaseUser.uid,
    nome: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuário",
    email: firebaseUser.email || "",
    perfil: "tutor",
    createdAt: nowIso(),
  };
  await userService.createProfile(fallback);
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRegisteringRef = useRef(false);

  const router = useRouter();
  const segments = useSegments();

  // 1. Restaurar e sincronizar sessão do Firebase Auth + perfil no Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isRegisteringRef.current) return;
      try {
        if (firebaseUser) {
          const [idToken, profile] = await Promise.all([
            firebaseUser.getIdToken(),
            resolveOrBootstrapProfile(firebaseUser),
          ]);
          setToken(idToken);
          setUser(profile);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error("Erro ao restaurar sessão:", e);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Proteção reativa de rotas
  useEffect(() => {
    if (isLoading || isRegisteringRef.current) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === "auth";
    const inProtectedGroup = rootSegment === "tutor" || rootSegment === "vet";

    if (!user && inProtectedGroup) {
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      router.replace(user.perfil === "veterinario" ? "/vet/home" : "/tutor/home");
    }
  }, [user, segments, isLoading, router]);

  const login = async (email: string, senha: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
    const [idToken, profile] = await Promise.all([
      credential.user.getIdToken(),
      resolveOrBootstrapProfile(credential.user),
    ]);
    setToken(idToken);
    setUser(profile);
  };

  const register = async (data: RegisterInput) => {
    isRegisteringRef.current = true;
    try {
      const normalizedEmail = data.email.trim().toLowerCase();
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, data.senha);
      await updateFirebaseProfile(credential.user, { displayName: data.nome.trim() });

      const newProfile: UserProfile = {
        uid: credential.user.uid,
        nome: data.nome.trim(),
        email: normalizedEmail,
        perfil: data.perfil,
        telefone: data.telefone?.trim() || undefined,
        crmv: data.crmv?.trim() || undefined,
        createdAt: nowIso(),
      };

      await userService.createProfile(newProfile);

      // Encerra a sessão automática do Firebase para exigir login explícito
      await signOut(auth);
      setToken(null);
      setUser(null);
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const updateProfile = async (data: UpdateProfileInput) => {
    if (!user) return;
    const payload = {
      nome: data.nome.trim(),
      telefone: data.telefone?.trim() || undefined,
      crmv: data.crmv?.trim() || undefined,
    };
    await userService.updateProfile(user.uid, payload);
    if (auth.currentUser && payload.nome) {
      await updateFirebaseProfile(auth.currentUser, { displayName: payload.nome }).catch(() => {});
    }
    setUser({ ...user, ...payload });
    queryClient.invalidateQueries({ queryKey: ["tutores"] });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Erro no signOut Firebase:", e);
    }
    queryClient.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
