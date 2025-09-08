/** @format */

import p5Types from 'p5';
import { POPULAR_EMOJIS } from '../../data/emojis';
import { applySpringPhysics, SpringConfig } from '../../utils/springPhysics';

// Configuration interfaces for better type safety and reusability
interface EntityOptions {
  maxOffset?: number; // Maximum distance the entity can move
  maxSizeIncrease?: number; // Maximum growth factor when near mouse
  minSizeDecrease?: number; // Minimum size factor when far from mouse
  minGlowFactor?: number; // Minimum glow size relative to entity
  maxGlowFactor?: number; // Maximum glow size relative to entity
  highlightSize?: number; // Size of the highlight relative to entity size
  colorOpacity?: number; // Main color opacity (0-255)
  glowOpacity?: number; // Glow color opacity (0-255)
  strokeWidth?: number; // Width of the entity stroke
  renderMode?: 'circle' | 'emoji' | 'dollar'; // Whether to render as circle, emoji, or dollar sign
  emoji?: string; // The emoji to display when in emoji mode
  magneticEffect?: boolean; // Whether to enable magnetic effect (movement toward cursor)
  isLightMode?: boolean; // Whether we're in light mode (affects glow rendering)
}

interface AnimationParams {
  shrinkDuration: number; // Duration of shrink phase in ms
  pauseDuration: number; // Duration of pause phase in ms
  bounceDuration: number; // Duration of bounce phase in ms
}

// Type for color selection callback
export type ColorSelectionCallback = (entity: CircleEntity) => p5Types.Color | null;

/**
 * CircleEntity represents an interactive entity in the grid
 * Each entity can be clicked to animate and change color/emoji
 */
export class CircleEntity {

  //------------------------------------------
  // Position Properties
  //------------------------------------------
  x: number;
  y: number;
  originalX: number;
  originalY: number;

  // Grid position for color tracking
  row?: number;
  col?: number;

  //------------------------------------------
  // Color Properties
  //------------------------------------------
  originalColor: p5Types.Color;
  currentColor: p5Types.Color;
  targetColor?: p5Types.Color; // Target color for transitions
  glowColor: p5Types.Color;
  highlightColor: p5Types.Color;

  //------------------------------------------
  // Emoji Properties
  //------------------------------------------
  emoji: string;
  currentEmoji: string;
  renderMode: 'circle' | 'emoji' | 'dollar';

  //------------------------------------------
  // Size Properties
  //------------------------------------------
  size: number;
  originalSize: number;

  //------------------------------------------
  // Animation State
  //------------------------------------------
  isActive: boolean;
  activeStartTime: number;
  colorChangedThisCycle: boolean = false;
  emojiChangedThisCycle: boolean = false;
  
  // Enter animation state
  hasEntered: boolean = false;
  enterStartTime: number = 0;
  enterDelay: number = 0;
  enterDuration: number = 1000; // Duration of color fade-in animation

  //------------------------------------------
  // Configuration Values
  //------------------------------------------
  maxOffset: number; // Maximum offset from original position
  maxSizeIncrease: number; // Maximum size increase factor
  minSizeDecrease: number; // Minimum size decrease factor
  minGlowFactor: number; // Minimum glow factor when mouse is close
  maxGlowFactor: number; // Maximum glow factor when mouse is far
  highlightSizeFactor: number; // Size of highlight relative to main entity
  strokeWidth: number; // Width of the stroke for the entity
  magneticEffect: boolean; // Whether to enable magnetic effect
  isLightMode: boolean; // Whether we're in light mode

  // Animation parameters
  animParams: AnimationParams = {
    shrinkDuration: 100, // Very quick shrink (100ms)
    pauseDuration: 300, // Brief pause at zero (300ms)
    bounceDuration: 800 // Duration of bounce-back (800ms)
  };

  //------------------------------------------
  // Spring Physics Variables
  //------------------------------------------
  targetX: number;
  targetY: number;
  targetSize: number;
  velocityX: number = 0;
  velocityY: number = 0;
  velocitySize: number = 0;
  springConfig: SpringConfig = { stiffness: 0.15, damping: 0.75 }; // Using slightly softer spring for smoother animations

