import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

/**
 * Get the current session on the server side
 */
export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Get the current session or redirect to sign in
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return session;
}

/**
 * Get the current user or redirect to sign in
 */
export async function getCurrentUser() {
  const session = await requireAuth();
  return session.user;
}
