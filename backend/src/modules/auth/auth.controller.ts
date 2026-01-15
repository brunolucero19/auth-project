import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const user = await AuthService.registerUser(email, password, name);
    res.status(201).json({ message: 'Usuario creado exitosamente', user: { id: user.id, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(400).json({ message: (error as Error).message });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, accessToken, refreshToken } = await AuthService.loginUser(email, password, userAgent, ipAddress as string);

    // Secure cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Secure cookie for access token
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes (matches JWT expiration)
    });

    // Return user data but NO tokens in body
    res.json({ message: 'Inicio de sesión exitoso', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ message: 'Sesión cerrada exitosamente' });
};

export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    // req.user is set by passport (the profile)
    const profile = req.user as any;
    
    let email = profile.emails?.[0]?.value;
    const name = profile.displayName || profile.username;
    const image = profile.photos?.[0]?.value;
    
    if (!email) {
      if (profile.provider === 'github' && profile.id) {
         email = `${profile.username || 'user'}.${profile.id}@github.no-reply.com`;
      } else {
         throw new Error('No se encontró email en el perfil de OAuth');
      }
    }

    // Find or create user
    const user = await AuthService.findOrCreateUserFromOAuth(email, name, profile.provider, profile.id, image);

    // Generate tokens
    const { accessToken, refreshToken } = AuthService.generateTokens(user);

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Set Access Token Cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    // Redirect to frontend dashboard (no tokens in URL)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('OAuth Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email es requerido' });
        
        await AuthService.requestPasswordReset(email);
        res.json({ message: 'Si el correo existe, se han enviado instrucciones para restablecer la contraseña.' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token y contraseña son requeridos' });

        await AuthService.resetPassword(token, password);
        res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
