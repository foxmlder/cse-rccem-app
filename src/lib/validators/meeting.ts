import { z } from 'zod';
import { MeetingType, MeetingStatus } from '@prisma/client';

// Schema for creating a meeting
export const createMeetingSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format invalide (HH:MM)'),
  type: z.enum([MeetingType.ORDINARY, MeetingType.EXTRAORDINARY], {
    required_error: 'Le type de réunion est requis',
  }),
  location: z.string().min(1, 'Le lieu est requis'),
  feedbackDeadline: z.string().optional(),
  participantIds: z.array(z.string()).min(1, 'Au moins un participant est requis'),
  agendaItems: z.array(
    z.object({
      title: z.string().min(1, 'Le titre est requis'),
      description: z.string().optional(),
      duration: z.number().int().positive().optional(),
      order: z.number().int().positive(),
    })
  ).optional(),
});

// Schema for updating a meeting
export const updateMeetingSchema = z.object({
  date: z.string().optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format invalide (HH:MM)').optional(),
  type: z.enum([MeetingType.ORDINARY, MeetingType.EXTRAORDINARY]).optional(),
  location: z.string().optional(),
  status: z.enum([
    MeetingStatus.PLANNED,
    MeetingStatus.CONVOCATION_SENT,
    MeetingStatus.IN_PROGRESS,
    MeetingStatus.COMPLETED,
    MeetingStatus.CANCELLED,
  ]).optional(),
  feedbackDeadline: z.string().optional().nullable(),
  convocationSentAt: z.string().optional().nullable(),
  agendaItems: z.array(
    z.object({
      title: z.string().min(1, 'Le titre est requis'),
      description: z.string().optional(),
      duration: z.number().int().positive().optional(),
      order: z.number().int().positive(),
    })
  ).optional(),
});

// Schema for updating participant status
export const updateParticipantSchema = z.object({
  participantId: z.string(),
  status: z.enum(['INVITED', 'CONFIRMED', 'PRESENT', 'ABSENT', 'EXCUSED']),
});

// Schema for agenda items
export const agendaItemSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  order: z.number().int().positive(),
});

export const createAgendaItemSchema = z.object({
  meetingId: z.string(),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  order: z.number().int().positive(),
});

export const updateAgendaItemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  order: z.number().int().positive().optional(),
});

// Type exports
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type AgendaItemInput = z.infer<typeof agendaItemSchema>;
export type CreateAgendaItemInput = z.infer<typeof createAgendaItemSchema>;
export type UpdateAgendaItemInput = z.infer<typeof updateAgendaItemSchema>;

/**
 * Get meeting type label in French
 */
export function getMeetingTypeLabel(type: MeetingType | string): string {
  return type === 'ORDINARY' || type === MeetingType.ORDINARY
    ? 'Réunion ordinaire'
    : 'Réunion extraordinaire';
}
