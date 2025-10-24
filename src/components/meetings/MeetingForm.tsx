'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users as UsersIcon, Plus, X, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  cseRole: string | null;
}

interface AgendaItem {
  title: string;
  description?: string;
  duration?: number;
  order: number;
}

interface MeetingFormProps {
  users: User[];
  initialData?: {
    id?: string;
    date: string;
    time: string;
    type: 'ORDINARY' | 'EXTRAORDINARY';
    location: string;
    feedbackDeadline?: string;
    participantIds: string[];
    agendaItems?: AgendaItem[];
  };
  mode?: 'create' | 'edit';
}

export default function MeetingForm({ users, initialData, mode = 'create' }: MeetingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    time: initialData?.time || '14:00',
    type: initialData?.type || 'ORDINARY' as 'ORDINARY' | 'EXTRAORDINARY',
    location: initialData?.location || 'Salle de réunion - RCCEM Montataire',
    feedbackDeadline: initialData?.feedbackDeadline || '',
    participantIds: initialData?.participantIds || [],
    agendaItems: initialData?.agendaItems || [
      { title: 'Approbation du procès-verbal de la réunion précédente', order: 1 },
      { title: 'Informations de la direction', order: 2 },
      { title: 'Questions diverses', order: 3 },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.date) {
        throw new Error('La date est requise');
      }
      if (formData.participantIds.length === 0) {
        throw new Error('Au moins un participant est requis');
      }

      const url = mode === 'edit' && initialData?.id
        ? `/api/meetings/${initialData.id}`
        : '/api/meetings';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const { meeting } = await response.json();
      router.push(`/reunions/${meeting.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter((id) => id !== userId)
        : [...prev.participantIds, userId],
    }));
  };

  const addAgendaItem = () => {
    setFormData((prev) => ({
      ...prev,
      agendaItems: [
        ...prev.agendaItems,
        { title: '', order: prev.agendaItems.length + 1 },
      ],
    }));
  };

  const removeAgendaItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      agendaItems: prev.agendaItems
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order: i + 1 })),
    }));
  };

  const updateAgendaItem = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      agendaItems: prev.agendaItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Meeting Details */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Informations de la réunion</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Heure
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Lieu
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de réunion
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ORDINARY">Réunion ordinaire</option>
              <option value="EXTRAORDINARY">Réunion extraordinaire</option>
            </select>
          </div>

          {/* Feedback Deadline */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date limite pour les remontées (optionnel)
            </label>
            <input
              type="datetime-local"
              value={formData.feedbackDeadline}
              onChange={(e) => setFormData({ ...formData, feedbackDeadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Par défaut : 48h avant la réunion
            </p>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            <UsersIcon className="inline w-5 h-5 mr-2" />
            Participants ({formData.participantIds.length})
          </h3>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {users.map((user) => (
            <label
              key={user.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.participantIds.includes(user.id)}
                onChange={() => toggleParticipant(user.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600">
                  {user.cseRole || 'Membre'} - {user.email}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Agenda Items */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Ordre du jour</h3>
          <button
            type="button"
            onClick={addAgendaItem}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <Plus size={16} />
            Ajouter un point
          </button>
        </div>

        <div className="space-y-3">
          {formData.agendaItems.map((item, index) => (
            <div key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
              <span className="text-gray-600 font-medium mt-2">{index + 1}.</span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                  placeholder="Titre du point"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                    placeholder="Description (optionnel)"
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={item.duration || ''}
                    onChange={(e) => updateAgendaItem(index, 'duration', parseInt(e.target.value) || undefined)}
                    placeholder="Durée (min)"
                    className="w-24 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAgendaItem(index)}
                className="text-red-500 hover:text-red-700 p-1 mt-1"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{mode === 'edit' ? 'Mise à jour...' : 'Création...'}</span>
            </>
          ) : (
            <span>{mode === 'edit' ? 'Mettre à jour' : 'Créer la réunion'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
