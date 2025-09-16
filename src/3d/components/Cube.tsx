/** @format */

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Circle3D } from '../entities/Circle3D';
import { CircleMesh } from './CircleMesh';
import { RoundedCubeFaces } from './RoundedCubeFaces';
import { MouseTracker } from './MouseTracker';
import { CameraController } from './CameraController';
import { InteractiveCubeFaces } from './InteractiveCubeFaces';

interface CubeProps {
  circles: Circle3D[];
  theme: string;
  position?: [number, number, number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orbitControlsRef: React.RefObject<any>;
  animationTarget: { position: THREE.Vector3; target: THREE.Vector3 } | null;
  onAnimationComplete: () => void;
  onSceneReady?: () => void;
  index?: number;
  disableHover?: boolean;
  isEditMode?: boolean;
  onFaceClick?: (face: number) => void;
  selectedFragment?: string[][];
}

/**
 * Main cube component - renders all circles with mouse tracking
 */
export function Cube({ 
  circles, 
  theme, 
  position = [0, 0, 0],
  orbitControlsRef, 
  animationTarget, 
  onAnimationComplete, 
  onSceneReady,
  index = 0,
  disableHover = false,
  isEditMode = false,
  onFaceClick,
  selectedFragment
}: CubeProps) {
  const [mouseRay, setMouseRay] = useState<THREE.Raycaster | null>(null);
  const hasCalledReady = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const rotationTime = useRef(0);
  const [isRotationPaused, setIsRotationPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle cube click to pause rotation
  const handleCubeClick = (event: any) => {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }
    
    // Only handle if not in edit mode
    if (isEditMode) return;
    
    // Clear any existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    // Toggle rotation pause
    setIsRotationPaused(prev => !prev);
    
    // If we just paused, resume rotation after 3 seconds
    if (!isRotationPaused) {
      pauseTimeoutRef.current = setTimeout(() => {
        setIsRotationPaused(false);
      }, 3000);
    }
  };
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);
  
  // Auto-rotation and onSceneReady
  useFrame((_, delta) => {
    // Call onSceneReady once after first render (only for first cube)
    if (!hasCalledReady.current && onSceneReady && circles.length > 0 && index === 0) {
      hasCalledReady.current = true;
      onSceneReady();
    }
    
    // Diagonal rotation that shows all 6 faces (pause when clicked or in edit mode)
    if (groupRef.current && !isRotationPaused && !isEditMode) {
      rotationTime.current += delta;
      
      // Use different rotation axes for each cube for variety
      const rotationAxes = [
        new THREE.Vector3(1, 1, 0.5),
        new THREE.Vector3(1, 0.5, 1),
        new THREE.Vector3(0.5, 1, 1)
      ];
      
      // Use different speeds for each cube
      const speeds = [0.15, 0.12, 0.18];
      const speed = speeds[index % 3];
      const angle = rotationTime.current * speed;
      
      // Set rotation using quaternion for smooth diagonal rotation
      const axis = rotationAxes[index % 3].normalize();
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      groupRef.current.quaternion.copy(quaternion);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Only render camera controller for first cube */}
      {index === 0 && (
        <CameraController 
          orbitControlsRef={orbitControlsRef} 
          animationTarget={animationTarget}
          onAnimationComplete={onAnimationComplete} 
        />
      )}
      {/* Only render mouse tracker if hover is enabled */}
      {!disableHover && index === 0 && (
        <MouseTracker onMouseMove={setMouseRay} />
      )}
      <group onClick={handleCubeClick}>
        <RoundedCubeFaces theme={theme} />
      </group>
      <InteractiveCubeFaces 
        isEditMode={isEditMode}
        onFaceClick={onFaceClick}
        selectedFragment={selectedFragment}
      />
      {circles.map((circle, circleIndex) => (
        <CircleMesh 
          key={circleIndex} 
          circle={circle} 
          mouseRay={disableHover ? null : mouseRay} 
          theme={theme} 
        />
      ))}
    </group>
  );
}