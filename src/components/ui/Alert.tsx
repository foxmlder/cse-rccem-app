import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  icon,
  onClose,
  children,
  ...props
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-600',
      defaultIcon: <Info className="w-5 h-5" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-600',
      defaultIcon: <CheckCircle className="w-5 h-5" />,
    },
    warning: {
      container: 'bg-orange-50 border-orange-200 text-orange-800',
      icon: 'text-orange-600',
      defaultIcon: <AlertTriangle className="w-5 h-5" />,
    },
    danger: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-600',
      defaultIcon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border rounded-lg',
        variantStyles.container,
        className
      )}
      role="alert"
      {...props}
    >
      <div className={cn('flex-shrink-0 mt-0.5', variantStyles.icon)}>
        {icon || variantStyles.defaultIcon}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-medium mb-1">{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'flex-shrink-0 hover:opacity-70 transition-opacity',
            variantStyles.icon
          )}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';
