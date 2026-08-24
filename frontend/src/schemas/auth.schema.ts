import { z } from 'zod';

export const registerFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
  email: z.string().trim().email('Informe um e-mail válido'),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
    .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número'),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  senha: z.string().min(1, 'Informe sua senha'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
