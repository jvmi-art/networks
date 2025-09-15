/** @format */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCw, Home } from 'lucide-react';
import { useTheme } from '../../theme/theme-provider';

interface FaceNavigatorProps {
  currentFace: number;
  onFaceChange: (face: number) => void;
}

const faceNames = ['Front', 'Back', 'Right', 'Left', 'Top', 'Bottom'];

/**
 * Navigation controls for switching between cube faces in edit mode
 */
export function FaceNavigator({ currentFace, onFaceChange }: FaceNavigatorProps) {
  const { theme } = useTheme();
  
  // Define navigation relationships between faces
  const navigate = (direction: 'left' | 'right' | 'up' | 'down') => {
    let newFace = currentFace;
    
    switch (currentFace) {
      case 0: // Front
        switch (direction) {
          case 'left': newFace = 3; break;  // Left face
          case 'right': newFace = 2; break; // Right face
          case 'up': newFace = 4; break;    // Top face
          case 'down': newFace = 5; break;  // Bottom face
        }
        break;
      case 1: // Back
        switch (direction) {
          case 'left': newFace = 2; break;  // Right face (reversed)
          case 'right': newFace = 3; break; // Left face (reversed)
          case 'up': newFace = 4; break;    // Top face
          case 'down': newFace = 5; break;  // Bottom face
        }
        break;
      case 2: // Right
        switch (direction) {
          case 'left': newFace = 0; break;  // Front face
          case 'right': newFace = 1; break; // Back face
          case 'up': newFace = 4; break;    // Top face
          case 'down': newFace = 5; break;  // Bottom face
        }
        break;
      case 3: // Left
        switch (direction) {
          case 'left': newFace = 1; break;  // Back face
          case 'right': newFace = 0; break; // Front face
          case 'up': newFace = 4; break;    // Top face
          case 'down': newFace = 5; break;  // Bottom face
        }
        break;
      case 4: // Top
        switch (direction) {
          case 'left': newFace = 3; break;  // Left face
          case 'right': newFace = 2; break; // Right face
          case 'up': newFace = 1; break;    // Back face
          case 'down': newFace = 0; break;  // Front face
        }
        break;
      case 5: // Bottom
        switch (direction) {
          case 'left': newFace = 3; break;  // Left face
          case 'right': newFace = 2; break; // Right face
          case 'up': newFace = 0; break;    // Front face
          case 'down': newFace = 1; break;  // Back face
        }
        break;
    }
    
    onFaceChange(newFace);
  };

  const buttonClass = `p-2 rounded-lg transition-all transform hover:scale-110 ${
    theme === 'light'
      ? 'bg-white/90 hover:bg-white text-gray-700 shadow-md'
      : 'bg-black/90 hover:bg-black text-gray-300 shadow-md'
  }`;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Current face indicator */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className={`px-4 py-2 rounded-full backdrop-blur-md ${
          theme === 'light'
            ? 'bg-white/90 text-gray-700 shadow-lg'
            : 'bg-black/90 text-gray-300 shadow-lg'
        }`}>
          <span className="text-sm font-medium">Editing: {faceNames[currentFace]}</span>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Left arrow */}
        <button
          onClick={() => navigate('left')}
          className={`${buttonClass} absolute left-8 pointer-events-auto`}
          title="Previous face"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => navigate('right')}
          className={`${buttonClass} absolute right-8 pointer-events-auto`}
          title="Next face"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Up arrow */}
        <button
          onClick={() => navigate('up')}
          className={`${buttonClass} absolute top-24 pointer-events-auto`}
          title="Face above"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Down arrow */}
        <button
          onClick={() => navigate('down')}
          className={`${buttonClass} absolute bottom-24 pointer-events-auto`}
          title="Face below"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Quick navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto">
        <button
          onClick={() => onFaceChange(0)}
          className={`${buttonClass} flex items-center gap-2`}
          title="Front face"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm">Front</span>
        </button>
        <button
          onClick={() => onFaceChange((currentFace + 1) % 6)}
          className={`${buttonClass} flex items-center gap-2`}
          title="Rotate to next face"
        >
          <RotateCw className="w-4 h-4" />
          <span className="text-sm">Rotate</span>
        </button>
      </div>
    </div>
  );
}