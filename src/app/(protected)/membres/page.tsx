import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import MemberCard from '@/components/members/MemberCard';
import { Plus, Users, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { role?: string; status?: string };
}

export default async function MembresPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const canManage = hasPermission(session.user.role, 'ADD_MEMBER');

  // Build where clause
  const where: any = {};

  if (searchParams.role) {
    where.role = searchParams.role;
  }

  if (searchParams.status === 'active') {
    where.isActive = true;
  } else if (searchParams.status === 'inactive') {
    where.isActive = false;
  }

  // Fetch members
  const members = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      cseRole: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          createdMeetings: true,
          participations: true,
          submittedFeedbacks: true,
        },
      },
    },
    orderBy: [
      { isActive: 'desc' },
      { name: 'asc' },
    ],
  });

  // Calculate stats
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.isActive).length;
  const inactiveMembers = members.filter((m) => !m.isActive).length;
  const presidents = members.filter((m) => m.role === 'PRESIDENT').length;
  const admins = members.filter((m) => m.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Membres du CSE</h2>
          <p className="text-gray-600 mt-1">Gérez les membres et leurs permissions</p>
        </div>

        {canManage && (
          <Link
            href="/membres/nouveau"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nouveau membre
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-600" />
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">Actifs</p>
          <p className="text-2xl font-bold text-green-900">{activeMembers}</p>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Inactifs</p>
          <p className="text-2xl font-bold text-gray-900">{inactiveMembers}</p>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <p className="text-sm text-purple-600 mb-1">Présidents</p>
          <p className="text-2xl font-bold text-purple-900">{presidents}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-sm text-red-600 mb-1">Admins</p>
          <p className="text-2xl font-bold text-red-900">{admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-800">Filtres</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Status Filters */}
          <Link
            href="/membres"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !searchParams.status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({totalMembers})
          </Link>
          <Link
            href="/membres?status=active"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              searchParams.status === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Actifs ({activeMembers})
          </Link>
          <Link
            href="/membres?status=inactive"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              searchParams.status === 'inactive'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactifs ({inactiveMembers})
          </Link>

          {/* Role Filters */}
          <div className="w-px h-8 bg-gray-300 mx-2" />

          <Link
            href="/membres?role=PRESIDENT"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              searchParams.role === 'PRESIDENT'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Présidents ({presidents})
          </Link>
          <Link
            href="/membres?role=ADMIN"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              searchParams.role === 'ADMIN'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Admins ({admins})
          </Link>
          <Link
            href="/membres?role=MEMBER"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              searchParams.role === 'MEMBER'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Membres ({totalMembers - presidents - admins})
          </Link>
        </div>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun membre trouvé
          </h3>
          <p className="text-gray-600">
            {searchParams.role || searchParams.status
              ? 'Essayez de modifier les filtres'
              : 'Commencez par ajouter des membres'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              currentUserId={session.user.id}
              currentUserRole={session.user.role}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
