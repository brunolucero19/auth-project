import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import prisma from '../../config/prisma';

export const registerUser = async (email: string, password: string, name?: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: Role.USER,
    },
  });

  return user;
};

export const loginUser = async (email: string, password: string, userAgent?: string, ipAddress?: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await createSession(user.id, userAgent, ipAddress, refreshToken);

  return { user, accessToken, refreshToken };
};

export const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
};

const createSession = async (userId: string, userAgent: string | undefined, ipAddress: string | undefined, refreshToken: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.session.create({
    data: {
      userId,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });
};

export const findOrCreateUserFromOAuth = async (email: string, name: string, provider: string, providerId: string, image?: string) => {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Create new user
    const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
    
    user = await prisma.user.create({
      data: {
        email,
        name,
        password: dummyPassword,
        role: Role.USER,
        image,
      },
    });
  } else if (image && !user.image) {
      // Optional: Update image if missing
      user = await prisma.user.update({
          where: { id: user.id },
          data: { image }
      });
  }
  
  return user;
};
