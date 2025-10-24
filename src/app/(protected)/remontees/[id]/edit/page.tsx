import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import FeedbackEditForm from '@/components/feedbacks/FeedbackEditForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditFeedbackPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch the feedback
  const feedback = await prisma.feedback.findUnique({
    where: { id: params.id },
    include: {
      meeting: {
        select: {
          id: true,
          date: true,
          time: true,
          type: true,
          location: true,
          feedbackDeadline: true,
        },
      },
      submittedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!feedback) {
    notFound();
  }

  // Check permissions
  const isOwner = feedback.submittedBy.id === session.user.id;
  const canManage = hasPermission(session.user.role, 'VIEW_ALL_FEEDBACKS');

  if (!isOwner && !canManage) {
    redirect('/remontees');
  }

  // Check if deadline has passed (only for owners, not admins)
  const now = new Date();
  const deadline = feedback.meeting.feedbackDeadline
    ? new Date(feedback.meeting.feedbackDeadline)
    : null;
  const deadlinePassed = deadline && now > deadline;

  if (isOwner && !canManage && deadlinePassed) {
    redirect('/remontees');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/remontees"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux remontées
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Modifier la remontée</h2>
        <p className="text-gray-600 mt-1">
          Modifiez les informations de votre remontée
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <FeedbackEditForm
          feedback={{
            id: feedback.id,
            subject: feedback.subject,
            description: feedback.description,
            category: feedback.category,
            meetingId: feedback.meetingId,
          }}
          meeting={{
            id: feedback.meeting.id,
            date: feedback.meeting.date,
            time: feedback.meeting.time,
            type: feedback.meeting.type,
            location: feedback.meeting.location,
          }}
        />
      </div>
    </div>
  );
}
