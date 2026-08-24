import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as userService from '../services/user.service';

export const listarTecnicos = asyncHandler(async (_req: Request, res: Response) => {
  const tecnicos = await userService.listarTecnicos();
  res.status(200).json({ tecnicos });
});

export const listarUsuarios = asyncHandler(async (_req: Request, res: Response) => {
  const usuarios = await userService.listarUsuarios();
  res.status(200).json({ usuarios });
});
