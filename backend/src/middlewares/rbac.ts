import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import type { PapelUsuario } from '../models/User';

/**
 * Controle de acesso baseado em função (RBAC). Deve ser usado sempre depois
 * de `authenticate`. Autorização é verificada aqui no back-end — a UI só
 * esconde botões por conveniência, nunca é a fronteira real de segurança.
 */
export function authorize(...papeisPermitidos: PapelUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const usuario = req.usuarioAutenticado;

    if (!usuario) {
      next(AppError.naoAutorizado());
      return;
    }

    if (!papeisPermitidos.includes(usuario.papel)) {
      next(AppError.proibido());
      return;
    }

    next();
  };
}
