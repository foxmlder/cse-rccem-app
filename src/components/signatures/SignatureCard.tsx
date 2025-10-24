'use client';

/**
 * SignatureCard component
 * Displays a single signature with user info and actions
 */

import { CheckCircle, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface SignatureCardProps {
  signature: {
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
  };
  currentUserId?: string;
  canRemove?: boolean;
  onRemove?: (signatureId: string) => void;
  isRemoving?: boolean;
}

export default function SignatureCard({
  signature,
  currentUserId,
  canRemove = false,
  onRemove,
  isRemoving = false,
}: SignatureCardProps) {
  const isOwnSignature = currentUserId === signature.user.id;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Signature icon */}
          <div className="flex-shrink-0 mt-1">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>

          {/* Signature info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900">
                {signature.user.name}
              </p>
              {isOwnSignature && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Vous
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500">{signature.user.email}</p>

            {signature.user.cseRole && (
              <p className="text-sm text-gray-500 mt-0.5">
                {signature.user.cseRole}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-1">
              Signé le {formatDateTime(signature.signedAt)}
            </p>

            {signature.comments && (
              <div className="mt-2 bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-600 italic">
                  &quot;{signature.comments}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canRemove && isOwnSignature && onRemove && (
          <button
            onClick={() => onRemove(signature.id)}
            disabled={isRemoving}
            className="flex-shrink-0 ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Retirer ma signature"
          >
            {isRemoving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
