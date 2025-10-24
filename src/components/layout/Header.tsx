import { Users } from 'lucide-react';
import UserMenu from './UserMenu';
import { SessionUser } from '@/types/auth';

interface HeaderProps {
  user: SessionUser;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                CSE RCCEM-Montataire
              </h1>
              <p className="text-sm text-gray-500">
                Gestion des réunions et comptes-rendus
              </p>
            </div>
          </div>

          {/* User Menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
