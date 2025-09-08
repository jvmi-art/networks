/** @format */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/theme-provider';
import { Check, Palette, Plus, X } from 'lucide-react';
import { Button } from './ui/button';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  presetColors?: string[];
  allowCustomColors?: boolean;
}

const defaultPresetColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FFB6C1', // Pink
  '#87CEEB', // Sky Blue
  '#FFA500', // Orange
  '#9B59B6', // Purple
  '#1ABC9C', // Turquoise
  '#34495E', // Dark Gray
  '#000000', // Black
  '#FFFFFF', // White
  '#E0E0E0', // Light Gray
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  presetColors = defaultPresetColors,
  allowCustomColors = true
}) => {
  const { theme } = useTheme();
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('#');

  const handleAddCustomColor = () => {
    if (customColorInput.match(/^#[0-9A-F]{6}$/i)) {
      setCustomColors([...customColors, customColorInput]);
      setCustomColorInput('#');
      setShowCustomInput(false);
      onColorSelect(customColorInput);
    }
  };

  const handleRemoveCustomColor = (colorToRemove: string) => {
    setCustomColors(customColors.filter(color => color !== colorToRemove));
  };

  const allColors = [...presetColors, ...customColors];

  return (
    <div className={`p-4 rounded-2xl ${
      theme === 'light' 
        ? 'bg-white border border-gray-200 shadow-sm' 
        : 'bg-black/50 border border-white/10'
    } backdrop-blur-sm`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5" />
        <h3 className={`font-semibold ${
          theme === 'light' ? 'text-gray-800' : 'text-white'
        }`}>
          Color Palette
        </h3>
      </div>

      {/* Selected Color Display */}
      <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
        theme === 'light' ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'
      }`}>
        <div
          className="w-12 h-12 rounded-lg border-2"
          style={{
            backgroundColor: selectedColor,
            borderColor: theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.2)'
          }}
        />
        <div>
          <p className={`text-sm ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Selected Color
          </p>
          <p className={`font-mono font-medium ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>
            {selectedColor}
          </p>
        </div>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {allColors.map((color) => (
          <motion.button
            key={color}
            className={`relative w-12 h-12 rounded-lg border-2 transition-all ${
              selectedColor === color 
                ? 'ring-2 ring-offset-2' 
                : ''
            }`}
            style={{
              backgroundColor: color,
              borderColor: selectedColor === color 
                ? '#3b82f6' 
                : theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.2)'
            }}
            onClick={() => onColorSelect(color)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={color}
          >
            {selectedColor === color && (
              <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
            )}
            {customColors.includes(color) && (
              <button
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCustomColor(color);
                }}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </motion.button>
        ))}
        
        {/* Add Custom Color Button */}
        {allowCustomColors && !showCustomInput && (
          <motion.button
            className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center ${
              theme === 'light' 
                ? 'border-gray-400 hover:border-gray-600 text-gray-600' 
                : 'border-gray-600 hover:border-gray-400 text-gray-400'
            }`}
            onClick={() => setShowCustomInput(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Add custom color"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Custom Color Input */}
      {showCustomInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex gap-2 p-3 rounded-lg ${
            theme === 'light' ? 'bg-gray-100' : 'bg-white/5'
          }`}
        >
          <input
            type="text"
            value={customColorInput}
            onChange={(e) => setCustomColorInput(e.target.value.toUpperCase())}
            placeholder="#FF0000"
            className={`flex-1 px-3 py-1 rounded border font-mono text-sm ${
              theme === 'light'
                ? 'bg-white border-gray-300 text-gray-800'
                : 'bg-black/50 border-white/20 text-white'
            }`}
            maxLength={7}
          />
          <Button size="sm" onClick={handleAddCustomColor}>
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowCustomInput(false);
              setCustomColorInput('#');
            }}
          >
            Cancel
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ColorPicker;