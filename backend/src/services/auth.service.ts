import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@backend/config/db';
import { env } from '@backend/config/env';
import { BadRequestError, UnauthorizedError } from '@backend/utils/appError';
import { RegisterInput, LoginInput } from '@backend/validators/auth.validator';

interface AuthServiceResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
  };
  token: string;
}

export const registerUser = async (data: RegisterInput): Promise<AuthServiceResponse> => {
  const { email, password, name } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Exclude password in database retrieval using select
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Sign JWT Access Token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' } // Match the cookie lifetime
  );

  /* 
   * TODO: [Refresh Token Placeholder]
   * In a future milestone, generate a separate cryptographically secure Refresh Token here:
   * const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
   * Save refresh token in database (e.g. prisma.refreshToken.create(...)) for session tracking.
   */

  return { user, token };
};

export const loginUser = async (data: LoginInput): Promise<AuthServiceResponse> => {
  const { email, password } = data;

  // Retrieve user (needs password hash for verification)
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify hash
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Sign JWT Access Token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' } // Match the cookie lifetime
  );

  /* 
   * TODO: [Refresh Token Placeholder]
   * In a future milestone, generate and save refresh token:
   * const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
   * Keep this synced with client DB session storage.
   */

  // Explicitly return a sanitized user object (never return user.password)
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};
