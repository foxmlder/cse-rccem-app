import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { Calendar, FileText, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import MeetingCard from '@/components/meetings/MeetingCard';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Tableau de bord - CSE RCCEM',
  description: 'Tableau de bord de gestion du CSE',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Fetch upcoming meetings
  const upcomingMeetings = await prisma.meeting.findMany({
    where: {
      OR: [
        { status: 'PLANNED' },
        { status: 'CONVOCATION_SENT' },
        { status: 'IN_PROGRESS' },
      ],
      date: {
        gte: new Date(),
      },
    },
    include: {
      participants: true,
      minutes: {
        select: {
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
      date: 'asc',
    },
    take: 5,
  });

  // Get next meeting
  const nextMeeting = upcomingMeetings[0];
  const nextMeetingDate = nextMeeting
    ? formatDate(nextMeeting.date, { day: 'numeric', month: 'short' })
    : '-';

  // Count pending minutes (DRAFT or PENDING_SIGNATURE)
  const pendingMinutesCount = await prisma.meetingMinute.count({
    where: {
      status: {
        in: ['DRAFT', 'PENDING_SIGNATURE'],
      },
    },
  });

  // Count active members
  const totalMembersCount = await prisma.user.count({
    where: {
      isActive: true,
    },
  });

  const stats = {
    nextMeeting: nextMeetingDate,
    pendingMinutes: pendingMinutesCount,
    totalMembers: totalMembersCount,
  };

  // Fetch recent meetings for display
  const recentMeetings = await prisma.meeting.findMany({
    include: {
      participants: true,
      minutes: {
        select: {
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
    take: 5,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Tableau de bord CSE
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Bienvenue, {user.name}
          </p>
        </div>
        <Link
          href="/reunions/nouvelle"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nouvelle réunion</span>
          <span className="sm:hidden">Nouvelle</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Meeting */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Prochaine réunion</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.nextMeeting}
              </p>
            </div>
            <Calendar className="text-blue-500" size={40} />
          </div>
        </div>

        {/* Pending Minutes */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">CR en attente</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.pendingMinutes}
              </p>
            </div>
            <FileText className="text-green-500" size={40} />
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Membres CSE</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalMembers}
              </p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Réunions récentes
          </h3>
          <Link
            href="/reunions"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir toutes
          </Link>
        </div>

        {recentMeetings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Aucune réunion planifiée</p>
            <Link
              href="/reunions/nouvelle"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Créer une réunion
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentMeetings.map((meeting) => (
              <div key={meeting.id} className="p-6">
                <MeetingCard meeting={meeting} showActions={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
