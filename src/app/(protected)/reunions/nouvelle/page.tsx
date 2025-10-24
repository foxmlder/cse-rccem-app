import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { canManageMeetings } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import MeetingForm from '@/components/meetings/MeetingForm';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nouvelle réunion - CSE RCCEM',
  description: 'Créer une nouvelle réunion',
};

export default async function NewMeetingPage() {
  const user = await getCurrentUser();

  // Check permission
  if (!canManageMeetings(user.role)) {
    redirect('/reunions');
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nouvelle réunion</h2>
          <p className="text-sm text-gray-600 mt-1">
            Planifier une nouvelle réunion du CSE
          </p>
        </div>
      </div>

      {/* Form */}
      <MeetingForm users={users} mode="create" />
    </div>
  );
}
