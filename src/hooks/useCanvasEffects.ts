/** @format */

import { useEffect, useCallback, useRef, RefObject } from 'react';
import p5Types from 'p5';
import { CircleEntity } from '../2d/entities/CircleEntity';
import { CanvasSettings } from '../types/canvas';

/**
 * Props for canvas resize hook
 */
interface UseCanvasResizeProps {
  settings: CanvasSettings;
  p5Instance: p5Types | null;
  setupGrid: (p5: p5Types, customColors?: string[], pixelGrid?: { [key: string]: string }, currentSettings?: CanvasSettings, skipEnterAnimation?: boolean) => CircleEntity[];
  customPalette: string[] | null;
  customColorGridRef: RefObject<{ [key: string]: string } | null>;
  setCircles: (circles: CircleEntity[]) => void;
  updateInteractionHandler: (circles: CircleEntity[]) => void;
  hideControls?: boolean;
}

/**
 * Props for grid regeneration hook
 */
interface UseGridRegenerationProps {
  isInitializedRef: RefObject<boolean>;
  p5Instance: p5Types | null;
  settings: CanvasSettings;
  setupGrid: (p5: p5Types, customColors?: string[], pixelGrid?: { [key: string]: string }, currentSettings?: CanvasSettings, skipEnterAnimation?: boolean) => CircleEntity[];
  customPalette: string[] | null;
  customColorGridRef: RefObject<{ [key: string]: string } | null>;
  customGridColors?: string[][];
  colorGridRef: RefObject<{ [key: string]: number }>;
  setCircles: (circles: CircleEntity[]) => void;
  setCustomPalette: (palette: string[] | null) => void;
  setColorGrid: (grid: string[][]) => void;
  updateInteractionHandler: (circles: CircleEntity[]) => void;
  circles: CircleEntity[];
  isEditMode: boolean;
  editColor?: string;
  onCircleClick?: (row: number, col: number) => void;
  interactionHandlerRef: RefObject<any>;
  InteractionHandlerClass: any;
}

/**
 * Props for visual property updates hook
 */
interface UseVisualPropertyUpdatesProps {
  isInitializedRef: RefObject<boolean>;
  circles: CircleEntity[];
  p5Instance: p5Types | null;
  settings: CanvasSettings;
  theme: string;
  setCircles: (circles: CircleEntity[]) => void;
  updateInteractionHandler: (circles: CircleEntity[]) => void;
  updateSettingsRef: RefObject<(settings: Partial<CanvasSettings>) => void>;
  isEditMode: boolean;
  editColor?: string;
  onCircleClick?: (row: number, col: number) => void;
}

/**
 * Custom hook for handling canvas resizing
 */
