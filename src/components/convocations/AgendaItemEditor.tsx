'use client';

import { useState } from 'react';
import { Plus, X, GripVertical, Clock } from 'lucide-react';

interface AgendaItem {
  id?: string;
  title: string;
  description?: string;
  duration?: number;
  order: number;
}

interface AgendaItemEditorProps {
  items: AgendaItem[];
  onChange: (items: AgendaItem[]) => void;
  disabled?: boolean;
}

export default function AgendaItemEditor({
  items,
  onChange,
  disabled = false,
}: AgendaItemEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: AgendaItem = {
      title: '',
      order: items.length + 1,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof AgendaItem, value: any) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, order: i + 1 }));
    onChange(updatedItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);

    // Update order numbers
    const reorderedItems = updatedItems.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    onChange(reorderedItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    moveItem(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Ordre du jour ({items.length})
        </h3>
        <button
          type="button"
          onClick={addItem}
          disabled={disabled}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Ajouter un point
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p>Aucun point à l'ordre du jour</p>
          <button
            type="button"
            onClick={addItem}
            disabled={disabled}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ajouter le premier point
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white border border-gray-200 rounded-lg p-4 transition-shadow ${
                !disabled ? 'cursor-move hover:shadow-md' : ''
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                {!disabled && (
                  <div className="pt-2">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                {/* Order Number */}
                <div className="flex-shrink-0 w-8 pt-2">
                  <span className="text-lg font-bold text-blue-600">
                    {item.order}.
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Title */}
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder="Titre du point"
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                  />

                  {/* Description */}
                  <textarea
                    value={item.description || ''}
                    onChange={(e) =>
                      updateItem(index, 'description', e.target.value || undefined)
                    }
                    placeholder="Description (optionnel)"
                    disabled={disabled}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />

                  {/* Duration */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={item.duration || ''}
                      onChange={(e) =>
                        updateItem(
                          index,
                          'duration',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="Durée"
                      disabled={disabled}
                      min="1"
                      className="w-24 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                  </div>
                </div>

                {/* Delete Button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition"
                    title="Supprimer"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <strong>💡 Astuce :</strong> Glissez-déposez les points pour les réorganiser
        </div>
      )}
    </div>
  );
}
