import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    nome: z
      .string({ required_error: 'Nome é obrigatório' })
      .trim()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(120, 'Nome deve ter no máximo 120 caracteres'),
    email: z
      .string({ required_error: 'E-mail é obrigatório' })
      .trim()
      .email('E-mail inválido')
      .max(254),
    senha: z
      .string({ required_error: 'Senha é obrigatória' })
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres')
      .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
      .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'E-mail é obrigatório' }).trim().email('E-mail inválido'),
    senha: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
