import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { canManageMeetings } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ConvocationForm from '@/components/convocations/ConvocationForm';

export const metadata: Metadata = {
  title: 'Convocation - CSE RCCEM',
  description: 'Créer et envoyer une convocation',
};

interface PageProps {
  params: { meetingId: string };
}

export default async function ConvocationPage({ params }: PageProps) {
  const user = await getCurrentUser();

  // Check permission
  if (!canManageMeetings(user.role)) {
    redirect('/reunions');
  }

  // Fetch meeting with all details
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.meetingId },
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
        orderBy: {
          user: {
            name: 'asc',
          },
        },
      },
      agendaItems: {
        orderBy: {
          order: 'asc',
        },
      },
      feedbacks: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!meeting) {
    notFound();
  }

  const meetingDate = new Date(meeting.date);
  const formattedDate = formatDate(meetingDate, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const alreadySent = !!meeting.convocationSentAt;

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
          <h2 className="text-2xl font-bold text-gray-800">Convocation</h2>
          <p className="text-sm text-gray-600 mt-1">
            {meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}{' '}
            - {formattedDate} à {meeting.time}
          </p>
        </div>
      </div>

      {/* Status Alert */}
      {alreadySent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium text-green-900">
                Convocation déjà envoyée
              </p>
              <p className="text-sm text-green-700">
                Envoyée le{' '}
                {formatDate(meeting.convocationSentAt!, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Informations de la réunion
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Date et heure</p>
            <p className="font-medium text-gray-900">
              {formattedDate} à {meeting.time}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Lieu</p>
            <p className="font-medium text-gray-900">{meeting.location || 'Non défini'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-medium text-gray-900">
              {meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Participants</p>
            <p className="font-medium text-gray-900">
              {meeting.participants.length} personne{meeting.participants.length > 1 ? 's' : ''}
            </p>
          </div>

          {meeting.feedbackDeadline && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Date limite pour les remontées</p>
              <p className="font-medium text-gray-900">
                {formatDate(meeting.feedbackDeadline, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Participants List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Membres convoqués ({meeting.participants.length})
        </h3>

        {meeting.participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun participant</p>
            <Link
              href={`/reunions/${meeting.id}`}
              className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Modifier la réunion pour ajouter des participants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meeting.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {participant.user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{participant.user.name}</p>
                  <p className="text-sm text-gray-600">
                    {participant.user.cseRole || 'Membre'} - {participant.user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Convocation Form */}
      <ConvocationForm
        meeting={meeting}
        initialAgendaItems={meeting.agendaItems}
        alreadySent={alreadySent}
      />
    </div>
  );
}
