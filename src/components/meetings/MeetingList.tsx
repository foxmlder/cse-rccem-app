'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MeetingCard from './MeetingCard';
import { Loader2, AlertCircle } from 'lucide-react';

interface MeetingListProps {
  meetings: Array<{
    id: string;
    date: Date;
    time: string;
    type: 'ORDINARY' | 'EXTRAORDINARY';
    status: string;
    location: string | null;
    convocationSentAt: Date | null;
    _count?: {
      participants: number;
      feedbacks: number;
    };
    minutes?: Array<{
      status: string;
    }>;
  }>;
  canDelete: boolean;
}

export default function MeetingList({ meetings, canDelete }: MeetingListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = (meetingId: string) => {
    setShowConfirm(meetingId);
    setError(null);
  };

  const handleConfirmDelete = async (meetingId: string) => {
    setDeletingId(meetingId);
    setError(null);

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      // Refresh the page to update the list
      router.refresh();
      setShowConfirm(null);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmer la suppression
              </h3>
            </div>
            <div className="mb-6 space-y-3">
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer cette réunion ?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  Cette action est irréversible et supprimera :
                </p>
                <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>La réunion et ses informations</li>
                  <li>La convocation (si envoyée)</li>
                  <li>Toutes les remontées du personnel</li>
                  <li>L'ordre du jour</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                Note : Les réunions avec un compte-rendu ne peuvent pas être supprimées.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={deletingId !== null}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleConfirmDelete(showConfirm)}
                disabled={deletingId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId === showConfirm ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meetings List */}
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onDelete={canDelete ? handleDeleteClick : undefined}
          showActions={true}
        />
      ))}
    </div>
  );
}
