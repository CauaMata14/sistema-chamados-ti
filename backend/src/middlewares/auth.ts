import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { verificarAccessToken } from '../services/token.service';

/**
 * Exige um access token JWT válido no header Authorization: Bearer <token>.
 * Popula req.usuarioAutenticado para uso pelos middlewares de RBAC e pelos
 * controllers/services subsequentes.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(AppError.naoAutorizado('Token de acesso ausente.'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verificarAccessToken(token);
    req.usuarioAutenticado = { id: payload.sub, papel: payload.papel };
    next();
  } catch {
    next(AppError.naoAutorizado('Token de acesso inválido ou expirado.'));
  }
}
