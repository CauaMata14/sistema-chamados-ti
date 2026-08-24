import { z } from 'zod';
import { objectIdSchema } from './shared.validators';

export const criarCategoriaSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'Nome é obrigatório' }).trim().min(2).max(60),
    descricao: z.string().trim().max(240).optional().default(''),
  }),
});

export const atualizarCategoriaSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    nome: z.string().trim().min(2).max(60).optional(),
    descricao: z.string().trim().max(240).optional(),
    ativo: z.boolean().optional(),
  }),
});

export const idCategoriaSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export type CriarCategoriaInput = z.infer<typeof criarCategoriaSchema>['body'];
export type AtualizarCategoriaInput = z.infer<typeof atualizarCategoriaSchema>['body'];
