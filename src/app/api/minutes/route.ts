import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createMinuteSchema } from '@/lib/validators/minute';
import { hasPermission } from '@/lib/permissions';

// GET /api/minutes - List minutes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};

    if (meetingId) {
      where.meetingId = meetingId;
    }

    if (status) {
      where.status = status;
    }

    const minutes = await prisma.meetingMinute.findMany({
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
        meeting: {
          select: {
            id: true,
            date: true,
            time: true,
            type: true,
            location: true,
          },
        },
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
        _count: {
          select: {
            signatures: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ minutes });
  } catch (error) {
    console.error('Error fetching minutes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des comptes-rendus' },
      { status: 500 }
    );
  }
}

// POST /api/minutes - Create minute
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, 'CREATE_MINUTE')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de créer des comptes-rendus' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createMinuteSchema.parse(body);

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

    // Check if a minute already exists for this meeting
    const existingMinute = await prisma.meetingMinute.findUnique({
      where: { meetingId: validatedData.meetingId },
    });

    if (existingMinute) {
      return NextResponse.json(
        { error: 'Un compte-rendu existe déjà pour cette réunion' },
        { status: 400 }
      );
    }

    // Create minute
    const minute = await prisma.meetingMinute.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
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
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ minute }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating minute:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du compte-rendu' },
      { status: 500 }
    );
  }
}