export function useCanvasResize({
  settings,
  p5Instance,
  setupGrid,
  customPalette,
  customColorGridRef,
  setCircles,
  updateInteractionHandler,
  hideControls = false
}: UseCanvasResizeProps) {
  // Use refs to access current values without causing re-renders
  const settingsRef = useRef(settings);
  const p5InstanceRef = useRef(p5Instance);
  const setupGridRef = useRef(setupGrid);
  const customPaletteRef = useRef(customPalette);
  const setCirclesRef = useRef(setCircles);
  const updateInteractionHandlerRef = useRef(updateInteractionHandler);
  
  // Update refs when props change
  useEffect(() => {
    settingsRef.current = settings;
    p5InstanceRef.current = p5Instance;
    setupGridRef.current = setupGrid;
    customPaletteRef.current = customPalette;
    setCirclesRef.current = setCircles;
    updateInteractionHandlerRef.current = updateInteractionHandler;
  });

  const handleResize = useCallback(() => {
    const p5 = p5InstanceRef.current;
    const currentSettings = settingsRef.current;
    
    if (!p5) return;

    // Get the desired aspect ratio from settings
    const targetWidth = currentSettings.canvasWidth || currentSettings.canvasSize;
    const targetHeight = currentSettings.canvasHeight || currentSettings.canvasSize;
    const aspectRatio = targetWidth / targetHeight;

    // Calculate available space
    const isMobile = window.innerWidth < 640;
    const headerHeight = hideControls ? 0 : (isMobile ? 180 : 120);
    const horizontalPadding = hideControls ? 0 : 40;
    const verticalPadding = hideControls ? 0 : 40; // Add vertical padding too
    
    // Calculate maximum available dimensions (capped at 600px, or full window if hideControls)
    const maxWidth = hideControls ? window.innerWidth : Math.min(600, window.innerWidth - horizontalPadding);
    const maxHeight = hideControls ? window.innerHeight : Math.min(600, window.innerHeight - headerHeight - verticalPadding);

    // Calculate the best fit maintaining aspect ratio
    let finalWidth, finalHeight;

    // Check which dimension is more constraining
    const widthBasedHeight = maxWidth / aspectRatio;
    const heightBasedWidth = maxHeight * aspectRatio;

    if (widthBasedHeight <= maxHeight) {
      // Width is the limiting factor - use full width
      finalWidth = maxWidth;
      finalHeight = widthBasedHeight;
    } else {
      // Height is the limiting factor - use full height
      finalHeight = maxHeight;
      finalWidth = heightBasedWidth;
    }

    // Round to avoid subpixel rendering
    finalWidth = Math.round(finalWidth);
    finalHeight = Math.round(finalHeight);

    // Only resize if dimensions actually changed
    if (p5.width !== finalWidth || p5.height !== finalHeight) {
      p5.resizeCanvas(finalWidth, finalHeight);
      
      // Regenerate grid after resize with current settings (skip enter animation)
      let newCircles: CircleEntity[];
      if (customColorGridRef.current && customPaletteRef.current) {
        newCircles = setupGridRef.current(p5, customPaletteRef.current, customColorGridRef.current, currentSettings, true);
      } else {
        newCircles = setupGridRef.current(p5, undefined, undefined, currentSettings, true);
      }
      setCirclesRef.current(newCircles);
      
      // Update interaction handler with new circles after resize
      updateInteractionHandlerRef.current(newCircles);
    }
  }, [hideControls]); // Include hideControls as dependency

  // Set up resize listener once
  useEffect(() => {
    const resizeHandler = () => {
      handleResize();
    };
    
    // Initial resize
    handleResize();
    
    // Add listener
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [handleResize, hideControls]);
  
  // Trigger resize when settings change
  useEffect(() => {
    handleResize();
  }, [handleResize, settings.canvasSize, settings.canvasWidth, settings.canvasHeight]);
}

/**
 * Custom hook for handling grid regeneration when settings or props change
 */
export function useGridRegeneration({
  isInitializedRef,
  p5Instance,
  settings,
  setupGrid,
  customPalette,
  customColorGridRef,
  customGridColors,
  colorGridRef,
  setCircles,
  setCustomPalette,
  setColorGrid,
  updateInteractionHandler,
  circles,
  isEditMode,
  editColor,
  onCircleClick,
  interactionHandlerRef,
  InteractionHandlerClass
}: UseGridRegenerationProps) {
  // Track previous grid dimensions to detect changes
  const prevGridDimensionsRef = useRef({ 
    width: settings.gridWidth || settings.gridSize, 
    height: settings.gridHeight || settings.gridSize 
  });

  // Effect to regenerate grid when settings change
  // Use a simpler approach - just regenerate when key settings change
  useEffect(() => {
    // Skip if not yet initialized (setup hasn't run yet)
    if (!isInitializedRef.current || !p5Instance || !setupGrid) {
      return;
    }
    
    const currentWidth = settings.gridWidth || settings.gridSize;
    const currentHeight = settings.gridHeight || settings.gridSize;
    const dimensionsChanged = 
      prevGridDimensionsRef.current.width !== currentWidth || 
      prevGridDimensionsRef.current.height !== currentHeight;
    
    
    // If dimensions changed, clear custom colors
    if (dimensionsChanged) {
      customColorGridRef.current = null;
      setCustomPalette(null);
      colorGridRef.current = {};
      prevGridDimensionsRef.current = { width: currentWidth, height: currentHeight };
    }
    
    // Always regenerate with current settings passed explicitly (skip enter animation after initial load)
    let newCircles: CircleEntity[];
    if (customColorGridRef.current && customPalette && !dimensionsChanged) {
      // If we have a custom grid and dimensions haven't changed, use it
      newCircles = setupGrid(p5Instance, customPalette, customColorGridRef.current, settings, true);
    } else {
      // Otherwise, use default setup with current settings
      newCircles = setupGrid(p5Instance, undefined, undefined, settings, true);
    }
    // Force a new array reference to ensure React re-renders
    setCircles([...newCircles]);
    
    // Update interaction handler references with new circles
    updateInteractionHandler(newCircles);
    
    // Force p5 to redraw immediately
    if (p5Instance.redraw) {
      p5Instance.redraw();
    }
    
    // Create interaction handler if it doesn't exist  
    if (!interactionHandlerRef.current && newCircles.length > 0) {
      // Create interaction handler if it doesn't exist
      interactionHandlerRef.current = new InteractionHandlerClass(
        p5Instance,
        newCircles,
        {
          isEditMode,
          editColor,
          onCircleClick
        }
      );
    }
  }, [
    // Use a JSON string of critical settings to detect any changes
    JSON.stringify({
      gridSize: settings.gridSize,
      gridWidth: settings.gridWidth,
      gridHeight: settings.gridHeight,
      gapFactor: settings.gapFactor,
      padding: settings.padding,
      colorPalette: settings.colorPalette
    }),
    p5Instance,
    isEditMode,
    editColor,
    onCircleClick,
    // Don't include setupGrid, setters and refs as they cause issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);

  // Update grid when customGridColors prop changes
  useEffect(() => {
    if (customGridColors && p5Instance) {
      // Check if grid dimensions match current settings
      const expectedWidth = settings.gridWidth || settings.gridSize;
      const expectedHeight = settings.gridHeight || settings.gridSize;
      const gridDimensionsMatch = 
        customGridColors.length === expectedHeight && 
        customGridColors[0]?.length === expectedWidth;

      // Convert the grid colors to the format expected by setupGrid
      const customColorGrid: { [key: string]: string } = {};
      customGridColors.forEach((row: string[], rowIndex: number) => {
        row.forEach((color: string, colIndex: number) => {
          const key = `${rowIndex}-${colIndex}`;
          customColorGrid[key] = color;
        });
      });

      // Extract unique colors for the palette
      const uniqueColors = Array.from(new Set(customGridColors.flat())) as string[];

      // Update the refs with the new data
      customColorGridRef.current = customColorGrid;
      setCustomPalette(uniqueColors);
      colorGridRef.current = {};

      // If dimensions don't match, we need to regenerate the grid
      if (!gridDimensionsMatch || circles.length === 0) {
        // Grid dimensions changed or no circles exist - regenerate with settings
        const newCircles = setupGrid(p5Instance, uniqueColors, customColorGrid, settings, false); // Do show enter animation on initial load
        setCircles(newCircles);
        
        // Update interaction handler with new circles
        updateInteractionHandler(newCircles);
      } else {
        // Dimensions match and circles exist - just update colors
        const updatedCircles = circles.map((circle) => {
          if (circle.row !== undefined && circle.col !== undefined) {
            const newColor = customGridColors[circle.row]?.[circle.col];
            if (newColor) {
              const p5Color = p5Instance.color(newColor);
              // Use the new updateColors method to update all color properties
              circle.updateColors(p5Instance, p5Color);
            }
          }
          return circle;
        });
        // Force a re-render by updating state
        setCircles(updatedCircles);
        
        // Update interaction handler with updated circles
        updateInteractionHandler(updatedCircles);
      }
      
      setColorGrid(customGridColors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customGridColors, p5Instance, settings.gridSize, settings.gridWidth, settings.gridHeight, isEditMode, editColor, onCircleClick]);
}

/**
 * Custom hook for handling visual property updates and theme changes
 */
export function useVisualPropertyUpdates({
  isInitializedRef,
  circles,
  p5Instance,
  settings,
  theme,
  setCircles,
  updateInteractionHandler,
  updateSettingsRef,
  isEditMode,
  editColor,
  onCircleClick
}: UseVisualPropertyUpdatesProps) {
  // Update the backgroundColor when theme changes
  useEffect(() => {
    const newBgColor = theme === 'light' ? 255 : 10;
    // Only update if it actually changed
    if (settings.backgroundColor !== newBgColor) {
      updateSettingsRef.current({
        backgroundColor: newBgColor
      });
    }
  }, [theme, settings.backgroundColor, updateSettingsRef]);

  // Update circle visual properties when settings change (without regenerating grid)
  useEffect(() => {
    // Skip if not yet initialized or no circles
    if (!isInitializedRef.current || circles.length === 0 || !p5Instance) {
      return;
    }
    
    // Update visual properties for all circles
    const updatedCircles = circles.map(circle => {
      circle.maxGlowFactor = theme === 'light' ? settings.lightModeGlowFactor : settings.darkModeGlowFactor;
      circle.strokeWidth = settings.strokeWidth;
      circle.maxSizeIncrease = settings.hoverScale;
      circle.magneticEffect = settings.magneticEffect;
      circle.renderMode = settings.renderMode;
      return circle;
    });
    // Force re-render to apply visual changes
    setCircles(updatedCircles);
    
    // Update interaction handler with updated circles
    updateInteractionHandler(updatedCircles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.hoverScale,
    settings.strokeWidth,
    settings.magneticEffect,
    settings.lightModeGlowFactor,
    settings.darkModeGlowFactor,
    settings.renderMode,
    theme
  ]);

  // Update interaction handler when edit mode settings change
  useEffect(() => {
    if (circles.length > 0) {
      updateInteractionHandler(circles);
    }
    // Note: circles is intentionally not a dependency to avoid infinite loops
    // The handler gets updated when circles change via other effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editColor, onCircleClick]);

  // Clean up interaction handler on unmount
  useEffect(() => {
    return () => {
      // Clean up interaction handler
      // Note: This will be handled by the component that has access to interactionHandlerRef
    };
  }, []);
}