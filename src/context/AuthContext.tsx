import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { storage } from '@/service/storage';
import { authService, RegisterRequest } from '@/service/authService';
import { tutorService } from '@/service/tutorService';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: 'tutor' | 'veterinario';
  uid?: string; // Firebase UID
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

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTutorGroup = segments[0] === 'tutor';
    const inVetGroup = segments[0] === 'vet';

    if (!user && (inTutorGroup || inVetGroup)) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      if (user.perfil === 'veterinario') {
        router.replace('/vet/home');
      } else {
        router.replace('/tutor/home');
      }
    }
  }, [user, segments, isLoading]);

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

  const login = async (email: string, senha: string) => {
    try {
      // Mock para desenvolvimento visual se o Firebase não estiver configurado
      if (auth.app.options.apiKey === "AIzaSy_YOUR_API_KEY") {
        console.warn("Usando Login Mockado (Firebase não configurado)");
        const mockUser = {
          id: Math.floor(Math.random() * 1000),
          nome: 'Tutor Teste',
          email: email,
          perfil: 'tutor' as const,
          uid: 'mock-uid-123'
        };
        await storage.saveSession({ ...mockUser, token: 'mock-token' });
        setToken('mock-token');
        setUser(mockUser);
        return;
      }

      // 1. Autenticar no Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // 2. Tentar buscar o ID no Java Backend (ignora se estiver offline)
      let usuarioLogado = {
        id: Math.floor(Math.random() * 1000), // ID mock para testes visuais
        nome: 'Tutor Firebase',
        email: email,
        perfil: 'tutor' as const,
        uid: userCredential.user.uid
      };

      try {
        const tutores = await tutorService.getAll();
        const tutor = tutores.data.find(t => t.email === email);
        if (tutor) {
           usuarioLogado.id = tutor.id || usuarioLogado.id;
           usuarioLogado.nome = tutor.nome;
        }
      } catch (backendError) {
        console.warn('Backend Java offline, usando dados mockados de Tutor.');
      }

      // 3. Salvar sessão local
      await storage.saveSession({ ...usuarioLogado, token: firebaseToken });
      setToken(firebaseToken);
      setUser(usuarioLogado);
      
    } catch (error) {
      console.error('Erro no login Firebase:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      // Mock para desenvolvimento visual se o Firebase não estiver configurado
      if (auth.app.options.apiKey === "AIzaSy_YOUR_API_KEY") {
        console.warn("Usando Register Mockado (Firebase não configurado)");
        return; // Apenas sai com sucesso para permitir que a tela mude
      }

      // 1. Criar usuário no Firebase
      await createUserWithEmailAndPassword(auth, data.email, data.senha);
      
      // 2. Criar usuário no Java Backend para gerar o ID numérico (tutorId)
      if (data.perfil === 'tutor') {
         try {
           await tutorService.create({
              nome: data.nome,
              email: data.email,
              telefone: data.telefone || '',
           });
         } catch (e) {
           console.warn('Backend Java offline, usuário criado apenas no Firebase.');
         }
      }
    } catch (error) {
      console.error('Erro no cadastro Firebase:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
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
