/** @format */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Brush, Save, Palette } from 'lucide-react';
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
  const [customColor, setCustomColor] = useState(selectedColor);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentColors');
    return saved ? JSON.parse(saved) : [];
  });

  // Update custom color when selected color changes externally
  useEffect(() => {
    setCustomColor(selectedColor);
  }, [selectedColor]);

  // Save a color to recent colors
  const saveToRecentColors = (color: string) => {
    if (!colors.includes(color)) {
      const newRecent = [color, ...recentColors.filter(c => c !== color)].slice(0, 5);
      setRecentColors(newRecent);
      localStorage.setItem('recentColors', JSON.stringify(newRecent));
    }
  };

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

            {/* Divider */}
            <div className={`w-px h-6 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`} />

            {/* Color Picker Button */}
            <div className="relative">
              <motion.button
                className={`relative rounded-full transition-all overflow-hidden ${
                  showColorPicker || (!colors.includes(selectedColor) && selectedColor === customColor)
                    ? 'ring-2 ring-offset-2 ' + (theme === 'light' ? 'ring-gray-400' : 'ring-white')
                    : ''
                }`}
                style={{
                  background: !colors.includes(selectedColor) 
                    ? selectedColor 
                    : `conic-gradient(from 0deg, #ff0000, #ff8c00, #ffd700, #00ff00, #00ced1, #0000ff, #9400d3, #ff0000)`,
                  width: 28,
                  height: 28,
                }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                title="Custom color picker"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {!colors.includes(selectedColor) ? (
                    <div className="w-full h-full rounded-full" />
                  ) : (
                    <Palette className="w-3 h-3 text-white drop-shadow-md" />
                  )}
                </div>
              </motion.button>

              {/* Color Picker Popup */}
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    className={`absolute top-full mt-2 right-0 p-3 rounded-xl backdrop-blur-md ${
                      theme === 'light' 
                        ? 'bg-white/95 border border-gray-200 shadow-lg' 
                        : 'bg-black/95 border border-white/10 shadow-lg'
                    } z-50`}
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className={`text-xs font-medium ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          Custom Color
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setCustomColor(newColor);
                              onColorSelect(newColor);
                              saveToRecentColors(newColor);
                            }}
                            className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={customColor}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                                setCustomColor(newColor);
                                onColorSelect(newColor);
                                saveToRecentColors(newColor);
                              } else {
                                setCustomColor(newColor);
                              }
                            }}
                            placeholder="#000000"
                            className={`px-2 py-1 text-xs rounded w-20 ${
                              theme === 'light'
                                ? 'bg-gray-100 text-gray-700 border border-gray-200'
                                : 'bg-white/10 text-gray-300 border border-white/10'
                            }`}
                          />
                        </div>
                        <div className="mt-2">
                          <div 
                            className="w-full h-8 rounded"
                            style={{ backgroundColor: customColor }}
                          />
                        </div>
                      </div>
                      
                      {/* Recent Colors */}
                      {recentColors.length > 0 && (
                        <div>
                          <label className={`text-xs font-medium ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            Recent
                          </label>
                          <div className="flex gap-1 mt-1">
                            {recentColors.map((color, index) => (
                              <motion.button
                                key={`recent-${index}`}
                                className={`rounded transition-all ${
                                  selectedColor === color
                                    ? 'ring-2 ring-offset-1 ' + (theme === 'light' ? 'ring-gray-400' : 'ring-white')
                                    : ''
                                }`}
                                style={{
                                  backgroundColor: color,
                                  width: 24,
                                  height: 24,
                                }}
                                onClick={() => {
                                  setCustomColor(color);
                                  onColorSelect(color);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
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