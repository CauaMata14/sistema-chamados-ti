import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

const HEADER_ESPERADO = 'X-Requested-With';
const VALOR_ESPERADO = 'sistema-chamados-ti';

/**
 * Mitigação de CSRF para rotas que autenticam só via cookie (refresh/logout),
 * sem exigir Authorization: Bearer. Exigir um header custom força o navegador
 * a fazer preflight CORS antes da requisição real — e o preflight só passa
 * se a origem bater com CORS_ORIGIN. Um site de terceiros não consegue
 * adicionar esse header a uma requisição "simples" (sem preflight), então
 * não tem como acionar essas rotas via CSRF usando o cookie da vítima.
 */
export function exigirHeaderCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (req.get(HEADER_ESPERADO) !== VALOR_ESPERADO) {
    next(AppError.proibido('Requisição não permitida.'));
    return;
  }

  next();
}
