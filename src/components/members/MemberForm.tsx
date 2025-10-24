'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { getRoleLabel, CSE_ROLES } from '@/lib/validators/user';
import { AlertCircle, Loader2, Save, Eye, EyeOff } from 'lucide-react';

interface MemberFormProps {
  member?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    cseRole: string | null;
    isActive: boolean;
  };
}

export default function MemberForm({ member }: MemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = !!member;

  const [formData, setFormData] = useState({
    email: member?.email || '',
    name: member?.name || '',
    password: '',
    role: member?.role || UserRole.MEMBER,
    cseRole: member?.cseRole || '',
    isActive: member?.isActive ?? true,
  });

  const roles = [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.MEMBER];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.name) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isEditing && !formData.password) {
      setError('Le mot de passe est obligatoire pour créer un nouveau membre');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/users/${member.id}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const payload: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        cseRole: formData.cseRole || null,
        isActive: formData.isActive,
      };

      // Only include password if it's provided
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      router.push('/membres');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom complet *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Jean Dupont"
          required
          disabled={loading}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="jean.dupont@example.com"
          required
          disabled={loading}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Mot de passe {isEditing ? '(laisser vide pour ne pas changer)' : '*'}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
            placeholder="Minimum 8 caractères"
            required={!isEditing}
            minLength={8}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">Minimum 8 caractères</p>
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Rôle système *
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={loading}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {getRoleLabel(role)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Détermine les permissions de l'utilisateur dans l'application
        </p>
      </div>

      {/* CSE Role */}
      <div>
        <label htmlFor="cseRole" className="block text-sm font-medium text-gray-700 mb-2">
          Fonction au CSE
        </label>
        <input
          type="text"
          id="cseRole"
          list="cseRoles"
          value={formData.cseRole}
          onChange={(e) => setFormData({ ...formData, cseRole: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Secrétaire, Trésorier, Titulaire..."
          disabled={loading}
        />
        <datalist id="cseRoles">
          {CSE_ROLES.map((role) => (
            <option key={role} value={role} />
          ))}
        </datalist>
        <p className="mt-1 text-sm text-gray-500">
          Fonction officielle au sein du CSE (optionnel)
        </p>
      </div>

      {/* Is Active */}
      {isEditing && (
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={loading}
          />
          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-900">
              Compte actif
            </label>
            <p className="text-sm text-gray-600">
              Les comptes inactifs ne peuvent pas se connecter à l'application
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? 'Enregistrer les modifications' : 'Créer le membre'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
