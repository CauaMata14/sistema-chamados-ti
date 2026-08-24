const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

/**
 * O access token vive só em memória (nunca em localStorage), para reduzir
 * a superfície de roubo por XSS. Ele é perdido ao recarregar a página, mas
 * é recuperado automaticamente via /auth/refresh, que usa o refresh token
 * guardado em cookie httpOnly (inacessível a JavaScript).
 */
let accessToken: string | null = null;
let refreshEmAndamento: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function chamarRefresh(): Promise<string | null> {
  try {
    const resposta = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!resposta.ok) {
      setAccessToken(null);
      return null;
    }

    const dados = (await resposta.json()) as { accessToken: string };
    setAccessToken(dados.accessToken);
    return dados.accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

function renovarSessao(): Promise<string | null> {
  if (!refreshEmAndamento) {
    refreshEmAndamento = chamarRefresh().finally(() => {
      refreshEmAndamento = null;
    });
  }
  return refreshEmAndamento;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  semRetry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const resposta = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (resposta.status === 401 && !options.semRetry && path !== '/auth/login' && path !== '/auth/refresh') {
    const novoToken = await renovarSessao();

    if (novoToken) {
      return request<T>(path, { ...options, semRetry: true });
    }
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const mensagem = typeof dados.erro === 'string' ? dados.erro : 'Ocorreu um erro inesperado.';
    throw new ApiError(mensagem, resposta.status);
  }

  return dados as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  tentarRenovarSessao: renovarSessao,
};
