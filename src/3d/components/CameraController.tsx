/** @format */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orbitControlsRef: React.RefObject<any>;
  animationTarget: { position: THREE.Vector3; target: THREE.Vector3 } | null;
  onAnimationComplete: () => void;
}

/**
 * Camera controller component for smooth animations to any target
 */
export function CameraController({ 
  orbitControlsRef, 
  animationTarget,
  onAnimationComplete 
}: CameraControllerProps) {
  const isAnimating = useRef(false);
  const animationStartTime = useRef(0);
  const startSpherical = useRef(new THREE.Spherical());
  const targetSpherical = useRef(new THREE.Spherical());
  const currentSpherical = useRef(new THREE.Spherical());
  const startTarget = useRef(new THREE.Vector3());
  const currentTargetTarget = useRef(new THREE.Vector3());
  
  useFrame(({ clock }) => {
    if (animationTarget && orbitControlsRef.current && !isAnimating.current) {
      // Start animation - capture starting positions
      isAnimating.current = true;
      animationStartTime.current = clock.elapsedTime;
      
      // Convert current camera position to spherical coordinates
      const currentPos = orbitControlsRef.current.object.position.clone();
      const target = orbitControlsRef.current.target.clone();
      const relativePos = currentPos.sub(target);
      startSpherical.current.setFromVector3(relativePos);
      
      // Convert target position to spherical coordinates
      const targetPos = animationTarget.position.clone();
      const targetCenter = animationTarget.target.clone();
      const relativeTarget = targetPos.sub(targetCenter);
      targetSpherical.current.setFromVector3(relativeTarget);
      
      // Store targets
      startTarget.current.copy(orbitControlsRef.current.target);
      currentTargetTarget.current.copy(animationTarget.target);
    }
    
    if (isAnimating.current && orbitControlsRef.current) {
      // Calculate animation progress
      const elapsed = clock.elapsedTime - animationStartTime.current;
      const duration = 1.2; // 1.2 seconds for smooth animation
      const rawT = Math.min(elapsed / duration, 1);
      
      // Smooth ease-in-out curve
      const t = rawT < 0.5 
        ? 2 * rawT * rawT 
        : -1 + (4 - 2 * rawT) * rawT;
      
      // Interpolate spherical coordinates for smooth rotation
      currentSpherical.current.theta = THREE.MathUtils.lerp(
        startSpherical.current.theta,
        targetSpherical.current.theta,
        t
      );
      currentSpherical.current.phi = THREE.MathUtils.lerp(
        startSpherical.current.phi,
        targetSpherical.current.phi,
        t
      );
      currentSpherical.current.radius = THREE.MathUtils.lerp(
        startSpherical.current.radius,
        targetSpherical.current.radius,
        t
      );
      
      // Convert back to Cartesian coordinates
      const newPosition = new THREE.Vector3();
      newPosition.setFromSpherical(currentSpherical.current);
      
      // Interpolate the target/center point
      const currentCenter = new THREE.Vector3();
      currentCenter.lerpVectors(startTarget.current, currentTargetTarget.current, t);
      
      // Apply the position relative to the center
      newPosition.add(currentCenter);
      orbitControlsRef.current.object.position.copy(newPosition);
      orbitControlsRef.current.target.copy(currentCenter);
      
      // Update the controls
      orbitControlsRef.current.update();
      
      // Check if animation is complete
      if (rawT >= 1) {
        // Ensure we're exactly at the target position
        const finalPos = new THREE.Vector3().setFromSpherical(targetSpherical.current);
        finalPos.add(currentTargetTarget.current);
        orbitControlsRef.current.object.position.copy(finalPos);
        orbitControlsRef.current.target.copy(currentTargetTarget.current);
        orbitControlsRef.current.update();
        
        // Animation complete - delay slightly to avoid stutter
        setTimeout(() => {
          isAnimating.current = false;
          onAnimationComplete();
        }, 50);
      }
    }
  });
  
  return null;
}