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
  
  // Call onSceneReady once after first render
  useFrame(() => {
    if (!hasCalledReady.current && onSceneReady && circles.length > 0) {
      hasCalledReady.current = true;
      // Call immediately since circles are already rendered
      onSceneReady();
    }
  });

  return (
    <group>
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