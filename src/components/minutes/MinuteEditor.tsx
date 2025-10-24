'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MinuteStatus, FeedbackCategory } from '@prisma/client';
import { formatDate, formatTime } from '@/lib/utils';
import { getCategoryLabel } from '@/lib/validators/feedback';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  MessageSquare,
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
} from 'lucide-react';

interface MinuteEditorProps {
  minute?: {
    id: string;
    content: string;
    status: MinuteStatus;
  };
  meeting: {
    id: string;
    date: Date;
    time: string;
    type: string;
    location: string;
    agendaItems: Array<{
      id: string;
      order: number;
      title: string;
      description: string | null;
      duration: number | null;
    }>;
    feedbacks?: Array<{
      id: string;
      subject: string;
      description: string;
      category: FeedbackCategory;
      response: string | null;
      submittedBy: {
        name: string | null;
        email: string;
      };
    }>;
  };
}

export default function MinuteEditor({ minute, meeting }: MinuteEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(minute?.content || '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = !!minute;
  const isDraft = !minute || minute.status === MinuteStatus.DRAFT;

  const handleSave = async () => {
    if (content.length < 50) {
      setError('Le contenu doit contenir au moins 50 caractères');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEditing ? `/api/minutes/${minute.id}` : '/api/minutes';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess('Brouillon sauvegardé avec succès');

      if (!isEditing) {
        // Redirect to edit page for newly created minute
        router.push(`/comptes-rendus/${data.minute.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForSignature = async () => {
    if (content.length < 50) {
      setError('Le contenu doit contenir au moins 50 caractères');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // First save if not editing yet
      if (!isEditing) {
        const createResponse = await fetch('/api/minutes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: meeting.id,
            content,
          }),
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
          throw new Error(createData.error || 'Erreur lors de la création');
        }

        // Then submit for signature
        const updateResponse = await fetch(`/api/minutes/${createData.minute.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: MinuteStatus.PENDING_SIGNATURE,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Erreur lors de la soumission');
        }

        router.push(`/comptes-rendus/${createData.minute.id}`);
      } else {
        // Just update status
        const response = await fetch(`/api/minutes/${minute.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: MinuteStatus.PENDING_SIGNATURE,
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la soumission');
        }

        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const insertTemplate = () => {
    const template = generateTemplate();
    setContent(template);
  };

  const generateTemplate = () => {
    let template = `COMPTE-RENDU DE RÉUNION\n\n`;
    template += `Type : ${meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}\n`;
    template += `Date : ${formatDate(meeting.date)}\n`;
    template += `Heure : ${formatTime(meeting.time)}\n`;
    template += `Lieu : ${meeting.location}\n\n`;

    template += `ORDRE DU JOUR\n\n`;
    meeting.agendaItems.forEach((item) => {
      template += `${item.order}. ${item.title}\n`;
      if (item.description) {
        template += `   ${item.description}\n`;
      }
      template += `\n`;
    });

    if (meeting.feedbacks && meeting.feedbacks.length > 0) {
      template += `\nREMONTÉES DU PERSONNEL\n\n`;
      meeting.feedbacks.forEach((feedback, index) => {
        template += `${index + 1}. ${feedback.subject} (${getCategoryLabel(feedback.category)})\n`;
        template += `   Soumis par : ${feedback.submittedBy.name || feedback.submittedBy.email}\n`;
        template += `   ${feedback.description}\n`;
        if (feedback.response) {
          template += `   \n`;
          template += `   Réponse de la Direction :\n`;
          template += `   ${feedback.response}\n`;
        }
        template += `\n`;
      });
    }

    template += `\n---\n\nCONTENU DU COMPTE-RENDU\n\n`;
    template += `[Rédigez ici le contenu détaillé du compte-rendu...]\n\n`;

    return template;
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Meeting Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la réunion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(meeting.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(meeting.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{meeting.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire'}</span>
          </div>
        </div>
      </div>

      {/* Agenda Items */}
      {meeting.agendaItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ordre du jour ({meeting.agendaItems.length} points)
          </h3>
          <div className="space-y-3">
            {meeting.agendaItems.map((item) => (
              <div key={item.id} className="border-l-4 border-blue-400 pl-4">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-900">
                    {item.order}. {item.title}
                  </p>
                  {item.duration && (
                    <span className="text-sm text-gray-500">{item.duration} min</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rédaction du compte-rendu</h3>
          {!content && (
            <button
              onClick={insertTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
              disabled={!isDraft}
            >
              Insérer un modèle
            </button>
          )}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
          placeholder="Rédigez le compte-rendu de la réunion..."
          disabled={!isDraft}
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            {content.length} caractères (minimum 50)
          </p>
          {!isDraft && (
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Modification impossible après soumission
            </p>
          )}
        </div>
      </div>

      {/* Feedbacks */}
      {meeting.feedbacks && meeting.feedbacks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Remontées du personnel ({meeting.feedbacks.length})
          </h3>
          <div className="space-y-4">
            {meeting.feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-l-4 border-purple-400 pl-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-900">{feedback.subject}</p>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {getCategoryLabel(feedback.category)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{feedback.description}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Soumis par : {feedback.submittedBy.name || feedback.submittedBy.email}
                </p>
                {feedback.response && (
                  <div className="mt-2 pl-4 border-l-2 border-blue-300 bg-blue-50 p-2 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Réponse de la Direction :</p>
                    <p className="text-sm text-blue-800">{feedback.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {isDraft && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={saving || submitting}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || submitting || content.length < 50}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Sauvegarder le brouillon
              </>
            )}
          </button>
          <button
            onClick={handleSubmitForSignature}
            disabled={saving || submitting || content.length < 50}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Soumission...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Soumettre pour signature
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
