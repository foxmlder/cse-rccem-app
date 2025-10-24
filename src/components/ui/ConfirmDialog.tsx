'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false,
}) => {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const variants = {
    danger: {
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: <Info className="w-6 h-6" />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonVariant: 'primary' as const,
    },
    success: {
      icon: <CheckCircle className="w-6 h-6" />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonVariant: 'success' as const,
    },
  };

  const variantStyles = variants[variant];

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error confirming:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!isConfirming && !loading}
      showCloseButton={!isConfirming && !loading}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            variantStyles.iconBg,
            variantStyles.iconColor
          )}
        >
          {variantStyles.icon}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isConfirming || loading}
        >
          {cancelText}
        </Button>

        <Button
          variant={variantStyles.buttonVariant}
          onClick={handleConfirm}
          loading={isConfirming || loading}
          disabled={isConfirming || loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

ConfirmDialog.displayName = 'ConfirmDialog';
