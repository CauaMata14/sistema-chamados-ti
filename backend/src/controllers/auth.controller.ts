import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as authService from '../services/auth.service';
import { isProduction } from '../config/env';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // 'none' é necessário em produção porque front-end (Vercel) e back-end (Render)
  // ficam em domínios diferentes — cookie cross-site só é enviado com sameSite='none'
  // (e exige secure=true, que já é o caso em produção). Em dev, 'lax' é suficiente
  // e mais seguro, já que front e back rodam em localhost.
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  path: '/api/auth',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await authService.registrar(req.body);
  res.cookie(REFRESH_COOKIE, resultado.refreshToken, cookieOptions);
  res.status(201).json({ accessToken: resultado.accessToken, usuario: resultado.usuario });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, resultado.refreshToken, cookieOptions);
  res.status(200).json({ accessToken: resultado.accessToken, usuario: resultado.usuario });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokenAtual = req.cookies?.[REFRESH_COOKIE];

  if (!tokenAtual) {
    throw AppError.naoAutorizado('Sessão não encontrada.');
  }

  const resultado = await authService.atualizarSessao(tokenAtual);
  res.cookie(REFRESH_COOKIE, resultado.refreshToken, cookieOptions);
  res.status(200).json({ accessToken: resultado.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const tokenAtual = req.cookies?.[REFRESH_COOKIE];

  if (tokenAtual) {
    await authService.logout(tokenAtual);
  }

  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const usuario = await authService.buscarUsuarioAutenticado(req.usuarioAutenticado!.id);
  res.status(200).json({ usuario });
});
