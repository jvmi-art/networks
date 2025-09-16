/** @format */

import { useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

interface InteractiveCubeFacesProps {
  isEditMode: boolean;
  onFaceClick?: (face: number) => void;
  selectedFragment?: string[][];
}

/**
 * Interactive cube faces for edit mode - handles clicking on faces to apply fragments
 */
export function InteractiveCubeFaces({ 
  isEditMode, 
  onFaceClick,
  selectedFragment 
}: InteractiveCubeFacesProps) {
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  if (!isEditMode || !onFaceClick) {
    return null;
  }

  const handleClick = (face: number) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onFaceClick(face);
  };

  const handlePointerEnter = (face: number) => () => {
    if (isEditMode) {
      setHoveredFace(face);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerLeave = () => {
    setHoveredFace(null);
    document.body.style.cursor = 'auto';
  };

  // Face positions and rotations
  const faces = [
    { position: [0, 0, 1.01] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] }, // Front
    { position: [0, 0, -1.01] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] }, // Back
    { position: [1.01, 0, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] }, // Right
    { position: [-1.01, 0, 0] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] }, // Left
    { position: [0, 1.01, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] }, // Top
    { position: [0, -1.01, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] }, // Bottom
  ];

  return (
    <group>
      {faces.map((face, index) => (
        <mesh
          key={index}
          position={face.position}
          rotation={face.rotation}
          onClick={handleClick(index)}
          onPointerEnter={handlePointerEnter(index)}
          onPointerLeave={handlePointerLeave}
        >
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial 
            color={hoveredFace === index && selectedFragment ? '#4a90e2' : '#ffffff'}
            transparent
            opacity={hoveredFace === index ? 0.3 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* Show fragment preview on hovered face */}
      {hoveredFace !== null && selectedFragment && (
        <group position={faces[hoveredFace].position} rotation={faces[hoveredFace].rotation}>
          {selectedFragment.map((row, rowIndex) =>
            row.map((color, colIndex) => {
              const size = 0.3;
              const spacing = 0.35;
              const offsetX = (colIndex - 2) * spacing;
              const offsetY = -(rowIndex - 2) * spacing;
              
              return (
                <mesh
                  key={`${rowIndex}-${colIndex}`}
                  position={[offsetX, offsetY, 0.01]}
                >
                  <circleGeometry args={[size / 2, 16]} />
                  <meshBasicMaterial color={color} transparent opacity={0.7} />
                </mesh>
              );
            })
          )}
        </group>
      )}
    </group>
  );
}