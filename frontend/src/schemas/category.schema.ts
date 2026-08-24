import { z } from 'zod';

export const categoriaFormSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(60),
  descricao: z.string().trim().max(240).optional().default(''),
});

export type CategoriaFormValues = z.infer<typeof categoriaFormSchema>;
