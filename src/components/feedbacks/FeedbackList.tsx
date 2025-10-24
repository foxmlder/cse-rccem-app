'use client';

import { useState, useEffect } from 'react';
import { FeedbackCategory, FeedbackStatus, UserRole } from '@prisma/client';
import FeedbackCard from './FeedbackCard';
import { getCategoryLabel, getStatusLabel } from '@/lib/validators/feedback';
import { Filter, Loader2, AlertCircle } from 'lucide-react';

interface FeedbackListProps {
  initialFeedbacks: Array<{
    id: string;
    subject: string;
    description: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    response: string | null;
    submittedAt: Date;
    submittedBy: {
      id: string;
      name: string | null;
      email: string;
      cseRole: string | null;
    };
    meeting: {
      id: string;
      date: Date;
      time: string;
      type: string;
      location: string;
    };
  }>;
  meetings: Array<{
    id: string;
    date: Date;
    time: string;
    type: string;
    location: string;
  }>;
  currentUserId: string;
  currentUserRole: UserRole;
}

export default function FeedbackList({
  initialFeedbacks,
  meetings,
  currentUserId,
  currentUserRole,
}: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    meetingId: '',
    category: '',
    status: '',
  });

  const categories = [
    FeedbackCategory.WORKING_CONDITIONS,
    FeedbackCategory.WORK_ORGANIZATION,
    FeedbackCategory.HEALTH_SAFETY,
    FeedbackCategory.TRAINING,
    FeedbackCategory.WAGES_BENEFITS,
    FeedbackCategory.OTHER,
  ];

  const statuses = [
    FeedbackStatus.PENDING,
    FeedbackStatus.IN_PROGRESS,
    FeedbackStatus.ADDRESSED,
    FeedbackStatus.REJECTED,
  ];

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.meetingId) params.append('meetingId', filters.meetingId);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/feedbacks?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des remontées');
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    fetchFeedbacks();
  };

  const handleResetFilters = () => {
    setFilters({
      meetingId: '',
      category: '',
      status: '',
    });
  };

  useEffect(() => {
    // Auto-fetch when filters are reset
    if (!filters.meetingId && !filters.category && !filters.status) {
      fetchFeedbacks();
    }
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>

        <p className="text-sm text-gray-600">
          {feedbacks.length} remontée{feedbacks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Meeting Filter */}
            <div>
              <label htmlFor="meetingFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Réunion
              </label>
              <select
                id="meetingFilter"
                value={filters.meetingId}
                onChange={(e) => handleFilterChange('meetingId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les réunions</option>
                {meetings.map((meeting) => {
                  const meetingDate = new Date(meeting.date);
                  const dateStr = meetingDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  return (
                    <option key={meeting.id} value={meeting.id}>
                      {dateStr} - {meeting.type}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="categoryFilter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="statusFilter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Appliquer
            </button>
            <button
              onClick={handleResetFilters}
              disabled={loading}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Feedbacks List */}
      {!loading && feedbacks.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune remontée trouvée</h3>
          <p className="text-gray-600">
            {filters.meetingId || filters.category || filters.status
              ? 'Essayez de modifier les filtres'
              : 'Aucune remontée n\'a encore été soumise'}
          </p>
        </div>
      )}

      {!loading && feedbacks.length > 0 && (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onUpdate={fetchFeedbacks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
