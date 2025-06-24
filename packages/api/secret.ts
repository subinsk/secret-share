import { router, procedure, protectedProcedure } from './trpc';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import { encryptSecret, decryptSecret } from '../../lib/encryption-simple';
import { notificationService } from '../../lib/notifications';

const prisma = new PrismaClient();

// Helper function to get client IP (simplified version)
function getClientIP(ctx: any): string {
  try {
    // Try to get IP from various headers
    const headers = ctx?.req?.headers;
    if (headers) {
      const forwarded = headers['x-forwarded-for'];
      const realIP = headers['x-real-ip'];
      const cfConnectingIP = headers['cf-connecting-ip'];
      
      if (forwarded) {
        return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown';
      }
      if (realIP) {
        return typeof realIP === 'string' ? realIP : 'unknown';
      }
      if (cfConnectingIP) {
        return typeof cfConnectingIP === 'string' ? cfConnectingIP : 'unknown';
      }
    }
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// Input schemas
const createSecretSchema = z.object({
  secretText: z.string().min(1, 'Secret text is required'),
  expiresAt: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  password: z.string().optional(),
  oneTimeAccess: z.boolean().default(true),
});

const getSecretSchema = z.object({
  id: z.string(),
  password: z.string().optional(),
});

const getSecretInfoSchema = z.object({
  id: z.string(),
});

export const secretRouter = router({  // Create a new secret
  create: protectedProcedure
    .input(createSecretSchema)
    .mutation(async ({ input, ctx }) => {
      const secretId = nanoid(12);
      const hashedPassword = input.password ? await hash(input.password, 12) : null;
      
      // Encrypt the secret text before storing
      const encryptedSecretText = encryptSecret(input.secretText);
      
      const secret = await prisma.secret.create({
        data: {
          id: secretId,
          secretText: encryptedSecretText, // Store encrypted version
          expiresAt: input.expiresAt,
          password: hashedPassword,
          oneTimeAccess: input.oneTimeAccess,
          userId: ctx.session.user.id,
          isViewed: false,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });      return {
        id: secret.id,
        url: `/secret/${secret.id}`,
        createdAt: secret.createdAt,
      };
    }),
  // Get a secret by ID
  get: procedure
    .input(getSecretSchema)
    .query(async ({ input, ctx }) => {const secret = await prisma.secret.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          secretText: true,
          createdAt: true,
          expiresAt: true,
          isViewed: true,
          oneTimeAccess: true,
          password: true,
          userId: true,
        },
      });

      if (!secret) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found',
        });
      }

      // Check if expired
      if (secret.expiresAt && new Date() > secret.expiresAt) {
        await prisma.secret.delete({ where: { id: input.id } });        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret has expired',
        });
      }      // Check if already viewed (only for one-time access secrets)
      if (secret.oneTimeAccess && secret.isViewed) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret has already been viewed',
        });
      }

      // Check password if required
      if (secret.password) {
        if (!input.password) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Password required',
          });
        }
        
        const isValidPassword = await compare(input.password, secret.password);
        if (!isValidPassword) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid password',
          });
        }
      }      // Mark as viewed (only for one-time access secrets)
      if (secret.oneTimeAccess) {
        await prisma.secret.update({
          where: { id: input.id },
          data: { isViewed: true },
        });

        // Send burn notification if the secret has an owner
        if (secret.userId) {
          try {
            const owner = await prisma.user.findUnique({
              where: { id: secret.userId },
              select: { email: true },
            });

            if (owner?.email) {              // Get client IP for notification
              const clientIP = getClientIP(ctx);
              
              // Decrypt for preview (first 20 characters)
              const decryptedText = decryptSecret(secret.secretText);
              const preview = decryptedText.length > 20 
                ? decryptedText.substring(0, 20)
                : decryptedText;

              // Send notification asynchronously (don't wait for it)
              notificationService.sendSecretBurnNotification({
                secretId: secret.id,
                ownerEmail: owner.email,
                viewedAt: new Date(),
                viewerIP: clientIP,
                secretPreview: preview,
              }).catch(console.error);
            }
          } catch (error) {
            console.error('Failed to send burn notification:', error);
            // Don't fail the request if notification fails
          }
        }
      }

      // Decrypt the secret text before returning
      const decryptedSecretText = decryptSecret(secret.secretText);

      return {
        secretText: decryptedSecretText, // Return decrypted version
        createdAt: secret.createdAt,
        oneTimeAccess: secret.oneTimeAccess,
      };}),

  // Get secret info without revealing content
  getInfo: procedure
    .input(getSecretInfoSchema)
    .query(async ({ input }) => {
      const secret = await prisma.secret.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
          isViewed: true,
          oneTimeAccess: true,
          password: true,
        },
      });

      if (!secret) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found',
        });
      }

      // Check if expired
      if (secret.expiresAt && new Date() > secret.expiresAt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret has expired',
        });
      }

      // Check if already viewed (only for one-time access secrets)
      if (secret.oneTimeAccess && secret.isViewed) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret has already been viewed',
        });
      }

      return {
        id: secret.id,
        createdAt: secret.createdAt,
        expiresAt: secret.expiresAt,
        oneTimeAccess: secret.oneTimeAccess,
        hasPassword: !!secret.password,
        isViewed: secret.isViewed,
      };
    }),
  // List user's secrets (authenticated only)
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const secrets = await prisma.secret.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          secretText: true,
          createdAt: true,
          expiresAt: true,
          isViewed: true,
          password: true,
          oneTimeAccess: true,
        },
      });

      // Filter out expired secrets and add status
      const now = new Date();
      const secretsWithStatus = secrets.map(secret => {
        let secretPreview = '';
        try {
          // Decrypt and create a preview (first 50 characters)
          const decryptedText = decryptSecret(secret.secretText);
          secretPreview = decryptedText.length > 50 
            ? decryptedText.substring(0, 50) + '...' 
            : decryptedText;
        } catch (error) {
          // If decryption fails, show error
          secretPreview = '[Decryption Error]';
        }

        return {
          ...secret,
          secretText: secretPreview, // Show preview instead of encrypted data
          hasPassword: !!secret.password,
          password: undefined, // Don't send password hash to client
          status: secret.oneTimeAccess && secret.isViewed 
            ? 'viewed' 
            : secret.expiresAt && secret.expiresAt < now 
            ? 'expired' 
            : 'active',
        };
      });

      return secretsWithStatus;
    }),

  // Delete a secret (authenticated only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify the secret belongs to the user
      const secret = await prisma.secret.findFirst({
        where: { 
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!secret) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found or not authorized',
        });
      }

      await prisma.secret.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
  // Search user's secrets
  search: procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }: any) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      // Since secrets are encrypted, we need to get all secrets and decrypt them for search
      const secrets = await prisma.secret.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          secretText: true,
          createdAt: true,
          expiresAt: true,
          isViewed: true,
          password: true,
          oneTimeAccess: true,
        },
      });

      // Decrypt and filter secrets based on search query
      const now = new Date();
      const filteredSecrets = secrets
        .map(secret => {
          try {
            const decryptedText = decryptSecret(secret.secretText);
            return {
              ...secret,
              decryptedText,
              secretText: decryptedText.length > 50 
                ? decryptedText.substring(0, 50) + '...' 
                : decryptedText,
            };
          } catch (error) {
            return null; // Skip secrets that can't be decrypted
          }
        })
        .filter(secret => 
          secret && 
          secret.decryptedText.toLowerCase().includes(input.query.toLowerCase())
        )
        .map(secret => ({
          id: secret!.id,
          secretText: secret!.secretText,
          createdAt: secret!.createdAt,
          expiresAt: secret!.expiresAt,
          isViewed: secret!.isViewed,
          oneTimeAccess: secret!.oneTimeAccess,
          hasPassword: !!secret!.password,
          status: secret!.oneTimeAccess && secret!.isViewed 
            ? 'viewed' 
            : secret!.expiresAt && secret!.expiresAt < now 
            ? 'expired' 
            : 'active',
        }));

      return filteredSecrets;
    }),
});
