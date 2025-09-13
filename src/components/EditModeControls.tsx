/** @format */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Brush, Save } from 'lucide-react';
import { useTheme } from '../theme/theme-provider';

interface EditModeControlsProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  isEditMode: boolean;
  onEditModeChange: (isEditMode: boolean) => void;
  onRandomize?: () => void;
  paletteColors?: string[];
}

// Default chromatic colors
const defaultColors = ['#FF0000', '#FF8C00', '#FFD700', '#00FF00', '#00CED1', '#0000FF', '#9400D3'];

// Export for use in other components if needed
export const colorPalettes = {
  vibrant: defaultColors
};

const EditModeControls: React.FC<EditModeControlsProps> = ({
  selectedColor,
  onColorSelect,
  isEditMode,
  onEditModeChange,
  onRandomize,
  paletteColors
}) => {
  const { theme } = useTheme();
  const colors = paletteColors || defaultColors;

  return (
    <div className="relative">
      {/* Edit/Save Button */}
      <motion.button
        className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md ${
          theme === 'light' 
            ? 'bg-white/90 border border-gray-200 shadow-lg hover:bg-white' 
            : 'bg-black/90 border border-white/10 shadow-lg hover:bg-black'
        } transition-colors ${isEditMode ? 'bg-green-500/20' : ''}`}
        onClick={() => onEditModeChange(!isEditMode)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isEditMode ? (
          <>
            <Save className="w-4 h-4" />
            <span className={`text-sm font-medium ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Save
            </span>
          </>
        ) : (
          <>
            <Brush className="w-4 h-4" />
            <span className={`text-sm font-medium ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Edit
            </span>
          </>
        )}
      </motion.button>

      {/* Color Picker Panel - appears below the button */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            className={`absolute top-full mt-2 right-0 flex items-center gap-2 p-3 rounded-2xl backdrop-blur-md ${
              theme === 'light' 
                ? 'bg-white/90 border border-gray-200 shadow-lg' 
                : 'bg-black/90 border border-white/10 shadow-lg'
            } max-w-[90vw] sm:max-w-none`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >

            {/* Color Circles */}
            <div className="flex items-center gap-1">
              {colors.map((color, index) => (
                <motion.button
                  key={`color-${index}`}
                  className={`rounded-full transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ' + (theme === 'light' ? 'ring-gray-400' : 'ring-white')
                      : ''
                  }`}
                  style={{
                    backgroundColor: color,
                    width: 28,
                    height: 28,
                  }}
                  onClick={() => onColorSelect(color)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>

            {/* Randomize Button */}
            {onRandomize && (
              <button
                className={`p-1.5 rounded-full ${
                  theme === 'light'
                    ? 'hover:bg-gray-100'
                    : 'hover:bg-white/10'
                } transition-colors`}
                onClick={onRandomize}
              >
                <Shuffle className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditModeControls;