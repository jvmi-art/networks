# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Networks** - A collective art experience building digital 2D nodes and 3D block sculptures inspired by Ethereum.

Interactive visualization app featuring:
- **2D Mode (Node)**: 5×5 grid with P5.js rendering, interactive color editing
- **3D Mode (Block)**: 25×25 grid forming rotating cube sculpture with Three.js
- Spring physics animations, touch/mouse interactions, PWA capabilities
- Built with React 19, TypeScript 5.7, Vite 6

Live site: https://networks-henna.vercel.app/

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

**Important**: Uses pnpm (not npm) as package manager

## Architecture

### Mode System & Entry Point

**CanvasVisualization** (`src/components/CanvasVisualization.tsx`): Main orchestrator
- Controls mode switching between 2D "node" (5×5) and 3D "block" (25×25)
- Manages header layout: Settings + Mode toggle (left), Edit controls (right)
- Handles palette selection and color grid generation
- URL query parameter sync (`?mode=node|block&palette=...`)

### 2D Rendering System (P5.js)

**TwoDimensionalCanvas** (`src/2d/components/TwoDimensionalCanvas.tsx`)
- Manages grid of CircleEntity instances with spring physics
- InteractionHandler class for centralized mouse/touch events
- Edit mode with drag-painting using `paintedCellsRef` Set
- Distance-based z-index sorting for proper layering
- Image upload for custom palette generation via mask mode

**CircleEntity** (`src/2d/entities/CircleEntity.ts`)
- Multi-phase animation: shrink (200ms) → pause (100ms) → bounce
- Spring physics: stiffness 0.15-0.25, damping 0.65-0.75
- Render modes: circle, emoji ($), dollar sign strategies
- Magnetic cursor attraction with distance-based zones

### 3D Rendering System (Three.js)

**ThreeDimensionalCanvas** (`src/3d/components/ThreeDimensionalCanvas.tsx`)
- React Three Fiber + Drei for declarative 3D
- Cube with 6 faces × gridSize² circles, edge deduplication
- Auto-rotating orbital controls
- Environmental: 500-star field, fog, ambient/directional lighting
- Circle3D entities share physics constants with 2D mode

### State Management

**CanvasSettingsContext** (`src/contexts/CanvasSettingsContext.tsx`)
- Central configuration for both 2D/3D modes
- Immutable updates via spread operator
- Settings: gridSize, padding, renderMode, fillPercentage, etc.

**Performance Patterns**:
- Heavy ref usage to prevent animation re-renders
- `settingsRef` for stable animation references
- `p5InstanceRef` for P5.js instance stability

### Component Systems

**UI Controls**:
- **EditModeControls**: Color palette selector (right-aligned dropdown), save/edit toggle
- **ControlPanel**: Settings sheet (left slide-in), dimension selector, display options
- **ModeTabs**: Node/Block mode switcher
- **PaletteSelector**: 17 predefined palettes + random generation

**UI Components** (`src/components/ui/`):
- Shadcn/ui components: button, drawer, select, sheet, slider, switch, tabs
- All dropdowns use `align="end"` to prevent off-screen rendering

### Configuration & Constants

**Predefined Modes** (`src/constants/modeConfig.ts`):
- `NODE_MODE_CONFIG`: 5×5 grid for 2D visualization
- `BLOCK_MODE_CONFIG`: 25×25 grid triggering 3D mode
- `NODE_DIMENSIONS`: Includes rectangular options (5×10, 10×5)
- `CUBE_DIMENSIONS`: Square-only for 3D cube faces

**Color System** (`src/constants/palettes.ts`):
- 17 themed palettes: rainbow, neon, cyberpunk, miami, etc.
- Random palette generation with HSL color space

### Technical Stack

**Build & Tooling**:
- Vite 6 with PWA plugin (3MB cache, auto-update)
- Tailwind CSS v4 with Vite plugin integration
- TypeScript 5.7 with path aliasing (`@/*` → `./src/*`)
- ESLint 9 with React hooks plugin

**Key Dependencies**:
- React 19 + React DOM 19
- P5.js via react-p5 wrapper
- Three.js with React Three Fiber + Drei
- Framer Motion for UI animations
- React Router DOM for URL state
- Radix UI primitives for accessible components

## Critical Implementation Details

### Animation Performance
- **Never trigger re-renders during animations** - use refs for animation state
- 60fps target requires careful state management
- Distance calculations cached per frame

### Touch/Mouse Handling
- Centralized through InteractionHandler class
- Fallback timeouts for unreliable touchend events
- Unified cursor position tracking for both 2D/3D

### Theme System
- Canvas backgrounds: light mode (255), dark mode (10)
- All UI components theme-aware via context
- Smooth transitions with Tailwind classes

### Edit Mode Features
- Drag to paint multiple cells with selected color
- `paintedCellsRef` Set prevents duplicate applications
- Color changes persist across mode switches

### PWA Requirements
- Icons at `public/pwa-192x192.png` and `public/pwa-512x512.png`
- Service worker with 3MB limit
- Manifest for standalone app mode
- Offline capability via workbox

### URL State Management
- Query params: `?mode=node|block&palette=rainbow&hideControls=true`
- Bidirectional sync with component state
- Shareable configurations

## Development Notes

- **Mobile Support**: Ngrok enabled in Vite config for device testing
- **No Test Suite**: Testing infrastructure not configured
- **Vercel Deployment**: Automatic deploys from main branch
- **Bundle Splitting**: 2.5MB chunk limit configured