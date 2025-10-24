import { Resend } from 'resend';
import {
  getConvocationEmailHtml,
  getConvocationEmailText,
} from './templates/convocation';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendConvocationEmailParams {
  to: string[];
  meetingData: {
    date: Date;
    time: string;
    type: 'ORDINARY' | 'EXTRAORDINARY';
    location: string;
    feedbackDeadline?: Date | null;
  };
  agendaItems: Array<{
    order: number;
    title: string;
    description?: string | null;
    duration?: number | null;
  }>;
  presidentName: string;
  pdfAttachment?: {
    filename: string;
    content: Buffer;
  };
}

export async function sendConvocationEmails(
  params: SendConvocationEmailParams
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const {
    to,
    meetingData,
    agendaItems,
    presidentName,
    pdfAttachment,
  } = params;

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not configured');
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const meetingType =
    meetingData.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire';

  const errors: string[] = [];
  let sentCount = 0;

  // Send individual emails to each recipient
  for (const recipient of to) {
    try {
      // Extract name from email (simple extraction)
      const recipientName = recipient.split('@')[0].replace(/[._]/g, ' ');

      const emailData = {
        recipientName,
        meetingDate: formatDate(meetingData.date),
        meetingTime: meetingData.time,
        meetingType,
        location: meetingData.location,
        feedbackDeadline: meetingData.feedbackDeadline
          ? formatDateTime(meetingData.feedbackDeadline)
          : undefined,
        agendaItems,
        appUrl,
        presidentName,
      };

      const attachments = pdfAttachment
        ? [
            {
              filename: pdfAttachment.filename,
              content: pdfAttachment.content,
            },
          ]
        : undefined;

      await resend.emails.send({
        from: `CSE RCCEM <${fromEmail}>`,
        to: recipient,
        subject: `Convocation - ${meetingType} du ${formatDate(meetingData.date)}`,
        html: getConvocationEmailHtml(emailData),
        text: getConvocationEmailText(emailData),
        attachments,
      });

      sentCount++;
    } catch (error: any) {
      console.error(`Failed to send email to ${recipient}:`, error);
      errors.push(`${recipient}: ${error.message}`);
    }
  }

  return {
    success: sentCount > 0,
    sentCount,
    errors,
  };
}

export async function sendConvocationEmail(
  to: string,
  params: Omit<SendConvocationEmailParams, 'to'>
): Promise<{ success: boolean; error?: string }> {
  const result = await sendConvocationEmails({
    ...params,
    to: [to],
  });

  return {
    success: result.success,
    error: result.errors.length > 0 ? result.errors[0] : undefined,
  };
}
