/** @format */

import { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MouseTrackerProps {
  onMouseMove: (ray: THREE.Raycaster | null) => void;
}

/**
 * Mouse tracking component that projects mouse to 3D space
 */
export function MouseTracker({ onMouseMove }: MouseTrackerProps) {
  const [hasMouseEntered, setHasMouseEntered] = useState(false);

  useFrame((state) => {
    // Only track mouse if it has entered the canvas area
    if (hasMouseEntered) {
      state.raycaster.setFromCamera(state.pointer, state.camera);
      onMouseMove(state.raycaster);
    } else {
      onMouseMove(null);
    }
  });

  // Handle mouse enter/leave events on the canvas
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const handleMouseEnter = () => setHasMouseEntered(true);
    const handleMouseLeave = () => setHasMouseEntered(false);

    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return null;
}