import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { renderToBuffer } from '@react-pdf/renderer';
import ConvocationTemplate from '@/lib/pdf/convocation-template';
import { sendConvocationEmails } from '@/lib/email/send-convocation';

// POST /api/convocations/send - Send convocation emails
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, 'SEND_CONVOCATION')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission d\'envoyer des convocations' },
        { status: 403 }
      );
    }

    const { meetingId } = await req.json();

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId est requis' },
        { status: 400 }
      );
    }

    // Fetch meeting with all required data
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        createdBy: {
          select: {
            name: true,
            cseRole: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                cseRole: true,
              },
            },
          },
          orderBy: {
            user: {
              name: 'asc',
            },
          },
        },
        agendaItems: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Réunion non trouvée' },
        { status: 404 }
      );
    }

    // Check if convocation already sent
    if (meeting.convocationSentAt) {
      return NextResponse.json(
        {
          error: 'La convocation a déjà été envoyée',
          sentAt: meeting.convocationSentAt,
        },
        { status: 400 }
      );
    }

    // Check if there are participants
    if (meeting.participants.length === 0) {
      return NextResponse.json(
        { error: 'Aucun participant n\'a été invité' },
        { status: 400 }
      );
    }

    // Check if there are agenda items
    if (meeting.agendaItems.length === 0) {
      return NextResponse.json(
        { error: 'Aucun point à l\'ordre du jour' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ConvocationTemplate({
        meeting: {
          date: meeting.date,
          time: meeting.time,
          type: meeting.type,
          location: meeting.location,
          feedbackDeadline: meeting.feedbackDeadline,
        },
        agendaItems: meeting.agendaItems,
        participants: meeting.participants,
        createdBy: meeting.createdBy,
      })
    );

    // Get participant emails
    const recipientEmails = meeting.participants.map((p) => p.user.email);

    // Send emails
    const result = await sendConvocationEmails({
      to: recipientEmails,
      meetingData: {
        date: meeting.date,
        time: meeting.time,
        type: meeting.type,
        location: meeting.location || 'À définir',
        feedbackDeadline: meeting.feedbackDeadline,
      },
      agendaItems: meeting.agendaItems,
      presidentName: meeting.createdBy.name,
      pdfAttachment: {
        filename: `convocation-${meeting.date.toISOString().split('T')[0]}.pdf`,
        content: Buffer.from(pdfBuffer),
      },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Échec de l\'envoi des emails',
          details: result.errors,
        },
        { status: 500 }
      );
    }

    // Update meeting status
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        convocationSentAt: new Date(),
        status: 'CONVOCATION_SENT',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Convocation envoyée à ${result.sentCount} participant(s)`,
      sentCount: result.sentCount,
      errors: result.errors,
      meeting: updatedMeeting,
    });
  } catch (error: any) {
    console.error('Error sending convocation:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'envoi de la convocation',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
