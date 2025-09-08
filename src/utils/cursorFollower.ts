/** @format */

import { P5CursorFollower } from '../types/canvas';
import p5Types from 'p5';

export const createCursorFollower = (isDarkMode: boolean): P5CursorFollower => ({
  x: 0,
  y: 0,
  size: 20,
  targetX: 0,
  targetY: 0,
  targetSize: 20,
  velocityX: 0,
  velocityY: 0,
  velocitySize: 0,
  isClicked: false,
  clickStartTime: 0,
  isDarkMode
});

export const updateCursorFollower = (
  follower: P5CursorFollower,
  p: p5Types,
  mouseX: number,
  mouseY: number,
  isDarkMode: boolean
): P5CursorFollower => {
  const damping = 0.8;
  const stiffness = 0.1;
  const mass = 1;

  // Update target position
  follower.targetX = mouseX;
  follower.targetY = mouseY;
  follower.targetSize = follower.isClicked ? 30 : 20;

  // Calculate spring forces
  const forceX = (follower.targetX - follower.x) * stiffness;
  const forceY = (follower.targetY - follower.y) * stiffness;
  const forceSize = (follower.targetSize - follower.size) * stiffness;

  // Update velocities with spring physics
  follower.velocityX = (follower.velocityX + forceX / mass) * damping;
  follower.velocityY = (follower.velocityY + forceY / mass) * damping;
  follower.velocitySize = (follower.velocitySize + forceSize / mass) * damping;

  // Update positions
  follower.x += follower.velocityX;
  follower.y += follower.velocityY;
  follower.size += follower.velocitySize;

  // Update click state
  if (follower.isClicked && p.millis() - follower.clickStartTime > 200) {
    follower.isClicked = false;
  }

  // Update dark mode
  follower.isDarkMode = isDarkMode;

  return follower;
};

export const drawCursorFollower = (follower: P5CursorFollower, p: p5Types): void => {
  p.push();
  p.noStroke();

  if (follower.isDarkMode) {
    // Dark mode - glowing effect
    p.blendMode(p.ADD);
    for (let i = 3; i > 0; i--) {
      const alpha = i * 0.3;
      const size = follower.size * (1 + i * 0.2);
      p.fill(255, 255, 255, alpha * 255);
      p.circle(follower.x, follower.y, size);
    }
    p.blendMode(p.BLEND);
  } else {
    // Light mode - subtle shadow
    p.fill(0, 0, 0, 30);
    p.circle(follower.x + 2, follower.y + 2, follower.size);
    p.fill(0, 0, 0, 100);
    p.circle(follower.x, follower.y, follower.size);
  }

  p.pop();
};
