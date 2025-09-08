/** @format */

export const generateColorGrid = (
  palette: string[] | string,
  gridSize: number,
  gridWidth?: number,
  gridHeight?: number
) => {
  const width = gridWidth || gridSize;
  const height = gridHeight || gridSize;
  const grid: string[][] = [];

  // Check if palette is 'RANDOM_GENERATOR' for truly random colors
  if (palette === 'RANDOM_GENERATOR') {
    for (let i = 0; i < height; i++) {
      const row: string[] = [];
      for (let j = 0; j < width; j++) {
        // Generate a completely random color for each cell
        const randomColor =
          '#' +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0');
        row.push(randomColor);
      }
      grid.push(row);
    }
  } else if (Array.isArray(palette)) {
    for (let i = 0; i < height; i++) {
      const row: string[] = [];
      for (let j = 0; j < width; j++) {
        const randomIndex = Math.floor(Math.random() * palette.length);
        row.push(palette[randomIndex]);
      }
      grid.push(row);
    }
  }

  return grid as string[][];
};

// Dimension configurations for node mode
export const NODE_DIMENSIONS = {
  '5x5': { gridWidth: 5, gridHeight: 5, canvasWidth: 600, canvasHeight: 600, padding: 150 },
  '5x10': { gridWidth: 5, gridHeight: 10, canvasWidth: 400, canvasHeight: 600, padding: 150 },
  '10x5': { gridWidth: 10, gridHeight: 5, canvasWidth: 600, canvasHeight: 400, padding: 150 },
  '10x10': { gridWidth: 10, gridHeight: 10, canvasWidth: 600, canvasHeight: 600, padding: 100 },
  '15x15': { gridWidth: 15, gridHeight: 15, canvasWidth: 600, canvasHeight: 600, padding: 75 },
  '20x20': { gridWidth: 20, gridHeight: 20, canvasWidth: 600, canvasHeight: 600, padding: 60 },
  '25x25': { gridWidth: 25, gridHeight: 25, canvasWidth: 600, canvasHeight: 600, padding: 50 }
};

// Dimension configurations for 3D block mode (only square grids for 3D cube)
export const CUBE_DIMENSIONS = {
  '5x5': { gridWidth: 5, gridHeight: 5, canvasWidth: 600, canvasHeight: 600, padding: 150 },
  '5x10': { gridWidth: 5, gridHeight: 10, canvasWidth: 600, canvasHeight: 600, padding: 150 }, // Not used in 3D, added for type compatibility
  '10x5': { gridWidth: 10, gridHeight: 5, canvasWidth: 600, canvasHeight: 600, padding: 150 }, // Not used in 3D, added for type compatibility
  '10x10': { gridWidth: 10, gridHeight: 10, canvasWidth: 600, canvasHeight: 600, padding: 100 },
  '15x15': { gridWidth: 15, gridHeight: 15, canvasWidth: 600, canvasHeight: 600, padding: 75 },
  '20x20': { gridWidth: 20, gridHeight: 20, canvasWidth: 600, canvasHeight: 600, padding: 60 },
  '25x25': { gridWidth: 25, gridHeight: 25, canvasWidth: 600, canvasHeight: 600, padding: 50 }
};

// Predefined configurations for tab modes
export const NODE_MODE_CONFIG = {
  gridSize: 5, // Deprecated: kept for backward compatibility
  gridWidth: 5,
  gridHeight: 5,
  fadeDuration: 2000,
  padding: 150,
  gapFactor: 1,
  canvasSize: 600, // Deprecated: kept for backward compatibility
  canvasWidth: 600,
  canvasHeight: 600,
  backgroundColor: 10,
  colorPalette: ['#90EE90', '#32CD32', '#228B22', '#006400', '#8FBC8F', '#9ACD32', '#ADFF2F'],
  strokeWidth: 0,
  renderMode: 'circle' as const,
  hoverScale: 1.8,
  magneticEffect: false,
  animationsEnabled: false,
  lightModeGlowFactor: 1.1,
  darkModeGlowFactor: 1.2,
  fillPercentage: 100 // Default to all circles enabled
};

export const BLOCK_MODE_CONFIG = {
  gridSize: 25, // Deprecated: kept for backward compatibility
  gridWidth: 25,
  gridHeight: 25,
  fadeDuration: 2000,
  padding: 50,
  gapFactor: 1,
  canvasSize: 600, // Deprecated: kept for backward compatibility
  canvasWidth: 600,
  canvasHeight: 600,
  backgroundColor: 1,
  colorPalette: ['#90EE90', '#32CD32', '#228B22', '#006400', '#8FBC8F', '#9ACD32', '#ADFF2F'],
  strokeWidth: 0.5,
  renderMode: 'circle' as const,
  hoverScale: 1.5,
  magneticEffect: false,
  animationsEnabled: true,
  lightModeGlowFactor: 1,
  darkModeGlowFactor: 1.1,
  fillPercentage: 100 // Default to all circles enabled
};