  /**
   * Create a new Entity
   */
  constructor(
    p5: p5Types,
    x: number,
    y: number,
    size: number,
    originalColor: p5Types.Color,
    options?: EntityOptions
  ) {
    // Initialize position
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;

    // Initialize size
    this.originalSize = size;
    this.size = size;

    // Initialize spring targets
    this.targetX = x;
    this.targetY = y;
    this.targetSize = size;

    // Set the configuration options with defaults
    this.maxOffset = options?.maxOffset ?? size * 1;
    this.maxSizeIncrease = options?.maxSizeIncrease ?? 1.5;
    this.minSizeDecrease = options?.minSizeDecrease ?? 0.7;
    this.minGlowFactor = options?.minGlowFactor ?? 1;
    this.maxGlowFactor = options?.maxGlowFactor ?? 1.2;
    this.highlightSizeFactor = options?.highlightSize ?? 0;
    this.strokeWidth = options?.strokeWidth ?? 1;
    this.renderMode = options?.renderMode ?? 'circle';
    this.magneticEffect = options?.magneticEffect ?? true;
    this.isLightMode = options?.isLightMode ?? false;

    // Select a random emoji from the collection if in emoji mode, or set dollar sign for dollar mode
    if (options?.renderMode === 'emoji') {
      const randomIndex = Math.floor(p5.random(POPULAR_EMOJIS.length));
      this.emoji = options?.emoji ?? POPULAR_EMOJIS[randomIndex];
    } else if (options?.renderMode === 'dollar') {
      this.emoji = '$';
    } else {
      this.emoji = options?.emoji ?? '🌟';
    }
    this.currentEmoji = this.emoji;

    // Extract color components
    const r = p5.red(originalColor);
    const g = p5.green(originalColor);
    const b = p5.blue(originalColor);

    // Set up colors with opacity
    const colorOpacity = options?.colorOpacity ?? 230;
    const glowOpacity = options?.glowOpacity ?? 70;

    this.originalColor = p5.color(r, g, b, colorOpacity);
    this.glowColor = p5.color(r, g, b, glowOpacity);
    this.highlightColor = p5.color(255, 255, 255, 255);
    this.currentColor = this.originalColor;

    // Initialize animation state
    this.isActive = false;
    this.activeStartTime = 0;
  }

  /**
   * Update all colors based on a new base color
   */
  updateColors(p5: p5Types, newColor: p5Types.Color) {
    // Extract color components from the new color
    const r = p5.red(newColor);
    const g = p5.green(newColor);
    const b = p5.blue(newColor);
    
    // Update all color variants
    const colorOpacity = 230;
    const glowOpacity = 70;
    
    this.originalColor = p5.color(r, g, b, colorOpacity);
    this.glowColor = p5.color(r, g, b, glowOpacity);
    this.currentColor = this.originalColor;
    this.targetColor = this.originalColor;
  }

  /**
   * Main update method called each frame
   */
  update(p5: p5Types) {
    // Handle enter animation first
    if (!this.hasEntered) {
      this.updateEnterAnimation(p5);
      // During enter animation, keep entity at original position with no orbiting
      this.targetX = this.originalX;
      this.targetY = this.originalY;
      this.targetSize = this.originalSize * this.minSizeDecrease;
    } else {
      // Only update positions after enter animation completes
      this.updatePosition(p5);

      // Then handle size animation
      if (this.isActive) {
        this.updateAnimation(p5);
      } else {
        // Not in active animation, just set the proper target based on mouse position
        this.targetSize = this.calculateProperSize(p5);
      }
    }

    // Apply spring physics
    this.applySpringPhysics();
  }
  
