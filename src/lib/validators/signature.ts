/**
 * Signature validation schemas and utilities
 */

import { z } from 'zod';

/**
 * Schema for creating a signature
 */
export const createSignatureSchema = z.object({
  minuteId: z.string().min(1, 'Le compte-rendu est requis'),
  comments: z.string().max(500, 'Le commentaire ne peut pas dépasser 500 caractères').optional().nullable(),
});

/**
 * Schema for updating a signature
 */
export const updateSignatureSchema = z.object({
  comments: z.string().max(500, 'Le commentaire ne peut pas dépasser 500 caractères').optional().nullable(),
});

/**
 * Type for create signature input
 */
export type CreateSignatureInput = z.infer<typeof createSignatureSchema>;

/**
 * Type for update signature input
 */
export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;

/**
 * Check if a user can sign a minute
 */
export function canSignMinute(minuteStatus: string, userRole: string): boolean {
  // Only minutes in PENDING_SIGNATURE status can be signed
  if (minuteStatus !== 'PENDING_SIGNATURE') {
    return false;
  }

  // ADMIN and PRESIDENT can sign
  return ['ADMIN', 'PRESIDENT'].includes(userRole);
}

/**
 * Check if a user can remove their signature
 */
export function canRemoveSignature(minuteStatus: string): boolean {
  // Can only remove signature if minute is still in PENDING_SIGNATURE status
  return minuteStatus === 'PENDING_SIGNATURE';
}

/**
 * Get signature status label
 */
export function getSignatureStatusLabel(hasSignature: boolean): string {
  return hasSignature ? 'Signé' : 'En attente';
}

/**
 * Get signature status color
 */
export function getSignatureStatusColor(hasSignature: boolean): string {
  return hasSignature ? 'green' : 'yellow';
}

/**
 * Calculate signature progress
 */
export function calculateSignatureProgress(
  currentSignatures: number,
  requiredSignatures: number
): {
  percentage: number;
  isComplete: boolean;
  label: string;
} {
  const percentage = Math.round((currentSignatures / requiredSignatures) * 100);
  const isComplete = currentSignatures >= requiredSignatures;
  const label = `${currentSignatures}/${requiredSignatures} signatures`;

  return { percentage, isComplete, label };
}

/**
 * Get list of eligible signers
 */
export function getEligibleSignerRoles(): string[] {
  return ['ADMIN', 'PRESIDENT'];
}
