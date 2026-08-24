import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/AppError';
import type { PapelUsuario } from '../models/User';

export interface AccessTokenPayload {
  sub: string;
  papel: PapelUsuario;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function gerarAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verificarAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
}

/**
 * Emite um novo refresh token (JWT) para o usuário e persiste o hash dele
 * no banco, para permitir revogação e detecção de reuso na rotação.
 */
export async function emitirRefreshToken(usuarioId: string): Promise<string> {
  const jti = crypto.randomUUID();
  const options: jwt.SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  const token = jwt.sign(
    { sub: usuarioId, jti } satisfies RefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    options,
  );

  const decoded = jwt.decode(token) as { exp: number };

  await RefreshToken.create({
    usuario: usuarioId,
    tokenHash: hashToken(token),
    expiresAt: new Date(decoded.exp * 1000),
  });

  return token;
}

/**
 * Valida um refresh token e faz a rotação: revoga o token usado e emite um
 * par novo (access + refresh). Se o token apresentado já estiver revogado,
 * isso indica reuso (possível roubo de token) e todas as sessões do usuário
 * são invalidadas por segurança.
 */
export async function rotacionarTokens(
  refreshTokenRecebido: string,
): Promise<{ accessToken: string; refreshToken: string; usuarioId: string; papel: PapelUsuario }> {
  let payload: RefreshTokenPayload & { exp: number };

  try {
    payload = jwt.verify(refreshTokenRecebido, env.JWT_REFRESH_SECRET) as unknown as RefreshTokenPayload & {
      exp: number;
    };
  } catch {
    throw AppError.naoAutorizado('Sessão expirada. Faça login novamente.');
  }

  const hash = hashToken(refreshTokenRecebido);
  const registro = await RefreshToken.findOne({ tokenHash: hash });

  if (!registro) {
    throw AppError.naoAutorizado('Sessão inválida. Faça login novamente.');
  }

  if (registro.revokedAt) {
    // Token já usado antes: possível reuso indevido. Revoga tudo do usuário.
    await RefreshToken.updateMany(
      { usuario: registro.usuario, revokedAt: null },
      { revokedAt: new Date() },
    );
    throw AppError.naoAutorizado('Sessão inválida. Faça login novamente.');
  }

  const { User } = await import('../models/User.js');
  const usuario = await User.findById(payload.sub);

  if (!usuario || !usuario.ativo) {
    throw AppError.naoAutorizado('Sessão inválida. Faça login novamente.');
  }

  const novoRefreshToken = await emitirRefreshToken(String(usuario._id));
  const novoHash = hashToken(novoRefreshToken);

  registro.revokedAt = new Date();
  registro.substituidoPorHash = novoHash;
  await registro.save();

  const novoAccessToken = gerarAccessToken({ sub: String(usuario._id), papel: usuario.papel });

  return {
    accessToken: novoAccessToken,
    refreshToken: novoRefreshToken,
    usuarioId: String(usuario._id),
    papel: usuario.papel,
  };
}

export async function revogarRefreshToken(refreshTokenRecebido: string): Promise<void> {
  const hash = hashToken(refreshTokenRecebido);
  await RefreshToken.updateOne({ tokenHash: hash, revokedAt: null }, { revokedAt: new Date() });
}
