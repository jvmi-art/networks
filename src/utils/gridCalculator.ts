export interface GridDimensions {
  gridWidth: number;
  gridHeight: number;
}

export interface GridSpacing {
  uniformSpacing: number;
  actualGridWidth: number;
  actualGridHeight: number;
  offsetX: number;
  offsetY: number;
  circleDiameter?: number;
}

export interface CirclePosition {
  x: number;
  y: number;
  row: number;
  col: number;
}

/**
 * Calculate uniform grid spacing based on canvas dimensions and padding
 */
export function calculateUniformSpacing(
  canvasWidth: number,
  canvasHeight: number,
  gridWidth: number,
  gridHeight: number,
  padding: number
): number {
  // Make padding proportional to the smaller dimension of the canvas
  // This ensures padding scales with canvas size
  const minDimension = Math.min(canvasWidth, canvasHeight);
  const proportionalPadding = (padding / 600) * minDimension; // Scale based on original 600px canvas
  
  const availableWidth = canvasWidth - 2 * proportionalPadding;
  const availableHeight = canvasHeight - 2 * proportionalPadding;
  
  const maxSpacingX = gridWidth > 1 ? availableWidth / (gridWidth - 1) : availableWidth;
  const maxSpacingY = gridHeight > 1 ? availableHeight / (gridHeight - 1) : availableHeight;
  
  return Math.min(maxSpacingX, maxSpacingY);
}

/**
 * Calculate complete grid spacing information including offsets and circle diameter
 */
export function calculateGridSpacing(
  width: number,
  height: number,
  gridWidth: number,
  gridHeight: number,
  padding: number,
  gapFactor?: number
): GridSpacing {
  const uniformSpacing = calculateUniformSpacing(width, height, gridWidth, gridHeight, padding);
  
  const actualGridWidth = gridWidth > 1 ? uniformSpacing * (gridWidth - 1) : 0;
  const actualGridHeight = gridHeight > 1 ? uniformSpacing * (gridHeight - 1) : 0;
  
  const offsetX = (width - actualGridWidth) / 2;
  const offsetY = (height - actualGridHeight) / 2;
  
  const result: GridSpacing = {
    uniformSpacing,
    actualGridWidth,
    actualGridHeight,
    offsetX,
    offsetY
  };
  
  if (gapFactor !== undefined) {
    result.circleDiameter = uniformSpacing * gapFactor;
  }
  
  return result;
}

/**
 * Get the position of a circle at a specific grid index
 */
export function getCirclePosition(
  index: number,
  gridWidth: number,
  gridHeight: number,
  spacing: number,
  padding: number,
  canvasWidth: number,
  canvasHeight: number
): CirclePosition {
  const row = Math.floor(index / gridWidth);
  const col = index % gridWidth;
  
  const gridSpacing = calculateGridSpacing(
    canvasWidth,
    canvasHeight,
    gridWidth,
    gridHeight,
    padding
  );
  
  const x = gridSpacing.offsetX + col * spacing;
  const y = gridSpacing.offsetY + row * spacing;
  
  return { x, y, row, col };
}

/**
 * Get circle position by row and column
 */
export function getCirclePositionByRowCol(
  row: number,
  col: number,
  gridSpacing: GridSpacing
): { x: number; y: number } {
  const x = gridSpacing.offsetX + col * gridSpacing.uniformSpacing;
  const y = gridSpacing.offsetY + row * gridSpacing.uniformSpacing;
  
  return { x, y };
}

/**
 * Convert canvas coordinates to grid row/column
 */
export function canvasToGrid(
  x: number,
  y: number,
  gridSpacing: GridSpacing
): { row: number; col: number } {
  const col = Math.round((x - gridSpacing.offsetX) / gridSpacing.uniformSpacing);
  const row = Math.round((y - gridSpacing.offsetY) / gridSpacing.uniformSpacing);
  
  return { row, col };
}

/**
 * Get available canvas dimensions after padding
 */
export function getAvailableDimensions(
  canvasWidth: number,
  canvasHeight: number,
  padding: number
): { availableWidth: number; availableHeight: number } {
  // Make padding proportional to the smaller dimension of the canvas
  const minDimension = Math.min(canvasWidth, canvasHeight);
  const proportionalPadding = (padding / 600) * minDimension; // Scale based on original 600px canvas
  
  return {
    availableWidth: canvasWidth - 2 * proportionalPadding,
    availableHeight: canvasHeight - 2 * proportionalPadding
  };
}