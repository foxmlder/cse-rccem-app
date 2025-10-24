import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Schema for creating a user
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: z.enum([UserRole.ADMIN, UserRole.PRESIDENT, UserRole.MEMBER], {
    required_error: 'Le rôle est requis',
  }),
  cseRole: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Schema for updating a user
export const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  role: z.enum([UserRole.ADMIN, UserRole.PRESIDENT, UserRole.MEMBER]).optional(),
  cseRole: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Helper function to get role label
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrateur',
    PRESIDENT: 'Président',
    MEMBER: 'Membre',
  };
  return labels[role];
}

// Helper function to get role color
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    PRESIDENT: 'bg-purple-100 text-purple-800',
    MEMBER: 'bg-blue-100 text-blue-800',
  };
  return colors[role];
}

// Common CSE roles
export const CSE_ROLES = [
  'Président',
  'Vice-Président',
  'Secrétaire',
  'Secrétaire adjoint',
  'Trésorier',
  'Trésorier adjoint',
  'Titulaire',
  'Suppléant',
  'Représentant syndical',
];

// Helper to get status badge info
export function getStatusBadge(isActive: boolean): { label: string; className: string } {
  return isActive
    ? { label: 'Actif', className: 'bg-green-100 text-green-800' }
    : { label: 'Inactif', className: 'bg-gray-100 text-gray-800' };
}
