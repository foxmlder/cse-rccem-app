'use client';

/**
 * MinuteViewer component
 * Displays a minute in read-only mode with signatures and signing capability
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MinuteStatus } from '@prisma/client';
import { formatDate, formatTime, formatDateTime } from '@/lib/utils';
import { getStatusLabel, getStatusColor } from '@/lib/validators/minute';
import { canSignMinute, calculateSignatureProgress } from '@/lib/validators/signature';
import SignatureCard from '@/components/signatures/SignatureCard';
import SignatureModal from '@/components/signatures/SignatureModal';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  PenTool,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface MinuteViewerProps {
  minute: {
    id: string;
    content: string;
    status: MinuteStatus;
    createdAt: Date;
    updatedAt: Date;
    meeting: {
      id: string;
      date: Date;
      time: string;
      type: string;
      location: string;
    };
    signatures: Array<{
      id: string;
      signedAt: Date;
      comments: string | null;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        cseRole: string | null;
      };
    }>;
  };
  currentUser: {
    id: string;
    role: string;
  };
  requiredSignatures: number;
}

export default function MinuteViewer({
  minute,
  currentUser,
  requiredSignatures,
}: MinuteViewerProps) {
  const router = useRouter();
  const [showSignModal, setShowSignModal] = useState(false);
  const [removingSignatureId, setRemovingSignatureId] = useState<string | null>(null);

  const userHasSigned = minute.signatures.some(
    (sig) => sig.user.id === currentUser.id
  );

  const canSign = canSignMinute(minute.status, currentUser.role) && !userHasSigned;

  const signatureProgress = calculateSignatureProgress(
    minute.signatures.length,
    requiredSignatures
  );

  const handleSign = async (comments?: string) => {
    const response = await fetch('/api/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minuteId: minute.id,
        comments,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la signature');
    }

    router.refresh();
  };

  const handleRemoveSignature = async (signatureId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer votre signature ?')) {
      return;
    }

    setRemovingSignatureId(signatureId);

    try {
      const response = await fetch(`/api/signatures/${signatureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du retrait de la signature');
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Erreur lors du retrait de la signature');
    } finally {
      setRemovingSignatureId(null);
    }
  };

  // Generate title from meeting type
  const meetingTitle = minute.meeting.type === 'ORDINARY'
    ? 'Réunion ordinaire'
    : 'Réunion extraordinaire';

  return (
    <div className="space-y-6">
      {/* Status and Actions Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {meetingTitle}
              </h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getStatusColor(minute.status) === 'green'
                    ? 'bg-green-100 text-green-800'
                    : getStatusColor(minute.status) === 'blue'
                    ? 'bg-blue-100 text-blue-800'
                    : getStatusColor(minute.status) === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {getStatusLabel(minute.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Créé le {formatDateTime(minute.createdAt)}
              {minute.updatedAt.getTime() !== minute.createdAt.getTime() &&
                ` • Modifié le ${formatDateTime(minute.updatedAt)}`}
            </p>
          </div>

          {canSign && (
            <button
              onClick={() => setShowSignModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <PenTool className="h-5 w-5" />
              Signer le compte-rendu
            </button>
          )}
        </div>
      </div>

      {/* Meeting Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations de la réunion
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(minute.meeting.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(minute.meeting.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{minute.meeting.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{minute.meeting.type}</span>
          </div>
        </div>
      </div>

      {/* Signature Progress */}
      {minute.status === MinuteStatus.PENDING_SIGNATURE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                En attente de signatures
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm text-yellow-800 mb-2">
                    <span>{signatureProgress.label}</span>
                    <span>{signatureProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${signatureProgress.percentage}%` }}
                    />
                  </div>
                </div>
                {!signatureProgress.isComplete && (
                  <p className="text-sm text-yellow-800">
                    {requiredSignatures - minute.signatures.length} signature(s)
                    supplémentaire(s) nécessaire(s) pour finaliser le compte-rendu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signatures Section */}
      {minute.signatures.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Signatures ({minute.signatures.length})
          </h3>
          <div className="grid gap-4">
            {minute.signatures.map((signature) => (
              <SignatureCard
                key={signature.id}
                signature={signature}
                currentUserId={currentUser.id}
                canRemove={minute.status === MinuteStatus.PENDING_SIGNATURE}
                onRemove={handleRemoveSignature}
                isRemoving={removingSignatureId === signature.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Compte-rendu
        </h3>
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
            {minute.content}
          </pre>
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSign={handleSign}
        minuteTitle={meetingTitle}
      />
    </div>
  );
}
