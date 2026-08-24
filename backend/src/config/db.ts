import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('sanitizeFilter', true);

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.warn('[db] conectado ao MongoDB');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[db] erro de conexão com o MongoDB:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] desconectado do MongoDB');
  });

  await mongoose.connect(env.MONGODB_URI);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