  /**
   * Start the enter animation with a specific delay
   */
  startEnterAnimation(p5: p5Types, delay: number) {
    this.enterDelay = delay;
    this.enterStartTime = p5.millis();
    this.hasEntered = false;
    
    // Start with disabled color (matches the chunk pattern disabled state)
    // Use darker grey for dark mode, lighter grey for light mode
    const disabledValue = this.isLightMode ? 208 : 42; // #d0d0d0 for light, #2a2a2a for dark
    const disabledAlpha = this.isLightMode ? 100 : 100;
    const disabledColor = p5.color(disabledValue, disabledValue, disabledValue, disabledAlpha);
    this.currentColor = disabledColor;
    
    // Set appropriate glow for disabled state
    const glowAlpha = this.isLightMode ? 20 : 30;
    this.glowColor = p5.color(disabledValue, disabledValue, disabledValue, glowAlpha);
  }
  
  /**
   * Update the enter animation
   */
  private updateEnterAnimation(p5: p5Types) {
    const currentTime = p5.millis();
    const elapsed = currentTime - this.enterStartTime;
    
    if (elapsed < this.enterDelay) {
      // Still waiting for delay - stay with disabled color
      return;
    }
    
    // Instantly switch to original color after delay
    this.hasEntered = true;
    this.currentColor = this.originalColor;
    this.glowColor = p5.color(p5.red(this.originalColor), p5.green(this.originalColor), p5.blue(this.originalColor), 70);
  }

  //------------------------------------------
  // Animation Methods
  //------------------------------------------

  /**
   * Handle animation updates based on current phase
   */
  private updateAnimation(p5: p5Types) {
    const currentTime = p5.millis();
    const age = currentTime - this.activeStartTime;

    const { shrinkDuration, pauseDuration, bounceDuration } = this.animParams;
    const totalDuration = shrinkDuration + pauseDuration + bounceDuration;

    // Animation still in progress
    if (age <= totalDuration) {
      // Phase 1: Shrink to zero
      if (age < shrinkDuration) {
        this.handleShrinkPhase(age);
      }
      // Phase 2: Pause at zero
      else if (age < shrinkDuration + pauseDuration) {
        this.handlePausePhase();
      }
      // Phase 3: Bounce back to proper size
      else {
        this.handleBouncePhase(p5, age);
      }
    } else {
      // Animation complete - transition to normal hover behavior
      this.isActive = false;
      this.targetSize = this.calculateProperSize(p5);
    }
  }

  /**
   * Handle the shrink phase of animation
   */
  private handleShrinkPhase(age: number) {
    const t = age / this.animParams.shrinkDuration;
    const scaleFactor = 1 - this.easeInQuad(t);

    // Direct size manipulation for immediate response
    this.size = this.originalSize * scaleFactor;
    this.targetSize = this.size;

    // Reset color and emoji change flags at the start of a new cycle
    if (age < 10) {
      this.colorChangedThisCycle = false;
      this.emojiChangedThisCycle = false;
    }
  }

  /**
   * Handle the pause phase of animation (when entity is hidden)
   */
  private handlePausePhase() {
    this.size = 0;
    this.targetSize = 0;

    // We no longer need to change the color randomly here
    // The color change is now handled by the colorSelectionCallback in handlePress
    // Keep tracking the colorChangedThisCycle flag for animation state
    if (!this.colorChangedThisCycle) {
      this.colorChangedThisCycle = true;
    }
  }

  /**
   * Handle the bounce phase of animation
   */
  private handleBouncePhase(p5: p5Types, age: number) {
    const { shrinkDuration, pauseDuration, bounceDuration } = this.animParams;
    const bounceAge = age - (shrinkDuration + pauseDuration);
    const bounceProgress = bounceAge / bounceDuration;

    // Calculate the proper target size based on mouse position
    const properTargetSize = this.calculateProperSize(p5);

    // Use elastic bounce formula
    const elasticValue = this.elasticOut(bounceProgress);

    if (bounceAge < 60) {
      // Just after pause, immediately set to small size to start bounce
      this.size = properTargetSize * 0.2;
      this.targetSize = this.size;

      // Add velocity for springiness
      this.velocitySize = properTargetSize * 0.3;

      // If in emoji mode and we haven't changed the emoji this cycle, change it now
      if (this.renderMode === 'emoji' && !this.emojiChangedThisCycle) {
        // Get a random emoji different from the current one
        let newEmoji;
        do {
          const randomIndex = Math.floor(p5.random(POPULAR_EMOJIS.length));
          newEmoji = POPULAR_EMOJIS[randomIndex];
        } while (newEmoji === this.currentEmoji && POPULAR_EMOJIS.length > 1);

        this.currentEmoji = newEmoji;
        this.emojiChangedThisCycle = true;
      }
      // Dollar mode doesn't change character - it stays as '$' throughout the animation
    } else {
      // Use target size for spring physics during the bounce
      this.targetSize = properTargetSize * elasticValue;
    }
  }

