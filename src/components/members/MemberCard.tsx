'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@prisma/client';
import { getRoleLabel, getRoleColor, getStatusBadge } from '@/lib/validators/user';
import { Mail, Calendar, Edit, Trash2, UserX, UserCheck, Loader2, AlertCircle } from 'lucide-react';

interface MemberCardProps {
  member: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    cseRole: string | null;
    isActive: boolean;
    createdAt: Date;
    _count?: {
      createdMeetings: number;
      participations: number;
      submittedFeedbacks: number;
    };
  };
  currentUserId: string;
  currentUserRole: UserRole;
  canManage: boolean;
}

export default function MemberCard({ member, currentUserId, currentUserRole, canManage }: MemberCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentUser = member.id === currentUserId;
  const statusBadge = getStatusBadge(member.isActive);

  const handleToggleStatus = async () => {
    setToggling(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${member.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 mb-3">
            Êtes-vous sûr de vouloir désactiver ce membre ? Cette action peut être annulée en réactivant le membre.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Désactivation...
                </>
              ) : (
                'Confirmer'
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
              {getRoleLabel(member.role)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {isCurrentUser && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Vous
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>

          {member.cseRole && (
            <p className="text-sm text-gray-600 mb-2">{member.cseRole}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${member.email}`} className="hover:text-blue-600">
              {member.email}
            </a>
          </div>

          {/* Stats */}
          {member._count && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {member._count.createdMeetings > 0 && (
                <span>{member._count.createdMeetings} réunion{member._count.createdMeetings > 1 ? 's' : ''} créée{member._count.createdMeetings > 1 ? 's' : ''}</span>
              )}
              {member._count.participations > 0 && (
                <span>{member._count.participations} participation{member._count.participations > 1 ? 's' : ''}</span>
              )}
              {member._count.submittedFeedbacks > 0 && (
                <span>{member._count.submittedFeedbacks} remontée{member._count.submittedFeedbacks > 1 ? 's' : ''}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <Calendar className="w-3 h-3" />
            <span>Membre depuis le {new Date(member.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex flex-col gap-2">
            <Link
              href={`/membres/${member.id}/edit`}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </Link>

            {!isCurrentUser && (
              <>
                <button
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                    member.isActive
                      ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title={member.isActive ? 'Désactiver' : 'Activer'}
                >
                  {toggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : member.isActive ? (
                    <UserX className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </button>

                {!showDeleteConfirm && member.isActive && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                    title="Désactiver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
