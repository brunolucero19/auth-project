import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, avatar: true, emailVerified: true, createdAt: true },
  });
};

export const updateUser = async (id: string, data: Partial<User>) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  
  return { users, total, page, pages: Math.ceil(total / limit) };
};
