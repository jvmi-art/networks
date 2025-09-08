/** @format */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shuffle, Brush, Save } from 'lucide-react';
import { useTheme } from '../theme/theme-provider';

interface EditModeControlsProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  isEditMode: boolean;
  onEditModeChange: (isEditMode: boolean) => void;
  onRandomize?: () => void;
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
  onRandomize
}) => {
  const { theme } = useTheme();
  const [colors, setColors] = React.useState<string[]>(defaultColors);
  const [showColorInput, setShowColorInput] = React.useState(false);
  const [newColorInput, setNewColorInput] = React.useState('');

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

            {/* Add Custom Color */}
            <div className="relative">
              <button
                className={`p-1.5 rounded-full ${
                  theme === 'light'
                    ? 'hover:bg-gray-100'
                    : 'hover:bg-white/10'
                } transition-colors`}
                onClick={() => setShowColorInput(!showColorInput)}
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Color Input Dropdown */}
              <AnimatePresence>
                {showColorInput && (
                  <motion.div
                    className={`absolute top-full mt-2 right-0 rounded-lg p-3 ${
                      theme === 'light'
                        ? 'bg-white border border-gray-200 shadow-lg'
                        : 'bg-black border border-white/10 shadow-lg'
                    } backdrop-blur-md z-50 min-w-[200px]`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColorInput}
                        onChange={(e) => setNewColorInput(e.target.value)}
                        placeholder="#FF0000"
                        className={`flex-1 px-2 py-1 text-sm rounded border ${
                          theme === 'light'
                            ? 'bg-white border-gray-300 text-gray-900'
                            : 'bg-gray-800 border-gray-600 text-white'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const color = newColorInput.startsWith('#') ? newColorInput : `#${newColorInput}`;
                            if (/^#[0-9A-F]{6}$/i.test(color)) {
                              setColors(prev => [...prev, color]);
                              setNewColorInput('');
                              setShowColorInput(false);
                              onColorSelect(color);
                            }
                          }
                        }}
                      />
                      <button
                        className={`px-2 py-1 text-xs rounded ${
                          theme === 'light'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } transition-colors`}
                        onClick={() => {
                          const color = newColorInput.startsWith('#') ? newColorInput : `#${newColorInput}`;
                          if (/^#[0-9A-F]{6}$/i.test(color)) {
                            setColors(prev => [...prev, color]);
                            setNewColorInput('');
                            setShowColorInput(false);
                            onColorSelect(color);
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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