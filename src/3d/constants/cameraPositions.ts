/** @format */

import * as THREE from 'three';

// Define camera positions for each cube face
export const CAMERA_POSITIONS = {
  default: { position: new THREE.Vector3(3, 3, 3), target: new THREE.Vector3(0, 0, 0) },
  front: { position: new THREE.Vector3(0, 0, 4), target: new THREE.Vector3(0, 0, 0) },
  back: { position: new THREE.Vector3(0, 0, -4), target: new THREE.Vector3(0, 0, 0) },
  right: { position: new THREE.Vector3(4, 0, 0), target: new THREE.Vector3(0, 0, 0) },
  left: { position: new THREE.Vector3(-4, 0, 0), target: new THREE.Vector3(0, 0, 0) },
  top: { position: new THREE.Vector3(0, 4, 0), target: new THREE.Vector3(0, 0, 0) },
  bottom: { position: new THREE.Vector3(0, -4, 0), target: new THREE.Vector3(0, 0, 0) }
} as const;

export type CameraPositionKey = keyof typeof CAMERA_POSITIONS;