import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import {
  atribuirTecnicoSchema,
  atualizarStatusSchema,
  atualizarTicketSchema,
  criarComentarioSchema,
  criarTicketSchema,
  idTicketSchema,
  listarTicketsQuerySchema,
} from '../validators/ticket.validators';

const router = Router();

router.use(authenticate);

router.post('/', validate(criarTicketSchema), ticketController.criar);
router.get('/', validate(listarTicketsQuerySchema), ticketController.listar);
router.get('/:id', validate(idTicketSchema), ticketController.buscarPorId);
router.patch('/:id', validate(atualizarTicketSchema), ticketController.atualizar);

router.patch(
  '/:id/status',
  authorize('tecnico'),
  validate(atualizarStatusSchema),
  ticketController.atualizarStatus,
);

router.patch(
  '/:id/assign',
  authorize('tecnico'),
  validate(atribuirTecnicoSchema),
  ticketController.atribuirTecnico,
);

router.post(
  '/:id/comments',
  validate(criarComentarioSchema),
  ticketController.adicionarComentario,
);

router.get('/:id/timeline', validate(idTicketSchema), ticketController.buscarTimeline);

export default router;
