import { z } from 'zod';
import { FeedbackCategory, FeedbackStatus } from '@prisma/client';

// Schema for creating a feedback
export const createFeedbackSchema = z.object({
  meetingId: z.string().min(1, 'La réunion est requise'),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category: z.enum([
    FeedbackCategory.WORKING_CONDITIONS,
    FeedbackCategory.WORK_ORGANIZATION,
    FeedbackCategory.HEALTH_SAFETY,
    FeedbackCategory.TRAINING,
    FeedbackCategory.WAGES_BENEFITS,
    FeedbackCategory.OTHER,
  ], {
    required_error: 'La catégorie est requise',
  }),
});

// Schema for updating a feedback
export const updateFeedbackSchema = z.object({
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères').optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').optional(),
  category: z.enum([
    FeedbackCategory.WORKING_CONDITIONS,
    FeedbackCategory.WORK_ORGANIZATION,
    FeedbackCategory.HEALTH_SAFETY,
    FeedbackCategory.TRAINING,
    FeedbackCategory.WAGES_BENEFITS,
    FeedbackCategory.OTHER,
  ]).optional(),
  status: z.enum([
    FeedbackStatus.PENDING,
    FeedbackStatus.IN_PROGRESS,
    FeedbackStatus.ADDRESSED,
    FeedbackStatus.REJECTED,
  ]).optional(),
  response: z.string().optional().nullable(),
});

// Type exports
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;

// Helper function to get category label
export function getCategoryLabel(category: FeedbackCategory): string {
  const labels: Record<FeedbackCategory, string> = {
    WORKING_CONDITIONS: 'Conditions de travail',
    WORK_ORGANIZATION: 'Organisation du travail',
    HEALTH_SAFETY: 'Santé et sécurité',
    TRAINING: 'Formation',
    WAGES_BENEFITS: 'Salaires et avantages',
    OTHER: 'Autre',
  };
  return labels[category];
}

// Helper function to get status label
export function getStatusLabel(status: FeedbackStatus): string {
  const labels: Record<FeedbackStatus, string> = {
    PENDING: 'En attente',
    IN_PROGRESS: 'En cours de traitement',
    ADDRESSED: 'Traité',
    REJECTED: 'Rejeté',
  };
  return labels[status];
}

// Helper function to get status color
export function getStatusColor(status: FeedbackStatus): string {
  const colors: Record<FeedbackStatus, string> = {
    PENDING: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    ADDRESSED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

// Helper function to get category color
export function getCategoryColor(category: FeedbackCategory): string {
  const colors: Record<FeedbackCategory, string> = {
    WORKING_CONDITIONS: 'bg-purple-100 text-purple-800',
    WORK_ORGANIZATION: 'bg-blue-100 text-blue-800',
    HEALTH_SAFETY: 'bg-red-100 text-red-800',
    TRAINING: 'bg-green-100 text-green-800',
    WAGES_BENEFITS: 'bg-orange-100 text-orange-800',
    OTHER: 'bg-gray-100 text-gray-800',
  };
  return colors[category];
}
