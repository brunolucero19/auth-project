import { Router } from 'express';
import * as UserController from './user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.patch('/profile', authenticate, UserController.updateProfile);
router.delete('/profile', authenticate, UserController.deleteAccount);

// Admin Routes
router.get('/', authenticate, authorize([Role.ADMIN]), UserController.listUsers);

export default router;
