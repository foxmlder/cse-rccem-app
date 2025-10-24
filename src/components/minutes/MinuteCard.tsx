'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MinuteStatus, UserRole } from '@prisma/client';
import { getMinuteStatusLabel, getMinuteStatusColor } from '@/lib/validators/minute';
import { formatDate, formatTime } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Edit,
  Trash2,
  FileText,
  Users,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface MinuteCardProps {
  minute: {
    id: string;
    content: string;
    status: MinuteStatus;
    createdAt: Date;
    updatedAt: Date;
    createdBy: {
      id: string;
      name: string | null;
      email: string;
      cseRole: string | null;
    };
    meeting: {
      id: string;
      date: Date;
      time: string;
      type: string;
      location: string;
    };
    _count?: {
      signatures: number;
    };
  };
  currentUserRole: UserRole;
  onDelete?: () => void;
}

export default function MinuteCard({ minute, currentUserRole, onDelete }: MinuteCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = currentUserRole === UserRole.PRESIDENT || currentUserRole === UserRole.ADMIN;
  const canEdit = canManage && minute.status === MinuteStatus.DRAFT;
  const canDelete = canManage && minute.status !== MinuteStatus.PUBLISHED;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/minutes/${minute.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      if (onDelete) {
        onDelete();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const signatureCount = minute._count?.signatures || 0;

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
            Êtes-vous sûr de vouloir supprimer ce compte-rendu ?
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
                  Suppression...
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMinuteStatusColor(minute.status)}`}>
              {getMinuteStatusLabel(minute.status)}
            </span>
            {signatureCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                {signatureCount} signature{signatureCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Compte-rendu - {minute.meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
          </h3>

          {/* Meeting Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(minute.meeting.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(minute.meeting.time)}
            </span>
            {minute.meeting.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {minute.meeting.location}
              </span>
            )}
          </div>

          {/* Created By */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>
              Rédigé par {minute.createdBy.name || minute.createdBy.email}
              {minute.createdBy.cseRole && ` (${minute.createdBy.cseRole})`}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>Créé le {new Date(minute.createdAt).toLocaleDateString('fr-FR')}</span>
            {minute.updatedAt !== minute.createdAt && (
              <span>Modifié le {new Date(minute.updatedAt).toLocaleDateString('fr-FR')}</span>
            )}
          </div>

          {/* Content Preview */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3">
              {minute.content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/comptes-rendus/${minute.id}`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {canEdit && (
            <Link
              href={`/comptes-rendus/${minute.id}/edit`}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </Link>
          )}

          {canDelete && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
