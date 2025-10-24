import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateMinuteSchema } from '@/lib/validators/minute';
import { hasPermission } from '@/lib/permissions';
import { MinuteStatus } from '@prisma/client';

// GET /api/minutes/[id] - Get minute details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const minute = await prisma.meetingMinute.findUnique({
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
        meeting: {
          select: {
            id: true,
            date: true,
            time: true,
            type: true,
            location: true,
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
                submittedAt: 'asc',
              },
            },
          },
        },
        signatures: {
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
            signedAt: 'asc',
          },
        },
      },
    });

    if (!minute) {
      return NextResponse.json(
        { error: 'Compte-rendu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ minute });
  } catch (error) {
    console.error('Error fetching minute:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du compte-rendu' },
      { status: 500 }
    );
  }
}

// PUT /api/minutes/[id] - Update minute
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
    if (!hasPermission(session.user.role, 'EDIT_MINUTE')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de modifier des comptes-rendus' },
        { status: 403 }
      );
    }

    const minute = await prisma.meetingMinute.findUnique({
      where: { id: params.id },
    });

    if (!minute) {
      return NextResponse.json(
        { error: 'Compte-rendu non trouvé' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = updateMinuteSchema.parse(body);

    // Prevent editing content if status is not DRAFT
    if (validatedData.content && minute.status !== MinuteStatus.DRAFT) {
      return NextResponse.json(
        { error: 'Le contenu ne peut être modifié qu\'en mode brouillon' },
        { status: 400 }
      );
    }

    // Validate status transitions
    if (validatedData.status) {
      const validTransitions: Record<MinuteStatus, MinuteStatus[]> = {
        DRAFT: [MinuteStatus.DRAFT, MinuteStatus.PENDING_SIGNATURE],
        PENDING_SIGNATURE: [MinuteStatus.PENDING_SIGNATURE, MinuteStatus.DRAFT, MinuteStatus.SIGNED],
        SIGNED: [MinuteStatus.SIGNED, MinuteStatus.PUBLISHED],
        PUBLISHED: [MinuteStatus.PUBLISHED],
      };

      if (!validTransitions[minute.status].includes(validatedData.status)) {
        return NextResponse.json(
          { error: `Transition de statut invalide: ${minute.status} → ${validatedData.status}` },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Convert date strings to Date objects if provided
    if (validatedData.sentAt) {
      updateData.sentAt = new Date(validatedData.sentAt);
    }

    const updatedMinute = await prisma.meetingMinute.update({
      where: { id: params.id },
      data: updateData,
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
      },
    });

    return NextResponse.json({ minute: updatedMinute });
  } catch (error: any) {
    console.error('Error updating minute:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du compte-rendu' },
      { status: 500 }
    );
  }
}

// DELETE /api/minutes/[id] - Delete minute
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
    if (!hasPermission(session.user.role, 'EDIT_MINUTE')) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de supprimer des comptes-rendus' },
        { status: 403 }
      );
    }

    const minute = await prisma.meetingMinute.findUnique({
      where: { id: params.id },
    });

    if (!minute) {
      return NextResponse.json(
        { error: 'Compte-rendu non trouvé' },
        { status: 404 }
      );
    }

    // Prevent deletion if minute is published
    if (minute.status === MinuteStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un compte-rendu publié' },
        { status: 400 }
      );
    }

    await prisma.meetingMinute.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Compte-rendu supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting minute:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte-rendu' },
      { status: 500 }
    );
  }
}
