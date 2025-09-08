/** @format */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import EditableCircle from './EditableCircle';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/theme-provider';
import { Button } from './ui/button';

interface EditableGridProps {
  gridSize: number;
  initialColors?: string[][];
  onColorChange?: (row: number, col: number, color: string) => void;
  selectedColor: string;
  onExport?: (colors: string[][]) => void;
}

const EditableGrid: React.FC<EditableGridProps> = ({
  gridSize,
  initialColors,
  onColorChange,
  selectedColor,
  onExport
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const paintedCellsRef = useRef<Set<string>>(new Set());
  
  // Initialize grid colors
  const [gridColors, setGridColors] = useState<string[][]>(() => {
    if (initialColors) {
      return initialColors;
    }
    // Create default grid with white circles
    const defaultGrid: string[][] = [];
    for (let i = 0; i < gridSize; i++) {
      const row: string[] = [];
      for (let j = 0; j < gridSize; j++) {
        row.push('#ffffff');
      }
      defaultGrid.push(row);
    }
    return defaultGrid;
  });

  const paintCircle = useCallback((row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    
    // If we're dragging, check if we've already painted this cell in this drag session
    if (isDragging && paintedCellsRef.current.has(cellKey)) {
      return;
    }
    
    // Update the color of the circle
    const newGridColors = [...gridColors];
    if (!newGridColors[row]) newGridColors[row] = [];
    newGridColors[row][col] = selectedColor;
    setGridColors(newGridColors);
    
    // Mark this cell as painted in this drag session
    if (isDragging) {
      paintedCellsRef.current.add(cellKey);
    }
    
    // Notify parent component
    if (onColorChange) {
      onColorChange(row, col, selectedColor);
    }
  }, [gridColors, selectedColor, onColorChange, isDragging]);

  const handleMouseDown = useCallback((row: number, col: number) => {
    setIsDragging(true);
    paintedCellsRef.current.clear();
    paintCircle(row, col);
  }, [paintCircle]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    setHoveredCell({ row, col });
    if (isDragging) {
      paintCircle(row, col);
    }
  }, [isDragging, paintCircle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    paintedCellsRef.current.clear();
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  // Add global mouse up listener to handle mouse up outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      paintedCellsRef.current.clear();
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleExport = () => {
    if (onExport) {
      onExport(gridColors);
    }
  };

  const handleClearGrid = () => {
    const clearedGrid: string[][] = [];
    for (let i = 0; i < gridSize; i++) {
      const row: string[] = [];
      for (let j = 0; j < gridSize; j++) {
        row.push('#ffffff');
      }
      clearedGrid.push(row);
    }
    setGridColors(clearedGrid);
    setHoveredCell(null);
  };

  // Calculate grid layout
  const maxGridWidth = 500; // Maximum width for the grid
  const gap = 8; // Gap between circles in pixels
  const totalGaps = (gridSize - 1) * gap;
  const availableSpace = maxGridWidth - totalGaps;
  const circleSize = Math.min(60, Math.floor(availableSpace / gridSize));

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Grid Container */}
      <motion.div
        className={`p-6 rounded-2xl select-none ${
          theme === 'light' 
            ? 'bg-white/95 border border-gray-200 shadow-lg' 
            : 'bg-black/95 border border-white/10 shadow-lg'
        } backdrop-blur-md`}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${circleSize}px)`,
            gap: `${gap}px`,
            cursor: isDragging ? 'pointer' : 'auto'
          }}
        >
          {gridColors.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <EditableCircle
                key={`${rowIndex}-${colIndex}`}
                color={color}
                size={circleSize}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                isHovered={
                  hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex
                }
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleClearGrid}>
          Clear Grid
        </Button>
        
        <Button onClick={handleExport}>
          Export Design
        </Button>
      </div>
    </div>
  );
};

export default EditableGrid;