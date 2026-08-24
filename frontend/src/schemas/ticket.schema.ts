import { z } from 'zod';

export const criarTicketFormSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(150, 'O título deve ter no máximo 150 caracteres'),
  descricao: z
    .string()
    .trim()
    .min(10, 'Descreva o problema com pelo menos 10 caracteres')
    .max(4000, 'Descrição muito longa'),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']),
});

export type CriarTicketFormValues = z.infer<typeof criarTicketFormSchema>;

export const comentarioFormSchema = z.object({
  texto: z.string().trim().min(1, 'Escreva um comentário').max(2000, 'Comentário muito longo'),
});

export type ComentarioFormValues = z.infer<typeof comentarioFormSchema>;
