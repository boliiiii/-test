import React, { useState } from 'react';
import { Dish } from '../types';
import { Button, Spinner } from './UI';
import { editDishImage } from '../services/geminiService';

interface DishCardProps {
  dish: Dish;
  onUpdateDish: (id: string, updates: Partial<Dish>) => void;
  onRegenerate: (id: string) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onUpdateDish, onRegenerate }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditInput, setShowEditInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!dish.imageUrl || !editPrompt.trim()) return;

    onUpdateDish(dish.id, { isEditing: true });
    setError(null);
    try {
      const newImageUrl = await editDishImage(dish.imageUrl, editPrompt);
      onUpdateDish(dish.id, { imageUrl: newImageUrl, isEditing: false });
      setEditPrompt('');
      setShowEditInput(false);
    } catch (err) {
      console.error(err);
      setError("Failed to edit image. Please try again.");
      onUpdateDish(dish.id, { isEditing: false });
    }
  };

  const handleDownload = () => {
    if (!dish.imageUrl) return;
    const link = document.createElement('a');
    link.href = dish.imageUrl;
    link.download = `${dish.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-stone-100 flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
      <div className="relative aspect-[4/3] bg-stone-100 group">
        {dish.imageUrl ? (
          <>
            <img 
              src={dish.imageUrl} 
              alt={dish.name} 
              className={`w-full h-full object-cover transition-opacity duration-500 ${dish.isEditing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
            />
            {/* Overlay Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button 
                onClick={handleDownload}
                className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-stone-700"
                title="Download"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
            {dish.isGenerating ? (
              <>
                <Spinner size="md" />
                <span className="mt-2 text-sm font-medium animate-pulse">Creating masterpiece...</span>
              </>
            ) : (
              <span className="text-sm">Ready to generate</span>
            )}
          </div>
        )}
        
        {dish.isEditing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Spinner size="sm" />
              <span>Editing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-serif text-lg font-bold text-stone-800 leading-tight mb-1">{dish.name}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-grow">{dish.description}</p>
        
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

        <div className="space-y-3 mt-auto">
          {dish.imageUrl && showEditInput ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="flex gap-2 mb-2">
                 <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g., Add steam, remove parsley..."
                  className="flex-grow text-sm border border-stone-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setShowEditInput(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
                >
                  Cancel
                </button>
                <Button onClick={handleEdit} disabled={!editPrompt.trim() || dish.isEditing} size="sm" className="text-xs py-1 px-3">
                  Apply Edit
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {!dish.imageUrl ? (
                <Button onClick={() => onRegenerate(dish.id)} disabled={dish.isGenerating} className="w-full">
                   Generate Photo
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowEditInput(true)} className="flex-1 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => onRegenerate(dish.id)} className="flex-1 text-sm" title="Regenerate">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Redo
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
