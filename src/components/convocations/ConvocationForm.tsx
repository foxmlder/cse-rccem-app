'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Send, Loader2, Download, CheckCircle } from 'lucide-react';
import AgendaItemEditor from './AgendaItemEditor';

interface AgendaItem {
  id?: string;
  title: string;
  description?: string | null;
  duration?: number | null;
  order: number;
}

interface Meeting {
  id: string;
  date: Date;
  time: string;
  type: string;
  participants: Array<{ user: { email: string } }>;
}

interface ConvocationFormProps {
  meeting: Meeting;
  initialAgendaItems: AgendaItem[];
  alreadySent: boolean;
}

export default function ConvocationForm({
  meeting,
  initialAgendaItems,
  alreadySent,
}: ConvocationFormProps) {
  const router = useRouter();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(initialAgendaItems);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasChanges =
    JSON.stringify(agendaItems) !== JSON.stringify(initialAgendaItems);

  const handleSaveAgenda = async () => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      // Update meeting with new agenda items
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agendaItems: agendaItems.map((item, index) => ({
            ...item,
            order: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess('Ordre du jour sauvegardé');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewPdf = async () => {
    setIsGeneratingPdf(true);
    setError(null);

    try {
      const response = await fetch('/api/convocations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setError(null);

    try {
      const response = await fetch('/api/convocations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `convocation-${meeting.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendConvocation = async () => {
    if (agendaItems.length === 0) {
      setError('Veuillez ajouter au moins un point à l\'ordre du jour');
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir envoyer la convocation à ${meeting.participants.length} participant(s) ?\n\nCette action est irréversible et les emails seront envoyés immédiatement.`
      )
    ) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSending(true);

    try {
      const response = await fetch('/api/convocations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setSuccess(
        `Convocation envoyée avec succès à ${data.sentCount} participant(s) !`
      );

      // Refresh page after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">{success}</p>
        </div>
      )}

      {/* Agenda Editor */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <AgendaItemEditor
          items={agendaItems}
          onChange={setAgendaItems}
          disabled={alreadySent}
        />

        {hasChanges && !alreadySent && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveAgenda}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <span>Sauvegarder l'ordre du jour</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preview PDF */}
          <button
            onClick={handlePreviewPdf}
            disabled={isGeneratingPdf || agendaItems.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Eye size={20} />
            {isGeneratingPdf ? 'Génération...' : 'Prévisualiser'}
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || agendaItems.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Download size={20} />
            {isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}
          </button>

          {/* Send Convocation */}
          <button
            onClick={handleSendConvocation}
            disabled={
              isSending ||
              alreadySent ||
              agendaItems.length === 0 ||
              meeting.participants.length === 0 ||
              hasChanges
            }
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Send size={20} />
            {isSending ? 'Envoi...' : 'Envoyer la convocation'}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-sm text-gray-600 space-y-2">
          {hasChanges && !alreadySent && (
            <p className="text-orange-600 font-medium">
              ⚠️ Vous avez des modifications non sauvegardées. Veuillez les
              sauvegarder avant d'envoyer la convocation.
            </p>
          )}
          {agendaItems.length === 0 && (
            <p className="text-red-600">
              ⚠️ Veuillez ajouter au moins un point à l'ordre du jour.
            </p>
          )}
          {meeting.participants.length === 0 && (
            <p className="text-red-600">
              ⚠️ Aucun participant n'a été invité à cette réunion.
            </p>
          )}
          {!alreadySent && agendaItems.length > 0 && meeting.participants.length > 0 && !hasChanges && (
            <p className="text-green-600">
              ✓ Tout est prêt ! Vous pouvez envoyer la convocation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
