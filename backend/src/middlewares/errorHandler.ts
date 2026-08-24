import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { isProduction } from '../config/env';

/**
 * Middleware de erro centralizado. Todo erro da aplicação passa por aqui
 * (via next(err) ou via asyncHandler). Erros operacionais (AppError) viram
 * a mensagem certa para o cliente; qualquer outro erro vira uma mensagem
 * genérica de 500, sem stack trace exposto ao usuário final.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ erro: err.message });
    return;
  }

  console.error('[erro não tratado]', err);

  if (!isProduction) {
    const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
    res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: mensagem });
    return;
  }

  res.status(500).json({ erro: 'Erro interno do servidor. Tente novamente mais tarde.' });
}

export function rotaNaoEncontrada(req: Request, res: Response): void {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não existe.` });
}
