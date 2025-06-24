import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const prisma = new PrismaClient();

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secrets = await prisma.secret.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        secretText: true,
        createdAt: true,
        expiresAt: true,
        isViewed: true,
        password: true,
      },
    });

    type SecretWithStatus = Omit<typeof secrets[number], 'password'> & {
      hasPassword: boolean;
      password?: undefined;
      status: 'viewed' | 'expired' | 'active';
    };


    // Filter out expired secrets and mark them as such
    const now = new Date();

    const secretsWithStatus: SecretWithStatus[] = secrets.map((secret:
      typeof secrets[number]
    ) => ({
      ...secret,
      hasPassword: !!secret.password,
      password: undefined, // Don't send password hash to client
      status: secret.isViewed
        ? 'viewed'
        : secret.expiresAt && secret.expiresAt < now
          ? 'expired'
          : 'active',
    }));

    return NextResponse.json({ secrets: secretsWithStatus });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch secrets' }, { status: 500 });
  }
}
