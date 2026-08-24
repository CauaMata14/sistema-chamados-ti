import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as categoryService from '../services/category.service';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const apenasAtivas = req.usuarioAutenticado?.papel !== 'tecnico';
  const categorias = await categoryService.listarCategorias(apenasAtivas);
  res.status(200).json({ categorias });
});

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const categoria = await categoryService.criarCategoria(req.body);
  res.status(201).json({ categoria });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const categoria = await categoryService.atualizarCategoria(req.params.id, req.body);
  res.status(200).json({ categoria });
});

export const remover = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.removerCategoria(req.params.id);
  res.status(204).send();
});
