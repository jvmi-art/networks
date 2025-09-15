/** @format */

import React from 'react';
import { useFragments } from '../contexts/FragmentContext';
import { useTheme } from '../theme/theme-provider';
import { RiDeleteBinLine } from '@remixicon/react';

interface FragmentLibraryProps {
  onFragmentSelect?: (fragmentId: string) => void;
}

const FragmentLibrary: React.FC<FragmentLibraryProps> = ({ onFragmentSelect }) => {
  const { fragments, selectedFragmentId, selectFragment, deleteFragment } = useFragments();
  const { theme } = useTheme();

  const handleFragmentClick = (fragmentId: string) => {
    selectFragment(fragmentId);
    if (onFragmentSelect) {
      onFragmentSelect(fragmentId);
    }
  };

  const handleDeleteFragment = (e: React.MouseEvent, fragmentId: string) => {
    e.stopPropagation();
    if (confirm('Delete this fragment?')) {
      deleteFragment(fragmentId);
    }
  };

  // Render a mini 5x5 grid preview
  const renderFragmentPreview = (colors: string[][]) => {
    return (
      <div className="grid grid-cols-5 gap-0.5 w-12 h-12">
        {colors.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 max-w-4xl mx-auto p-4 rounded-xl backdrop-blur-xl ${
        theme === 'light'
          ? 'bg-white/90 border border-black/10'
          : 'bg-black/90 border border-white/10'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className={`text-sm font-medium ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>
          Fragment Library
        </h3>
        <span className={`text-xs ${
          theme === 'light' ? 'text-black/60' : 'text-white/60'
        }`}>
          Click to select • Place on cube faces
        </span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2">
        {fragments.map((fragment) => (
          <div
            key={fragment.id}
            onClick={() => handleFragmentClick(fragment.id)}
            className={`relative flex-shrink-0 p-3 rounded-lg cursor-pointer transition-all ${
              selectedFragmentId === fragment.id
                ? theme === 'light'
                  ? 'bg-black/10 ring-2 ring-black/20'
                  : 'bg-white/10 ring-2 ring-white/20'
                : theme === 'light'
                ? 'bg-black/5 hover:bg-black/10'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {/* Delete button */}
            {!fragment.id.startsWith('default-') && (
              <button
                onClick={(e) => handleDeleteFragment(e, fragment.id)}
                className={`absolute -top-1 -right-1 p-1 rounded-full transition-colors ${
                  theme === 'light'
                    ? 'bg-white hover:bg-red-50 text-red-600'
                    : 'bg-black hover:bg-red-950 text-red-400'
                }`}
              >
                <RiDeleteBinLine size={12} />
              </button>
            )}
            
            {/* Fragment preview */}
            {renderFragmentPreview(fragment.colors)}
            
            {/* Fragment name */}
            <p className={`mt-2 text-xs text-center truncate max-w-[48px] ${
              theme === 'light' ? 'text-black/70' : 'text-white/70'
            }`}>
              {fragment.name}
            </p>
          </div>
        ))}
        
        {fragments.length === 0 && (
          <p className={`text-sm ${
            theme === 'light' ? 'text-black/50' : 'text-white/50'
          }`}>
            No fragments yet. Create one in 5×5 node mode!
          </p>
        )}
      </div>
    </div>
  );
};

export default FragmentLibrary;