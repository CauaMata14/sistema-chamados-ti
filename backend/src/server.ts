import { createApp } from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.warn(`[server] API rodando na porta ${env.PORT} (${env.NODE_ENV})`);
  });

  const encerrarComGraca = (sinal: string) => {
    console.warn(`[server] recebido ${sinal}, encerrando...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => encerrarComGraca('SIGTERM'));
  process.on('SIGINT', () => encerrarComGraca('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('[server] falha ao iniciar a aplicação:', error);
  process.exit(1);
});
