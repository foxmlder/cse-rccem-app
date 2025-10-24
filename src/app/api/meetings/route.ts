import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createMeetingSchema } from '@/lib/validators/meeting';
import { hasPermission } from '@/lib/permissions';

// GET /api/meetings - List all meetings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const meetings = await prisma.meeting.findMany({
      where,
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
        },
        agendaItems: {
          orderBy: {
            order: 'asc',
          },
        },
        feedbacks: {
          select: {
            id: true,
            status: true,
          },
        },
        minutes: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            participants: true,
            feedbacks: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réunions' },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, 'CREATE_MEETING')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de créer des réunions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createMeetingSchema.parse(body);

    // Parse date and create DateTime
    const meetingDateTime = new Date(`${validatedData.date}T${validatedData.time}`);

    // Calculate feedback deadline (48h before meeting by default)
    let feedbackDeadline: Date | undefined;
    if (validatedData.feedbackDeadline) {
      feedbackDeadline = new Date(validatedData.feedbackDeadline);
    } else {
      feedbackDeadline = new Date(meetingDateTime);
      feedbackDeadline.setHours(feedbackDeadline.getHours() - 48);
    }

    // Create meeting with participants and agenda items
    const meeting = await prisma.meeting.create({
      data: {
        date: meetingDateTime,
        time: validatedData.time,
        type: validatedData.type,
        location: validatedData.location,
        feedbackDeadline,
        createdById: session.user.id,
        participants: {
          create: validatedData.participantIds.map((userId) => ({
            userId,
            status: 'INVITED',
          })),
        },
        agendaItems: validatedData.agendaItems
          ? {
              create: validatedData.agendaItems,
            }
          : undefined,
      },
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

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating meeting:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la réunion' },
      { status: 500 }
    );
  }
}
