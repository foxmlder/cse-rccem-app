/**
 * Signatures management page
 * Lists all signatures with filters
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDateTime } from '@/lib/utils';
import { getStatusLabel, getStatusColor } from '@/lib/validators/minute';
import { CheckCircle, FileText, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SignaturesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const isAdmin = session.user.role === 'ADMIN';

  // Get signatures based on user role
  const signatures = await prisma.signature.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          cseRole: true,
        },
      },
      minute: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          meeting: {
            select: {
              id: true,
              type: true,
              date: true,
              time: true,
              location: true,
            },
          },
        },
      },
    },
    orderBy: {
      signedAt: 'desc',
    },
  });

  // Calculate stats
  const stats = {
    total: signatures.length,
    mySignatures: signatures.filter((sig) => sig.userId === session.user.id).length,
    thisMonth: signatures.filter((sig) => {
      const signedDate = new Date(sig.signedAt);
      const now = new Date();
      return (
        signedDate.getMonth() === now.getMonth() &&
        signedDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'Toutes les signatures' : 'Mes signatures'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isAdmin
            ? 'Vue d\'ensemble de toutes les signatures des comptes-rendus'
            : 'Vos signatures sur les comptes-rendus'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isAdmin ? 'Total signatures' : 'Mes signatures'}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isAdmin ? stats.total : stats.mySignatures}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ce mois-ci</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.thisMonth}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comptes-rendus</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {new Set(signatures.map((s) => s.minuteId)).size}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Signatures List */}
      {signatures.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune signature
          </h3>
          <p className="text-gray-600 mb-6">
            {isAdmin
              ? 'Aucune signature n\'a encore été effectuée.'
              : 'Vous n\'avez signé aucun compte-rendu pour le moment.'}
          </p>
          <Link
            href="/comptes-rendus"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            Voir les comptes-rendus
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compte-rendu
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signé par
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de signature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commentaire
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {signatures.map((signature) => (
                  <tr key={signature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {signature.minute.meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(signature.minute.meeting.date).toLocaleDateString('fr-FR')} à {signature.minute.meeting.time}
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {signature.user.name || signature.user.email}
                          </div>
                          {signature.user.cseRole && (
                            <div className="text-sm text-gray-500">
                              {signature.user.cseRole}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(signature.signedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(signature.minute.status) === 'green'
                            ? 'bg-green-100 text-green-800'
                            : getStatusColor(signature.minute.status) === 'blue'
                            ? 'bg-blue-100 text-blue-800'
                            : getStatusColor(signature.minute.status) === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatusLabel(signature.minute.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {signature.comments ? (
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {signature.comments}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Aucun commentaire</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/comptes-rendus/${signature.minute.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
