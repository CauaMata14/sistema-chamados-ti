import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as dashboardService from '../services/dashboard.service';

export const metricas = asyncHandler(async (_req: Request, res: Response) => {
  const dados = await dashboardService.obterMetricas();
  res.status(200).json(dados);
});
