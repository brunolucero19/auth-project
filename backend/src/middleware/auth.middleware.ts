import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/auth';

interface JwtPayload {
  userId: string;
  role: Role;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.accessToken;

  // Fallback to Header (optional, for backward compatibility or mobile apps)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
    // Attach user to request object using type assertion or extending type definition
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

export const authorize = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as AuthenticatedRequest).user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Prohibido: Permisos insuficientes' });
    }
    next();
  };
};
