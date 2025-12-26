import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dish, PhotoStyle, ImageSize } from './types';
import { parseMenuText, generateDishImage } from './services/geminiService';
import { DishCard } from './components/DishCard';
import { StyleSelector } from './components/StyleSelector';
import { Button, Spinner } from './components/UI';

const App: React.FC = () => {
  // State
  const [menuText, setMenuText] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [style, setStyle] = useState<PhotoStyle>(PhotoStyle.BRIGHT);
  const [size, setSize] = useState<ImageSize>('1K');
  const [isParsing, setIsParsing] = useState(false);
  const [keySelected, setKeySelected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for API Key Selection on Mount (Required for Gemini 3 Pro)
  useEffect(() => {
    const checkApiKey = async () => {
      // Use 'any' cast to avoid type conflicts with existing window.aistudio definitions
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        try {
          const hasKey = await aistudio.hasSelectedApiKey();
          setKeySelected(hasKey);
        } catch (e) {
          console.error("Error checking API key", e);
          setKeySelected(false);
        }
      } else {
        // Fallback for dev environments where window.aistudio might not be mocked
        // In a real deployed environment controlled by the prompt context, this exists.
        // We assume true if not present to not block UI development, 
        // but strictly per prompt we should use it if available.
        setKeySelected(true); 
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume success as per instructions
      setKeySelected(true);
    }
  };

  const handleParseMenu = async () => {
    if (!menuText.trim()) return;
    setIsParsing(true);
    setError(null);
    try {
      const result = await parseMenuText(menuText);
      const newDishes: Dish[] = result.dishes.map(d => ({
        id: uuidv4(),
        name: d.name,
        description: d.description,
        isGenerating: false,
        isEditing: false
      }));
      setDishes(newDishes);
    } catch (err) {
      console.error(err);
      setError("Failed to parse menu. Please try again or check your API key.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerateImage = async (id: string) => {
    const dishIndex = dishes.findIndex(d => d.id === id);
    if (dishIndex === -1) return;

    const dish = dishes[dishIndex];
    updateDish(id, { isGenerating: true });

    try {
      const imageUrl = await generateDishImage(dish.name, dish.description, style, size);
      updateDish(id, { imageUrl, isGenerating: false });
    } catch (err) {
      console.error(err);
      updateDish(id, { isGenerating: false });
      alert(`Failed to generate image for ${dish.name}. Try again.`);
    }
  };

  const handleGenerateAll = () => {
    dishes.forEach(dish => {
      if (!dish.imageUrl && !dish.isGenerating) {
        handleGenerateImage(dish.id);
      }
    });
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const reset = () => {
    setDishes([]);
    setMenuText('');
    setError(null);
  };

  // -------------------------------------------------------------------------
  // Render: API Key Wall
  // -------------------------------------------------------------------------
  if (!keySelected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a4.789 4.789 0 01-1.414 0l-2.586-2.586a4.789 4.789 0 010-1.414l.707-.707a4.789 4.789 0 010-1.414l.707-.707a4.789 4.789 0 010-1.414l1.414-1.414a1.828 1.828 0 000-2.586l-.707-.707a4.789 4.789 0 01-1.414 0L6 10.293a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414 0l-.707-.707a1 1 0 010-1.414l.707-.707a1 1 0 010-1.414l1.414-1.414a6 6 0 017.743 0z" /></svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">Access Required</h1>
          <p className="text-stone-600 mb-6">
            This application uses high-definition Generative AI models. Please select a paid API key to proceed.
          </p>
          <Button onClick={handleSelectKey} className="w-full justify-center">
            Select API Key
          </Button>
          <p className="mt-4 text-xs text-stone-400">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-primary">
              Learn about billing
            </a>
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Main App
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold font-serif">
               V
             </div>
             <h1 className="font-serif text-xl font-bold text-stone-900 tracking-tight">Virtual Food Photographer</h1>
          </div>
          {dishes.length > 0 && (
            <Button variant="outline" onClick={reset} className="text-sm">
              New Menu
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Step 1: Menu Input */}
        {dishes.length === 0 && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl font-bold text-stone-900 mb-4">Turn your menu into a visual feast.</h2>
              <p className="text-stone-600 text-lg">
                Paste your text-based menu below. Our AI will extract the dishes and generate professional photography for each item.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100">
              <textarea
                value={menuText}
                onChange={(e) => setMenuText(e.target.value)}
                placeholder="e.g. Classic Burger - Beef patty, lettuce, tomato, house sauce..."
                className="w-full h-48 p-4 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none mb-4 font-sans"
              />
              {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleParseMenu} 
                  disabled={!menuText.trim() || isParsing}
                  className="w-full sm:w-auto px-8 py-3 text-lg"
                >
                  {isParsing ? (
                    <>
                      <Spinner /> Analyzing Menu...
                    </>
                  ) : (
                    "Create Photos"
                  )}
                </Button>
              </div>
            </div>

            {/* Examples */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-60">
               <div className="aspect-square bg-stone-200 rounded-lg overflow-hidden relative">
                  <img src="https://picsum.photos/400/400?random=1" className="object-cover w-full h-full grayscale" alt="Example" />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black/30">Rustic</div>
               </div>
               <div className="aspect-square bg-stone-200 rounded-lg overflow-hidden relative">
                  <img src="https://picsum.photos/400/400?random=2" className="object-cover w-full h-full grayscale" alt="Example" />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black/30">Modern</div>
               </div>
               <div className="aspect-square bg-stone-200 rounded-lg overflow-hidden relative">
                  <img src="https://picsum.photos/400/400?random=3" className="object-cover w-full h-full grayscale" alt="Example" />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black/30">Social</div>
               </div>
            </div>
          </div>
        )}

        {/* Step 2: Generation Dashboard */}
        {dishes.length > 0 && (
          <div className="animate-in fade-in duration-500">
            
            <StyleSelector 
              currentStyle={style} 
              onStyleChange={setStyle} 
              currentSize={size}
              onSizeChange={setSize}
              disabled={dishes.some(d => d.isGenerating)}
            />

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-stone-800">
                Menu Items ({dishes.length})
              </h2>
              <div className="flex gap-3">
                 <Button onClick={handleGenerateAll} disabled={dishes.every(d => d.imageUrl || d.isGenerating)}>
                   Generate All Missing
                 </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dishes.map((dish) => (
                <div key={dish.id} className="h-full">
                  <DishCard 
                    dish={dish} 
                    onUpdateDish={updateDish} 
                    onRegenerate={handleGenerateImage}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;