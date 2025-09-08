/** @format */

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useCanvasSettings } from '../contexts/CanvasSettingsContext';
import { NODE_DIMENSIONS, CUBE_DIMENSIONS } from '../constants';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/theme-provider';

type DimensionKey = keyof typeof NODE_DIMENSIONS;
type CubeDimensionKey = keyof typeof CUBE_DIMENSIONS;

interface DimensionTabsProps {
  mode?: 'node' | 'block';
}

const DimensionTabs: React.FC<DimensionTabsProps> = ({ mode = 'node' }) => {
  const { settings, updateSettings } = useCanvasSettings();
  const { theme } = useTheme();

  // Determine current dimension based on settings and mode
  const getCurrentDimension = (): DimensionKey | CubeDimensionKey => {
    const width = settings.gridWidth || settings.gridSize;
    const height = settings.gridHeight || settings.gridSize;
    
    const dimensions = mode === 'block' ? CUBE_DIMENSIONS : NODE_DIMENSIONS;
    
    // Find matching dimension configuration
    for (const [key, config] of Object.entries(dimensions)) {
      if (config.gridWidth === width && config.gridHeight === height) {
        return key as DimensionKey | CubeDimensionKey;
      }
    }
    return '5x5'; // Default
  };

  const currentDimension = getCurrentDimension();

  const handleDimensionChange = (dimension: string) => {
    const dimensions = mode === 'block' ? CUBE_DIMENSIONS : NODE_DIMENSIONS;
    const config = dimensions[dimension as DimensionKey | CubeDimensionKey];
    if (config) {
      // Calculate appropriate padding based on grid dimensions
      const minDimension = Math.min(config.gridWidth, config.gridHeight);
      const padding = config.padding || (minDimension <= 5 ? 100 : 60);
      
      updateSettings({
        gridWidth: config.gridWidth,
        gridHeight: config.gridHeight,
        gridSize: Math.max(config.gridWidth, config.gridHeight), // For backward compatibility
        canvasWidth: config.canvasWidth,
        canvasHeight: config.canvasHeight,
        canvasSize: Math.max(config.canvasWidth, config.canvasHeight), // For backward compatibility
        padding: padding
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Tabs value={currentDimension} onValueChange={handleDimensionChange}>
        <TabsList
          className={`backdrop-blur-md ${
            theme === 'light'
              ? 'bg-white/90 border border-gray-200'
              : 'bg-black/90 border border-white/10'
          }`}
        >
          {mode === 'block' ? (
            // Cube dimensions for 3D mode (only square grids)
            <>
              <TabsTrigger value="5x5" className="data-[state=active]:bg-primary/10">
                5×5
              </TabsTrigger>
              <TabsTrigger value="10x10" className="data-[state=active]:bg-primary/10">
                10×10
              </TabsTrigger>
              <TabsTrigger value="15x15" className="data-[state=active]:bg-primary/10">
                15×15
              </TabsTrigger>
              <TabsTrigger value="20x20" className="data-[state=active]:bg-primary/10">
                20×20
              </TabsTrigger>
              <TabsTrigger value="25x25" className="data-[state=active]:bg-primary/10">
                25×25
              </TabsTrigger>
            </>
          ) : (
            // Node dimensions for 2D mode - includes rectangular options
            <>
              <TabsTrigger value="5x5" className="data-[state=active]:bg-primary/10">
                5×5
              </TabsTrigger>
              <TabsTrigger value="5x10" className="data-[state=active]:bg-primary/10">
                5×10
              </TabsTrigger>
              <TabsTrigger value="10x5" className="data-[state=active]:bg-primary/10">
                10×5
              </TabsTrigger>
              <TabsTrigger value="10x10" className="data-[state=active]:bg-primary/10">
                10×10
              </TabsTrigger>
              <TabsTrigger value="25x25" className="data-[state=active]:bg-primary/10">
                25×25
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </Tabs>
    </motion.div>
  );
};

export default DimensionTabs;