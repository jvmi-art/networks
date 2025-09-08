/** @format */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/theme-provider';

interface ColorAnimationToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  visible?: boolean;
}

/**
 * Toggle button for random color animation in block mode
 * Provides visual feedback and smooth transitions
 */
const ColorAnimationToggle: React.FC<ColorAnimationToggleProps> = ({
  isEnabled,
  onToggle,
  visible = true
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  const getButtonStyles = () => {
    if (isEnabled) {
      return theme === 'light'
        ? 'bg-blue-500/90 text-white border border-blue-400'
        : 'bg-blue-600/90 text-white border border-blue-500';
    }
    return theme === 'light'
      ? 'bg-white/90 border border-gray-200 text-gray-700'
      : 'bg-black/90 border border-white/10 text-white/80';
  };

  return (
    <motion.button
      className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md ${getButtonStyles()} transition-colors shadow-lg`}
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title="Toggle random color animation"
      aria-label={`Color animation ${isEnabled ? 'enabled' : 'disabled'}`}
    >
      <span className="text-sm" role="img" aria-label="palette">
        🎨
      </span>
      <span className="text-xs font-medium">
        {isEnabled ? 'ON' : 'OFF'}
      </span>
    </motion.button>
  );
};

export default ColorAnimationToggle;