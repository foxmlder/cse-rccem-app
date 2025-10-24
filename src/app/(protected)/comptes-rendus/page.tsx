import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import MinuteCard from '@/components/minutes/MinuteCard';
import { FileText, Plus, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ComptesRendusPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const canManage = hasPermission(session.user.role, 'CREATE_MINUTE');

  // Fetch all minutes
  const minutes = await prisma.meetingMinute.findMany({
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
      _count: {
        select: {
          signatures: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch meetings without minutes (for creating new minutes)
  const meetingsWithoutMinutes = canManage
    ? await prisma.meeting.findMany({
        where: {
          minutes: {
            none: {},
          },
        },
        select: {
          id: true,
          date: true,
          time: true,
          type: true,
          location: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Comptes-rendus</h2>
          <p className="text-gray-600 mt-1">
            Consultez et gérez les comptes-rendus des réunions du CSE
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{minutes.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Brouillons</p>
          <p className="text-2xl font-bold text-gray-900">
            {minutes.filter((m) => m.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <p className="text-sm text-orange-600 mb-1">En attente de signature</p>
          <p className="text-2xl font-bold text-orange-900">
            {minutes.filter((m) => m.status === 'PENDING_SIGNATURE').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">Publiés</p>
          <p className="text-2xl font-bold text-green-900">
            {minutes.filter((m) => m.status === 'PUBLISHED').length}
          </p>
        </div>
      </div>

      {/* Meetings without Minutes */}
      {canManage && meetingsWithoutMinutes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Réunions sans compte-rendu ({meetingsWithoutMinutes.length})
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Les réunions suivantes n'ont pas encore de compte-rendu :
              </p>
              <div className="space-y-2">
                {meetingsWithoutMinutes.slice(0, 5).map((meeting) => {
                  const meetingDate = new Date(meeting.date);
                  const dateStr = meetingDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {dateStr} - {meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
                        </p>
                        <p className="text-xs text-gray-600">{meeting.location}</p>
                      </div>
                      <Link
                        href={`/comptes-rendus/${meeting.id}`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer le CR
                      </Link>
                    </div>
                  );
                })}
              </div>
              {meetingsWithoutMinutes.length > 5 && (
                <p className="text-sm text-blue-700 mt-2">
                  Et {meetingsWithoutMinutes.length - 5} autre
                  {meetingsWithoutMinutes.length - 5 > 1 ? 's' : ''}...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minutes List */}
      {minutes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun compte-rendu
          </h3>
          <p className="text-gray-600">
            Aucun compte-rendu n'a encore été rédigé.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {minutes.map((minute) => (
            <MinuteCard
              key={minute.id}
              minute={minute}
              currentUserRole={session.user.role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
