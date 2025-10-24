import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion - CSE RCCEM',
  description: 'Connexion à l\'application de gestion CSE',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CSE RCCEM-Montataire
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à l'application
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Pour toute assistance, contactez{' '}
          <a
            href="mailto:f.muselet@rccem.fr"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            f.muselet@rccem.fr
          </a>
        </p>
      </div>
    </div>
  );
}
