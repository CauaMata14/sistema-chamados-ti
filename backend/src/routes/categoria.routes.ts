import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import {
  atualizarCategoriaSchema,
  criarCategoriaSchema,
  idCategoriaSchema,
} from '../validators/categoria.validators';

const router = Router();

router.use(authenticate);

router.get('/', categoriaController.listar);
router.post('/', authorize('tecnico'), validate(criarCategoriaSchema), categoriaController.criar);
router.patch(
  '/:id',
  authorize('tecnico'),
  validate(atualizarCategoriaSchema),
  categoriaController.atualizar,
);
router.delete('/:id', authorize('tecnico'), validate(idCategoriaSchema), categoriaController.remover);

export default router;
