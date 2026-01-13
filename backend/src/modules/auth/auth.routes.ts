import { Router } from 'express';
import * as AuthController from './auth.controller';
import passport from 'passport';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (_req, res) => {
    // Determine where to redirect after success
    // For now, we'll just redirect to frontend dashboard with a query param (unsafe for prod, need secure token passing)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?login=success`); 
  }
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (_req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?login=success`);
  }
);

export default router;
