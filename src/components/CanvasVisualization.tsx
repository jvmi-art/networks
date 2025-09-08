/** @format */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TwoDimensionalCanvas from '../2d/components/TwoDimensionalCanvas';
import ThreeDimensionalCanvas from '../3d/components/ThreeDimensionalCanvas';
import { useTheme } from '../theme/theme-provider';
import { useCanvasSettings } from '../contexts/CanvasSettingsContext';
import EditModeControls from './EditModeControls';
import ModeTabs, { ModeType } from './ModeTabs';
import DimensionTabs from './DimensionTabs';
import { generateColorGrid } from '../constants';
import ControlPanel from './ControlPanel';
import PaletteSelector, { PaletteType, palettes } from './PaletteSelector';
import { useQueryParams } from '../hooks/useQueryParams';
import ColorAnimationToggle from './ColorAnimationToggle';
import { generateRandomPalette, getColorPalette } from '../utils/paletteUtils';

function CanvasVisualization() {
  const { theme } = useTheme();
  const { settings } = useCanvasSettings();
  const [searchParams] = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  // Initialize activeMode based on query parameter
  const modeParam = searchParams.get('mode');
  const initialMode: ModeType = modeParam === 'block' ? 'block' : 'node';
  const [activeMode, setActiveMode] = useState<ModeType>(initialMode);

  // Initialize palette from URL or default
  const urlPalette = searchParams.get('palette');
  const initialPalette =
    urlPalette && urlPalette in palettes ? (urlPalette as PaletteType) : 'random';
  const [selectedPalette, setSelectedPalette] = useState<PaletteType>(initialPalette);

  const [savedGridColors, setSavedGridColors] = useState<string[][]>(() =>
    generateColorGrid(
      palettes[selectedPalette],
      settings.gridSize,
      settings.gridWidth,
      settings.gridHeight
    )
  );
  const [randomColorAnimation, setRandomColorAnimation] = useState(false);

  // Generate a fixed random color palette for animation purposes
  const [randomColorPalette] = useState<string[]>(() => generateRandomPalette(20));

  // Apply query parameters and get hideControls
  const { hideControls } = useQueryParams();

  // Regenerate grid colors when settings or palette changes
  useEffect(() => {
    setSavedGridColors(
      generateColorGrid(
        palettes[selectedPalette],
        settings.gridSize,
        settings.gridWidth,
        settings.gridHeight
      )
    );
  }, [settings.gridSize, settings.gridWidth, settings.gridHeight, selectedPalette]);

  const handleColorChange = useCallback(
    (row: number, col: number) => {
      if (!isEditMode) return;
      const newGrid = [...savedGridColors];
      if (!newGrid[row]) newGrid[row] = [];
      newGrid[row][col] = selectedColor;
      setSavedGridColors(newGrid);
    },
    [savedGridColors, selectedColor, isEditMode]
  );

  const handleRandomize = useCallback(() => {
    setSavedGridColors(
      generateColorGrid(
        palettes[selectedPalette],
        settings.gridSize,
        settings.gridWidth,
        settings.gridHeight
      )
    );
  }, [selectedPalette, settings.gridSize, settings.gridWidth, settings.gridHeight]);

  // Determine background color based on theme and settings
  const canvasBackground = theme === 'light' ? 255 : 10;
  const backgroundStyle = hideControls
    ? { backgroundColor: `rgb(${canvasBackground}, ${canvasBackground}, ${canvasBackground})` }
    : {};

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden ${
        hideControls ? '' : theme === 'light' ? 'bg-[#eeeeee]' : 'bg-[#101010]'
      } transition-colors duration-300 ease-in-out`}
      style={backgroundStyle}
    >
      {/* Header with controls */}
      {!hideControls && (
        <header className='fixed top-0 left-0 right-0 z-[49] p-2 sm:p-4'>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-between'>
            {/* Settings and Mode Tabs - Stack on mobile */}
            <div className='flex flex-col sm:flex-row items-center gap-2'>
              {/* First row on mobile: Settings and Mode Tabs */}
              <div className='flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start'>
                <ControlPanel mode={activeMode} />
                <ModeTabs activeTab={activeMode} onTabChange={setActiveMode} />
              </div>

              {/* Second row on mobile: Dimension Tabs (for both modes) */}
              <div className='flex justify-center w-full sm:w-auto'>
                <DimensionTabs mode={activeMode} />
              </div>
            </div>

            {/* Right side controls container */}
            <div className='flex items-center gap-2 justify-center sm:justify-end'>
              {/* Palette Selector - show for all modes */}
              <PaletteSelector
                selectedPalette={selectedPalette}
                onPaletteChange={setSelectedPalette}
              />

              {/* Random Color Animation Toggle - only in block mode */}
              <ColorAnimationToggle
                isEnabled={randomColorAnimation}
                onToggle={() => setRandomColorAnimation(!randomColorAnimation)}
                visible={activeMode === 'block'}
              />

              {/* Edit Mode Controls - only show in node mode */}
              {activeMode === 'node' && (
                <EditModeControls
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  isEditMode={isEditMode}
                  onEditModeChange={setIsEditMode}
                  onRandomize={handleRandomize}
                />
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <div
        className={`flex-1 flex justify-center items-center min-h-0 ${
          hideControls ? 'p-0' : 'pt-20 sm:pt-16'
        }`}
      >
        <div
          className={`flex justify-center items-center rounded-2xl overflow-hidden ${
            hideControls ? 'w-full h-full' : ''
          }`}
        >
          {activeMode === 'block' ? (
            <ThreeDimensionalCanvas
              customGridColors={savedGridColors}
              isEditMode={isEditMode}
              colorPalette={getColorPalette(selectedPalette, palettes, randomColorPalette)}
              hideControls={hideControls}
              randomColorAnimation={randomColorAnimation}
              useRandomColors={selectedPalette === 'random'}
            />
          ) : (
            <TwoDimensionalCanvas
              customGridColors={savedGridColors}
              isEditMode={isEditMode}
              onCircleClick={handleColorChange}
              editColor={selectedColor}
              colorPalette={
                Array.isArray(palettes[selectedPalette]) ? palettes[selectedPalette] : undefined
              }
              hideControls={hideControls}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CanvasVisualization;
