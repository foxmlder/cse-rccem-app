import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateMeetingSchema } from '@/lib/validators/meeting';
import { hasPermission } from '@/lib/permissions';

// GET /api/meetings/[id] - Get meeting details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            cseRole: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
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
        feedbacks: {
          include: {
            submittedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
        minutes: {
          include: {
            signatures: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    cseRole: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Réunion non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la réunion' },
      { status: 500 }
    );
  }
}

// PUT /api/meetings/[id] - Update meeting
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, 'EDIT_MEETING')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de modifier des réunions' },
        { status: 403 }
      );
    }

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: params.id },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: 'Réunion non trouvée' }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = updateMeetingSchema.parse(body);

    // Extract agendaItems from validated data
    const { agendaItems, ...meetingData } = validatedData;

    // Prepare update data
    const updateData: any = { ...meetingData };

    // If date or time is updated, update the date field
    if (meetingData.date || meetingData.time) {
      const dateStr = meetingData.date || existingMeeting.date.toISOString().split('T')[0];
      const timeStr = meetingData.time || existingMeeting.time;
      updateData.date = new Date(`${dateStr}T${timeStr}`);
    }

    // Convert string dates to Date objects
    if (meetingData.feedbackDeadline) {
      updateData.feedbackDeadline = new Date(meetingData.feedbackDeadline);
    }
    if (meetingData.convocationSentAt) {
      updateData.convocationSentAt = new Date(meetingData.convocationSentAt);
    }

    // Remove time field as it's stored separately
    delete updateData.time;
    if (meetingData.time) {
      updateData.time = meetingData.time;
    }

    // Update meeting and agenda items in a transaction
    const meeting = await prisma.$transaction(async (tx) => {
      // Update meeting
      const updatedMeeting = await tx.meeting.update({
        where: { id: params.id },
        data: updateData,
      });

      // If agendaItems are provided, replace all existing items
      if (agendaItems) {
        // Delete existing agenda items
        await tx.agendaItem.deleteMany({
          where: { meetingId: params.id },
        });

        // Create new agenda items
        if (agendaItems.length > 0) {
          await tx.agendaItem.createMany({
            data: agendaItems.map((item) => ({
              ...item,
              meetingId: params.id,
            })),
          });
        }
      }

      // Return meeting with all includes
      return await tx.meeting.findUnique({
        where: { id: params.id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  cseRole: true,
                },
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
    });

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error('Error updating meeting:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la réunion' },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Delete meeting
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, 'DELETE_MEETING')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de supprimer des réunions' },
        { status: 403 }
      );
    }

    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        minutes: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Réunion non trouvée' }, { status: 404 });
    }

    // Prevent deletion if meeting has any minutes (draft, pending signature, signed, or published)
    if (meeting.minutes.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une réunion avec un compte-rendu' },
        { status: 400 }
      );
    }

    // Allow deletion if meeting is PLANNED or CONVOCATION_SENT without minutes
    if (!['PLANNED', 'CONVOCATION_SENT'].includes(meeting.status)) {
      return NextResponse.json(
        { error: 'Seules les réunions planifiées ou avec convocation envoyée (sans compte-rendu) peuvent être supprimées' },
        { status: 400 }
      );
    }

    await prisma.meeting.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Réunion supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la réunion' },
      { status: 500 }
    );
  }
}
