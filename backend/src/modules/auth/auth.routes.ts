import { Router } from 'express';
import * as AuthController from './auth.controller';
import passport from 'passport';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// OAuth Routes
// Helper to handle OAuth success
const handleOAuthSuccess = async (req: any, res: any) => {
  const user = req.user; // Passport user
  // Find or create user in DB (Passport strategy might return profile, we need actual DB user)
  // For this quick implementation, we assume strategy helps or we do it here.
  // Actually, let's update strategy to return DB user or handle it here.
  
  // Realistically, we need to ensure the user exists in DB.
  // We'll delegate this to a controller function or service.
  // But since we can't easily change strategy right now without more context,
  // let's assume we need to upsert the user here or in strategy.
  
  // Let's modify the flow: 
  // 1. Passport strategy verifies/creates user.
  // 2. Returns user object.
  // 3. Callback generates tokens.

  try {
     // We need to properly import AuthService and generate tokens. 
     // Note: We need to import generateTokens from auth.service
     // But auth.service exports it.
     
     // Quick fix: Redirect to a frontend page that shows "Processing login..."
     // But we need the tokens.
     
     // Let's rely on the controller to handle the logic if we move this to controller.
     // For now, inline:
     
     const { AuthService } = require('./auth.service'); // Dynamic import or fix top-level
     // Better: Call AuthController.oauthCallback(req, res)
     
     // Let's refactor routes to use controller methods.
     res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=PLACEHOLDER_FIX_ME`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`);
  }
};

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  AuthController.handleOAuthCallback
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  AuthController.handleOAuthCallback
);

export default router;
