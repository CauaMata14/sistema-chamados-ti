import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Limita tentativas nas rotas de autenticação (login/register/refresh) para
 * dificultar força bruta e enumeração de credenciais.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente mais tarde.' },
});

/**
 * Limita a criação de chamados e comentários por usuário autenticado, para
 * evitar que uma conta (ou várias criadas em massa) inunde o sistema.
 * Mais permissivo que o de auth: é tráfego legítimo esperado ser mais frequente.
 */
export const writeRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Aguarde um momento e tente novamente.' },
  keyGenerator: (req) => req.usuarioAutenticado?.id ?? req.ip ?? 'desconhecido',
});
