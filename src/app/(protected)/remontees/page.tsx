import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import FeedbackList from '@/components/feedbacks/FeedbackList';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RemonteesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch all feedbacks
  const feedbacks = await prisma.feedback.findMany({
    include: {
      submittedBy: {
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
    },
    orderBy: {
      submittedAt: 'desc',
    },
  });

  // Fetch meetings for filter dropdown
  const meetings = await prisma.meeting.findMany({
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
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Remontées du personnel</h2>
          <p className="text-gray-600 mt-1">
            Consultez et gérez les remontées soumises pour les réunions du CSE
          </p>
        </div>

        <Link
          href="/remontees/nouvelle"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nouvelle remontée
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-600 mb-1">En attente</p>
          <p className="text-2xl font-bold text-blue-900">
            {feedbacks.filter((f) => f.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600 mb-1">En cours</p>
          <p className="text-2xl font-bold text-yellow-900">
            {feedbacks.filter((f) => f.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">Traités</p>
          <p className="text-2xl font-bold text-green-900">
            {feedbacks.filter((f) => f.status === 'ADDRESSED').length}
          </p>
        </div>
      </div>

      {/* Feedbacks List */}
      <FeedbackList
        initialFeedbacks={feedbacks}
        meetings={meetings}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </div>
  );
}
