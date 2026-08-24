import 'dotenv/config';
import { z } from 'zod';

/**
 * Valida e tipa as variáveis de ambiente na inicialização do processo.
 * Se algo obrigatório faltar, o servidor falha ao subir em vez de falhar
 * silenciosamente em runtime.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI é obrigatório'),

  // 32+ caracteres (idealmente gerado com `openssl rand -base64 48`) para
  // resistir a força bruta offline contra o HMAC do JWT.
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET deve ter pelo menos 32 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN é obrigatório'),

  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  // Notificações por e-mail (mudança de status de chamado). Todo opcional:
  // sem SMTP_HOST/SMTP_USER/SMTP_PASS o envio fica desativado — o sistema
  // continua funcionando normalmente, só sem notificar por e-mail.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Configuração de ambiente inválida. Verifique o arquivo .env.');
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';

// SMTP totalmente configurado é o único caso em que o envio de e-mail é
// tentado; caso contrário, email.service faz no-op silencioso (avisado
// uma única vez no log) em vez de falhar a operação de negócio.
export const emailHabilitado = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
