import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import MinuteEditor from '@/components/minutes/MinuteEditor';
import { formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { MinuteStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditMinutePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const canManage = hasPermission(session.user.role, 'EDIT_MINUTE');

  if (!canManage) {
    redirect('/comptes-rendus');
  }

  // Fetch the minute
  const minute = await prisma.meetingMinute.findUnique({
    where: { id: params.id },
    include: {
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
    },
  });

  if (!minute) {
    notFound();
  }

  // Only allow editing if status is DRAFT
  if (minute.status !== MinuteStatus.DRAFT) {
    redirect(`/comptes-rendus/${minute.id}`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/comptes-rendus/${minute.id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au compte-rendu
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Modifier le compte-rendu</h2>
        <p className="text-gray-600 mt-1">
          {formatDate(minute.meeting.date)} - {minute.meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
        </p>
      </div>

      {/* Editor */}
      <MinuteEditor minute={minute} meeting={minute.meeting} />
    </div>
  );
}
