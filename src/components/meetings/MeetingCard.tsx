import Link from 'next/link';
import { Calendar, Users, FileText, MessageSquare, CheckCircle, Mail, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MeetingCardProps {
  meeting: {
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
  };
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function MeetingCard({ meeting, onDelete, showActions = true }: MeetingCardProps) {
  const meetingDate = new Date(meeting.date);
  const formattedDate = formatDate(meetingDate, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PLANNED: { label: 'À venir', className: 'bg-blue-100 text-blue-800' },
      CONVOCATION_SENT: { label: 'Convocation envoyée', className: 'bg-green-100 text-green-800' },
      IN_PROGRESS: { label: 'En cours', className: 'bg-orange-100 text-orange-800' },
      COMPLETED: { label: 'Terminée', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Annulée', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getMinuteStatus = () => {
    if (!meeting.minutes || meeting.minutes.length === 0) {
      return { label: 'Non rédigé', className: 'text-gray-600' };
    }

    const minute = meeting.minutes[0];
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Brouillon', className: 'text-orange-600' },
      PENDING_SIGNATURE: { label: 'En attente de signature', className: 'text-orange-600' },
      SIGNED: { label: 'Signé', className: 'text-green-600' },
      PUBLISHED: { label: 'Publié', className: 'text-green-600' },
    };

    return statusMap[minute.status] || { label: minute.status, className: 'text-gray-600' };
  };

  const minuteStatus = getMinuteStatus();
  const participantCount = meeting._count?.participants || 0;
  const feedbackCount = meeting._count?.feedbacks || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-800">
              {meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}
            </h4>
            {getStatusBadge(meeting.status)}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {formattedDate} à {meeting.time}
            </span>
            {meeting.location && (
              <span className="flex items-center gap-1">📍 {meeting.location}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users size={16} />
              {participantCount} participant{participantCount > 1 ? 's' : ''}
            </span>
            {feedbackCount > 0 && (
              <span className="flex items-center gap-1 text-purple-600">
                <MessageSquare size={16} />
                {feedbackCount} remontée{feedbackCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span
              className={`flex items-center gap-1 ${
                meeting.convocationSentAt ? 'text-green-600' : 'text-orange-600'
              }`}
            >
              {meeting.convocationSentAt ? <CheckCircle size={16} /> : <Mail size={16} />}
              Convocation {meeting.convocationSentAt ? 'envoyée' : 'à envoyer'}
            </span>
            <span className={`flex items-center gap-1 ${minuteStatus.className}`}>
              <FileText size={16} />
              CR: {minuteStatus.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/remontees?meetingId=${meeting.id}`}
              className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition flex items-center gap-1"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Remontées</span> ({feedbackCount})
            </Link>
            <Link
              href={`/convocations/${meeting.id}`}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
            >
              Convocation
            </Link>
            <Link
              href={`/comptes-rendus/${meeting.id}`}
              className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition"
            >
              CR
            </Link>
            <Link
              href={`/reunions/${meeting.id}`}
              className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition"
            >
              <Edit size={16} />
            </Link>
            {onDelete && (meeting.status === 'PLANNED' || (meeting.status === 'CONVOCATION_SENT' && (!meeting.minutes || meeting.minutes.length === 0))) && (
              <button
                onClick={() => onDelete(meeting.id)}
                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
