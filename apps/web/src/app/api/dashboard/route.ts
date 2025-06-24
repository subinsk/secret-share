import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const prisma = new PrismaClient();

export async function GET() {
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

    // Filter out expired secrets and mark them as such
    const now = new Date();
    const secretsWithStatus = secrets.map(secret => ({
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
