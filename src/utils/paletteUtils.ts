/** @format */

/**
 * Generates a random color palette with vibrant HSL colors
 * @param size - Number of colors to generate (default: 20)
 * @returns Array of HSL color strings
 */
export const generateRandomPalette = (size: number = 20): string[] => {
  const colors: string[] = [];
  
  for (let i = 0; i < size; i++) {
    const hue = Math.random() * 360;
    const saturation = 50 + Math.random() * 50; // 50-100% for vibrant colors
    const lightness = 40 + Math.random() * 30; // 40-70% for good visibility
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  
  return colors;
};

/**
 * Gets the color palette array for a given palette selection
 * Handles special cases like random palette generation
 */
export const getColorPalette = (
  paletteName: string,
  palettes: Record<string, string[] | string>,
  randomPalette?: string[]
): string[] | undefined => {
  if (paletteName === 'random' && randomPalette) {
    return randomPalette;
  }
  
  const palette = palettes[paletteName];
  return Array.isArray(palette) ? palette : undefined;
};