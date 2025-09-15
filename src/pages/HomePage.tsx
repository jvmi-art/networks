/** @format */

import { useState, useEffect } from 'react';
import ThreeDimensionalCanvas from '../3d/components/ThreeDimensionalCanvas';
import { generateColorGrid, CUBE_DIMENSIONS } from '../constants';
import { palettes } from '../components/PaletteSelector';
import { generateRandomPalette } from '../utils/paletteUtils';
import { CanvasSettingsProvider } from '../contexts/CanvasSettingsContext';
import { FragmentProvider } from '../contexts/FragmentContext';
import { Header } from './home/components/Header';

function HomePage() {
  const [customGridColors, setCustomGridColors] = useState<string[][]>([]);
  const gridSize = 15;

  useEffect(() => {
    const paletteKeys = Object.keys(palettes).filter((key) => key !== 'random');
    const randomPaletteKey = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
    const selectedPalette = palettes[randomPaletteKey];

    const colorPalette = Array.isArray(selectedPalette) ? selectedPalette : generateRandomPalette();

    const grid = generateColorGrid(colorPalette, gridSize);
    setCustomGridColors(grid);
  }, []);

  // Create settings for 15x15 grid with single cube
  const settings = {
    ...CUBE_DIMENSIONS['15x15'],
    gridSize: 15,
    gridWidth: 15,
    gridHeight: 15,
    circleSize: 20,
    renderMode: 'dollar' as const,
    fillPercentage: 100,
    colorPalette: customGridColors[0] || ['#ffffff'],
    springStiffness: 0.2,
    springDamping: 0.7,
    interactionRadius: 100,
    interactionStrength: 0.5,
    magnetRadius: 50,
    enableMagnet: true,
    blockCount: 1, // Render only 1 cube
    fadeDuration: 500,
    gapFactor: 0.1,
    canvasSize: 800,
    canvasWidth: 800,
    canvasHeight: 800,
    backgroundColor: 10,
    strokeWidth: 2,
    hoverScale: 1.2,
    magneticEffect: true,
    animationsEnabled: true,
    lightModeGlowFactor: 0.5,
    darkModeGlowFactor: 0.8,
    autoRotateCamera: true
  };

  const handleButtonClick = () => {
    console.log('Connect button clicked');
    // Add your connect logic here
  };

  return (
    <CanvasSettingsProvider initialSettings={settings}>
      <FragmentProvider>
        <div className='w-screen h-screen bg-black overflow-hidden'>
          <Header onButtonClick={handleButtonClick} buttonText='sign up' />
          <ThreeDimensionalCanvas
            customGridColors={customGridColors}
            hideControls={true}
            useRandomColors={false}
          />
        </div>
      </FragmentProvider>
    </CanvasSettingsProvider>
  );
}

export default HomePage;
