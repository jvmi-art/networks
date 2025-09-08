/** @format */

/**
 * Generates a 2D pattern of enabled/disabled cells based on 5x5 chunks
 * @param gridWidth - Width of the grid
 * @param gridHeight - Height of the grid
 * @param fillPercentage - Percentage of chunks to enable (0-100)
 * @returns 2D array of boolean values indicating enabled state
 */
export const generateChunkPattern = (
  gridWidth: number,
  gridHeight: number,
  fillPercentage: number
): boolean[][] => {
  const CHUNK_SIZE = 5;
  
  // Initialize the pattern array
  const pattern: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(true));
  
  // If fill is 100%, return all enabled
  if (fillPercentage >= 100) {
    return pattern;
  }
  
  // If fill is 0%, return all disabled
  if (fillPercentage <= 0) {
    return pattern.map(row => row.map(() => false));
  }
  
  // Calculate number of chunks
  const chunksX = Math.ceil(gridWidth / CHUNK_SIZE);
  const chunksY = Math.ceil(gridHeight / CHUNK_SIZE);
  const totalChunks = chunksX * chunksY;
  
  // Calculate how many chunks should be enabled
  const enabledChunks = Math.round((fillPercentage / 100) * totalChunks);
  
  // Create array of chunk indices and shuffle
  const chunkIndices: number[] = [];
  for (let i = 0; i < totalChunks; i++) {
    chunkIndices.push(i);
  }
  
  // Fisher-Yates shuffle
  for (let i = chunkIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chunkIndices[i], chunkIndices[j]] = [chunkIndices[j], chunkIndices[i]];
  }
  
  // Select chunks to enable
  const enabledChunkIndices = new Set(chunkIndices.slice(0, enabledChunks));
  
  // Apply chunk pattern to grid
  for (let chunkY = 0; chunkY < chunksY; chunkY++) {
    for (let chunkX = 0; chunkX < chunksX; chunkX++) {
      const chunkIndex = chunkY * chunksX + chunkX;
      const isEnabled = enabledChunkIndices.has(chunkIndex);
      
      // Apply to all cells in this chunk
      const startY = chunkY * CHUNK_SIZE;
      const endY = Math.min(startY + CHUNK_SIZE, gridHeight);
      const startX = chunkX * CHUNK_SIZE;
      const endX = Math.min(startX + CHUNK_SIZE, gridWidth);
      
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          pattern[y][x] = isEnabled;
        }
      }
    }
  }
  
  return pattern;
};

/**
 * Maps a grid position to its chunk pattern value for a given face
 * @param face - Cube face index (0-5)
 * @param row - Row position on the face
 * @param col - Column position on the face
 * @param pattern - The chunk pattern array
 * @returns Whether the position is enabled
 */
export const getChunkPatternValue = (
  face: number,
  row: number,
  col: number,
  pattern: boolean[][]
): boolean => {
  // Ensure we have a valid pattern
  if (!pattern || pattern.length === 0 || !pattern[0]) {
    return true; // Default to enabled if no pattern
  }
  
  // Use the same pattern on face 0, and default others to true for now
  // This will be replaced by generateCubeChunkPattern
  if (face === 0) {
    const patternRow = row % pattern.length;
    const patternCol = col % pattern[0].length;
    return pattern[patternRow][patternCol];
  }
  
  return true;
};

/**
 * Generates a 3D chunk pattern for the entire cube
 * @param gridWidth - Width of each face
 * @param gridHeight - Height of each face
 * @param fillPercentage - Percentage of the entire cube to enable (0-100)
 * @returns Array of 6 2D boolean arrays, one for each face
 */
export const generateCubeChunkPattern = (
  gridWidth: number,
  gridHeight: number,
  fillPercentage: number
): boolean[][][] => {
  const CHUNK_SIZE = 5;
  const NUM_FACES = 6;
  
  // Initialize patterns for all 6 faces
  const facePatterns: boolean[][][] = [];
  for (let face = 0; face < NUM_FACES; face++) {
    const pattern: boolean[][] = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(true));
    facePatterns.push(pattern);
  }
  
  // If fill is 100%, return all enabled
  if (fillPercentage >= 100) {
    return facePatterns;
  }
  
  // If fill is 0%, return all disabled
  if (fillPercentage <= 0) {
    return facePatterns.map(facePattern =>
      facePattern.map(row => row.map(() => false))
    );
  }
  
  // Calculate total number of chunks across all faces
  const chunksX = Math.ceil(gridWidth / CHUNK_SIZE);
  const chunksY = Math.ceil(gridHeight / CHUNK_SIZE);
  const chunksPerFace = chunksX * chunksY;
  const totalChunks = chunksPerFace * NUM_FACES;
  
  // Calculate how many chunks should be enabled
  const enabledChunks = Math.round((fillPercentage / 100) * totalChunks);
  
  // Create array of all chunk indices across all faces and shuffle
  const allChunkIndices: { face: number; chunkIndex: number }[] = [];
  for (let face = 0; face < NUM_FACES; face++) {
    for (let i = 0; i < chunksPerFace; i++) {
      allChunkIndices.push({ face, chunkIndex: i });
    }
  }
  
  // Fisher-Yates shuffle
  for (let i = allChunkIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChunkIndices[i], allChunkIndices[j]] = [allChunkIndices[j], allChunkIndices[i]];
  }
  
  // Select chunks to enable
  const enabledChunkSet = new Set(allChunkIndices.slice(0, enabledChunks));
  
  // Apply chunk patterns to each face
  enabledChunkSet.forEach(({ face, chunkIndex }) => {
    const chunkY = Math.floor(chunkIndex / chunksX);
    const chunkX = chunkIndex % chunksX;
    
    // Apply to all cells in this chunk
    const startY = chunkY * CHUNK_SIZE;
    const endY = Math.min(startY + CHUNK_SIZE, gridHeight);
    const startX = chunkX * CHUNK_SIZE;
    const endX = Math.min(startX + CHUNK_SIZE, gridWidth);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        facePatterns[face][y][x] = true;
      }
    }
  });
  
  // Set all non-enabled chunks to false
  for (let face = 0; face < NUM_FACES; face++) {
    for (let chunkIndex = 0; chunkIndex < chunksPerFace; chunkIndex++) {
      // Check if this specific chunk is in the enabled set
      const shouldBeEnabled = Array.from(enabledChunkSet).some(
        item => item.face === face && item.chunkIndex === chunkIndex
      );
      
      if (!shouldBeEnabled) {
        const chunkY = Math.floor(chunkIndex / chunksX);
        const chunkX = chunkIndex % chunksX;
        
        const startY = chunkY * CHUNK_SIZE;
        const endY = Math.min(startY + CHUNK_SIZE, gridHeight);
        const startX = chunkX * CHUNK_SIZE;
        const endX = Math.min(startX + CHUNK_SIZE, gridWidth);
        
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            facePatterns[face][y][x] = false;
          }
        }
      }
    }
  }
  
  return facePatterns;
};