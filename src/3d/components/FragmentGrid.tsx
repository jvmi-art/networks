/** @format */

import { useMemo } from 'react';
import * as THREE from 'three';

interface FragmentGridProps {
  visible: boolean;
  onCellClick?: (face: number, row: number, col: number) => void;
  onCellHover?: (face: number | null, row: number | null, col: number | null) => void;
  hoverPreview?: {face: number, row: number, col: number} | null;
}

/**
 * Component that renders a visual grid overlay showing the 5x5 fragment sections
 */
export function FragmentGrid({ visible, onCellClick, onCellHover, hoverPreview }: FragmentGridProps) {
  if (!visible) return null;

  // Create grid lines for each face
  const gridLines = useMemo(() => {
    const lines: React.JSX.Element[] = [];
    const cubeSize = 2;
    const gridSize = 5; // 5x5 grid
    const cellSize = cubeSize / gridSize;
    
    // Define the 6 faces - slightly offset from cube surface for visibility
    const offset = 0.1; // Offset to ensure grid is in front of cube
    const faces = [
      { normal: [0, 0, 1], position: [0, 0, cubeSize/2 + offset] },   // Front
      { normal: [0, 0, -1], position: [0, 0, -cubeSize/2 - offset] }, // Back
      { normal: [1, 0, 0], position: [cubeSize/2 + offset, 0, 0] },   // Right
      { normal: [-1, 0, 0], position: [-cubeSize/2 - offset, 0, 0] }, // Left
      { normal: [0, 1, 0], position: [0, cubeSize/2 + offset, 0] },   // Top
      { normal: [0, -1, 0], position: [0, -cubeSize/2 - offset, 0] }  // Bottom
    ];

    faces.forEach((face, faceIndex) => {
      // Create grid lines for this face
      const points: THREE.Vector3[] = [];
      
      // Determine the axes for this face
      let u = new THREE.Vector3();
      let v = new THREE.Vector3();
      
      if (Math.abs(face.normal[1]) === 1) {
        // Top or bottom face
        u.set(1, 0, 0);
        v.set(0, 0, face.normal[1] === 1 ? 1 : -1);
      } else if (Math.abs(face.normal[0]) === 1) {
        // Left or right face
        u.set(0, 1, 0);
        v.set(0, 0, face.normal[0] === 1 ? -1 : 1);
      } else {
        // Front or back face
        u.set(1, 0, 0);
        v.set(0, 1, 0);
      }
      
      // Create horizontal lines
      for (let i = 0; i <= gridSize; i++) {
        const offset = (i / gridSize - 0.5) * cubeSize;
        const start = new THREE.Vector3()
          .copy(face.position as any)
          .addScaledVector(v, offset)
          .addScaledVector(u, -cubeSize/2);
        const end = new THREE.Vector3()
          .copy(face.position as any)
          .addScaledVector(v, offset)
          .addScaledVector(u, cubeSize/2);
        points.push(start, end);
      }
      
      // Create vertical lines
      for (let i = 0; i <= gridSize; i++) {
        const offset = (i / gridSize - 0.5) * cubeSize;
        const start = new THREE.Vector3()
          .copy(face.position as any)
          .addScaledVector(u, offset)
          .addScaledVector(v, -cubeSize/2);
        const end = new THREE.Vector3()
          .copy(face.position as any)
          .addScaledVector(u, offset)
          .addScaledVector(v, cubeSize/2);
        points.push(start, end);
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      lines.push(
        <lineSegments key={`grid-${faceIndex}`} geometry={geometry}>
          <lineBasicMaterial
            color="#00ff00"
            opacity={0.3}
            transparent={true}
            depthTest={false}
          />
        </lineSegments>
      );
      
      // Create invisible clickable planes for each cell
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const cellU = (col / gridSize - 0.5 + cellSize/cubeSize/2) * cubeSize;
          const cellV = (row / gridSize - 0.5 + cellSize/cubeSize/2) * cubeSize;
          
          const cellPosition = new THREE.Vector3()
            .copy(face.position as any)
            .addScaledVector(u, cellU)
            .addScaledVector(v, -cellV); // Negative for correct orientation
          
          // Check if this cell is being hovered
          const isHovered = hoverPreview && 
            hoverPreview.face === faceIndex && 
            hoverPreview.row === row && 
            hoverPreview.col === col;
          
          lines.push(
            <mesh
              key={`cell-${faceIndex}-${row}-${col}`}
              position={cellPosition}
              onClick={(e) => {
                e.stopPropagation();
                if (onCellClick) {
                  onCellClick(faceIndex, row, col);
                }
              }}
              onPointerEnter={(e) => {
                e.stopPropagation();
                if (onCellHover) {
                  onCellHover(faceIndex, row, col);
                }
              }}
              onPointerLeave={(e) => {
                e.stopPropagation();
                if (onCellHover) {
                  onCellHover(null, null, null);
                }
              }}
            >
              <planeGeometry args={[cellSize * 0.95, cellSize * 0.95]} />
              <meshBasicMaterial
                color={isHovered ? "#ffff00" : "#00ff00"}
                opacity={isHovered ? 0.5 : 0.1}
                transparent={true}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        }
      }
    });
    
    return lines;
  }, [visible, onCellClick, onCellHover, hoverPreview]);

  return <group>{gridLines}</group>;
}