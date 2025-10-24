/**
 * Signature API route
 * DELETE /api/signatures/[id] - Remove signature
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canRemoveSignature } from '@/lib/validators/signature';

/**
 * DELETE /api/signatures/[id]
 * Remove a signature (only own signature)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const signatureId = params.id;

    // Get the signature
    const signature = await prisma.signature.findUnique({
      where: { id: signatureId },
      include: {
        minute: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature non trouvée' },
        { status: 404 }
      );
    }

    // Check if user owns the signature or is admin
    if (signature.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer cette signature' },
        { status: 403 }
      );
    }

    // Check if signature can be removed based on minute status
    if (!canRemoveSignature(signature.minute.status)) {
      return NextResponse.json(
        { error: 'Cette signature ne peut plus être retirée (compte-rendu déjà signé ou publié)' },
        { status: 400 }
      );
    }

    // Delete the signature
    await prisma.signature.delete({
      where: { id: signatureId },
    });

    return NextResponse.json(
      { message: 'Signature retirée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting signature:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la signature' },
      { status: 500 }
    );
  }
}
