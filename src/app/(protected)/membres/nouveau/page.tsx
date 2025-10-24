import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import MemberForm from '@/components/members/MemberForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewMemberPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Check permission
  if (!hasPermission(session.user.role, 'ADD_MEMBER')) {
    redirect('/membres');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/membres"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux membres
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Nouveau membre</h2>
        <p className="text-gray-600 mt-1">Ajoutez un nouveau membre au CSE</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          À propos des rôles
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-medium">Administrateur :</span> Accès complet à toutes les fonctionnalités
          </li>
          <li>
            <span className="font-medium">Président :</span> Peut gérer les réunions, convocations et comptes-rendus
          </li>
          <li>
            <span className="font-medium">Membre :</span> Peut participer aux réunions et soumettre des remontées
          </li>
        </ul>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MemberForm />
      </div>
    </div>
  );
}
