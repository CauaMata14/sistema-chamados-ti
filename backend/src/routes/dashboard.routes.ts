import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.get('/metrics', authenticate, authorize('tecnico'), dashboardController.metricas);

export default router;
