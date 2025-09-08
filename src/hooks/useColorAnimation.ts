/** @format */

import { useEffect, useRef } from 'react';
import { Circle3D } from '../3d/entities/Circle3D';

interface UseColorAnimationProps {
  circles: Circle3D[];
  colorPalette?: string[];
  isAnimating: boolean;
  transitionSpeed?: number;
  intervalRange?: { min: number; max: number };
}

/**
 * Custom hook to handle staggered color animation for 3D circles
 * Creates a continuous, fluid color-changing effect
 */
export const useColorAnimation = ({
  circles,
  colorPalette,
  isAnimating,
  transitionSpeed = 0.15,
  intervalRange = { min: 400, max: 600 }
}: UseColorAnimationProps) => {
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any existing intervals
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];

    if (!isAnimating) {
      // Reset to default transition speed when animation is disabled
      circles.forEach(circle => {
        circle.colorTransitionSpeed = 0.05;
      });
      return;
    }

    // Set transition speed for smooth animation
    circles.forEach(circle => {
      circle.colorTransitionSpeed = transitionSpeed;
    });

    // Create staggered intervals for each circle
    circles.forEach((circle, index) => {
      // Only animate enabled circles
      if (!circle.isEnabled) return;
      
      // Stagger initial color change to create a wave effect
      const initialDelay = (index * 50) % 500;
      
      setTimeout(() => {
        // Set initial random color
        const newColor = colorPalette 
          ? colorPalette[Math.floor(Math.random() * colorPalette.length)]
          : '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        circle.setNewColor(newColor);
        
        // Set up recurring color changes with random intervals
        const intervalDuration = intervalRange.min + 
          Math.random() * (intervalRange.max - intervalRange.min);
        
        const interval = setInterval(() => {
          // Double-check circle is still enabled
          if (circle.isEnabled) {
            const randomColor = colorPalette 
              ? colorPalette[Math.floor(Math.random() * colorPalette.length)]
              : '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            circle.setNewColor(randomColor);
          }
        }, intervalDuration);
        
        intervalsRef.current.push(interval);
      }, initialDelay);
    });

    // Cleanup function
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current = [];
    };
  }, [isAnimating, colorPalette, circles, transitionSpeed, intervalRange.min, intervalRange.max]);
};