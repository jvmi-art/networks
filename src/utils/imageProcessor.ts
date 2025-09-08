/**
 * Image processing utility for extracting colors and generating masks from images
 */

export interface ImageProcessingResult {
  palette: string[];
  colorGrid: string[][];
  pixelGrid: { [key: string]: string };
}

export interface MaskConfig {
  opacityThreshold?: number;
  whiteThreshold?: number;
}

/**
 * Extract colors from an image file and map them to a grid
 * @param imageFile - The image file to process
 * @param gridWidth - Width of the grid
 * @param gridHeight - Height of the grid
 * @returns Promise containing palette, colorGrid, and pixelGrid
 */
export async function extractColorsFromImage(
  imageFile: File,
  gridWidth: number,
  gridHeight: number
): Promise<ImageProcessingResult> {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!imageFile.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    // Create an image element
    const img = new Image();
    const fileUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      try {
        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Calculate step sizes for sampling
        const stepX = img.width / gridWidth;
        const stepY = img.height / gridHeight;

        // Initialize data structures
        const pixelGrid: { [key: string]: string } = {};
        const colorGrid: string[][] = [];
        const uniqueColors = new Set<string>();

        // Sample colors from the image
        for (let row = 0; row < gridHeight; row++) {
          const gridRow: string[] = [];
          
          for (let col = 0; col < gridWidth; col++) {
            // Sample from the center of each grid cell
            const x = Math.floor(col * stepX + stepX / 2);
            const y = Math.floor(row * stepY + stepY / 2);
            
            // Get pixel data
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            
            // Convert to hex color
            const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
            
            // Store in data structures
            pixelGrid[`${row}-${col}`] = hexColor;
            gridRow.push(hexColor);
            uniqueColors.add(hexColor);
          }
          
          colorGrid.push(gridRow);
        }

        // Clean up
        URL.revokeObjectURL(fileUrl);

        // Create palette from unique colors
        const palette = Array.from(uniqueColors);

        resolve({
          palette,
          colorGrid,
          pixelGrid
        });
      } catch (error) {
        URL.revokeObjectURL(fileUrl);
        reject(error instanceof Error ? error : new Error('Failed to process image'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = fileUrl;
  });
}

/**
 * Generate a mask from image data based on opacity and color thresholds
 * @param imageFile - The image file to process
 * @param gridSize - Size of the grid (assumes square grid)
 * @param config - Configuration for mask detection
 * @returns Promise containing mask points
 */
export async function generateMaskFromImage(
  imageFile: File,
  gridSize: number,
  config: MaskConfig = {}
): Promise<{ [key: string]: boolean }> {
  return generateMaskFromImageWithDimensions(imageFile, gridSize, gridSize, config);
}

/**
 * Generate a mask from image data with separate width and height
 * @param imageFile - The image file to process
 * @param gridWidth - Width of the grid
 * @param gridHeight - Height of the grid
 * @param config - Configuration for mask detection
 * @returns Promise containing mask points
 */
export async function generateMaskFromImageWithDimensions(
  imageFile: File,
  gridWidth: number,
  gridHeight: number,
  config: MaskConfig = {}
): Promise<{ [key: string]: boolean }> {
  const { opacityThreshold = 100, whiteThreshold = 200 } = config;

  return new Promise((resolve, reject) => {
    // Validate input
    if (!imageFile.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    // Create an image element
    const img = new Image();
    const fileUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      try {
        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Calculate step sizes for sampling
        const stepX = img.width / gridWidth;
        const stepY = img.height / gridHeight;

        // Initialize mask data
        const maskData: { [key: string]: boolean } = {};

        // Check each grid position
        for (let row = 0; row < gridHeight; row++) {
          for (let col = 0; col < gridWidth; col++) {
            // Sample from the center of each grid cell
            const x = Math.floor(col * stepX + stepX / 2);
            const y = Math.floor(row * stepY + stepY / 2);
            
            // Get pixel data
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            
            // Check if pixel is inside the mask
            // - Must have sufficient opacity (not transparent)
            // - Must not be white (to support white backgrounds)
            const isInsideMask = 
              pixel[3] > opacityThreshold && 
              !(pixel[0] > whiteThreshold && 
                pixel[1] > whiteThreshold && 
                pixel[2] > whiteThreshold);
            
            maskData[`${row}-${col}`] = isInsideMask;
          }
        }

        // Clean up
        URL.revokeObjectURL(fileUrl);

        resolve(maskData);
      } catch (error) {
        URL.revokeObjectURL(fileUrl);
        reject(error instanceof Error ? error : new Error('Failed to process image'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = fileUrl;
  });
}

/**
 * Process image using existing canvas context (for compatibility with ImageUploader)
 * @param ctx - Canvas 2D context with image already drawn
 * @param img - The image element
 * @param gridWidth - Width of the grid
 * @param gridHeight - Height of the grid
 * @returns Color grid mapping
 */
export function processImageFromCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  gridWidth: number,
  gridHeight: number
): { [key: string]: string } {
  const stepX = img.width / gridWidth;
  const stepY = img.height / gridHeight;
  const colorGrid: { [key: string]: string } = {};

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const x = Math.floor(col * stepX + stepX / 2);
      const y = Math.floor(row * stepY + stepY / 2);
      const pixel = ctx.getImageData(x, y, 1, 1).data;

      const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
      colorGrid[`${row}-${col}`] = hexColor;
    }
  }

  return colorGrid;
}

/**
 * Generate mask from canvas context (for compatibility with ImageUploader)
 * @param ctx - Canvas 2D context with image already drawn
 * @param img - The image element
 * @param gridWidth - Width of the grid
 * @param gridHeight - Height of the grid
 * @param config - Configuration for mask detection
 * @returns Mask data mapping
 */
export function generateMaskFromCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  gridWidth: number,
  gridHeight: number,
  config: MaskConfig = {}
): { [key: string]: boolean } {
  const { opacityThreshold = 100, whiteThreshold = 200 } = config;
  const stepX = img.width / gridWidth;
  const stepY = img.height / gridHeight;
  const maskData: { [key: string]: boolean } = {};

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const x = Math.floor(col * stepX + stepX / 2);
      const y = Math.floor(row * stepY + stepY / 2);
      const pixel = ctx.getImageData(x, y, 1, 1).data;

      const isInsideMask = 
        pixel[3] > opacityThreshold && 
        !(pixel[0] > whiteThreshold && 
          pixel[1] > whiteThreshold && 
          pixel[2] > whiteThreshold);

      maskData[`${row}-${col}`] = isInsideMask;
    }
  }

  return maskData;
}

/**
 * Convert RGB values to hex color string
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Extract unique colors from a color grid
 * @param colorGrid - 2D array of hex colors
 * @returns Array of unique hex colors
 */
export function extractPaletteFromGrid(colorGrid: string[][]): string[] {
  const uniqueColors = new Set<string>();
  
  for (const row of colorGrid) {
    for (const color of row) {
      uniqueColors.add(color);
    }
  }
  
  return Array.from(uniqueColors);
}

/**
 * Convert pixel grid to 2D color array
 * @param pixelGrid - Object mapping position keys to colors
 * @param gridWidth - Width of the grid
 * @param gridHeight - Height of the grid
 * @returns 2D array of colors
 */
export function pixelGridToColorArray(
  pixelGrid: { [key: string]: string },
  gridWidth: number,
  gridHeight: number
): string[][] {
  const colorArray: string[][] = [];
  
  for (let row = 0; row < gridHeight; row++) {
    const gridRow: string[] = [];
    for (let col = 0; col < gridWidth; col++) {
      const key = `${row}-${col}`;
      gridRow.push(pixelGrid[key] || '#000000');
    }
    colorArray.push(gridRow);
  }
  
  return colorArray;
}