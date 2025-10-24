import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import FeedbackForm from '@/components/feedbacks/FeedbackForm';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NouvelleFeedbackPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch meetings that are open for feedback (deadline not passed or no deadline)
  const now = new Date();
  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [
        { feedbackDeadline: null },
        { feedbackDeadline: { gte: now } },
      ],
    },
    select: {
      id: true,
      date: true,
      time: true,
      type: true,
      location: true,
      feedbackDeadline: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

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
        <h2 className="text-2xl font-bold text-gray-800">Nouvelle remontée</h2>
        <p className="text-gray-600 mt-1">
          Soumettez une remontée concernant une réunion à venir ou en cours
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">À propos des remontées</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Les remontées permettent de faire remonter des préoccupations ou suggestions au CSE</li>
            <li>Chaque remontée est liée à une réunion spécifique</li>
            <li>Vous pouvez modifier ou supprimer votre remontée avant la date limite</li>
            <li>La direction pourra y répondre après traitement</li>
          </ul>
        </div>
      </div>

      {/* No Meetings Alert */}
      {meetings.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Aucune réunion disponible</h3>
          <p className="text-yellow-800">
            Il n'y a actuellement aucune réunion pour laquelle vous pouvez soumettre une remontée.
            Les réunions dont la date limite est dépassée ne sont plus disponibles.
          </p>
          <Link
            href="/remontees"
            className="inline-block mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Retour aux remontées
          </Link>
        </div>
      )}

      {/* Form */}
      {meetings.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FeedbackForm meetings={meetings} />
        </div>
      )}

      {/* Help Text */}
      {meetings.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Conseils pour rédiger votre remontée :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Choisissez une catégorie appropriée pour faciliter le traitement</li>
            <li>Soyez précis et factuel dans votre description</li>
            <li>Indiquez des exemples concrets si possible</li>
            <li>Proposez des solutions ou améliorations si vous en avez</li>
          </ul>
        </div>
      )}
    </div>
  );
}
