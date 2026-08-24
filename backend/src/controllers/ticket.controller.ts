import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as ticketService from '../services/ticket.service';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketService.criarTicket(req.usuarioAutenticado!.id, req.body);
  res.status(201).json({ ticket });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { status, categoria, prioridade, tecnicoResponsavel, pagina, limite } = req.query as unknown as {
    status?: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
    categoria?: string;
    prioridade?: 'baixa' | 'media' | 'alta' | 'critica';
    tecnicoResponsavel?: string;
    pagina: number;
    limite: number;
  };

  const resultado = await ticketService.listarTickets(req.usuarioAutenticado!, {
    status,
    categoria,
    prioridade,
    tecnicoResponsavel,
    pagina,
    limite,
  });

  res.status(200).json(resultado);
});

export const buscarPorId = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketService.buscarTicketPorId(req.params.id, req.usuarioAutenticado!);
  res.status(200).json({ ticket });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketService.atualizarTicket(req.params.id, req.usuarioAutenticado!, req.body);
  res.status(200).json({ ticket });
});

export const atualizarStatus = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketService.atualizarStatus(req.params.id, req.usuarioAutenticado!, req.body.status);
  res.status(200).json({ ticket });
});

export const atribuirTecnico = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketService.atribuirTecnico(
    req.params.id,
    req.usuarioAutenticado!,
    req.body.tecnicoId,
  );
  res.status(200).json({ ticket });
});

export const adicionarComentario = asyncHandler(async (req: Request, res: Response) => {
  const evento = await ticketService.adicionarComentario(
    req.params.id,
    req.usuarioAutenticado!,
    req.body.texto,
  );
  res.status(201).json({ evento });
});

export const buscarTimeline = asyncHandler(async (req: Request, res: Response) => {
  const timeline = await ticketService.buscarTimeline(req.params.id, req.usuarioAutenticado!);
  res.status(200).json({ timeline });
});
