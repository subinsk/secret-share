import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getUserId() {
  const session = await requireAuth();
  return session.user.id;
}
