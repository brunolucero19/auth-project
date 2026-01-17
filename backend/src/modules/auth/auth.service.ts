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
    throw new Error('Usuario no encontrado');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Contraseña incorrecta, intente nuevamente');
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

import { sendEmail } from '../../services/email.service';
import crypto from 'crypto';

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Security: Don't reveal if user exists. Return true effectively.
    return; 
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      token,
      identifier: user.email,
      expires: expiresAt,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  
  // LOG FOR DEVELOPMENT: Allow testing without valid email setup
  if (process.env.NODE_ENV === 'development') {
    console.log('================================================');
    console.log('LINK DE RECUPERACIÓN (Copia y pega en navegador):');
    console.log(resetLink);
    console.log('================================================');
  }

  await sendEmail(
    email,
    'Restablecer Contraseña',
    `<p>Hola ${user.name || 'Usuario'},</p>
     <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
     <a href="${resetLink}">Restablecer Contraseña</a>
     <p>Este enlace expira en 1 hora.</p>`
  );
};

export const resetPassword = async (token: string, newPassword: string) => {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  
  if (!resetToken || resetToken.expires < new Date()) {
    throw new Error('Token inválido o expirado');
  }

  const user = await prisma.user.findUnique({ where: { email: resetToken.identifier } });
  if (!user) {
      throw new Error('Usuario no asociado al token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({ where: { token } });
  
  return true;
};
