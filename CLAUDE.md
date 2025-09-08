# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dual-mode interactive visualization app featuring both 2D (P5.js) and 3D (Three.js) rendering. Built with React 19, TypeScript 5.7, and Vite 6, it provides responsive grid animations with spring physics, touch/mouse interaction, and full PWA capabilities.

## Commands

```bash
# Development
pnpm dev             # Start development server with HMR on port 5173

# Build & Production
pnpm build           # TypeScript check + production build
pnpm preview         # Preview production build locally

# Code Quality
pnpm lint            # Run ESLint checks
```

## Architecture

### Dual-Mode Rendering Architecture

The app implements a sophisticated conditional rendering system supporting both 2D (P5.js) and 3D (Three.js) modes:
- **Automatic Mode Detection**: Switches to 3D when BLOCK_MODE_CONFIG (25x25 grid) is selected
- **Unified Data Model**: Both modes consume the same `customGridColors` array for consistency
- **Conditional Rendering**: CanvasVisualization.tsx orchestrates mode switching
- **Shared Physics System**: Both modes use identical spring physics (stiffness: 0.15-0.25, damping: 0.65-0.75)

### Core Components

**TwoDimensionalCanvas** (`src/2d/components/TwoDimensionalCanvas.tsx`): Main 2D canvas orchestrator
- Manages grid of CircleEntity instances
- Handles mouse/touch interactions via InteractionHandler class
- Image upload for custom color palettes
- Mask mode for shape-based grids
- Edit mode support with color painting and dragging
- Distance-based rendering sorting for proper z-index

**CircleEntity** (`src/2d/entities/CircleEntity.ts`): Self-contained entity with encapsulated behavior
- Multi-phase animations: shrink (200ms) → pause (100ms) → bounce (spring physics)
- Render strategies: circle, emoji, dollar sign modes
- Spring physics properties: velocityX/Y, magneticEffect for cursor attraction
- Hover states with dynamic glow effects
- Color fade transitions with configurable duration
- Distance-based interaction zones

**ThreeDimensionalCanvas** (`src/3d/components/ThreeDimensionalCanvas.tsx`): Three.js scene management
- React Three Fiber integration with @react-three/drei helpers
- Cube face population: 6 faces × gridSize² circles with edge deduplication
- Orbital controls with auto-rotation
- Environmental effects: starfield (500 stars), fog, ambient/directional lighting
- Circle3D entities sharing the same spring physics as 2D mode

### State Management Architecture

**CanvasSettingsContext** (`src/contexts/CanvasSettingsContext.tsx`): Centralized configuration
- Immutable state updates with spread operator pattern
- Type-safe `CanvasSettings` interface
- Consumed by both 2D and 3D canvas components
- Settings include: gridSize, fadeDuration, padding, colorPalette, renderMode, etc.

### Performance-Optimized State Patterns

**Ref-Heavy Architecture**: Prevents re-renders during animations
```typescript
const settingsRef = useRef(settings);  // Avoids animation disruption
const p5InstanceRef = useRef(p5Instance);  // Stable P5.js reference
```

**Predefined Configurations**:
- `NODE_MODE_CONFIG`: 5×5 grid for node visualization
- `BLOCK_MODE_CONFIG`: 25×25 grid triggering 3D mode

**Custom Hooks**:
- `useCanvasEffects`: Manages resize, regeneration, and property updates
- `useQueryParams`: URL state synchronization
- `useColorAnimation`: Animation timing control

### Styling Architecture

- Tailwind CSS v4 with Vite plugin
- Shadcn/ui components in `src/components/ui/`
- Theme provider with light/dark mode support
- Framer Motion for UI animations
- Three.js for 3D rendering with React Three Fiber and Drei helpers

### PWA Features

Configured via `vite-plugin-pwa` with:
- Service worker auto-update with user confirmation
- Offline capability
- Standalone app manifest
- 3MB cache limit

## Key Patterns

1. **Entity-Component Pattern**: Self-contained entities (CircleEntity, Circle3D) with encapsulated physics and rendering
2. **Ref-Based Performance**: Strategic ref usage prevents re-renders during 60fps animations
3. **Distance-Based Rendering**: Dynamic z-index sorting based on cursor proximity for proper layering
4. **Drag Painting**: Edit mode with `paintedCellsRef` Set to prevent duplicate color applications
5. **Theme-Aware Canvas**: Background colors adapt to theme (light: 255, dark: 10)
6. **Unified Spring Physics**: Shared physics constants across 2D/3D for consistent feel
7. **Multi-Phase Animations**: Shrink → Pause → Bounce sequence with precise timing
8. **Touch Event Resilience**: Fallback timeouts handle unreliable touchend events
9. **Mode Strategy Pattern**: Render modes (circle/emoji/dollar) with pluggable strategies
10. **Configuration-Driven**: Mode switching via configuration objects rather than imperative code

## Important Files & Configuration

- **Vite Config** (`vite.config.ts`): PWA setup, Tailwind CSS v4, path aliasing, ngrok support, 2.5MB chunk limit
- **Color Constants** (`src/constants/palettes.ts`): 17 predefined color palettes
- **Mode Configs** (`src/constants/modeConfig.ts`): NODE_MODE_CONFIG and BLOCK_MODE_CONFIG definitions
- **UI Components** (`src/components/ui/`): Shadcn/ui components (button, drawer, dropdown-menu, select, sheet, slider, switch, tabs)
- **Edit Components**: EditModeControls, PaletteSelector for grid customization
- **Interaction Handler** (`src/2d/handlers/InteractionHandler.ts`): Centralized mouse/touch event handling
- **Spring Physics** (`src/utils/springPhysics.ts`): Shared physics system for 2D/3D entities
- **Canvas Visualization** (`src/components/CanvasVisualization.tsx`): Mode switching and palette management

## Development Notes

- **Package Manager**: Uses pnpm (not npm)
- **No Test Suite**: Testing infrastructure not configured
- **Mobile Development**: Ngrok support via Vite's allowedHosts configuration
- **PWA Requirements**: Icons needed at public/pwa-192x192.png and public/pwa-512x512.png
- **Service Worker**: 3MB cache limit with auto-update prompt
- **Mode Detection Logic**: Checks gridSize + animationsEnabled + colorPalette to determine 2D vs 3D
- **Performance Critical**: Avoid triggering re-renders during animations - use refs for animation state