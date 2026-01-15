import { Request, Response } from 'express';
import * as UserService from './user.service';
import { AuthenticatedRequest } from '../../types/auth';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Basic validation logic here or use Zod
    const updatedUser = await UserService.updateUser(userId, req.body);
    res.json({ message: 'Perfil actualizado', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};



export const listUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await UserService.getAllUsers(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
