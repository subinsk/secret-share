import { z } from 'zod';
import { router, protectedProcedure } from './trpc';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userRouter = router({
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required'),
    }))
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return updatedUser;
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }),
});
