/** @format */

export interface RoundedPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Maps cube coordinates to a rounded cube surface with corner rounding and face curvature
 * @param x - X coordinate
 * @param y - Y coordinate  
 * @param z - Z coordinate
 * @param cubeSize - Size of the cube (default 2.0)
 * @param cornerRadius - Radius of corner rounding (default 0.25)
 * @param faceRoundness - Amount of face curvature, 0 = flat, 1 = sphere (default 0.35)
 * @returns Mapped position on rounded cube surface
 */
export function mapToRoundedCube(
  x: number,
  y: number,
  z: number,
  cubeSize: number = 2.0,
  cornerRadius: number = 0.25,
  faceRoundness: number = 0.35
): RoundedPosition {
  const halfSize = cubeSize / 2;

  // First apply corner rounding
  const innerSize = halfSize - cornerRadius;
  const clampedX = Math.sign(x) * Math.min(Math.abs(x), innerSize);
  const clampedY = Math.sign(y) * Math.min(Math.abs(y), innerSize);
  const clampedZ = Math.sign(z) * Math.min(Math.abs(z), innerSize);

  const dx = x - clampedX;
  const dy = y - clampedY;
  const dz = z - clampedZ;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  let cornerX = x,
    cornerY = y,
    cornerZ = z;
  if (dist > 0.001) {
    const scale = cornerRadius / dist;
    cornerX = clampedX + dx * scale;
    cornerY = clampedY + dy * scale;
    cornerZ = clampedZ + dz * scale;
  }

  // Then apply spherical blending for face curvature
  const nx = cornerX / halfSize;
  const ny = cornerY / halfSize;
  const nz = cornerZ / halfSize;
  const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

  if (length > 0) {
    const sphereFactor = faceRoundness;
    const cubeFactor = 1 - faceRoundness;

    const sphereX = (nx / length) * halfSize;
    const sphereY = (ny / length) * halfSize;
    const sphereZ = (nz / length) * halfSize;

    const finalX = cornerX * cubeFactor + sphereX * sphereFactor;
    const finalY = cornerY * cubeFactor + sphereY * sphereFactor;
    const finalZ = cornerZ * cubeFactor + sphereZ * sphereFactor;

    return { x: finalX, y: finalY, z: finalZ };
  }

  return { x: cornerX, y: cornerY, z: cornerZ };
}

/**
 * Maps cube coordinates to a rounded cube surface and returns as array
 * Convenience function for geometry generation
 */
export function mapToRoundedCubeArray(
  x: number,
  y: number,
  z: number,
  cubeSize: number = 2.0,
  cornerRadius: number = 0.25,
  faceRoundness: number = 0.35
): [number, number, number] {
  const pos = mapToRoundedCube(x, y, z, cubeSize, cornerRadius, faceRoundness);
  return [pos.x, pos.y, pos.z];
}