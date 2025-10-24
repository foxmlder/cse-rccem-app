'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  MessageSquare,
  FileText,
  Users,
  PenLine,
} from 'lucide-react';

const navItems = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'blue',
  },
  {
    name: 'Réunions',
    href: '/reunions',
    icon: Users,
    color: 'blue',
  },
  {
    name: 'Convocations',
    href: '/convocations',
    icon: Send,
    color: 'blue',
  },
  {
    name: 'Remontées personnel',
    href: '/remontees',
    icon: MessageSquare,
    color: 'purple',
  },
  {
    name: 'Comptes-rendus',
    href: '/comptes-rendus',
    icon: FileText,
    color: 'blue',
  },
  {
    name: 'Signatures',
    href: '/signatures',
    icon: PenLine,
    color: 'green',
  },
  {
    name: 'Membres',
    href: '/membres',
    icon: Users,
    color: 'blue',
  },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const getColorClasses = (color: string, active: boolean) => {
    if (active) {
      if (color === 'purple') return 'border-purple-600 text-purple-600';
      if (color === 'green') return 'border-green-600 text-green-600';
      return 'border-blue-600 text-blue-600';
    }
    return 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 sm:gap-8 overflow-x-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-sm transition whitespace-nowrap flex items-center gap-2 ${getColorClasses(
                  item.color,
                  active
                )}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.name}</span>
                <span className="sm:hidden">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
