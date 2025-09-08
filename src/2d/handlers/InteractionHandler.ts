import p5Types from 'p5';
import { CircleEntity } from '../../2d/entities/CircleEntity';

/**
 * Configuration for the InteractionHandler
 */
export interface InteractionHandlerConfig {
  isEditMode: boolean;
  editColor?: string;
  onCircleClick?: (row: number, col: number) => void;
}

/**
 * Handles all mouse and touch interactions for the P5 canvas
 */
export class InteractionHandler {
  private p5: p5Types;
  private circles: CircleEntity[];
  private config: InteractionHandlerConfig;
  
  // Interaction state
  private isMousePressed: boolean = false;
  private isDragging: boolean = false;
  private paintedCells: Set<string> = new Set();
  private touchTimeout: number | null = null;
  
  constructor(
    p5: p5Types,
    circles: CircleEntity[],
    config: InteractionHandlerConfig
  ) {
    this.p5 = p5;
    this.circles = circles;
    this.config = config;
  }
  
  /**
   * Update references that may change
   */
  updateReferences(circles: CircleEntity[], config: InteractionHandlerConfig) {
    this.circles = circles;
    this.config = config;
  }
  
  /**
   * Update p5 instance (needed when p5 reference changes)
   */
  updateP5Instance(p5: p5Types) {
    this.p5 = p5;
  }
  
  /**
   * Handle mouse press event
   */
  handleMousePressed(): void {
    this.isMousePressed = true;
    
    // Start drag session in edit mode
    if (this.config.isEditMode) {
      this.isDragging = true;
      this.paintedCells.clear();
    }
    
    this.checkCirclesUnderMouse();
  }
  
  /**
   * Handle mouse release event
   */
  handleMouseReleased(): void {
    this.isMousePressed = false;
    
    // End drag session in edit mode
    if (this.config.isEditMode) {
      this.isDragging = false;
      this.paintedCells.clear();
    }
    
  }
  
  /**
   * Handle mouse drag event
   */
  handleMouseDragged(): boolean {
    // In edit mode, ensure we're tracking the drag
    if (this.config.isEditMode && this.isMousePressed) {
      if (!this.isDragging) {
        this.isDragging = true;
      }
      this.checkCirclesUnderMouse();
    } else if (this.isMousePressed) {
      // Normal mode dragging
      this.checkCirclesUnderMouse();
    }
    return false; // Prevent default
  }
  
  /**
   * Handle mouse move event
   */
  handleMouseMoved(): void {
  }
  
  /**
   * Handle touch start event
   */
  handleTouchStarted(): boolean {
    this.isMousePressed = true;
    
    // Clear any existing touch timeout
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    
    // Start drag session in edit mode
    if (this.config.isEditMode) {
      this.isDragging = true;
      this.paintedCells.clear();
    }
    
    this.checkCirclesUnderMouse();
    
    // Set a fallback timeout to reset state if touchEnded doesn't fire
    this.touchTimeout = window.setTimeout(() => {
      this.isMousePressed = false;
      if (!this.config.isEditMode) {
        // In normal mode, allow animations to complete before resetting position
        setTimeout(() => {
          this.p5.mouseX = -1000;
          this.p5.mouseY = -1000;
        }, 100);
      }
    }, 300); // Short timeout for tap gestures
    
    return false; // Prevent default touch behavior
  }
  
  /**
   * Handle touch end event
   */
  handleTouchEnded(): boolean {
    this.isMousePressed = false;
    
    // Clear the fallback timeout since touchEnded fired properly
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    
    // End drag session in edit mode
    if (this.config.isEditMode) {
      this.isDragging = false;
      this.paintedCells.clear();
    } else {
      // In normal mode, delay mouse position reset to allow animations to complete
      setTimeout(() => {
        this.p5.mouseX = -1000;
        this.p5.mouseY = -1000;
      }, 100);
    }
    
    return false; // Prevent default behavior
  }
  
  /**
   * Handle touch move event for mobile dragging
   */
  handleTouchMoved(): boolean {
    if (this.p5.touches.length > 0) {
      // Update mouse position to first touch point
      const touch = this.p5.touches[0] as any;
      this.p5.mouseX = touch.x as number;
      this.p5.mouseY = touch.y as number;
      
      // In edit mode, ensure we're tracking the drag
      if (this.config.isEditMode && !this.isDragging) {
        this.isDragging = true;
      }
      
      this.checkCirclesUnderMouse();
    }
    return false; // Prevent default scrolling
  }
  
  /**
   * Check which circles are under the mouse cursor and activate them
   */
  private checkCirclesUnderMouse(): void {
    this.circles.forEach((circle) => {
      const d = this.p5.dist(this.p5.mouseX, this.p5.mouseY, circle.x, circle.y);
      if (d < circle.size / 2) {
        if (this.config.isEditMode && this.config.onCircleClick) {
          // In edit mode, use the circle's stored row and column
          // These are set when the circle is created
          const row = circle.row ?? 0;
          const col = circle.col ?? 0;
          const cellKey = `${row}-${col}`;
          
          // If dragging, check if we've already painted this cell in this drag
          if (this.isDragging) {
            if (this.paintedCells.has(cellKey)) {
              return; // Skip if already painted in this drag
            }
            // Mark as painted for this drag session
            this.paintedCells.add(cellKey);
          }
          
          // Update the circle color immediately for visual feedback
          if (this.config.editColor) {
            const newColor = this.p5.color(this.config.editColor);
            circle.targetColor = newColor;
            circle.currentColor = newColor;
            circle.originalColor = newColor;
            // Subtle feedback - small size pulse
            circle.targetSize = circle.originalSize * 1.1;
            setTimeout(() => {
              circle.targetSize = circle.originalSize;
            }, 150);
          }
          
          // Notify the parent component
          this.config.onCircleClick(row, col);
        } else if (!circle.isActive && !this.config.isEditMode) {
          // Normal interaction mode - only when not in edit mode
          circle.handlePress(this.p5);
        }
      }
    });
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    this.paintedCells.clear();
  }
  
  /**
   * Get current interaction state
   */
  getState() {
    return {
      isMousePressed: this.isMousePressed,
      isDragging: this.isDragging,
      paintedCellsCount: this.paintedCells.size
    };
  }
}