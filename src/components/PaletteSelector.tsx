/** @format */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import {
  rainbowPalette,
  chromaticPalette,
  pastelPalette,
  monochromePalette,
  oceanPalette,
  sunsetPalette,
  neonPalette,
  earthPalette,
  cyberpunkPalette,
  nordicPalette,
  autumnPalette,
  vintagePalette,
  miamiPalette,
  forestPalette,
  candyPalette,
  deepSeaPalette,
  berryPalette,
  randomPalette
} from '../palettes';
import { useTheme } from '../theme/theme-provider';

export type PaletteType = 'rainbow' | 'neon' | 'cyberpunk' | 'miami' | 
  'pastel' | 'candy' | 'chromatic' | 'forest' | 'ocean' | 'deepSea' | 
  'sunset' | 'autumn' | 'berry' | 'earth' | 'vintage' | 'nordic' | 'monochrome' | 'random';

interface PaletteSelectorProps {
  selectedPalette: PaletteType;
  onPaletteChange: (palette: PaletteType) => void;
}

export const palettes: Record<string, string[] | string> = {
  rainbow: rainbowPalette,
  neon: neonPalette,
  cyberpunk: cyberpunkPalette,
  miami: miamiPalette,
  pastel: pastelPalette,
  candy: candyPalette,
  chromatic: chromaticPalette,
  forest: forestPalette,
  ocean: oceanPalette,
  deepSea: deepSeaPalette,
  sunset: sunsetPalette,
  autumn: autumnPalette,
  berry: berryPalette,
  earth: earthPalette,
  vintage: vintagePalette,
  nordic: nordicPalette,
  monochrome: monochromePalette,
  random: randomPalette
};

const paletteNames = {
  rainbow: '🌈 Rainbow',
  neon: '💫 Neon',
  cyberpunk: '🤖 Cyberpunk',
  miami: '🌴 Miami',
  pastel: '🎨 Pastel',
  candy: '🍬 Candy',
  chromatic: '🍃 Chromatic',
  forest: '🌲 Forest',
  ocean: '🌊 Ocean',
  deepSea: '🐋 Deep Sea',
  sunset: '🌅 Sunset',
  autumn: '🍂 Autumn',
  berry: '🫐 Berry',
  earth: '🏜️ Earth',
  vintage: '📻 Vintage',
  nordic: '❄️ Nordic',
  monochrome: '⚫ Monochrome',
  random: '🎲 Random'
};

const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  selectedPalette,
  onPaletteChange
}) => {
  const { theme } = useTheme();

  return (
    <Select value={selectedPalette} onValueChange={(value) => onPaletteChange(value as PaletteType)}>
      <SelectTrigger 
        className={`w-[160px] h-10 rounded-full backdrop-blur-md transition-colors ${
          theme === 'light' 
            ? 'bg-white/90 border-gray-200 shadow-lg hover:bg-white' 
            : 'bg-black/90 border-white/10 shadow-lg hover:bg-black text-white'
        }`}
      >
        <SelectValue placeholder="Select palette" />
      </SelectTrigger>
      <SelectContent
        className={`rounded-xl backdrop-blur-md ${
          theme === 'light'
            ? 'bg-white/95 border-gray-200'
            : 'bg-black/95 border-white/10 text-white'
        }`}
        style={{ maxHeight: '300px' }}
      >
        {Object.entries(paletteNames).map(([key, name]) => (
          <SelectItem 
            key={key} 
            value={key}
            className={`rounded-lg mx-1 ${
              theme === 'dark' 
                ? 'focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10' 
                : 'focus:bg-gray-100 data-[state=checked]:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{name}</span>
              <div className="flex gap-1">
                {Array.isArray(palettes[key as PaletteType]) ? (
                  (palettes[key as PaletteType] as string[]).slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full border ${
                        theme === 'dark' ? 'border-white/20' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))
                ) : (
                  // For random palette, show question marks or random color dots
                  [0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full border ${
                        theme === 'dark' ? 'border-white/20' : 'border-gray-300'
                      }`}
                      style={{ 
                        background: `linear-gradient(45deg, 
                          hsl(${Math.random() * 360}, 70%, 50%), 
                          hsl(${Math.random() * 360}, 70%, 50%))`
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PaletteSelector;