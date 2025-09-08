/** @format */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import '../../App.css';
import { CircleEntity } from '../entities/CircleEntity';
import { calculateGridSpacing, getCirclePositionByRowCol } from '../../utils/gridCalculator';
import { InteractionHandler } from '../handlers/InteractionHandler';
import ImageUploader from './ImageUploader';
import {
  useCanvasResize,
  useGridRegeneration,
  useVisualPropertyUpdates
} from '../../hooks/useCanvasEffects';

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from '../../components/ui/drawer';
import { Button } from '../../components/ui/button';
import { generateColorGrid } from '../../constants';
import { chromaticPalette } from '../../palettes';
import { RiCameraFill } from '@remixicon/react';
import { useTheme } from '../../theme/theme-provider';
import { useCanvasSettings } from '../../contexts/CanvasSettingsContext';
import { CanvasSettings } from '../../types/canvas';

/**
 * Interface for storing color indices in a grid pattern
 */
export interface ColorGrid {
  [key: string]: number; // Maps position string "row-col" to color index
}

interface TwoDimensionalCanvasProps {
  customGridColors?: string[][];
  isEditMode?: boolean;
  onCircleClick?: (row: number, col: number) => void;
  editColor?: string;
  colorPalette?: string[];
  hideControls?: boolean;
}

/**
 * Main P5Canvas component that manages the interactive grid of circles
 */
