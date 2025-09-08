/** @format */

import React, { useRef } from 'react';
import * as THREE from 'three';
import { mapToRoundedCubeArray } from '../utils/roundedCubeMapping';

interface RoundedCubeFacesProps {
  theme: string;
}

/**
 * Rounded cube with curved surfaces using a custom geometry
 */
export function RoundedCubeFaces({ theme }: RoundedCubeFacesProps) {
  const groupRef = useRef<THREE.Group>(null);

  const material = React.useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: theme === 'dark' ? '#000000' : '#ffffff',
        side: THREE.DoubleSide
      }),
    [theme]
  );

  // Create a rounded cube geometry using a parametric approach
  const roundedCubeGeometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const cubeSize = 2.0;
    const cornerRadius = 0.25; // Radius of corner rounding
    const faceRoundness = 0.35; // Amount of face curvature (0 = flat, 1 = sphere)
    const segments = 32; // Number of segments for smoothness

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    // Generate vertices for each face with curvature
    const generateFace = (
      normal: [number, number, number],
      up: [number, number, number],
      right: [number, number, number],
      offset: number
    ) => {
      const baseIndex = vertices.length / 3;

      for (let v = 0; v <= segments; v++) {
        for (let u = 0; u <= segments; u++) {
          // Calculate position on flat face
          const uNorm = (u / segments) * 2 - 1;
          const vNorm = (v / segments) * 2 - 1;

          const x = normal[0] * offset + right[0] * uNorm + up[0] * vNorm;
          const y = normal[1] * offset + right[1] * uNorm + up[1] * vNorm;
          const z = normal[2] * offset + right[2] * uNorm + up[2] * vNorm;

          // Map to rounded surface
          const [rx, ry, rz] = mapToRoundedCubeArray(x, y, z, cubeSize, cornerRadius, faceRoundness);

          vertices.push(rx, ry, rz);

          // Calculate normal for the curved surface
          const len = Math.sqrt(rx * rx + ry * ry + rz * rz);
          normals.push(rx / len, ry / len, rz / len);

          // Create indices for triangles
          if (u < segments && v < segments) {
            const a = baseIndex + v * (segments + 1) + u;
            const b = baseIndex + v * (segments + 1) + u + 1;
            const c = baseIndex + (v + 1) * (segments + 1) + u;
            const d = baseIndex + (v + 1) * (segments + 1) + u + 1;

            indices.push(a, b, c);
            indices.push(b, d, c);
          }
        }
      }
    };

    // Generate all 6 faces
    generateFace([0, 0, 1], [0, 1, 0], [1, 0, 0], 1); // Front
    generateFace([0, 0, -1], [0, 1, 0], [-1, 0, 0], 1); // Back
    generateFace([1, 0, 0], [0, 1, 0], [0, 0, -1], 1); // Right
    generateFace([-1, 0, 0], [0, 1, 0], [0, 0, 1], 1); // Left
    generateFace([0, 1, 0], [0, 0, -1], [1, 0, 0], 1); // Top
    generateFace([0, -1, 0], [0, 0, 1], [1, 0, 0], 1); // Bottom

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);

    return geometry;
  }, []);

  return (
    <group ref={groupRef}>
      <mesh geometry={roundedCubeGeometry} material={material} />
    </group>
  );
}