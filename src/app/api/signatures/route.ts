/**
 * Signatures API routes
 * POST /api/signatures - Create a new signature
 * GET /api/signatures - List signatures with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSignatureSchema, canSignMinute } from '@/lib/validators/signature';
import { MinuteStatus } from '@prisma/client';

/**
 * POST /api/signatures
 * Create a new signature for a minute
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createSignatureSchema.parse(body);

    // Get the minute
    const minute = await prisma.minute.findUnique({
      where: { id: validatedData.minuteId },
      include: {
        signatures: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!minute) {
      return NextResponse.json(
        { error: 'Compte-rendu non trouvé' },
        { status: 404 }
      );
    }

    // Check if user can sign
    if (!canSignMinute(minute.status, session.user.role)) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas signer ce compte-rendu' },
        { status: 403 }
      );
    }

    // Check if user has already signed
    if (minute.signatures.length > 0) {
      return NextResponse.json(
        { error: 'Vous avez déjà signé ce compte-rendu' },
        { status: 400 }
      );
    }

    // Create the signature
    const signature = await prisma.signature.create({
      data: {
        userId: session.user.id,
        minuteId: validatedData.minuteId,
        comments: validatedData.comments || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            cseRole: true,
          },
        },
      },
    });

    // Check if we should auto-update minute status to SIGNED
    // Get total signatures count
    const signaturesCount = await prisma.signature.count({
      where: { minuteId: validatedData.minuteId },
    });

    // Get required signatures count (ADMIN + PRESIDENT)
    const requiredSigners = await prisma.user.count({
      where: {
        role: { in: ['ADMIN', 'PRESIDENT'] },
        isActive: true,
      },
    });

    // If all required signatures are collected, update status to SIGNED
    if (signaturesCount >= requiredSigners) {
      await prisma.minute.update({
        where: { id: validatedData.minuteId },
        data: { status: MinuteStatus.SIGNED },
      });
    }

    return NextResponse.json(signature, { status: 201 });
  } catch (error: any) {
    console.error('Error creating signature:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la signature' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/signatures
 * List signatures with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const minuteId = searchParams.get('minuteId');
    const userId = searchParams.get('userId');

    // Build where clause
    const where: any = {};

    if (minuteId) {
      where.minuteId = minuteId;
    }

    if (userId) {
      where.userId = userId;
    }

    // Get signatures
    const signatures = await prisma.signature.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            cseRole: true,
          },
        },
        minute: {
          select: {
            id: true,
            status: true,
            meeting: {
              select: {
                id: true,
                title: true,
                type: true,
                date: true,
              },
            },
          },
        },
      },
      orderBy: {
        signedAt: 'desc',
      },
    });

    return NextResponse.json(signatures);
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des signatures' },
      { status: 500 }
    );
  }
}
