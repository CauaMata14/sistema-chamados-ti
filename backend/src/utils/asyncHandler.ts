import type { NextFunction, Request, Response } from 'express';

type RequestHandlerAsync = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Evita repetir try/catch em cada controller: encaminha qualquer rejeição
 * da função assíncrona para o middleware de erro central.
 */
export function asyncHandler(handler: RequestHandlerAsync) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
