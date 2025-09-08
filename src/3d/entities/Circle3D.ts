/** @format */

import * as THREE from 'three';
import { applySpringToSize, SpringConfig } from '../../utils/springPhysics';

// 3D Circle entity for Three.js with spring physics
export class Circle3D {
  position: THREE.Vector3;
  originalColor: THREE.Color;
  currentColor: THREE.Color;
  targetColor: THREE.Color;
  size: number;
  originalSize: number;
  targetSize: number;
  velocitySize: number;
  springConfig: SpringConfig = { stiffness: 0.2, damping: 0.7 }; // Use shared config with consistent values
  colorTransitionSpeed: number = 0.05;
  isEnabled: boolean = true;
  disabledColor: THREE.Color;
  
  // Enter animation state
  hasEntered: boolean = false;
  enterStartTime: number = 0;
  enterDelay: number = 0;
  enterDuration: number = 1000; // Duration of color fade-in animation

  constructor(x: number, y: number, z: number, size: number, color: string, enabled: boolean = true) {
    this.position = new THREE.Vector3(x, y, z);
    this.originalColor = new THREE.Color(color);
    this.currentColor = new THREE.Color(enabled ? color : '#333333');
    this.targetColor = new THREE.Color(enabled ? color : '#333333');
    this.size = size;
    this.originalSize = size;
    this.targetSize = size;
    this.velocitySize = 0;
    this.isEnabled = enabled;
    this.disabledColor = new THREE.Color('#333333'); // Default grey for disabled state
  }
  
  startEnterAnimation(delay: number, theme: string = 'dark', startImmediately: boolean = true) {
    this.enterDelay = delay;
    this.enterStartTime = startImmediately ? Date.now() : 0; // Only set if starting immediately
    this.hasEntered = false;
    
    // Start with disabled color (same as chunk pattern disabled state)
    const disabledColor = theme === 'dark' ? new THREE.Color('#2a2a2a') : new THREE.Color('#d0d0d0');
    this.currentColor = disabledColor.clone();
    this.targetColor = disabledColor.clone();
    this.disabledColor = disabledColor;
  }
  
  triggerAnimation() {
    if (this.enterStartTime === 0) {
      this.enterStartTime = Date.now();
    }
  }
  
  updateEnterAnimation() {
    if (this.hasEntered || this.enterStartTime === 0) return; // Don't animate if not triggered yet
    
    const currentTime = Date.now();
    const elapsed = currentTime - this.enterStartTime;
    
    if (elapsed < this.enterDelay) {
      // Still waiting for delay - stay with disabled color
      return;
    }
    
    // Only switch to original color if enabled
    this.hasEntered = true;
    if (this.isEnabled) {
      this.currentColor = this.originalColor.clone();
      this.targetColor = this.originalColor.clone();
    }
  }

  update() {
    // Update enter animation first
    this.updateEnterAnimation();
    
    // Use shared spring physics for size
    applySpringToSize(this, this.springConfig);

    // Smooth color transitions with smaller lerp factor to reduce flickering
    this.currentColor.lerp(this.targetColor, this.colorTransitionSpeed);
  }

  setNewColor(color: string) {
    if (this.isEnabled) {
      this.targetColor = new THREE.Color(color);
      this.originalColor = new THREE.Color(color);
    }
  }

  setEnabled(enabled: boolean, theme: string = 'dark') {
    this.isEnabled = enabled;
    if (!enabled) {
      // Use different grey colors for light/dark mode
      const greyColor = theme === 'dark' ? '#2a2a2a' : '#d0d0d0';
      this.targetColor = new THREE.Color(greyColor);
      this.currentColor = new THREE.Color(greyColor);
      this.disabledColor = new THREE.Color(greyColor);
    } else {
      // When enabling, only show color if we've already animated
      // Otherwise keep it grey until animation triggers
      if (this.hasEntered) {
        this.targetColor = this.originalColor.clone();
        this.currentColor = this.originalColor.clone();
      } else {
        this.targetColor = this.disabledColor.clone();
        this.currentColor = this.disabledColor.clone();
      }
    }
  }

  setTargetSizeFromDistance(distance: number, maxDistance: number, hoverScale: number = 1.5) {
    // Don't apply hover effects during enter animation or to disabled circles
    if (!this.hasEntered || !this.isEnabled) {
      this.targetSize = this.originalSize;
      return;
    }
    
    // Calculate size based on distance (closer = bigger)
    if (distance < maxDistance) {
      const influence = 1 - distance / maxDistance;
      const scaleFactor = 1 + (hoverScale - 1) * Math.pow(influence, 2.5);
      this.targetSize = this.originalSize * scaleFactor;

      // Update color based on proximity with smooth transition
      const colorIntensity = Math.max(0, Math.pow(influence, 3) * 0.3);
      this.targetColor = this.originalColor.clone().multiplyScalar(1 + colorIntensity);
    } else {
      this.targetSize = this.originalSize;
      this.targetColor = this.originalColor.clone();
    }
  }
}