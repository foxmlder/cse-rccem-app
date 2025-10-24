import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import MinuteEditor from '@/components/minutes/MinuteEditor';
import MinuteViewer from '@/components/minutes/MinuteViewer';
import { getMinuteStatusLabel, getMinuteStatusColor } from '@/lib/validators/minute';
import { formatDate, formatTime } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { MinuteStatus, UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MinutePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const canManage = hasPermission(session.user.role, 'CREATE_MINUTE');

  // First try to find a minute with this ID
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

  // If found, show minute view/edit
  if (minute) {
    const isEditable = minute.status === MinuteStatus.DRAFT && canManage;

    // Get required signatures count (ADMIN + PRESIDENT roles)
    const requiredSignatures = await prisma.user.count({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.PRESIDENT] },
        isActive: true,
      },
    });

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/comptes-rendus"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux comptes-rendus
          </Link>

          {isEditable && (
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Modifier le compte-rendu
                </h2>
                <p className="text-gray-600 mt-1">
                  {formatDate(minute.meeting.date)} - {minute.meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getMinuteStatusColor(minute.status)}`}>
                {getMinuteStatusLabel(minute.status)}
              </span>
            </div>
          )}
        </div>

        {/* Viewer (if not editable) */}
        {!isEditable && (
          <MinuteViewer
            minute={{
              id: minute.id,
              content: minute.content,
              status: minute.status,
              createdAt: minute.createdAt,
              updatedAt: minute.updatedAt,
              meeting: {
                id: minute.meeting.id,
                date: minute.meeting.date,
                time: minute.meeting.time,
                type: minute.meeting.type,
                location: minute.meeting.location,
              },
              signatures: minute.signatures.map((sig) => ({
                id: sig.id,
                signedAt: sig.signedAt,
                comments: sig.comments,
                user: {
                  id: sig.user.id,
                  name: sig.user.name || '',
                  email: sig.user.email,
                  role: sig.user.role,
                  cseRole: sig.user.cseRole,
                },
              })),
            }}
            currentUser={{
              id: session.user.id,
              role: session.user.role,
            }}
            requiredSignatures={requiredSignatures}
          />
        )}

        {/* Editor (if editable) */}
        {isEditable && (
          <MinuteEditor minute={minute} meeting={minute.meeting} />
        )}
      </div>
    );
  }

  // If not a minute, try to find a meeting with this ID
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: {
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
      minutes: true,
    },
  });

  if (!meeting) {
    notFound();
  }

  // Check if minute already exists for this meeting
  if (meeting.minutes.length > 0) {
    redirect(`/comptes-rendus/${meeting.minutes[0].id}`);
  }

  // Check permission
  if (!canManage) {
    redirect('/comptes-rendus');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/comptes-rendus"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux comptes-rendus
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Nouveau compte-rendu</h2>
        <p className="text-gray-600 mt-1">
          {formatDate(meeting.date)} - {meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
        </p>
      </div>

      {/* Editor */}
      <MinuteEditor meeting={meeting} />
    </div>
  );
}
