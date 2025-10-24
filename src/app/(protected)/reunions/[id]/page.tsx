import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { canManageMeetings } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import MeetingForm from '@/components/meetings/MeetingForm';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Détails de la réunion - CSE RCCEM',
  description: 'Détails et modification de la réunion',
};

interface PageProps {
  params: { id: string };
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  // Check permission
  if (!canManageMeetings(user.role)) {
    redirect('/reunions');
  }

  // Fetch meeting
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          cseRole: true,
        },
      },
      participants: {
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
      },
      agendaItems: {
        orderBy: {
          order: 'asc',
        },
      },
      feedbacks: true,
      minutes: true,
    },
  });

  if (!meeting) {
    notFound();
  }

  // Fetch all active users for participant selection
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      cseRole: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Prepare initial data for form
  const meetingDate = new Date(meeting.date);
  const initialData = {
    id: meeting.id,
    date: meetingDate.toISOString().split('T')[0],
    time: meeting.time,
    type: meeting.type,
    location: meeting.location || '',
    feedbackDeadline: meeting.feedbackDeadline
      ? new Date(meeting.feedbackDeadline).toISOString().slice(0, 16)
      : '',
    participantIds: meeting.participants.map((p) => p.userId),
    agendaItems: meeting.agendaItems.map((item) => ({
      title: item.title,
      description: item.description || undefined,
      duration: item.duration || undefined,
      order: item.order,
    })),
  };

  const formattedDate = formatDate(meetingDate, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/reunions"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">
            {meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {formattedDate} à {meeting.time}
          </p>
        </div>
      </div>

      {/* Meeting Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-xl font-bold text-gray-800">
                {meeting.participants.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Remontées</p>
              <p className="text-xl font-bold text-gray-800">
                {meeting.feedbacks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <p className="text-sm font-semibold text-gray-800">
                {meeting.status === 'PLANNED' && 'À venir'}
                {meeting.status === 'CONVOCATION_SENT' && 'Convocation envoyée'}
                {meeting.status === 'IN_PROGRESS' && 'En cours'}
                {meeting.status === 'COMPLETED' && 'Terminée'}
                {meeting.status === 'CANCELLED' && 'Annulée'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Créée par :</strong> {meeting.createdBy.name} ({meeting.createdBy.cseRole || 'Membre'})
        </p>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Modifier la réunion
        </h3>
        <MeetingForm users={users} initialData={initialData} mode="edit" />
      </div>
    </div>
  );
}
