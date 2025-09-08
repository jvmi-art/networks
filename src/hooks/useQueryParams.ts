import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../theme/theme-provider';
import { useCanvasSettings } from '../contexts/CanvasSettingsContext';
import { 
  NODE_MODE_CONFIG,
  BLOCK_MODE_CONFIG
} from '../constants';

export function useQueryParams() {
  const [searchParams] = useSearchParams();
  const { setTheme } = useTheme();
  const { updateSettings } = useCanvasSettings();
  
  // Check if controls should be hidden
  const hideControls = searchParams.get('hideControls') === 'true';

  useEffect(() => {
    // Only run once on mount
    
    // Theme parameter (light/dark)
    const theme = searchParams.get('theme');
    if (theme === 'light' || theme === 'dark') {
      setTheme(theme);
    }

    // Start with mode configuration if provided
    let baseConfig = {};
    const mode = searchParams.get('mode');
    if (mode) {
      switch (mode) {
        case 'block':
          baseConfig = { ...BLOCK_MODE_CONFIG };
          break;
        case 'node':
        default:
          baseConfig = { ...NODE_MODE_CONFIG };
          break;
      }
    }

    // Grid dimensions and padding - can override mode defaults
    const gridSize = searchParams.get('gridSize');
    const gridWidth = searchParams.get('gridWidth');
    const gridHeight = searchParams.get('gridHeight');
    const padding = searchParams.get('padding');

    const updates: any = { ...baseConfig };
    
    // Handle single gridSize parameter (sets both width and height)
    if (gridSize) {
      const size = parseInt(gridSize, 10);
      if (!isNaN(size) && size > 0 && size <= 100) {
        updates.gridSize = size;
        updates.gridWidth = size;
        updates.gridHeight = size;
      }
    }
    
    if (gridWidth) {
      const width = parseInt(gridWidth, 10);
      if (!isNaN(width) && width > 0 && width <= 100) {
        updates.gridWidth = width;
        // Also update gridSize for compatibility if width and height are the same
        if (!gridHeight || width === parseInt(gridHeight, 10)) {
          updates.gridSize = width;
        }
      }
    }

    if (gridHeight) {
      const height = parseInt(gridHeight, 10);
      if (!isNaN(height) && height > 0 && height <= 100) {
        updates.gridHeight = height;
        // Also update gridSize for compatibility if width and height are the same
        if (!gridWidth || height === parseInt(gridWidth, 10)) {
          updates.gridSize = height;
        }
      }
    }

    if (padding) {
      const pad = parseInt(padding, 10);
      if (!isNaN(pad) && pad >= 0 && pad <= 200) {
        updates.padding = pad;
      }
    }

    // Apply all settings at once
    if (Object.keys(updates).length > 0) {
      updateSettings(updates);
    }

  }, []); // Empty dependency array - only run once on mount
  
  return { hideControls };
}

