import type { PapelUsuario } from '../models/User';

/**
 * Estende o tipo Request do Express com os dados do usuário autenticado,
 * preenchidos pelo middleware `authenticate`.
 */
declare global {
  namespace Express {
    interface Request {
      usuarioAutenticado?: {
        id: string;
        papel: PapelUsuario;
      };
    }
  }
}

export {};