  /**
   * Method for handling mouse press (click or drag)
   * @returns true if the entity was activated, false otherwise
   */
  handlePress(p5: p5Types): boolean {
    if (!this.isActive) {
      this.isActive = true;
      this.activeStartTime = p5.millis();

      // Just start the normal click animation without color change
      this.velocitySize = -this.originalSize * 0.2;

      return true;
    }
    return false;
  }

  /**
   * Legacy method for backward compatibility
   */
  handleClick(p5: p5Types): boolean {
    const d = p5.dist(p5.mouseX, p5.mouseY, this.x, this.y);
    if (d < this.size / 2 && !this.isActive) {
      return this.handlePress(p5);
    }
    return false;
  }

  //------------------------------------------
  // Size Calculation Methods
  //------------------------------------------

  /**
   * Calculate the proper size based on mouse position
   */
  calculateProperSize(p5: p5Types): number {
    // Check if mouse is off-screen or at a far-off position (used in touchEnded)
    if (
      p5.mouseX < -500 ||
      p5.mouseY < -500 ||
      p5.mouseX > p5.width + 500 ||
      p5.mouseY > p5.height + 500
    ) {
      // Mouse is far off-screen, return to minimum size
      return this.originalSize * this.minSizeDecrease;
    }

    const distToMouse = p5.dist(p5.mouseX, p5.mouseY, this.originalX, this.originalY);
    const maxInfluenceDistance = 180;
    const noInfluenceDistance = 300;

    if (distToMouse < maxInfluenceDistance) {
      // Close to mouse - grow
      let influence = p5.map(distToMouse, 0, maxInfluenceDistance, 1, 0);
      influence = p5.pow(influence, 2);
      const sizeFactor = 1 + (this.maxSizeIncrease - 1) * influence;
      return this.originalSize * sizeFactor;
    } else if (distToMouse < noInfluenceDistance) {
      // In the transition zone
      const shrinkInfluence = p5.map(distToMouse, maxInfluenceDistance, noInfluenceDistance, 0, 1);
      const shrinkFactor = p5.lerp(1, this.minSizeDecrease, shrinkInfluence);
      return this.originalSize * shrinkFactor;
    } else {
      // Beyond influence - minimum size
      return this.originalSize * this.minSizeDecrease;
    }
  }

  /**
   * Calculate the glow factor based on mouse distance - inverse relationship
   */
  calculateGlowFactor(p5: p5Types): number {
    // Check if mouse is off-screen or at a far-off position (used in touchEnded)
    if (
      p5.mouseX < -500 ||
      p5.mouseY < -500 ||
      p5.mouseX > p5.width + 500 ||
      p5.mouseY > p5.height + 500
    ) {
      // Mouse is far off-screen, use maximum glow factor
      return this.maxGlowFactor * 1.05;
    }

    const distToMouse = p5.dist(p5.mouseX, p5.mouseY, this.originalX, this.originalY);
    const maxInfluenceDistance = 180;
    const noInfluenceDistance = 300;

    if (distToMouse < maxInfluenceDistance) {
      // Close to mouse - smaller glow (inverse relationship)
      let influence = p5.map(distToMouse, 0, maxInfluenceDistance, 1, 0);
      influence = p5.pow(influence, 2); // Apply easing for smoother effect

      // Inverse relationship - smaller glow when closer
      return p5.lerp(this.maxGlowFactor, this.minGlowFactor, influence);
    } else if (distToMouse < noInfluenceDistance) {
      // In the transition zone - gradually increase glow as distance increases
      const influence = p5.map(distToMouse, maxInfluenceDistance, noInfluenceDistance, 0, 0.5);
      return p5.lerp(this.maxGlowFactor, this.maxGlowFactor * 1.05, influence);
    } else {
      // Far away - maximum glow
      return this.maxGlowFactor * 1.05;
    }
  }

