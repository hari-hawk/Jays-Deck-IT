import { Router, type Router as RouterType } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

export const authRouter: RouterType = Router();

authRouter.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  authController.login
);

authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);

authRouter.put(
  '/change-password',
  authenticate,
  body('currentPassword').isLength({ min: 8 }),
  body('newPassword').isLength({ min: 8 }),
  authController.changePassword
);
