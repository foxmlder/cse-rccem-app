import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateFeedbackSchema } from '@/lib/validators/feedback';
import { hasPermission } from '@/lib/permissions';

// GET /api/feedbacks/[id] - Get feedback details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: params.id },
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
            location: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Remontée non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la remontée' },
      { status: 500 }
    );
  }
}

// PUT /api/feedbacks/[id] - Update feedback
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: params.id },
      include: {
        meeting: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Remontée non trouvée' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = feedback.submittedById === session.user.id;
    const canManage = hasPermission(session.user.role, 'VIEW_ALL_FEEDBACKS');

    // Users can only edit their own feedbacks
    // Admins/Presidents can edit status and response
    if (!isOwner && !canManage) {
      return NextResponse.json(
        { error: 'Vous ne pouvez modifier que vos propres remontées' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateFeedbackSchema.parse(body);

    // Regular users can't update status or response
    if (!canManage) {
      delete validatedData.status;
      delete validatedData.response;
    }

    // Check if deadline has passed (only for content updates)
    if (isOwner && !canManage && feedback.meeting.feedbackDeadline) {
      const now = new Date();
      const deadline = new Date(feedback.meeting.feedbackDeadline);

      if (now > deadline) {
        return NextResponse.json(
          { error: 'La date limite de modification est dépassée' },
          { status: 400 }
        );
      }
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json({ feedback: updatedFeedback });
  } catch (error: any) {
    console.error('Error updating feedback:', error);

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

// DELETE /api/feedbacks/[id] - Delete feedback
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: params.id },
      include: {
        meeting: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Remontée non trouvée' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = feedback.submittedById === session.user.id;
    const canManage = hasPermission(session.user.role, 'VIEW_ALL_FEEDBACKS');

    if (!isOwner && !canManage) {
      return NextResponse.json(
        { error: 'Vous ne pouvez supprimer que vos propres remontées' },
        { status: 403 }
      );
    }

    // Check if deadline has passed (only for owners)
    if (isOwner && !canManage && feedback.meeting.feedbackDeadline) {
      const now = new Date();
      const deadline = new Date(feedback.meeting.feedbackDeadline);

      if (now > deadline) {
        return NextResponse.json(
          { error: 'La date limite de suppression est dépassée' },
          { status: 400 }
        );
      }
    }

    await prisma.feedback.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Remontée supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
