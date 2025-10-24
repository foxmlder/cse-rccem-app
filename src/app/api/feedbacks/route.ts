import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createFeedbackSchema } from '@/lib/validators/feedback';

// GET /api/feedbacks - List feedbacks
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};

    if (meetingId) {
      where.meetingId = meetingId;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            cseRole: true,
          },
        },
        meeting: {
          select: {
            id: true,
            date: true,
            time: true,
            type: true,
            feedbackDeadline: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des remontées' },
      { status: 500 }
    );
  }
}

// POST /api/feedbacks - Create feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createFeedbackSchema.parse(body);

    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: validatedData.meetingId },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Réunion non trouvée' },
        { status: 404 }
      );
    }

    // Check if feedback deadline has passed
    if (meeting.feedbackDeadline) {
      const now = new Date();
      const deadline = new Date(meeting.feedbackDeadline);

      if (now > deadline) {
        return NextResponse.json(
          { error: 'La date limite de soumission est dépassée' },
          { status: 400 }
        );
      }
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ...validatedData,
        submittedById: session.user.id,
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            cseRole: true,
          },
        },
        meeting: {
          select: {
            id: true,
            date: true,
            time: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating feedback:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la remontée' },
      { status: 500 }
    );
  }
}
