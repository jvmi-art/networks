/** @format */

import React, { useState, useCallback } from 'react';
import EditableGrid from './EditableGrid';
import ColorPicker from './ColorPicker';
import { useTheme } from '../theme/theme-provider';
import { Eye, Edit3, Download, Upload, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface EditModeProps {
  gridSize: number;
  initialGridColors?: string[][];
  onExitEditMode: (gridColors: string[][]) => void;
  onPreview: (gridColors: string[][]) => void;
}

const EditMode: React.FC<EditModeProps> = ({
  gridSize,
  initialGridColors,
  onExitEditMode,
  onPreview
}) => {
  const { theme } = useTheme();
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [currentGridColors, setCurrentGridColors] = useState<string[][]>(
    initialGridColors || []
  );

  const handleColorChange = useCallback((row: number, col: number, color: string) => {
    const newGrid = [...currentGridColors];
    if (!newGrid[row]) newGrid[row] = [];
    newGrid[row][col] = color;
    setCurrentGridColors(newGrid);
  }, [currentGridColors]);

  const handleExport = (colors: string[][]) => {
    setCurrentGridColors(colors);
    
    // Create a JSON representation of the grid
    const gridData = {
      gridSize,
      colors,
      timestamp: new Date().toISOString(),
    };
    
    // Convert to JSON and create download
    const dataStr = JSON.stringify(gridData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `grid-design-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.colors && Array.isArray(data.colors)) {
            setCurrentGridColors(data.colors);
          }
        } catch (error) {
          console.error('Error parsing imported file:', error);
          alert('Invalid file format. Please select a valid grid design file.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleCopyToClipboard = () => {
    const codeString = `const gridColors = ${JSON.stringify(currentGridColors, null, 2)};`;
    
    navigator.clipboard.writeText(codeString).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Semi-transparent backdrop */}
      <div className={`absolute inset-0 ${
        theme === 'light' ? 'bg-white/50' : 'bg-black/50'
      } backdrop-blur-sm`} />
      
      {/* Edit Controls Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-[51] px-6 py-4 backdrop-blur-md ${
          theme === 'light' 
            ? 'bg-white/90 border-b border-gray-200' 
            : 'bg-black/90 border-b border-white/10'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Edit3 className="w-6 h-6" />
            <h1 className={`text-xl font-bold ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>
              Grid Editor
            </h1>
          </motion.div>
          
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button variant="outline" onClick={handleImport}>
              <Upload className="w-4 h-4" />
              Import
            </Button>
            
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
            
            <Button onClick={() => onPreview(currentGridColors)}>
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            
            <Button variant="default" onClick={() => onExitEditMode(currentGridColors)}>
              <Download className="w-4 h-4" />
              Save & View
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Color Picker Floating Panel */}
      <motion.div
        className={`fixed left-6 top-24 z-[51] ${
          theme === 'light' ? 'bg-white/95' : 'bg-black/95'
        } backdrop-blur-md rounded-xl shadow-xl border ${
          theme === 'light' ? 'border-gray-200' : 'border-white/10'
        }`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
      >
        <ColorPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
      </motion.div>

      {/* Editable Grid Overlay */}
      <div className="fixed inset-0 flex justify-center items-center pointer-events-none">
        <motion.div
          className="pointer-events-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
        >
          <EditableGrid
            gridSize={gridSize}
            initialColors={currentGridColors}
            selectedColor={selectedColor}
            onColorChange={handleColorChange}
            onExport={handleExport}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EditMode;