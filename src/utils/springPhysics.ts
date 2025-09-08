/**
 * Spring physics configuration
 */
export interface SpringConfig {
  stiffness: number; // Controls how fast it reaches target (0-1)
  damping: number;   // Controls oscillation dampening (0-1)
}

/**
 * Default spring configuration
 * Provides a balanced, smooth spring animation
 */
export const DEFAULT_SPRING_CONFIG: SpringConfig = {
  stiffness: 0.2,
  damping: 0.7
};

/**
 * Calculate spring force for a single dimension
 * @param current - Current value
 * @param target - Target value
 * @param velocity - Current velocity
 * @param config - Spring configuration
 * @returns Updated velocity
 */
export function calculateSpringForce(
  current: number,
  target: number,
  velocity: number,
  config: SpringConfig = DEFAULT_SPRING_CONFIG
): number {
  const delta = target - current;
  return velocity * config.damping + delta * config.stiffness;
}

/**
 * Apply spring physics to update position and velocity
 * @param current - Current value
 * @param target - Target value
 * @param velocity - Current velocity (will be updated)
 * @param config - Spring configuration
 * @returns Object with new position and velocity
 */
export function applySpring(
  current: number,
  target: number,
  velocity: number,
  config: SpringConfig = DEFAULT_SPRING_CONFIG
): { position: number; velocity: number } {
  const newVelocity = calculateSpringForce(current, target, velocity, config);
  const newPosition = current + newVelocity;
  
  return {
    position: newPosition,
    velocity: newVelocity
  };
}

/**
 * Interface for entities with spring physics properties
 */
export interface SpringEntity {
  x: number;
  y: number;
  size: number;
  targetX: number;
  targetY: number;
  targetSize: number;
  velocityX: number;
  velocityY: number;
  velocitySize: number;
}

/**
 * Apply spring physics to an entity's position and size
 * @param entity - Entity with spring physics properties
 * @param config - Spring configuration
 * @param deltaTime - Optional delta time for frame-rate independent animation (default: 1)
 */
export function applySpringPhysics(
  entity: SpringEntity,
  config: SpringConfig = DEFAULT_SPRING_CONFIG,
  deltaTime: number = 1
): void {
  // Apply spring physics to X position
  const xResult = applySpring(entity.x, entity.targetX, entity.velocityX, config);
  entity.x = xResult.position;
  entity.velocityX = xResult.velocity * deltaTime;
  
  // Apply spring physics to Y position
  const yResult = applySpring(entity.y, entity.targetY, entity.velocityY, config);
  entity.y = yResult.position;
  entity.velocityY = yResult.velocity * deltaTime;
  
  // Apply spring physics to size
  const sizeResult = applySpring(entity.size, entity.targetSize, entity.velocitySize, config);
  entity.size = sizeResult.position;
  entity.velocitySize = sizeResult.velocity * deltaTime;
}

/**
 * Apply spring physics to size only (for simpler entities)
 * @param entity - Entity with size spring physics properties
 * @param config - Spring configuration
 */
export function applySpringToSize(
  entity: { size: number; targetSize: number; velocitySize: number },
  config: SpringConfig = DEFAULT_SPRING_CONFIG
): void {
  const sizeResult = applySpring(entity.size, entity.targetSize, entity.velocitySize, config);
  entity.size = sizeResult.position;
  entity.velocitySize = sizeResult.velocity;
}