'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FeedbackCategory } from '@prisma/client';
import { getCategoryLabel } from '@/lib/validators/feedback';
import { formatDate, formatTime } from '@/lib/utils';
import { AlertCircle, Loader2, Save, Calendar, Clock, MapPin } from 'lucide-react';

interface FeedbackEditFormProps {
  feedback: {
    id: string;
    subject: string;
    description: string;
    category: FeedbackCategory;
    meetingId: string;
  };
  meeting: {
    id: string;
    date: Date;
    time: string;
    type: string;
    location: string;
  };
}

export default function FeedbackEditForm({ feedback, meeting }: FeedbackEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: feedback.subject,
    description: feedback.description,
    category: feedback.category,
  });

  const categories = [
    FeedbackCategory.WORKING_CONDITIONS,
    FeedbackCategory.WORK_ORGANIZATION,
    FeedbackCategory.HEALTH_SAFETY,
    FeedbackCategory.TRAINING,
    FeedbackCategory.WAGES_BENEFITS,
    FeedbackCategory.OTHER,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.subject || !formData.description || !formData.category) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/feedbacks/${feedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      router.push('/remontees');
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

      {/* Meeting Info (Read-only) */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Réunion concernée</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(meeting.date)}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{formatTime(meeting.time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{meeting.location}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Type :</span> {meeting.type}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as FeedbackCategory })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={loading}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Sujet *
        </label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Conditions de température dans l'atelier"
          required
          minLength={3}
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">Minimum 3 caractères</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description détaillée *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Décrivez en détail votre remontée..."
          required
          minLength={10}
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">Minimum 10 caractères</p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </form>
  );
}