const TwoDimensionalCanvas: React.FC<TwoDimensionalCanvasProps> = ({
  customGridColors,
  isEditMode = false,
  onCircleClick,
  editColor,
  colorPalette,
  hideControls = false
}) => {
  const { theme } = useTheme();
  const { settings, updateSettings } = useCanvasSettings();

  // Use ref for updateSettings to avoid dependency issues
  const updateSettingsRef = useRef(updateSettings);
  updateSettingsRef.current = updateSettings;
  //------------------------------------------
  // State Management
  //------------------------------------------
  const [circles, setCircles] = useState<CircleEntity[]>([]);
  const [p5Instance, setP5Instance] = useState<p5Types | null>(null);
  const [showImageUploader, setShowImageUploader] = useState<boolean>(false);
  const [customPalette, setCustomPalette] = useState<string[] | null>(null);
  const [isMaskMode, setIsMaskMode] = useState<boolean>(false);
  const [, setMaskData] = useState<{ [key: string]: boolean } | null>(null);

  // Interaction handler
  const interactionHandlerRef = useRef<InteractionHandler | null>(null);

  // Track if initial setup is complete to avoid unnecessary grid regeneration
  const isInitializedRef = useRef<boolean>(false);

  // Settings come from context now

  const [colorGrid, setColorGrid] = useState<string[][]>(
    () =>
      customGridColors ||
      generateColorGrid(
        colorPalette || settings.colorPalette || chromaticPalette,
        settings.gridSize,
        settings.gridWidth,
        settings.gridHeight
      )
  );

  //------------------------------------------
  // Refs for State Persistence
  //------------------------------------------
  const canvasRef = useRef<HTMLDivElement>(null);
  const colorGridRef = useRef<ColorGrid>({});
  const customColorGridRef = useRef<{ [key: string]: string } | null>(null);

  //------------------------------------------
  // Derived Values
  //------------------------------------------
  const circleOptions = {
    maxGlowFactor: theme === 'light' ? settings.lightModeGlowFactor : settings.darkModeGlowFactor,
    strokeWidth: settings.strokeWidth,
    maxSizeIncrease: settings.hoverScale,
    magneticEffect: settings.magneticEffect,
    isLightMode: theme === 'light'
  };

  // Tracking for mouse interactions
  // Remove this - using ref instead
  // let isMousePressed = false;

  /**
   * Handle pixel data from the ImageUploader
   */
  const handlePixelDataReady = (colorGrid: { [key: string]: string }) => {
    // Store the custom color grid in the ref
    customColorGridRef.current = colorGrid;

    // Extract unique colors for the palette
    const uniqueColors = Array.from(new Set(Object.values(colorGrid)));

    // Update palette with these colors
    setCustomPalette(uniqueColors);

    // Reset the color index grid so we can rebuild it with the new colors
    colorGridRef.current = {};

    // Regenerate the circles with the new colors
    if (p5Instance) {
      const newCircles = setupGrid(p5Instance, uniqueColors, colorGrid);
      setCircles(newCircles);

      // Update interaction handler with new circles
      updateInteractionHandler(newCircles);
    }
  };

  /**
   * Toggle mask mode
   */
  const handleMaskModeToggle = (enabled: boolean) => {
    setIsMaskMode(enabled);

    // Reset mask data and custom grid when toggling off mask mode
    if (!enabled) {
      setMaskData(null);
      if (customColorGridRef.current && customPalette && p5Instance) {
        // Regenerate with standard grid if we have a custom palette
        const newCircles = setupGrid(p5Instance, customPalette, customColorGridRef.current);
        setCircles(newCircles);

        // Update interaction handler with new circles
        updateInteractionHandler(newCircles);
      } else if (p5Instance) {
        // Otherwise regenerate with default grid
        const newCircles = setupGrid(p5Instance);
        setCircles(newCircles);

        // Update interaction handler with new circles
        updateInteractionHandler(newCircles);
      }
    }
  };

  /**
   * Handle mask data from the ImageUploader
   */
  const handleMaskDataReady = (maskPoints: { [key: string]: boolean }) => {
    setMaskData(maskPoints);

    if (p5Instance) {
      // Create circles only for points inside the mask
      const palette = customPalette || settings.colorPalette;
      const newCircles = setupGridWithMask(p5Instance, maskPoints, palette);
      setCircles(newCircles);

      // Update interaction handler with new circles
      updateInteractionHandler(newCircles);
    }
  };

  //------------------------------------------
  // Color Grid Management
  //------------------------------------------

  /**
   * Creates a position key for the color grid
   */
  const getPositionKey = (row: number, col: number) => `${row}-${col}`;

  /**
   * Update the interaction handler with new circle references
   * This centralizes the repeated pattern of updating the handler
   */
  const updateInteractionHandler = (newCircles: CircleEntity[]) => {
    if (interactionHandlerRef.current) {
      interactionHandlerRef.current.updateReferences(newCircles, {
        isEditMode,
        editColor,
        onCircleClick
      });
    }
  };

  //------------------------------------------
  // Grid Setup and Management
  //------------------------------------------

  /**
   * Initialize the grid of circles
   */
  const setupGrid = useCallback(
    (
      p5: p5Types,
      customColors?: string[],
      pixelGrid?: { [key: string]: string },
      currentSettings?: CanvasSettings, // Accept settings as parameter
      skipEnterAnimation?: boolean // Option to skip enter animation
    ): CircleEntity[] => {
      const newCircles: CircleEntity[] = [];

      // Use passed settings or fall back to closure settings
      const settingsToUse = currentSettings || settings;

      // Get grid dimensions (use new separate width/height or fall back to gridSize)
      const gridWidth = settingsToUse.gridWidth || settingsToUse.gridSize;
      const gridHeight = settingsToUse.gridHeight || settingsToUse.gridSize;

      // Calculate grid spacing using the utility
      const gridSpacing = calculateGridSpacing(
        p5.width,
        p5.height,
        gridWidth,
        gridHeight,
        settingsToUse.padding,
        settingsToUse.gapFactor
      );

      // Use custom palette if provided, then prop palette, then settings palette
      const palette = customColors || colorPalette || settingsToUse.colorPalette;

      // Reset the color grid if we have a custom grid
      if (pixelGrid) {
        colorGridRef.current = {};
      }

      for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
          const { x, y } = getCirclePositionByRowCol(row, col, gridSpacing);

          // Generate a position key for this circle
          const posKey = getPositionKey(row, col);

          let originalColor: p5Types.Color;

          // If we have pixel data from an image, use it
          if (pixelGrid && pixelGrid[posKey]) {
            const hexColor = pixelGrid[posKey];
            originalColor = p5.color(hexColor);
          } else if (customGridColors && customGridColors[row] && customGridColors[row][col]) {
            // Use the color from customGridColors if provided
            originalColor = p5.color(customGridColors[row][col]);
          } else {
            // Select a random color from the palette
            const randomIndex = Math.floor(Math.random() * palette.length);
            originalColor = p5.color(palette[randomIndex]);
          }

          const circle = new CircleEntity(p5, x, y, gridSpacing.circleDiameter!, originalColor, {
            ...circleOptions,
            renderMode: settingsToUse.renderMode
          });

          // Store the row and column on the circle itself for later reference
          circle.row = row;
          circle.col = col;

          // Start enter animation with random delay unless skipped
          if (!skipEnterAnimation) {
            // Calculate max delay based on grid size
            // Smaller grids (5x5) = 500ms max, larger grids (25x25) = 3000ms max
            const totalCircles = gridWidth * gridHeight;
            const maxDelay = Math.min(500 + totalCircles * 4, 3000); // Scale from 500ms to 3000ms
            const randomDelay = Math.random() * maxDelay;
            circle.startEnterAnimation(p5, randomDelay);
          } else {
            // Mark as already entered if skipping animation
            circle.hasEntered = true;
          }

          newCircles.push(circle);
        }
      }

      return newCircles;
    },
    // Only include essential settings that affect grid structure
    // Exclude circleOptions as it changes frequently
    [
      settings.gridWidth,
      settings.gridSize,
      settings.gridHeight,
      settings.padding,
      settings.gapFactor,
      settings.renderMode,
      settings.colorPalette,
      colorPalette,
      customGridColors
    ]
  );

  /**
   * Initialize grid with masked circles
   */
  const setupGridWithMask = useCallback(
    (
      p5: p5Types,
      maskPoints: { [key: string]: boolean },
      colorPalette: string[],
      skipEnterAnimation?: boolean
    ): CircleEntity[] => {
      const newCircles: CircleEntity[] = [];

      // Get grid dimensions (use new separate width/height or fall back to gridSize)
      const gridWidth = settings.gridWidth || settings.gridSize;
      const gridHeight = settings.gridHeight || settings.gridSize;

      // Calculate grid spacing using the utility
      const gridSpacing = calculateGridSpacing(
        p5.width,
        p5.height,
        gridWidth,
        gridHeight,
        settings.padding,
        settings.gapFactor
      );

      for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
          const posKey = getPositionKey(row, col);

          // Skip this point if it's not inside the mask
          if (!maskPoints[posKey]) {
            continue;
          }

          const { x, y } = getCirclePositionByRowCol(row, col, gridSpacing);

          // For mask mode, assign random colors from the palette
          const colorIndex = Math.floor(p5.random(colorPalette.length));
          const originalColor = p5.color(colorPalette[colorIndex]);

          // Create the circle entity
          const circle = new CircleEntity(
            p5,
            x,
            y,
            gridSpacing.circleDiameter!,
            originalColor,
            circleOptions
          );
          circle.row = row;
          circle.col = col;

          // Start enter animation with random delay unless skipped
          if (!skipEnterAnimation) {
            // Calculate max delay based on grid size
            // Smaller grids (5x5) = 500ms max, larger grids (25x25) = 3000ms max
            const totalCircles = gridWidth * gridHeight;
            const maxDelay = Math.min(500 + totalCircles * 4, 3000); // Scale from 500ms to 3000ms
            const randomDelay = Math.random() * maxDelay;
            circle.startEnterAnimation(p5, randomDelay);
          } else {
            // Mark as already entered if skipping animation
            circle.hasEntered = true;
          }

          // Store the color index in our grid
          colorGridRef.current[posKey] = colorIndex;

          newCircles.push(circle);
        }
      }

      return newCircles;
    },
    // Only include essential settings that affect grid structure
    [
      settings.gridWidth,
      settings.gridSize,
      settings.gridHeight,
      settings.padding,
      settings.gapFactor,
      circleOptions
    ]
  );

  //------------------------------------------
  // Mouse Interaction Handlers
  //------------------------------------------

  /**
   * Handle mouse press event
   */
  const mousePressed = (p5: p5Types) => {
    if (interactionHandlerRef.current) {
      interactionHandlerRef.current.updateP5Instance(p5);
      interactionHandlerRef.current.handleMousePressed();
    }
  };

  /**
   * Handle mouse release event
   */
  const mouseReleased = () => {
    interactionHandlerRef.current?.handleMouseReleased();
  };

  /**
   * Handle mouse drag event
   */
  const mouseDragged = (p5: p5Types) => {
    if (interactionHandlerRef.current) {
      interactionHandlerRef.current.updateP5Instance(p5);
      return interactionHandlerRef.current.handleMouseDragged();
    }
    return false;
  };

  /**
   * Handle mouse move event
   */
  const mouseMoved = () => {
    interactionHandlerRef.current?.handleMouseMoved();
  };

  /**
   * Handle touch start event
   */
  const touchStarted = (p5: p5Types) => {
    if (interactionHandlerRef.current) {
      interactionHandlerRef.current.updateP5Instance(p5);
      return interactionHandlerRef.current.handleTouchStarted();
    }
    return false;
  };

  /**
   * Handle touch end event
   */
  const touchEnded = (p5: p5Types) => {
    if (interactionHandlerRef.current) {
      interactionHandlerRef.current.updateP5Instance(p5);
      return interactionHandlerRef.current.handleTouchEnded();
    }
    return false;
  };

  /**
   * Handle touch move event
   */
  const touchMoved = (p5: p5Types) => {
    if (interactionHandlerRef.current) {
      interactionHandlerRef.current.updateP5Instance(p5);
      return interactionHandlerRef.current.handleTouchMoved();
    }
    return false;
  };

  //------------------------------------------
  // Drawing and Animation Methods
  //------------------------------------------

  /**
   * Update and sort circles for proper layering
   */
  const updateAndSortCircles = (p5: p5Types): CircleEntity[] => {
    // Update all circles with edit mode awareness
    circles.forEach((circle) => {
      // In edit mode, disable normal hover animations
      if (isEditMode) {
        // Just update spring physics, no hover effects
        circle.applySpringPhysics();

        // Add subtle hover effect for edit mode
        const d = p5.dist(p5.mouseX, p5.mouseY, circle.x, circle.y);
        if (d < circle.size / 2) {
          circle.targetSize = circle.originalSize * 1.05; // Very subtle grow
        } else {
          circle.targetSize = circle.originalSize;
        }
      } else {
        // Normal update with all animations
        circle.update(p5);
      }
    });

    // Sort circles by distance from mouse for proper layering
    return [...circles].sort((a, b) => {
      const distA = p5.dist(p5.mouseX, p5.mouseY, a.x, a.y);
      const distB = p5.dist(p5.mouseX, p5.mouseY, b.x, b.y);
      return distB - distA; // Descending order (furthest first)
    });
  };

  /**
   * P5.js draw function called each frame
   */
  const draw = (p5: p5Types) => {
    // Clear the background
    p5.background(settings.backgroundColor);

    // Update and sort circles by distance from mouse
    const sortedCircles = updateAndSortCircles(p5);

    // Set blend mode for glow effects (only in non-edit mode)
    if (!isEditMode && theme === 'dark') {
      p5.blendMode(p5.ADD);
    }

    // Draw the circles in sorted order
    sortedCircles.forEach((circle) => {
      if (isEditMode) {
        // Simple drawing without glow in edit mode
        p5.push();
        p5.noStroke();
        p5.fill(circle.currentColor);
        p5.circle(circle.x, circle.y, circle.size);
        p5.pop();
      } else {
        // Normal drawing with all effects
        circle.draw(p5);
      }
    });

    // Reset blend mode for future draws
    if (!isEditMode && theme === 'dark') {
      p5.blendMode(p5.BLEND);
    }

    // Draw edit mode cursor preview
    if (
      isEditMode &&
      editColor &&
      p5.mouseX >= 0 &&
      p5.mouseX <= p5.width &&
      p5.mouseY >= 0 &&
      p5.mouseY <= p5.height
    ) {
      p5.push();

      // Subtle cursor indicator
      p5.noFill();
      p5.stroke(editColor);
      p5.strokeWeight(2);
      p5.circle(p5.mouseX, p5.mouseY, 20);

      // Small color dot in center
      p5.noStroke();
      p5.fill(editColor);
      p5.circle(p5.mouseX, p5.mouseY, 8);

      p5.pop();
    }
  };

  /**
   * P5.js setup function
   */
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // Guard against null canvasParentRef
    if (!canvasParentRef) {
      console.warn('Canvas parent ref is null, skipping setup');
      return;
    }

    // Get the desired aspect ratio from settings
    const targetWidth = settings.canvasWidth || settings.canvasSize;
    const targetHeight = settings.canvasHeight || settings.canvasSize;
    const aspectRatio = targetWidth / targetHeight;

    // Calculate available space
    const isMobile = window.innerWidth < 640;
    const headerHeight = hideControls ? 0 : isMobile ? 180 : 120;
    const horizontalPadding = hideControls ? 0 : 40;
    const verticalPadding = hideControls ? 0 : 40;

    // Calculate maximum available dimensions (capped at 600px, or full window if hideControls)
    const maxWidth = hideControls
      ? window.innerWidth
      : Math.min(600, window.innerWidth - horizontalPadding);
    const maxHeight = hideControls
      ? window.innerHeight
      : Math.min(600, window.innerHeight - headerHeight - verticalPadding);

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

    p5.createCanvas(finalWidth, finalHeight).parent(canvasParentRef);

    // Initialize mouse position outside canvas to prevent hover effects on startup
    p5.mouseX = -1000;
    p5.mouseY = -1000;

    setP5Instance(p5);

    // Use customGridColors if provided, otherwise use colorGrid
    const gridToUse = customGridColors || colorGrid;

    // Convert gridToUse to the format expected by setupGrid
    const customColorGrid: { [key: string]: string } = {};
    gridToUse.forEach((row: string[], rowIndex: number) => {
      row.forEach((color: string, colIndex: number) => {
        const key = `${rowIndex}-${colIndex}`;
        customColorGrid[key] = color;
      });
    });

    // Extract unique colors for the palette
    const uniqueColors = Array.from(new Set(gridToUse.flat())) as string[];

    // Set the custom palette and grid locally without updating context
    // to avoid infinite loops during initialization
    setCustomPalette(uniqueColors);
    customColorGridRef.current = customColorGrid;

    // Initialize circles with the custom grid
    const initialCircles = setupGrid(p5, uniqueColors, customColorGrid);
    setCircles(initialCircles);

    // Initialize interaction handler
    interactionHandlerRef.current = new InteractionHandler(p5, initialCircles, {
      isEditMode,
      editColor,
      onCircleClick
    });

    // Mark as initialized to prevent unnecessary grid regeneration
    isInitializedRef.current = true;
  };

  //------------------------------------------
  // Custom Hook Effects
  //------------------------------------------

  // Handle canvas resizing
  useCanvasResize({
    settings,
    p5Instance,
    setupGrid,
    customPalette,
    customColorGridRef,
    setCircles,
    updateInteractionHandler,
    hideControls
  });

  // Handle grid regeneration when settings or props change
  useGridRegeneration({
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
    InteractionHandlerClass: InteractionHandler
  });

  // Handle visual property updates and theme changes
  useVisualPropertyUpdates({
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
  });

  // Clean up interaction handler on unmount
  useEffect(() => {
    return () => {
      interactionHandlerRef.current?.cleanup();
    };
  }, []);

  //------------------------------------------
  // Component Rendering
  //------------------------------------------
  return (
    <>
      <div className='flex justify-center items-center' ref={canvasRef}>
        <Sketch
          setup={setup as any}
          draw={draw as any}
          mousePressed={mousePressed as any}
          mouseReleased={mouseReleased as any}
          mouseDragged={mouseDragged as any}
          mouseMoved={mouseMoved as any}
          touchEnded={touchEnded as any}
          touchStarted={touchStarted as any}
          touchMoved={touchMoved as any}
        />
      </div>

      {!hideControls && (
        <Drawer open={showImageUploader} onOpenChange={setShowImageUploader}>
          <DrawerTrigger asChild>
            <Button
              variant='outline'
              className='fixed bottom-[28px] right-[28px] rounded-full w-16 h-16 p-0'
              role='toggle-image-uploader'
            >
              <RiCameraFill size={40} className='size-6 text-muted-foreground' />
            </Button>
          </DrawerTrigger>

          <DrawerContent
            className={`${
              theme === 'light'
                ? 'bg-white/95 border-black/20 text-black'
                : 'bg-black/95 border-white/20 text-white'
            } backdrop-blur-lg`}
          >
            <DrawerHeader className='sr-only'>
              <DrawerTitle>Upload Image</DrawerTitle>
              <DrawerDescription>
                Upload an image to extract colors or create a mask for your grid
              </DrawerDescription>
            </DrawerHeader>
            <div className='px-4 pb-4 max-w-full'>
              <div className='max-w-lg mx-auto'>
                <ImageUploader
                  gridSize={settings.gridSize}
                  onPixelDataReady={handlePixelDataReady}
                  onMaskDataReady={handleMaskDataReady}
                  isMaskMode={isMaskMode}
                  onMaskModeToggle={handleMaskModeToggle}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default TwoDimensionalCanvas;
