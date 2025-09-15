/** @format */

import React, { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useCanvasSettings } from '../../contexts/CanvasSettingsContext';
import { useTheme } from '../../theme/theme-provider';
import { useColorAnimation } from '../../hooks/useColorAnimation';
import { generateCubeChunkPattern } from '../../utils/chunkPattern';
import AnimatedLogo from '../../components/AnimatedLogo';
import { Circle3D } from '../entities/Circle3D';
import { Cube } from './Cube';
import { mapToRoundedCube } from '../utils/roundedCubeMapping';


// Main ThreeDimensionalCanvas component
interface ThreeDimensionalCanvasProps {
  customGridColors?: string[][];
  isEditMode?: boolean;
  colorPalette?: string[];
  hideControls?: boolean;
  randomColorAnimation?: boolean;
  useRandomColors?: boolean;
  onFaceClick?: (face: number) => void;
  selectedFragment?: string[][];
}

const ThreeDimensionalCanvas: React.FC<ThreeDimensionalCanvasProps> = ({
  customGridColors,
  isEditMode = false,
  colorPalette,
  randomColorAnimation = false,
  useRandomColors = false,
  onFaceClick,
  selectedFragment
}) => {
  const { settings } = useCanvasSettings();
  const { theme } = useTheme();
  const blockCount = settings.blockCount || 3;
  const [cubeCircles, setCubeCircles] = useState<Circle3D[][]>(() => 
    Array(blockCount).fill(null).map(() => [])
  );
  const [faceColors, setFaceColors] = useState<{ [key: number]: string[][] }>({});
  const [cubeChunkPattern, setCubeChunkPattern] = useState<boolean[][][]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitControlsRef = useRef<any>(null);
  const [, setIsAnimating] = useState(false);
  const [animationTarget, setAnimationTarget] = useState<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const [isSceneLoading, setIsSceneLoading] = useState(true);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  const [loadingExiting, setLoadingExiting] = useState(false);
  const [foregroundFading, setForegroundFading] = useState(false);
  const loadingStartTime = useRef(Date.now());
  const isFirstLoad = useRef(true);
  
  // Generate cube-wide chunk pattern when fillPercentage changes
  React.useEffect(() => {
    const gridWidth = settings.gridWidth || settings.gridSize;
    const gridHeight = settings.gridHeight || settings.gridSize;
    const patterns = generateCubeChunkPattern(gridWidth, gridHeight, settings.fillPercentage);
    setCubeChunkPattern(patterns);
  }, [settings.fillPercentage, settings.gridSize, settings.gridWidth, settings.gridHeight]);

  // Handle applying fragment to a face
  const handleFaceClick = useCallback((face: number) => {
    if (!selectedFragment || !onFaceClick) return;
    
    // Store the fragment colors for this face
    setFaceColors(prev => ({
      ...prev,
      [face]: selectedFragment
    }));
    
    // Update the circles on this face with fragment colors
    const gridWidth = settings.gridWidth || settings.gridSize;
    const gridHeight = settings.gridHeight || settings.gridSize;
    
    // For each cube, update the circles on the clicked face
    setCubeCircles(prevCubeCircles => {
      return prevCubeCircles.map((circles) => {
        // Update circles that belong to the clicked face
        circles.forEach((circle) => {
          if (circle.face === face) {
            const row = circle.row || 0;
            const col = circle.col || 0;
            
            // Apply fragment color if within 5x5 bounds (fragments are 5x5)
            if (row < 5 && col < 5 && selectedFragment[row] && selectedFragment[row][col]) {
              const newColor = selectedFragment[row][col];
              circle.setColor(newColor);
            }
          }
        });
        
        return circles;
      });
    });
    
    if (onFaceClick) {
      onFaceClick(face);
    }
  }, [selectedFragment, onFaceClick, settings.gridWidth, settings.gridHeight, settings.gridSize]);
  
  // Generate circles for all 6 faces of a single cube following the curved surface
  const generateCubeCircles = useCallback(() => {
    const newCircles: Circle3D[] = [];
    const positionMap = new Map<string, Circle3D>();
    // Use the same grid dimensions as P5Canvas
    const gridWidth = settings.gridWidth || settings.gridSize;
    const gridHeight = settings.gridHeight || settings.gridSize;
    const cubeSize = 2;
    const cornerRadius = 0.25; // Same corner radius as the cube geometry
    const faceRoundness = 0.35; // Same face roundness as the cube geometry

    // Dynamic padding and sizing based on grid dimensions
    const maxDimension = Math.max(gridWidth, gridHeight);

    // Less padding for 5x5 to maximize circle size
    // 5x5: 8% padding, 10x10: 7% padding, 15x15: 5%, 20x20: 3.5%, 25x25: 2.5%
    const paddingRatio =
      maxDimension <= 5
        ? 0.12
        : maxDimension <= 10
        ? 0.07
        : maxDimension <= 15
        ? 0.05
        : maxDimension <= 20
        ? 0.04
        : 0.033;
    const effectiveSize = cubeSize * (1 - 2 * paddingRatio);

    // Calculate spacing between circles
    const spacing = effectiveSize / (maxDimension - 1);

    // Dynamic circle size calculation
    const baseCircleSizeFactor = theme === 'light' ? 0.36 : 0.324;

    // Bigger circles for 5x5 to minimize gaps
    // 5x5: factor = 0.95, 10x10: factor = 0.85, 15x15: factor = 0.88, 20x20: factor = 0.94, 25x25: factor = 1.0
    const sizeScaleFactor =
      maxDimension <= 5
        ? 0.85
        : maxDimension <= 10
        ? 0.85
        : maxDimension <= 15
        ? 0.88
        : maxDimension <= 20
        ? 0.94
        : 1.0;
    const circleSize = spacing * baseCircleSizeFactor * sizeScaleFactor;

    // Offset to center the padded grid
    const offset = effectiveSize / 2;


    // Generate circles for each face following the curved surface
    for (let face = 0; face < 6; face++) {
      for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
          // Calculate position within the padded grid area
          // Handle edge case when grid dimension is 1
          const u = gridWidth === 1 ? 0 : (col / (gridWidth - 1)) * effectiveSize - offset;
          const v = gridHeight === 1 ? 0 : (row / (gridHeight - 1)) * effectiveSize - offset;

          // Position circles on the cube face
          const faceOffset = cubeSize / 2;
          let x = 0,
            y = 0,
            z = 0;

          switch (face) {
            case 0: // Front face
              x = u;
              y = -v;
              z = faceOffset;
              break;
            case 1: // Back face
              x = -u;
              y = -v;
              z = -faceOffset;
              break;
            case 2: // Right face
              x = faceOffset;
              y = -v;
              z = -u;
              break;
            case 3: // Left face
              x = -faceOffset;
              y = -v;
              z = u;
              break;
            case 4: // Top face
              x = u;
              y = faceOffset;
              z = v;
              break;
            case 5: // Bottom face
              x = u;
              y = -faceOffset;
              z = -v;
              break;
          }

          // Map the flat position to the curved surface
          const curvedPos = mapToRoundedCube(x, y, z, cubeSize, cornerRadius, faceRoundness);

          // Position circles exactly on the surface (half in, half out)
          const pushOutFactor = 1.0; // No push out - circles sit exactly on the surface
          curvedPos.x *= pushOutFactor;
          curvedPos.y *= pushOutFactor;
          curvedPos.z *= pushOutFactor;

          // Create a key for position deduplication (rounded to avoid floating point issues)
          const posKey = `${Math.round(curvedPos.x * 1000)},${Math.round(
            curvedPos.y * 1000
          )},${Math.round(curvedPos.z * 1000)}`;

          // Skip if we already have a circle at this position
          if (positionMap.has(posKey)) {
            continue;
          }

          // Generate truly random color if useRandomColors is true, otherwise use palette
          let color: string;
          if (useRandomColors) {
            // Generate a completely random hex color
            color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
          } else if (colorPalette) {
            // Use color from palette
            color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
          } else {
            // Fallback to random color
            color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
          }

          // Determine if this circle should be enabled based on cube chunk pattern
          let isEnabled = true;
          if (cubeChunkPattern.length > 0 && 
              cubeChunkPattern[face] && 
              cubeChunkPattern[face][row] && 
              cubeChunkPattern[face][row][col] !== undefined) {
            isEnabled = cubeChunkPattern[face][row][col];
          }

          // Check if we have a saved fragment for this face
          let finalColor = color;
          if (faceColors[face] && row < 5 && col < 5 && faceColors[face][row] && faceColors[face][row][col]) {
            finalColor = faceColors[face][row][col];
          }
          
          const circle = new Circle3D(curvedPos.x, curvedPos.y, curvedPos.z, circleSize, finalColor, isEnabled);
          circle.face = face;
          circle.row = row;
          circle.col = col;
          
          // Set the disabled color based on theme
          if (!isEnabled) {
            circle.setEnabled(false, theme);
          }
          
          // Setup animation but don't start it yet
          // Configuration for circle animation timing
          const CIRCLE_ANIMATION_CONFIG = {
            targetTotalTime: 1000,  // Target total time for all circles to animate (1s)
            minDelay: 0,           // Minimum delay for any circle
          };
          
          // Scale max delay inversely with grid size
          // This ensures larger grids animate faster per circle
          const maxDelay = Math.max(
            200, // Minimum 200ms max delay
            Math.min(
              CIRCLE_ANIMATION_CONFIG.targetTotalTime,
              CIRCLE_ANIMATION_CONFIG.targetTotalTime * (25 / Math.max(gridWidth, 10))
            )
          );
          
          const randomDelay = Math.random() * maxDelay;
          circle.startEnterAnimation(randomDelay, theme, false); // false = don't start immediately
          positionMap.set(posKey, circle);
          newCircles.push(circle);
        }
      }
    }

    return newCircles;
  }, [
    settings.gridSize,
    settings.gridWidth,
    settings.gridHeight,
    customGridColors,
    theme,
    colorPalette,
    cubeChunkPattern,
    faceColors
  ]);

  // Initialize circles for all cubes based on blockCount
  React.useEffect(() => {
    const allCubeCircles: Circle3D[][] = [];
    
    // Generate circles for each cube
    for (let i = 0; i < blockCount; i++) {
      const circles = generateCubeCircles();
      allCubeCircles.push(circles);
    }
    
    setCubeCircles(allCubeCircles);
    setSceneInitialized(true);
    
    // If this is not the first load, trigger animations immediately
    if (!isFirstLoad.current) {
      setTimeout(() => {
        allCubeCircles.forEach(circles => {
          circles.forEach(circle => {
            circle.triggerAnimation();
          });
        });
      }, 100);
    }
  }, [generateCubeCircles, blockCount]);
  
  // Handle scene ready callback from Cube component
  const handleSceneReady = useCallback(() => {
    // Calculate time elapsed since loading started
    const elapsed = Date.now() - loadingStartTime.current;
    
    // Configuration for consistent timing across all grid sizes
    const LOADING_CONFIG = {
      logoDisplayTime: 1000,        // How long logo shows before fade
      logoFadeTime: 300,            // Logo fade out duration
      panelSplitTime: 800,          // Panel split animation duration
      circleAnimationDelay: -400,   // Start circles 400ms BEFORE panels finish (negative = early)
    };
    
    // Total time for loading sequence (before circles animate)
    const totalLoadingTime = 
      LOADING_CONFIG.logoDisplayTime + 
      LOADING_CONFIG.logoFadeTime + 
      LOADING_CONFIG.panelSplitTime;
    
    // Calculate remaining time to wait
    const remainingTime = Math.max(0, totalLoadingTime - elapsed);
    
    // Wait for minimum time
    setTimeout(() => {
      // First fade out the foreground content
      setForegroundFading(true);
      
      // Then start the split animation
      setTimeout(() => {
        setLoadingExiting(true);
        
        // Trigger circles early (while panels are still sliding)
        const circleDelay = Math.max(0, LOADING_CONFIG.panelSplitTime + LOADING_CONFIG.circleAnimationDelay);
        setTimeout(() => {
          cubeCircles.forEach(circles => {
            circles.forEach(circle => {
              circle.triggerAnimation();
            });
          });
        }, circleDelay);
        
        // Hide loading screen after panel animation completes
        setTimeout(() => {
          setIsSceneLoading(false);
          // Mark that first load is complete
          isFirstLoad.current = false;
        }, LOADING_CONFIG.panelSplitTime);
      }, LOADING_CONFIG.logoFadeTime);
    }, remainingTime);
  }, [cubeCircles]);

  // Update circle enabled states when pattern or theme changes
  React.useEffect(() => {
    cubeCircles.forEach(circles => {
      circles.forEach((circle, index) => {
      // Calculate which face, row, col this circle belongs to
      const gridWidth = settings.gridWidth || settings.gridSize;
      const gridHeight = settings.gridHeight || settings.gridSize;
      const circlesPerFace = gridWidth * gridHeight;
      const face = Math.floor(index / circlesPerFace);
      const positionOnFace = index % circlesPerFace;
      const row = Math.floor(positionOnFace / gridWidth);
      const col = positionOnFace % gridWidth;
      
      let shouldBeEnabled = true;
      if (cubeChunkPattern.length > 0 && 
          cubeChunkPattern[face] && 
          cubeChunkPattern[face][row] && 
          cubeChunkPattern[face][row][col] !== undefined) {
        shouldBeEnabled = cubeChunkPattern[face][row][col];
      }
      
      if (circle.isEnabled !== shouldBeEnabled) {
        circle.setEnabled(shouldBeEnabled, theme);
        // If we're enabling a circle that was disabled and animations have already run,
        // trigger its animation
        if (shouldBeEnabled && !isFirstLoad.current && circle.enterStartTime === 0) {
          circle.triggerAnimation();
        }
      }
      });
    });
  }, [cubeChunkPattern, theme, cubeCircles, settings.gridSize, settings.gridWidth, settings.gridHeight]);

  // Use the color animation hook for all circles combined
  // For random palette, generate random colors on the fly
  const allCircles = React.useMemo(() => {
    return cubeCircles.flat();
  }, [cubeCircles]);
  
  useColorAnimation({
    circles: allCircles,
    colorPalette: useRandomColors ? undefined : colorPalette,
    isAnimating: randomColorAnimation,
    transitionSpeed: 0.15,
    intervalRange: { min: 400, max: 600 }
  });

  const backgroundColor = theme === 'light' ? '#ffffff' : '#000000';

  // Calculate dynamic camera distance based on screen size and block count
  const calculateCameraDistance = useCallback(() => {
    const minDimension = Math.min(window.innerWidth, window.innerHeight);
    const maxDimension = Math.max(window.innerWidth, window.innerHeight);
    
    // Base distance that scales with block count
    // Formula: base + (blockCount - 1) * spacing factor
    let baseDistance = 4 + (blockCount - 1) * 1.5;
    
    // Adjust for very small screens (mobile)
    if (minDimension < 600) {
      baseDistance = baseDistance + 1;
    }
    // Adjust for tablets
    else if (minDimension < 1024) {
      baseDistance = baseDistance + 0.5;
    }
    
    // Further adjust based on aspect ratio
    const aspectRatio = maxDimension / minDimension;
    if (aspectRatio > 2) {
      // Ultra-wide or tall screens need more distance
      baseDistance *= 1.15;
    }
    
    // Cap maximum distance for better view
    baseDistance = Math.min(baseDistance, 20);
    
    return [baseDistance, baseDistance, baseDistance];
  }, [blockCount]);

  const [cameraPosition, setCameraPosition] = useState(() => calculateCameraDistance());

  // Update camera position on resize
  React.useEffect(() => {
    const handleResize = () => {
      setCameraPosition(calculateCameraDistance());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCameraDistance]);

  // Window resize is handled by the Canvas component itself

  // Always use full viewport
  const canvasStyle = { width: '100vw', height: '100vh' };

  // Called when any animation completes
  const handleAnimationComplete = useCallback(() => {
    // Small delay to ensure smooth transition
    requestAnimationFrame(() => {
      if (orbitControlsRef.current) {
        // Restore auto-rotate setting after animation
        orbitControlsRef.current.autoRotate = settings.autoRotateCamera;
        orbitControlsRef.current.update();
      }
      setIsAnimating(false);
      setAnimationTarget(null);
    });
  }, [settings.autoRotateCamera]);


  return (
    <div className="fixed inset-0 w-screen h-screen">
      <div style={canvasStyle} className="relative overflow-hidden">
        {/* Loading screen with split panel animation */}
        {isSceneLoading && (
          <div className="absolute inset-0 z-50">
            {/* Top panel - just solid color */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/2"
              style={{ 
                backgroundColor: theme === 'light' ? '#ffffff' : '#000000',
                transform: loadingExiting ? 'translateY(-100%)' : 'translateY(0)',
                transition: 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)'
              }}
            />
            
            {/* Bottom panel - just solid color */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1/2"
              style={{ 
                backgroundColor: theme === 'light' ? '#ffffff' : '#000000',
                transform: loadingExiting ? 'translateY(100%)' : 'translateY(0)',
                transition: 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)'
              }}
            />
            
            {/* Center divider line */}
            <div 
              className="absolute left-0 right-0 h-px"
              style={{ 
                top: '50%',
                backgroundColor: theme === 'light' ? '#e5e5e5' : '#333333',
                opacity: loadingExiting ? 0 : 0.3,
                transition: 'opacity 0.3s ease-out'
              }}
            />
            
            {/* Loading content - absolutely positioned in center */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                opacity: foregroundFading ? 0 : 1,
                transition: 'opacity 0.3s ease-out',
                color: theme === 'light' ? '#000000' : '#ffffff'
              }}
            >
              <AnimatedLogo size={150} />
            </div>
          </div>
        )}
        <Canvas 
          camera={{ position: cameraPosition as [number, number, number], fov: 45 }} 
          style={{ 
            background: backgroundColor,
            opacity: sceneInitialized ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          {/* Starfield background */}
          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={8}
            saturation={0}
            fade={true}
            speed={0.5}
          />

          <OrbitControls
            ref={orbitControlsRef}
            enableZoom={true}
            enablePan={false}
            minDistance={5}
            maxDistance={20}
            autoRotate={settings.autoRotateCamera && !isEditMode}
            autoRotateSpeed={0.5}
            enableDamping={true}
            dampingFactor={0.05}
          />

          <ambientLight intensity={theme === 'light' ? 1.0 : 0.6} />
          <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 0.5 : 0.8} />

          {/* Render cubes with dynamic positioning */}
          {cubeCircles.map((circles, index) => {
            // Dynamic spacing based on block count
            const spacing = blockCount === 1 ? 0 : Math.min(3.5, 12 / (blockCount - 1));
            
            // Center the cubes around origin
            const totalWidth = (blockCount - 1) * spacing;
            const xPosition = index * spacing - totalWidth / 2;
            
            return (
              <Cube 
                key={index}
                circles={circles} 
                theme={theme}
                position={[xPosition, 0, 0]}
                orbitControlsRef={orbitControlsRef}
                animationTarget={animationTarget}
                onAnimationComplete={handleAnimationComplete}
                onSceneReady={index === 0 ? handleSceneReady : undefined}
                index={index}
                disableHover={blockCount > 1 || isEditMode} // Disable hover when multiple blocks or in edit mode
                isEditMode={isEditMode}
                onFaceClick={handleFaceClick}
                selectedFragment={selectedFragment}
              />
            );
          })}
        </Canvas>
      </div>
    </div>
  );
};

export default ThreeDimensionalCanvas;
