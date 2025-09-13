/** @format */

export interface CanvasSettings {
  gridSize: number; // Deprecated: kept for backward compatibility
  gridWidth: number;
  gridHeight: number;
  fadeDuration: number;
  padding: number;
  gapFactor: number;
  canvasSize: number; // Deprecated: kept for backward compatibility  
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: number;
  colorPalette: string[];
  strokeWidth: number;
  renderMode: 'circle' | 'emoji' | 'dollar';
  hoverScale: number;
  magneticEffect: boolean;
  animationsEnabled: boolean;
  lightModeGlowFactor: number;
  darkModeGlowFactor: number;
  fillPercentage: number; // Percentage of circles to show as "on" (0-100)
  blockCount: number; // Number of blocks to render in 3D mode (1-10)
  autoRotateCamera: boolean; // Enable/disable camera auto-rotation in 3D mode
}


export interface P5CursorFollower {
  x: number;
  y: number;
  size: number;
  targetX: number;
  targetY: number;
  targetSize: number;
  velocityX: number;
  velocityY: number;
  velocitySize: number;
  isClicked: boolean;
  clickStartTime: number;
  isDarkMode: boolean;
}
