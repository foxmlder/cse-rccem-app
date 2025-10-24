import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateAgendaItemSchema } from '@/lib/validators/meeting';
import { hasPermission } from '@/lib/permissions';

// PUT /api/agenda-items/[id] - Update agenda item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const agendaItem = await prisma.agendaItem.findUnique({
      where: { id: params.id },
      include: {
        meeting: true,
      },
    });

    if (!agendaItem) {
      return NextResponse.json(
        { error: 'Point non trouvé' },
        { status: 404 }
      );
    }

    // Check if convocation already sent
    if (agendaItem.meeting.convocationSentAt) {
      return NextResponse.json(
        { error: 'Impossible de modifier : la convocation a déjà été envoyée' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = updateAgendaItemSchema.parse(body);

    const updatedItem = await prisma.agendaItem.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ agendaItem: updatedItem });
  } catch (error: any) {
    console.error('Error updating agenda item:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE /api/agenda-items/[id] - Delete agenda item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const agendaItem = await prisma.agendaItem.findUnique({
      where: { id: params.id },
      include: {
        meeting: true,
      },
    });

    if (!agendaItem) {
      return NextResponse.json(
        { error: 'Point non trouvé' },
        { status: 404 }
      );
    }

    // Check if convocation already sent
    if (agendaItem.meeting.convocationSentAt) {
      return NextResponse.json(
        { error: 'Impossible de supprimer : la convocation a déjà été envoyée' },
        { status: 400 }
      );
    }

    await prisma.agendaItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Point supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting agenda item:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
