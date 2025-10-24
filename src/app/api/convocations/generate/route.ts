import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import ConvocationTemplate from '@/lib/pdf/convocation-template';

// POST /api/convocations/generate - Generate convocation PDF
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="convocation-${meetingId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating convocation PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
