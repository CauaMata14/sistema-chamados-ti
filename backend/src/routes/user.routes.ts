import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate, authorize('tecnico'));

router.get('/technicians', userController.listarTecnicos);
router.get('/', userController.listarUsuarios);

export default router;
