import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import MeetingList from '@/components/meetings/MeetingList';
import { canManageMeetings } from '@/lib/permissions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réunions - CSE RCCEM',
  description: 'Gestion des réunions du CSE',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { status?: string };
}

export default async function ReunionsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const canManage = canManageMeetings(user.role);

  // Build where clause
  const where: any = {};
  if (searchParams.status) {
    where.status = searchParams.status;
  }

  // Fetch meetings
  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
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
      minutes: {
        select: {
          id: true,
          status: true,
        },
      },
      _count: {
        select: {
          participants: true,
          feedbacks: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  // Count meetings by status
  const statusCounts = await prisma.meeting.groupBy({
    by: ['status'],
    _count: true,
  });

  const statusCountMap = statusCounts.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  const filters = [
    { label: 'Toutes', value: '', count: meetings.length },
    { label: 'À venir', value: 'PLANNED', count: statusCountMap.PLANNED || 0 },
    { label: 'Convocation envoyée', value: 'CONVOCATION_SENT', count: statusCountMap.CONVOCATION_SENT || 0 },
    { label: 'En cours', value: 'IN_PROGRESS', count: statusCountMap.IN_PROGRESS || 0 },
    { label: 'Terminées', value: 'COMPLETED', count: statusCountMap.COMPLETED || 0 },
    { label: 'Annulées', value: 'CANCELLED', count: statusCountMap.CANCELLED || 0 },
  ];

  const activeFilter = searchParams.status || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des réunions</h2>
          <p className="text-sm text-gray-600 mt-1">
            {meetings.length} réunion{meetings.length > 1 ? 's' : ''}
          </p>
        </div>
        {canManage && (
          <Link
            href="/reunions/nouvelle"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Nouvelle réunion
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-800">Filtrer par statut</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value ? `/reunions?status=${filter.value}` : '/reunions'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </Link>
          ))}
        </div>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            {activeFilter
              ? 'Aucune réunion avec ce statut'
              : 'Aucune réunion planifiée'}
          </p>
          {canManage && !activeFilter && (
            <Link
              href="/reunions/nouvelle"
              className="inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Créer une réunion
            </Link>
          )}
        </div>
      ) : (
        <MeetingList meetings={meetings} canDelete={canManage} />
      )}
    </div>
  );
}
