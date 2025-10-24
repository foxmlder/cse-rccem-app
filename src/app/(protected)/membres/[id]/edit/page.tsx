import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import MemberForm from '@/components/members/MemberForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditMemberPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Check permission
  if (!hasPermission(session.user.role, 'EDIT_MEMBER')) {
    redirect('/membres');
  }

  // Fetch the member
  const member = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      cseRole: true,
      isActive: true,
    },
  });

  if (!member) {
    notFound();
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
        <h2 className="text-2xl font-bold text-gray-800">Modifier le membre</h2>
        <p className="text-gray-600 mt-1">{member.name}</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Informations importantes
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>Le mot de passe n'est requis que si vous souhaitez le modifier</li>
          <li>Les comptes inactifs ne peuvent pas se connecter à l'application</li>
          <li>La modification de l'email nécessitera une nouvelle connexion</li>
        </ul>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MemberForm member={member} />
      </div>
    </div>
  );
}
