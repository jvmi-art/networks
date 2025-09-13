/** @format */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Circle3D } from '../entities/Circle3D';

interface CircleMeshProps {
  circle: Circle3D;
  mouseRay: THREE.Raycaster | null;
  theme: string;
}

/**
 * Single circle mesh component with mouse proximity effect
 */
export function CircleMesh({ circle, mouseRay, theme }: CircleMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);

  // Initialize materials properly on first render based on theme
  React.useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      if (material.transparent) {
        material.opacity = 0.9;
        material.needsUpdate = true;
      }
    }
    if (glowMeshRef.current && theme === 'dark') {
      const glowMaterial = glowMeshRef.current.material as THREE.MeshBasicMaterial;
      glowMaterial.opacity = 0.3; // Prominent base glow for dark mode
      glowMaterial.needsUpdate = true;
    }
  }, [theme]);

  useFrame(() => {
    if (meshRef.current) {
      // Calculate distance from ray to circle position
      if (mouseRay && meshRef.current.parent) {
        // Transform circle position to world space to account for parent rotation
        const worldPosition = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPosition);
        
        // Get the closest point on the ray to the circle's world position
        const closestPoint = new THREE.Vector3();
        mouseRay.ray.closestPointToPoint(worldPosition, closestPoint);
        const distance = worldPosition.distanceTo(closestPoint);

        // Consistent hover scale across all grid sizes
        const hoverScaleFactor = 3.0; // Fixed hover scale for consistency
        const maxDistance = 0.7; // Fixed hover distance for consistency
        circle.setTargetSizeFromDistance(distance, maxDistance, hoverScaleFactor);
      } else {
        circle.targetSize = circle.originalSize;
      }

      // Update circle physics
      circle.update();

      // Update mesh properties
      const scaleAmount = circle.size / circle.originalSize;
      meshRef.current.scale.setScalar(scaleAmount);

      // Adjust glow based on hover state
      const isHovering = scaleAmount > 1.2;

      // Update glow mesh if in dark mode and circle is enabled
      if (glowMeshRef.current && theme === 'dark' && circle.isEnabled) {
        const glowFactor = isHovering ? 1.63 : 1.37; // 20% larger (1.36 * 1.2 = 1.632 ≈ 1.63, 1.14 * 1.2 = 1.368 ≈ 1.37)
        glowMeshRef.current.scale.setScalar(scaleAmount * glowFactor);
        const glowMaterial = glowMeshRef.current.material as THREE.MeshBasicMaterial;
        glowMaterial.color.copy(circle.currentColor);
        glowMaterial.opacity = isHovering ? 0.4 : 0.3; // Prominent base and hover glow
      }

      const material = meshRef.current.material as THREE.MeshBasicMaterial;

      // Always update color to ensure animation works
      material.color.copy(circle.currentColor);

      // Only adjust opacity if material is transparent (light mode)
      if (material.transparent) {
        material.opacity = 1;
      }
    }
  });

  return (
    <group>
      {/* Glow effect for dark mode - only show if circle is enabled */}
      {theme === 'dark' && circle.isEnabled && (
        <mesh ref={glowMeshRef} position={circle.position}>
          <sphereGeometry args={[circle.originalSize, 16, 16]} />
          <meshBasicMaterial
            color={circle.originalColor}
            transparent={true}
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Main sphere */}
      <mesh ref={meshRef} position={circle.position}>
        <sphereGeometry args={[circle.originalSize, 16, 16]} />
        {theme === 'dark' ? (
          <meshBasicMaterial color={circle.originalColor} transparent={false} />
        ) : (
          <meshBasicMaterial color={circle.originalColor} transparent={true} opacity={0.9} />
        )}
      </mesh>
    </group>
  );
}