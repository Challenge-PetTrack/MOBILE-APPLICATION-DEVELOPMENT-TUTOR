import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { storage } from '@/service/storage';
import { RegisterRequest } from '@/service/authService';
import { auth } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: 'tutor' | 'veterinario';
  uid?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  // ── 1. Restaurar sessão persistida ─────────────────────────────────────
  useEffect(() => {
    loadSession();
  }, []);

  // ── 2. Proteção reativa de rotas ───────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTutorGroup = segments[0] === 'tutor';
    const inVetGroup = segments[0] === 'vet';

    if (!user && (inTutorGroup || inVetGroup)) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace(user.perfil === 'veterinario' ? '/vet/home' : '/tutor/home');
    }
  }, [user, segments, isLoading]);

  // ── Funções ────────────────────────────────────────────────────────────

  const loadSession = async () => {
    try {
      const session = await storage.getSession();
      if (session?.token && session?.id) {
        setUser({
          id: session.id,
          nome: session.nome,
          email: session.email,
          perfil: session.perfil,
        });
        setToken(session.token);
      }
    } catch (e) {
      console.error('Erro ao restaurar sessão:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Login via Firebase Auth ────────────────────────────────────────────
  const login = async (email: string, senha: string) => {
    // 1. Autenticar no Firebase
    const credential = await signInWithEmailAndPassword(auth, email, senha);
    const firebaseToken = await credential.user.getIdToken();

    // 2. Montar dados do usuário a partir do Firebase
    //    O displayName é salvo no momento do cadastro.
    //    O campo "perfil" é armazenado em customClaims via Firebase ou em AsyncStorage.
    const displayName = credential.user.displayName || email.split('@')[0];

    // 3. Tentar recuperar perfil salvo localmente (definido no cadastro)
    const savedSession = await storage.getSession();
    const perfil: 'tutor' | 'veterinario' =
      (savedSession?.email === email ? savedSession?.perfil : null) ?? 'tutor';

    const loggedUser: User = {
      id: credential.user.uid.charCodeAt(0) % 10000, // ID numérico derivado do UID
      nome: displayName,
      email: credential.user.email ?? email,
      perfil: perfil,
      uid: credential.user.uid,
    };

    // 4. Persistir sessão
    await storage.saveSession({ ...loggedUser, token: firebaseToken });
    setToken(firebaseToken);
    setUser(loggedUser);
    // AuthContext redireciona automaticamente via useEffect de segmentos
  };

  // ── Cadastro via Firebase Auth ─────────────────────────────────────────
  const register = async (data: RegisterRequest) => {
    // 1. Criar conta no Firebase Authentication
    const credential = await createUserWithEmailAndPassword(auth, data.email, data.senha);

    // 2. Salvar perfil localmente para uso no login futuro
    //    (Firebase não suporta campos customizados sem Functions, então guardamos no storage)
    const newUser: User = {
      id: credential.user.uid.charCodeAt(0) % 10000,
      nome: data.nome,
      email: data.email,
      perfil: data.perfil,
      uid: credential.user.uid,
    };

    const firebaseToken = await credential.user.getIdToken();
    await storage.saveSession({ ...newUser, token: firebaseToken });
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Erro no signOut Firebase:', e);
    }
    await storage.clearSession();
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
