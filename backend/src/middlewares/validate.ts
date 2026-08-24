import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Valida body/query/params de uma requisição contra um schema Zod.
 * Roda no back-end mesmo quando o front já validou, porque a UI não é
 * uma fronteira de segurança confiável.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!resultado.success) {
      const primeiroErro = formatarPrimeiroErro(resultado.error);
      next(new AppError(primeiroErro, 422));
      return;
    }

    if (resultado.data.body !== undefined) req.body = resultado.data.body;
    if (resultado.data.query !== undefined) {
      Object.assign(req.query, resultado.data.query);
    }
    if (resultado.data.params !== undefined) {
      Object.assign(req.params, resultado.data.params);
    }

    next();
  };
}

function formatarPrimeiroErro(error: ZodError): string {
  const issue = error.issues[0];
  return issue ? issue.message : 'Dados inválidos.';
}
