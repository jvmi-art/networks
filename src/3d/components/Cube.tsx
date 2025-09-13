/** @format */

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Circle3D } from '../entities/Circle3D';
import { CircleMesh } from './CircleMesh';
import { RoundedCubeFaces } from './RoundedCubeFaces';
import { MouseTracker } from './MouseTracker';
import { CameraController } from './CameraController';

interface CubeProps {
  circles: Circle3D[];
  theme: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orbitControlsRef: React.RefObject<any>;
  animationTarget: { position: THREE.Vector3; target: THREE.Vector3 } | null;
  onAnimationComplete: () => void;
  onSceneReady?: () => void;
}

/**
 * Main cube component - renders all circles with mouse tracking
 */
export function Cube({ 
  circles, 
  theme, 
  orbitControlsRef, 
  animationTarget, 
  onAnimationComplete, 
  onSceneReady 
}: CubeProps) {
  const [mouseRay, setMouseRay] = useState<THREE.Raycaster | null>(null);
  const hasCalledReady = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const rotationTime = useRef(0);
  
  // Auto-rotation and onSceneReady
  useFrame((_, delta) => {
    // Call onSceneReady once after first render
    if (!hasCalledReady.current && onSceneReady && circles.length > 0) {
      hasCalledReady.current = true;
      onSceneReady();
    }
    
    // Diagonal rotation that shows all 6 faces
    if (groupRef.current) {
      rotationTime.current += delta;
      
      // Use a diagonal axis rotation (1,1,0 normalized) 
      // This creates a rotation that naturally shows all 6 faces
      const speed = 0.15; // Reduced from 0.3 for slower rotation
      const angle = rotationTime.current * speed;
      
      // Set rotation using quaternion for smooth diagonal rotation
      // Rotating around the axis (1, 1, 0.5) shows all faces nicely
      const axis = new THREE.Vector3(1, 1, 0.5).normalize();
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      groupRef.current.quaternion.copy(quaternion);
    }
  });

  return (
    <group ref={groupRef}>
      <CameraController 
        orbitControlsRef={orbitControlsRef} 
        animationTarget={animationTarget}
        onAnimationComplete={onAnimationComplete} 
      />
      <MouseTracker onMouseMove={setMouseRay} />
      <RoundedCubeFaces theme={theme} />
      {circles.map((circle, index) => (
        <CircleMesh key={index} circle={circle} mouseRay={mouseRay} theme={theme} />
      ))}
    </group>
  );
}