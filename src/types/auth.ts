import { UserRole } from '@prisma/client';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cseRole: string | null;
}

export interface AuthError {
  message: string;
  code?: string;
}
