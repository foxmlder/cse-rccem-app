import { z } from 'zod';
import { MinuteStatus } from '@prisma/client';

// Schema for creating a minute
export const createMinuteSchema = z.object({
  meetingId: z.string().min(1, 'La réunion est requise'),
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
});

// Schema for updating a minute
export const updateMinuteSchema = z.object({
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères').optional(),
  status: z.enum([
    MinuteStatus.DRAFT,
    MinuteStatus.PENDING_SIGNATURE,
    MinuteStatus.SIGNED,
    MinuteStatus.PUBLISHED,
  ]).optional(),
  pdfUrl: z.string().url().optional().nullable(),
  sentAt: z.string().datetime().optional().nullable(),
});

// Type exports
export type CreateMinuteInput = z.infer<typeof createMinuteSchema>;
export type UpdateMinuteInput = z.infer<typeof updateMinuteSchema>;

// Helper function to get status label
export function getMinuteStatusLabel(status: MinuteStatus): string {
  const labels: Record<MinuteStatus, string> = {
    DRAFT: 'Brouillon',
    PENDING_SIGNATURE: 'En attente de signature',
    SIGNED: 'Signé',
    PUBLISHED: 'Publié',
  };
  return labels[status];
}

// Helper function to get status color
export function getMinuteStatusColor(status: MinuteStatus): string {
  const colors: Record<MinuteStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_SIGNATURE: 'bg-orange-100 text-orange-800',
    SIGNED: 'bg-blue-100 text-blue-800',
    PUBLISHED: 'bg-green-100 text-green-800',
  };
  return colors[status];
}

// Helper to check if minute can be edited
export function canEditMinute(status: MinuteStatus): boolean {
  return status === MinuteStatus.DRAFT;
}

// Helper to check if minute can be submitted for signature
export function canSubmitForSignature(status: MinuteStatus): boolean {
  return status === MinuteStatus.DRAFT;
}

// Helper to check if minute can be published
export function canPublishMinute(status: MinuteStatus): boolean {
  return status === MinuteStatus.SIGNED;
}
