import { z } from 'zod';
import { Types } from 'mongoose';

/** Valida que a string é um ObjectId válido do MongoDB antes de qualquer query. */
export const objectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), { message: 'Identificador inválido' });
