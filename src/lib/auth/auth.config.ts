import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import { compare } from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// Importar para que las declaraciones de tipos se apliquen
import './auth.types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            password: true,
            role: true,
            tier: true,
            tierExpiresAt: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          logger.warn('Login failed: user not found or inactive', { email: parsed.data.email });
          return null;
        }

        const passwordMatch = await compare(parsed.data.password, user.password);
        if (!passwordMatch) {
          logger.warn('Login failed: invalid password', { email: parsed.data.email });
          return null;
        }

        // Verificar si el tier expiró
        if (user.tierExpiresAt && user.tierExpiresAt < new Date() && user.tier !== 'FREE') {
          await prisma.user.update({
            where: { id: user.id },
            data: { tier: 'FREE', tierExpiresAt: null },
          });
          user.tier = 'FREE';
          user.tierExpiresAt = null;
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        logger.info('User logged in', { userId: user.id, email: user.email });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.username,
          image: user.avatarUrl,
          username: user.username,
          role: user.role,
          tier: user.tier,
          tierExpiresAt: user.tierExpiresAt?.toISOString() ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userData = user as unknown as {
          id: string;
          username: string;
          role: string;
          tier: string;
          tierExpiresAt: string | null;
        };
        token.id = userData.id;
        token.username = userData.username;
        token.role = userData.role;
        token.tier = userData.tier;
        token.tierExpiresAt = userData.tierExpiresAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as unknown as Record<string, unknown>;
        sessionUser.id = token.id;
        sessionUser.username = token.username;
        sessionUser.role = token.role;
        sessionUser.tier = token.tier;
        sessionUser.tierExpiresAt = token.tierExpiresAt;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
};