  //------------------------------------------
  // Physics Methods
  //------------------------------------------

  /**
   * Apply spring physics to position and size
   */
  applySpringPhysics() {
    // Use the shared spring physics utility
    applySpringPhysics(this, this.springConfig);
  }

  /**
   * Update position based on mouse distance
   */
  updatePosition(p5: p5Types) {
    // If magnetic effect is disabled, always stay at original position
    if (!this.magneticEffect) {
      this.targetX = this.originalX;
      this.targetY = this.originalY;
      return;
    }

    // Calculate distance from mouse to original position
    const distToMouse = p5.dist(p5.mouseX, p5.mouseY, this.originalX, this.originalY);
    const maxInfluenceDistance = 180; // Distance at which mouse influence starts to diminish

    // Check if mouse is off-screen or at a far-off position (used in touchEnded)
    if (
      p5.mouseX < -500 ||
      p5.mouseY < -500 ||
      p5.mouseX > p5.width + 500 ||
      p5.mouseY > p5.height + 500
    ) {
      // Mouse is far off-screen, reset to original position
      this.targetX = this.originalX;
      this.targetY = this.originalY;
      this.targetSize = this.originalSize * this.minSizeDecrease;
      return;
    }

    if (distToMouse < maxInfluenceDistance) {
      // Close to mouse - move toward cursor
      let influence = p5.map(distToMouse, 0, maxInfluenceDistance, 1, 0);
      influence = p5.pow(influence, 3); // Stronger easing curve for more dramatic effect

      // Calculate direction from original position to mouse
      const dirX = p5.mouseX - this.originalX;
      const dirY = p5.mouseY - this.originalY;

      // Set target positions for spring physics - increased pull factor from 0.25 to 0.5
      const offsetX = dirX * influence * 0.5;
      const offsetY = dirY * influence * 0.5;

      // Use the class maxOffset property to limit displacement
      const offsetDistance = p5.sqrt(offsetX * offsetX + offsetY * offsetY);

      if (offsetDistance > this.maxOffset) {
        const scale = this.maxOffset / offsetDistance;
        this.targetX = this.originalX + offsetX * scale;
        this.targetY = this.originalY + offsetY * scale;
      } else {
        this.targetX = this.originalX + offsetX;
        this.targetY = this.originalY + offsetY;
      }
    } else {
      // Far from cursor - return to original position
      this.targetX = this.originalX;
      this.targetY = this.originalY;
    }
  }

  //------------------------------------------
  // Drawing Methods
  //------------------------------------------

