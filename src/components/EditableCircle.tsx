/** @format */

import React from 'react';
import { useTheme } from '../theme/theme-provider';

interface EditableCircleProps {
  color: string;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  size?: number;
  isHovered?: boolean;
}

const EditableCircle: React.FC<EditableCircleProps> = ({
  color,
  onMouseDown,
  onMouseEnter,
  size = 40,
  isHovered = false
}) => {
  const { theme } = useTheme();
  
  const borderColor = theme === 'light' 
    ? 'rgba(0, 0, 0, 0.15)' 
    : 'rgba(255, 255, 255, 0.15)';

  return (
    <div
      className={`relative rounded-full cursor-pointer select-none ${
        theme === 'light' 
          ? 'shadow-sm' 
          : ''
      }`}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        border: `2px solid ${borderColor}`,
        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
        boxShadow: isHovered 
          ? theme === 'light' 
            ? '0 4px 12px rgba(0,0,0,0.15)' 
            : '0 4px 12px rgba(255,255,255,0.1)'
          : theme === 'light'
            ? '0 1px 3px rgba(0,0,0,0.1)'
            : 'none'
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      role="button"
      tabIndex={0}
      aria-label={`Paint with color ${color}`}
    />
  );
};

export default EditableCircle;