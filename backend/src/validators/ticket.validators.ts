import { z } from 'zod';
import { PRIORIDADES, STATUS_CHAMADO } from '../models/Ticket';
import { objectIdSchema } from './shared.validators';

export const criarTicketSchema = z.object({
  body: z.object({
    titulo: z.string({ required_error: 'Título é obrigatório' }).trim().min(5).max(150),
    descricao: z.string({ required_error: 'Descrição é obrigatória' }).trim().min(10).max(4000),
    categoria: objectIdSchema,
    prioridade: z.enum(PRIORIDADES).optional().default('media'),
  }),
});

export const atualizarTicketSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    titulo: z.string().trim().min(5).max(150).optional(),
    descricao: z.string().trim().min(10).max(4000).optional(),
    categoria: objectIdSchema.optional(),
    prioridade: z.enum(PRIORIDADES).optional(),
  }),
});

export const atualizarStatusSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    status: z.enum(STATUS_CHAMADO, { required_error: 'Status é obrigatório' }),
  }),
});

export const atribuirTecnicoSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    tecnicoId: objectIdSchema,
  }),
});

export const criarComentarioSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    texto: z.string({ required_error: 'Comentário não pode ser vazio' }).trim().min(1).max(2000),
  }),
});

export const idTicketSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export const listarTicketsQuerySchema = z.object({
  query: z.object({
    status: z.enum(STATUS_CHAMADO).optional(),
    categoria: objectIdSchema.optional(),
    prioridade: z.enum(PRIORIDADES).optional(),
    tecnicoResponsavel: objectIdSchema.optional(),
    pagina: z.coerce.number().int().positive().optional().default(1),
    limite: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export type CriarTicketInput = z.infer<typeof criarTicketSchema>['body'];
export type AtualizarTicketInput = z.infer<typeof atualizarTicketSchema>['body'];
