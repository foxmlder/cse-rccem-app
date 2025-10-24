import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Send, CheckCircle, Calendar } from 'lucide-react';
import { Metadata } from 'next';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Convocations - CSE RCCEM',
  description: 'Gestion des convocations',
};

export default async function ConvocationsPage() {
  const user = await getCurrentUser();

  // Fetch meetings
  const meetings = await prisma.meeting.findMany({
    where: {
      status: {
        not: 'CANCELLED',
      },
    },
    include: {
      participants: {
        select: {
          id: true,
        },
      },
      agendaItems: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Convocations</h2>
        <p className="text-sm text-gray-600 mt-1">
          Gérer les convocations et ordres du jour
        </p>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">Aucune réunion disponible</p>
          <Link
            href="/reunions/nouvelle"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            Créer une réunion
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const meetingDate = new Date(meeting.date);
            const formattedDate = formatDate(meetingDate, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            const convocationSent = !!meeting.convocationSentAt;
            const hasAgenda = meeting.agendaItems.length > 0;
            const hasParticipants = meeting.participants.length > 0;

            return (
              <div
                key={meeting.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {meeting.type === 'ORDINARY'
                          ? 'Réunion ordinaire'
                          : 'Réunion extraordinaire'}
                      </h3>
                      {convocationSent && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle size={14} />
                          Envoyée
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Date :</strong> {formattedDate} à {meeting.time}
                      </p>
                      {meeting.location && (
                        <p>
                          <strong>Lieu :</strong> {meeting.location}
                        </p>
                      )}
                      <p>
                        <strong>Participants :</strong> {meeting.participants.length}
                      </p>
                      <p>
                        <strong>Points à l'ordre du jour :</strong>{' '}
                        {meeting.agendaItems.length}
                      </p>
                      {convocationSent && meeting.convocationSentAt && (
                        <p className="text-green-600">
                          <strong>Envoyée le :</strong>{' '}
                          {formatDate(meeting.convocationSentAt, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/convocations/${meeting.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      {convocationSent ? 'Voir la convocation' : 'Gérer la convocation'}
                    </Link>

                    {/* Status indicators */}
                    <div className="text-xs text-gray-600 space-y-1">
                      {!hasParticipants && (
                        <p className="text-orange-600">⚠️ Aucun participant</p>
                      )}
                      {!hasAgenda && (
                        <p className="text-orange-600">⚠️ Ordre du jour vide</p>
                      )}
                      {hasParticipants && hasAgenda && !convocationSent && (
                        <p className="text-green-600">✓ Prête à envoyer</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
