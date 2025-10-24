import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createAgendaItemSchema } from '@/lib/validators/meeting';
import { hasPermission } from '@/lib/permissions';

// POST /api/agenda-items - Create agenda item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, 'EDIT_MEETING')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createAgendaItemSchema.parse(body);

    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: validatedData.meetingId },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Réunion non trouvée' }, { status: 404 });
    }

    // Check if convocation already sent
    if (meeting.convocationSentAt) {
      return NextResponse.json(
        { error: 'Impossible de modifier : la convocation a déjà été envoyée' },
        { status: 400 }
      );
    }

    const agendaItem = await prisma.agendaItem.create({
      data: validatedData,
    });

    return NextResponse.json({ agendaItem }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating agenda item:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du point' },
      { status: 500 }
    );
  }
}
