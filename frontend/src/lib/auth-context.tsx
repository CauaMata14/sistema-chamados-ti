'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAccessToken } from './api';
import type { LoginFormValues, RegisterFormValues } from '@/schemas/auth.schema';
import type { Usuario } from '@/types';

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (dados: LoginFormValues) => Promise<void>;
  cadastrar: (dados: RegisterFormValues) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let ativo = true;

    (async () => {
      const token = await api.tentarRenovarSessao();

      if (!token) {
        if (ativo) setCarregando(false);
        return;
      }

      try {
        const { usuario: usuarioAtual } = await api.get<{ usuario: Usuario }>('/auth/me');
        if (ativo) setUsuario(usuarioAtual);
      } catch {
        setAccessToken(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const entrar = useCallback(async (dados: LoginFormValues) => {
    const resposta = await api.post<{ accessToken: string; usuario: Usuario }>('/auth/login', dados);
    setAccessToken(resposta.accessToken);
    setUsuario(resposta.usuario);
  }, []);

  const cadastrar = useCallback(async (dados: RegisterFormValues) => {
    const resposta = await api.post<{ accessToken: string; usuario: Usuario }>('/auth/register', dados);
    setAccessToken(resposta.accessToken);
    setUsuario(resposta.usuario);
  }, []);

  const sair = useCallback(async () => {
    await api.post('/auth/logout').catch(() => undefined);
    setAccessToken(null);
    setUsuario(null);
    router.push('/login');
  }, [router]);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair }),
    [usuario, carregando, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return contexto;
}
