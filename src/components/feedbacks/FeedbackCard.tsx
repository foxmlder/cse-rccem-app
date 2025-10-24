'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FeedbackCategory, FeedbackStatus, UserRole } from '@prisma/client';
import {
  getCategoryLabel,
  getCategoryColor,
  getStatusLabel,
  getStatusColor,
} from '@/lib/validators/feedback';
import { formatDate, formatTime } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Edit2,
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FeedbackCardProps {
  feedback: {
    id: string;
    subject: string;
    description: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    response: string | null;
    submittedAt: Date;
    submittedBy: {
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
  };
  currentUserId: string;
  currentUserRole: UserRole;
  onUpdate?: () => void;
}

export default function FeedbackCard({
  feedback,
  currentUserId,
  currentUserRole,
  onUpdate,
}: FeedbackCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState(feedback.response || '');

  const isOwner = feedback.submittedBy.id === currentUserId;
  const canManage = currentUserRole === UserRole.PRESIDENT || currentUserRole === UserRole.ADMIN;
  const canEdit = isOwner || canManage;
  const canDelete = isOwner || canManage;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/feedbacks/${feedback.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || 'Une erreur est survenue');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusUpdate = async (newStatus: FeedbackStatus) => {
    if (!canManage) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/feedbacks/${feedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || 'Une erreur est survenue');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResponseSubmit = async () => {
    if (!canManage) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/feedbacks/${feedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setShowResponseForm(false);
      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || 'Une erreur est survenue');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
              {getCategoryLabel(feedback.category)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
              {getStatusLabel(feedback.status)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{feedback.subject}</h3>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => router.push(`/remontees/${feedback.id}/edit`)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 mb-3">Êtes-vous sûr de vouloir supprimer cette remontée ?</p>
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

      {/* Description */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{feedback.description}</p>

      {/* Meeting Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Réunion concernée</h4>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(feedback.meeting.date)}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{formatTime(feedback.meeting.time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{feedback.meeting.location}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Type :</span> {feedback.meeting.type}
        </div>
      </div>

      {/* Submitted By */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <User className="w-4 h-4" />
        <span>
          Soumis par {feedback.submittedBy.name || feedback.submittedBy.email}
          {feedback.submittedBy.cseRole && ` (${feedback.submittedBy.cseRole})`}
        </span>
        <span className="mx-1">•</span>
        <span>{new Date(feedback.submittedAt).toLocaleDateString('fr-FR')}</span>
      </div>

      {/* Response Section */}
      {feedback.response && !showResponseForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Réponse de la direction</h4>
          </div>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">{feedback.response}</p>
          {canManage && (
            <button
              onClick={() => {
                setResponseText(feedback.response || '');
                setShowResponseForm(true);
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Modifier la réponse
            </button>
          )}
        </div>
      )}

      {/* Response Form */}
      {canManage && showResponseForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Réponse de la direction</h4>
          </div>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            placeholder="Entrez votre réponse..."
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleResponseSubmit}
              disabled={updatingStatus}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
            <button
              onClick={() => {
                setShowResponseForm(false);
                setResponseText(feedback.response || '');
              }}
              disabled={updatingStatus}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {canManage && !showResponseForm && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600 mr-2">Changer le statut :</span>
          {feedback.status !== FeedbackStatus.IN_PROGRESS && (
            <button
              onClick={() => handleStatusUpdate(FeedbackStatus.IN_PROGRESS)}
              disabled={updatingStatus}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              En cours
            </button>
          )}
          {feedback.status !== FeedbackStatus.ADDRESSED && (
            <button
              onClick={() => handleStatusUpdate(FeedbackStatus.ADDRESSED)}
              disabled={updatingStatus}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Traité
            </button>
          )}
          {feedback.status !== FeedbackStatus.REJECTED && (
            <button
              onClick={() => handleStatusUpdate(FeedbackStatus.REJECTED)}
              disabled={updatingStatus}
              className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Rejeté
            </button>
          )}
          {!feedback.response && (
            <button
              onClick={() => setShowResponseForm(true)}
              className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              Répondre
            </button>
          )}
        </div>
      )}
    </div>
  );
}
