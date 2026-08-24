import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import routes from './routes';
import { errorHandler, rotaNaoEncontrada } from './middlewares/errorHandler';
import { env } from './config/env';

export function createApp(): Application {
  const app = express();

  // Confia só no 1º proxy reverso (Render/Vercel) para que req.ip reflita o
  // IP real do cliente via X-Forwarded-For. Sem isso, todos os clientes
  // aparecem com o mesmo IP atrás do proxy, e o rate limiter de auth passa a
  // contar tentativas de todo mundo junto — bloqueando todos os usuários
  // depois de poucas tentativas de qualquer um.
  app.set('trust proxy', 1);

  app.use(helmet());

  // CORS com origem explícita — nunca "*" — para permitir cookies httpOnly
  // do refresh token entre front-end e API.
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  // Remove operadores Mongo ($, .) de req.body/params/query para mitigar
  // NoSQL injection antes de qualquer query chegar ao Mongoose.
  app.use(mongoSanitize());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', routes);

  app.use(rotaNaoEncontrada);
  app.use(errorHandler);

  return app;
}