  /**
   * Draw the entity on the canvas
   */
  draw(p5: p5Types) {
    // Only draw if size is greater than 0
    if (this.size > 0.5) {
      // Calculate glow factor based on mouse distance (inverse relationship)
      const glowFactor = this.calculateGlowFactor(p5);

      if (this.renderMode === 'circle') {
        // Draw circle mode
        if (this.isLightMode) {
          // In light mode, just make the circle bigger instead of drawing a glow
          p5.fill(this.currentColor);
          if (this.strokeWidth > 0) {
            p5.stroke(0); // Black stroke
            p5.strokeWeight(this.strokeWidth); // Use the custom stroke width
          } else {
            p5.noStroke(); // No stroke if strokeWidth is 0
          }
          // Apply the glow factor directly to the circle size
          const adjustedSize = this.size * glowFactor;
          p5.circle(this.x, this.y, adjustedSize);
        } else {
          // In dark mode, draw the glow effect behind the circle
          // First draw the glow effect
          p5.fill(this.glowColor);
          p5.noStroke();
          const glowSize = this.size * glowFactor;
          p5.circle(this.x, this.y, glowSize);

          // Then draw the main circle on top with a black stroke (or no stroke if strokeWidth is 0)
          p5.fill(this.currentColor);
          if (this.strokeWidth > 0) {
            p5.stroke(0); // Black stroke
            p5.strokeWeight(this.strokeWidth); // Use the custom stroke width
          } else {
            p5.noStroke(); // No stroke if strokeWidth is 0
          }
          p5.circle(this.x, this.y, this.size);
        }

        // Reset stroke for highlight
        p5.noStroke();

        // Finally, draw a small highlight circle that follows the cursor like a light reflection
        if (this.size > 5) {
          // Only draw highlight if circle is big enough
          const highlight = this.getHighlightPosition(p5);
          p5.fill(this.highlightColor);

          // Size the highlight based on main circle size
          const highlightSize = this.size * this.highlightSizeFactor;
          p5.circle(highlight.x, highlight.y, highlightSize);
        }
      } else if (this.renderMode === 'emoji') {
        // Draw emoji mode - no background circle
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(this.size * 0.8); // Emoji size relative to entity size
        p5.fill(this.currentColor);
        p5.noStroke();
        p5.text(this.currentEmoji, this.x, this.y);
      } else {
        // Draw dollar mode - no background circle
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(this.size * 0.8); // Dollar size relative to entity size
        p5.fill(this.currentColor);
        p5.noStroke();
        p5.text('$', this.x, this.y);
      }
    }
  }

  /**
   * Get the position for the highlight based on cursor position
   */
  getHighlightPosition(p5: p5Types): { x: number; y: number } {
    // Direction from this entity to the mouse
    const dirX = p5.mouseX - this.x;
    const dirY = p5.mouseY - this.y;

    // Calculate the distance to mouse
    const distance = p5.dist(this.x, this.y, p5.mouseX, p5.mouseY);

    // Calculate how far from center the highlight should be (40% of entity radius maximum)
    const radius = this.size / 2;
    const maxHighlightOffset = radius * 0.4;

    // If mouse is very close to the center, position highlight based on a smooth blend
    // between following the mouse and staying near center to avoid jumpiness
    if (distance < radius * 0.5) {
      // Apply smooth blending when mouse is close to center
      // The closer the mouse is to center, the more we keep the highlight near center
      const blendFactor = p5.map(distance, 0, radius * 0.5, 0.1, 1.0);

      // Get normalized direction, but avoid division by zero
      let normalizedDirX = 0;
      let normalizedDirY = 0;

      if (distance > 0.1) {
        normalizedDirX = dirX / distance;
        normalizedDirY = dirY / distance;
      }

      // Calculate a reduced offset that's proportional to distance
      const smoothOffset = maxHighlightOffset * blendFactor;

      // Apply the offset in the direction of the mouse, but scaled down
      return {
        x: this.x + normalizedDirX * smoothOffset,
        y: this.y + normalizedDirY * smoothOffset
      };
    } else {
      // For greater distances, use the regular highlight calculation
      // Use reciprocal square root to create nonlinear falloff with distance
      const falloff = 200 / (distance + 50); // Starts at 4 for d=0, tends to 0 for large distances
      const highlightOffset = Math.min(maxHighlightOffset, maxHighlightOffset * falloff);

      // Normalize direction components (safe since we know distance > 0 here)
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;

      // Calculate highlight position, shifted toward the cursor
      return {
        x: this.x + normalizedDirX * highlightOffset,
        y: this.y + normalizedDirY * highlightOffset
      };
    }
  }

  //------------------------------------------
  // Utility Methods
  //------------------------------------------

  /**
   * Easing function for smooth transitions - quadratic ease in
   */
  easeInQuad(t: number): number {
    return t * t;
  }

  /**
   * Elastic easing function for bounce effect
   */
  elasticOut(t: number): number {
    const p = 0.3; // Controls oscillation
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  }
  
  /**
   * Easing function for smooth transitions - cubic ease out
   */
  easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
}
