import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { exigirHeaderCsrf } from '../middlewares/csrf';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validators/auth.validators';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
// refresh e logout autenticam só pelo cookie httpOnly — exigem o header
// anti-CSRF, já que não têm um Bearer token pra provar que a chamada veio
// da nossa própria aplicação.
router.post('/refresh', exigirHeaderCsrf, authRateLimiter, authController.refresh);
router.post('/logout', exigirHeaderCsrf, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
