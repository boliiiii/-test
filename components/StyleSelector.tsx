import React from 'react';
import { PhotoStyle, ImageSize } from '../types';

interface StyleSelectorProps {
  currentStyle: PhotoStyle;
  currentSize: ImageSize;
  onStyleChange: (style: PhotoStyle) => void;
  onSizeChange: (size: ImageSize) => void;
  disabled: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  currentStyle, 
  currentSize, 
  onStyleChange, 
  onSizeChange,
  disabled 
}) => {
  const styles = [
    { 
      id: PhotoStyle.BRIGHT, 
      label: 'Bright & Modern', 
      desc: 'High-key, clean, sharp focus',
      color: 'bg-white border-stone-200' 
    },
    { 
      id: PhotoStyle.RUSTIC, 
      label: 'Rustic & Dark', 
      desc: 'Moody, textured, warm tones',
      color: 'bg-stone-800 text-white border-stone-700' 
    },
    { 
      id: PhotoStyle.SOCIAL, 
      label: 'Social Media', 
      desc: 'Top-down, trendy, vibrant',
      color: 'bg-gradient-to-br from-purple-500 to-orange-400 text-white' 
    },
  ];

  const sizes: ImageSize[] = ['1K', '2K', '4K'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8">
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        
        {/* Style Selection */}
        <div className="flex-grow">
          <label className="block text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Aesthetic Style
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => onStyleChange(s.id)}
                disabled={disabled}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${currentStyle === s.id 
                    ? 'border-primary ring-1 ring-primary transform scale-[1.02] shadow-md' 
                    : 'border-transparent hover:border-stone-200 opacity-80 hover:opacity-100 grayscale hover:grayscale-0'
                  }
                  ${s.id === PhotoStyle.RUSTIC && currentStyle !== s.id ? 'bg-stone-800 text-white' : ''}
                  ${s.id === PhotoStyle.BRIGHT && currentStyle !== s.id ? 'bg-stone-50 text-stone-800' : ''}
                  ${s.id === PhotoStyle.SOCIAL && currentStyle !== s.id ? 'bg-stone-100 text-stone-800' : ''}
                  ${currentStyle === s.id ? 'opacity-100 grayscale-0' : ''}
                `}
              >
                <div className="font-serif font-bold text-lg mb-1">{s.label}</div>
                <div className={`text-xs ${s.id === PhotoStyle.RUSTIC || s.id === PhotoStyle.SOCIAL ? 'text-white/80' : 'text-stone-500'}`}>
                  {s.desc}
                </div>
                {currentStyle === s.id && (
                  <div className="absolute top-2 right-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="md:min-w-[200px]">
          <label className="block text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Resolution
          </label>
          <div className="flex rounded-lg bg-stone-100 p-1 border border-stone-200">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                disabled={disabled}
                className={`
                  flex-1 py-2 text-sm font-medium rounded-md transition-all
                  ${currentSize === size 
                    ? 'bg-white text-stone-900 shadow-sm' 
                    : 'text-stone-500 hover:text-stone-700'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-2 text-center">
            Higher resolution takes longer to generate.
          </p>
        </div>

      </div>
    </div>
  );
};
