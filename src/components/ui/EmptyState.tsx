import React from 'react';
import { cn } from '@/lib/utils';
import { FileQuestion } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className,
  icon,
  title,
  description,
  action,
  size = 'md',
  ...props
}) => {
  const sizes = {
    sm: {
      container: 'p-8',
      icon: 'w-8 h-8',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'p-12',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'p-16',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizeStyles = sizes[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'bg-white rounded-lg border border-gray-200',
        sizeStyles.container,
        className
      )}
      {...props}
    >
      <div className={cn('text-gray-400 mb-4', sizeStyles.icon)}>
        {icon || <FileQuestion className="w-full h-full" />}
      </div>

      <h3 className={cn('font-medium text-gray-900 mb-2', sizeStyles.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn('text-gray-600 mb-6 max-w-md', sizeStyles.description)}>
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
