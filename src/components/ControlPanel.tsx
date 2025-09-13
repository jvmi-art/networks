/** @format */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiSettings3Fill, RiShapeFill, RiPaletteFill, RiArrowDownSLine } from '@remixicon/react';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from './ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from './ui/drawer';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { useTheme } from '../theme/theme-provider';
import { useCanvasSettings } from '../contexts/CanvasSettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { NODE_DIMENSIONS, CUBE_DIMENSIONS } from '../constants';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

/**
 * ControlPanel now uses context - no props needed
 */

// Motion variants for animations
const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: '0px 0px 8px rgba(255, 255, 255, 0.3)'
  },
  tap: {
    scale: 0.95,
    boxShadow: '0px 0px 0px rgba(255, 255, 255, 0)'
  }
};

const sectionVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut' as const
    }
  },
  open: {
    opacity: 1,
    height: 'auto' as const,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const
    }
  }
};

//------------------------------------------
// Sub-Components
//------------------------------------------

interface ControlRowProps {
  label: string;
  theme: 'light' | 'dark';
  children: React.ReactNode;
  currentValue?: string | number;
  description?: string;
}

const ControlRow: React.FC<ControlRowProps> = ({ label, theme, children, currentValue }) => {
  const getLabelClass = () => {
    return theme === 'light' ? 'text-black text-sm font-medium' : 'text-white text-sm font-medium';
  };

  const getCurrentValueClass = () => {
    return theme === 'light'
      ? 'text-black/80 text-xs bg-black/5 px-2 py-1 rounded-md'
      : 'text-white/80 text-xs bg-white/5 px-2 py-1 rounded-md';
  };

  const getContainerClass = () => {
    return 'py-4 sm:py-3';
  };

  return (
    <div className={`flex flex-col gap-4 sm:gap-3 w-full ${getContainerClass()}`}>
      <div className='flex flex-col gap-2 sm:gap-1'>
        <div className='flex items-center justify-between'>
          <label className={getLabelClass()}>{label}</label>
          {currentValue !== undefined && (
            <span className={getCurrentValueClass()}>{currentValue}</span>
          )}
        </div>
      </div>
      <div className='flex items-center justify-start min-h-[44px] sm:min-h-0'>{children}</div>
    </div>
  );
};

interface SliderControlProps {
  theme: 'light' | 'dark';
  currentValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  theme,
  currentValue,
  min,
  max,
  step,
  onChange,
  ariaLabel
}) => {
  const handleSliderChange = (values: number[]) => {
    if (values.length > 0) {
      onChange(values[0]);
    }
  };

  return (
    <div className='w-full'>
      <Slider
        value={[currentValue]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel}
        className={`w-full ${
          theme === 'light'
            ? '[&_[data-slot=slider-track]]:bg-black/5 [&_[data-slot=slider-track]]:backdrop-blur-sm [&_[data-slot=slider-track]]:h-3 sm:[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-black/30 [&_[data-slot=slider-thumb]]:border-black/30 [&_[data-slot=slider-thumb]]:bg-white/90 [&_[data-slot=slider-thumb]]:backdrop-blur-sm [&_[data-slot=slider-thumb]]:w-6 [&_[data-slot=slider-thumb]]:h-6 sm:[&_[data-slot=slider-thumb]]:w-5 sm:[&_[data-slot=slider-thumb]]:h-5'
            : '[&_[data-slot=slider-track]]:bg-white/5 [&_[data-slot=slider-track]]:backdrop-blur-sm [&_[data-slot=slider-track]]:h-3 sm:[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-white/30 [&_[data-slot=slider-thumb]]:border-white/30 [&_[data-slot=slider-thumb]]:bg-black/90 [&_[data-slot=slider-thumb]]:backdrop-blur-sm [&_[data-slot=slider-thumb]]:w-6 [&_[data-slot=slider-thumb]]:h-6 sm:[&_[data-slot=slider-thumb]]:w-5 sm:[&_[data-slot=slider-thumb]]:h-5'
        }`}
      />
    </div>
  );
};

interface EditableValueProps {
  theme: 'light' | 'dark';
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onEditClick: () => void;
  inputProps?: {
    min?: string;
    max?: string;
    step?: string;
  };
  ariaLabel: string;
}

const EditableValue: React.FC<EditableValueProps> = ({
  theme,
  value,
  onChange,
  onSubmit,
  onEditClick,
  inputProps = {},
  ariaLabel
}) => {
  const getDefaultButtonClass = () => {
    return theme === 'light'
      ? 'border-black/20 bg-black/5 backdrop-blur-sm text-black'
      : 'border-white/20 bg-white/5 backdrop-blur-sm text-white';
  };

  const getInputClass = () => {
    return theme === 'light'
      ? 'bg-black/5 backdrop-blur-sm border-black/20 rounded-full py-2 sm:py-1.5 px-3 text-black text-sm w-[80px] sm:w-[70px] min-h-[44px] sm:min-h-0'
      : 'bg-white/5 backdrop-blur-sm border-white/20 rounded-full py-2 sm:py-1.5 px-3 text-white text-sm w-[80px] sm:w-[70px] min-h-[44px] sm:min-h-0';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <>
      <input
        type='number'
        {...inputProps}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={getInputClass()}
        aria-label={ariaLabel}
        autoFocus
      />
      <motion.button
        className={`rounded-full border ${getDefaultButtonClass()} cursor-pointer text-[10px] flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 aspect-square min-h-[44px] sm:min-h-0`}
        onClick={onSubmit}
        aria-label='Apply value'
        whileHover='hover'
        whileTap='tap'
        variants={buttonVariants}
      >
        ✓
      </motion.button>
      <motion.button
        className={`py-1 px-2 rounded-full border ${getDefaultButtonClass()} cursor-pointer text-[10px] flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 aspect-square min-h-[44px] sm:min-h-0`}
        onClick={onEditClick}
        aria-label='Edit value'
        whileHover='hover'
        whileTap='tap'
        variants={buttonVariants}
      >
        ✏️
      </motion.button>
    </>
  );
};

interface SwitchControlProps {
  theme: 'light' | 'dark';
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  ariaLabel: string;
}

const SwitchControl: React.FC<SwitchControlProps> = ({
  theme,
  isChecked,
  onCheckedChange,
  label,
  ariaLabel
}) => {
  const getLabelClass = () => {
    return theme === 'light' ? 'text-black text-sm font-medium' : 'text-white text-sm font-medium';
  };

  return (
    <div className='flex items-center justify-between w-full min-h-[44px] sm:min-h-0'>
      <label className={getLabelClass()}>{label}</label>
      <Switch
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        aria-label={ariaLabel}
        size='lg'
        className={`backdrop-blur-sm ${
          theme === 'light'
            ? 'data-[state=checked]:bg-black/60 data-[state=unchecked]:bg-black/5 border-black/15'
            : 'data-[state=checked]:bg-white/60 data-[state=unchecked]:bg-white/5 border-white/15'
        }`}
      />
    </div>
  );
};

interface DropdownControlProps {
  theme: 'light' | 'dark';
  currentValue: 'circle' | 'emoji' | 'dollar';
  onValueChange: (value: 'circle' | 'emoji' | 'dollar') => void;
  label: string;
  ariaLabel: string;
}

interface PaletteDropdownControlProps {
  theme: 'light' | 'dark';
  currentValue: string;
  onValueChange: (value: string) => void;
  label: string;
  ariaLabel: string;
}

const DropdownControl: React.FC<DropdownControlProps> = ({
  theme,
  currentValue,
  onValueChange,
  label,
  ariaLabel
}) => {
  const getLabelClass = () => {
    return theme === 'light' ? 'text-black text-sm font-medium' : 'text-white text-sm font-medium';
  };

  const getTriggerClass = () => {
    return theme === 'light'
      ? 'bg-black/5 backdrop-blur-sm border-black/15 text-black hover:bg-black/10 h-auto py-3 sm:py-2'
      : 'bg-white/5 backdrop-blur-sm border-white/15 text-white hover:bg-white/10 h-auto py-3 sm:py-2';
  };

  const getContentClass = () => {
    return theme === 'light'
      ? 'bg-white/85 border-black/10 text-black backdrop-blur-xl'
      : 'bg-black/85 border-white/10 text-white backdrop-blur-xl';
  };

  const getItemClass = () => {
    return theme === 'light'
      ? 'hover:bg-black/10 focus:bg-black/10 text-black cursor-pointer'
      : 'hover:bg-white/10 focus:bg-white/10 text-white cursor-pointer';
  };

  const renderModes = {
    circle: '⭕ Circle',
    emoji: '🌟 Emoji',
    dollar: '💲 Dollar'
  };

  return (
    <div className='flex items-center justify-between w-full'>
      <label className={getLabelClass()}>{label}</label>
      <Select value={currentValue} onValueChange={(value) => onValueChange(value as 'circle' | 'emoji' | 'dollar')}>
        <SelectTrigger 
          className={`w-[140px] rounded-md border text-sm ${getTriggerClass()} min-h-[44px] sm:min-h-0`}
          aria-label={ariaLabel}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent 
          className={getContentClass()}
          position="popper"
          side="bottom"
          align="end"
          sideOffset={5}
          alignOffset={-5}
        >
          {Object.entries(renderModes).map(([key, name]) => (
            <SelectItem 
              key={key}
              value={key}
              className={getItemClass()}
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const PaletteDropdownControl: React.FC<PaletteDropdownControlProps> = ({
  theme,
  currentValue,
  onValueChange,
  label,
  ariaLabel
}) => {
  const getLabelClass = () => {
    return theme === 'light' ? 'text-black text-sm font-medium' : 'text-white text-sm font-medium';
  };

  const getTriggerClass = () => {
    return theme === 'light'
      ? 'bg-black/5 backdrop-blur-sm border-black/15 text-black hover:bg-black/10 h-auto py-3 sm:py-2'
      : 'bg-white/5 backdrop-blur-sm border-white/15 text-white hover:bg-white/10 h-auto py-3 sm:py-2';
  };

  const getContentClass = () => {
    return theme === 'light'
      ? 'bg-white/95 border-black/20 text-black backdrop-blur-md max-h-[220px]'
      : 'bg-black/95 border-white/20 text-white backdrop-blur-md max-h-[220px]';
  };

  const getItemClass = () => {
    return theme === 'light'
      ? 'hover:bg-black/10 focus:bg-black/10 text-black cursor-pointer'
      : 'hover:bg-white/10 focus:bg-white/10 text-white cursor-pointer';
  };

  const paletteNames: Record<string, string> = {
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

  return (
    <div className='flex items-center justify-between w-full'>
      <label className={getLabelClass()}>{label}</label>
      <Select value={currentValue} onValueChange={onValueChange}>
        <SelectTrigger 
          className={`w-[160px] rounded-md border text-sm ${getTriggerClass()} min-h-[44px] sm:min-h-0`}
          aria-label={ariaLabel}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent 
          className={getContentClass()}
          position="popper"
          side="bottom"
          align="end"
          sideOffset={5}
          alignOffset={-5}
        >
          {Object.entries(paletteNames).map(([key, name]) => (
            <SelectItem 
              key={key}
              value={key}
              className={getItemClass()}
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface DimensionSelectorProps {
  mode: 'node' | 'block';
  theme: 'light' | 'dark';
}

const DimensionSelector: React.FC<DimensionSelectorProps> = ({ mode, theme }) => {
  const { settings, updateSettings } = useCanvasSettings();
  
  // Determine current dimension based on settings and mode
  const getCurrentDimension = (): string => {
    const width = settings.gridWidth || settings.gridSize;
    const height = settings.gridHeight || settings.gridSize;
    
    const dimensions = mode === 'block' ? CUBE_DIMENSIONS : NODE_DIMENSIONS;
    
    // Find matching dimension configuration
    for (const [key, config] of Object.entries(dimensions)) {
      if (config.gridWidth === width && config.gridHeight === height) {
        return key;
      }
    }
    return '5x5'; // Default
  };

  const currentDimension = getCurrentDimension();

  const handleDimensionChange = (dimension: string) => {
    const dimensions = mode === 'block' ? CUBE_DIMENSIONS : NODE_DIMENSIONS;
    const config = dimensions[dimension as keyof typeof dimensions];
    if (config) {
      updateSettings({
        gridWidth: config.gridWidth,
        gridHeight: config.gridHeight,
        gridSize: Math.max(config.gridWidth, config.gridHeight), // For backward compatibility
        canvasWidth: config.canvasWidth,
        canvasHeight: config.canvasHeight,
        canvasSize: Math.max(config.canvasWidth, config.canvasHeight), // For backward compatibility
        padding: config.padding
      });
    }
  };

  const getTabTriggerClass = () => {
    return theme === 'light'
      ? 'data-[state=active]:bg-black/10 data-[state=active]:text-black text-gray-600 hover:text-gray-800 rounded-md transition-colors'
      : 'data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 hover:text-gray-200 rounded-md transition-colors';
  };

  return (
    <Tabs value={currentDimension} onValueChange={handleDimensionChange} className="w-full">
      <TabsList className={`grid ${mode === 'block' ? 'grid-cols-5' : 'grid-cols-5'} gap-1 h-auto p-0 bg-transparent border-0 w-full`}>
        {mode === 'block' ? (
          // Cube dimensions for 3D mode (only square grids)
          <>
            <TabsTrigger value="5x5" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              5×5
            </TabsTrigger>
            <TabsTrigger value="10x10" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              10×10
            </TabsTrigger>
            <TabsTrigger value="15x15" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              15×15
            </TabsTrigger>
            <TabsTrigger value="20x20" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              20×20
            </TabsTrigger>
            <TabsTrigger value="25x25" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              25×25
            </TabsTrigger>
          </>
        ) : (
          // Node dimensions for 2D mode - includes rectangular options
          <>
            <TabsTrigger value="5x5" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              5×5
            </TabsTrigger>
            <TabsTrigger value="5x10" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              5×10
            </TabsTrigger>
            <TabsTrigger value="10x5" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              10×5
            </TabsTrigger>
            <TabsTrigger value="10x10" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              10×10
            </TabsTrigger>
            <TabsTrigger value="25x25" className={`${getTabTriggerClass()} py-3 text-sm font-medium`}>
              25×25
            </TabsTrigger>
          </>
        )}
      </TabsList>
    </Tabs>
  );
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  theme: 'light' | 'dark';
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='w-full'>
      <motion.button
        className={`w-full py-5 sm:py-4 cursor-pointer rounded-t-lg flex items-center justify-between transition-all duration-200 min-h-[56px] sm:min-h-0 active:scale-[0.98]`}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        <div className='flex items-center gap-4 sm:gap-3'>
          <span className='text-xl sm:text-lg'>{icon}</span>
          <span className='text-base sm:text-sm font-semibold'>{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className='text-lg sm:text-sm'
        >
          <RiArrowDownSLine />
        </motion.div>
      </motion.button>

      <motion.div
        initial={defaultOpen ? 'open' : 'closed'}
        animate={isOpen ? 'open' : 'closed'}
        variants={sectionVariants}
        className={`overflow-hidden`}
      >
        <div className='space-y-5 sm:space-y-4'>{children}</div>
      </motion.div>
    </div>
  );
};

//------------------------------------------
// Main Component
//------------------------------------------

interface ControlPanelProps {
  mode?: 'node' | 'block';
  selectedPalette?: string;
  onPaletteChange?: (palette: string) => void;
  randomColorAnimation?: boolean;
  onRandomColorAnimationChange?: (enabled: boolean) => void;
}

/**
 * ControlPanel provides UI controls for adjusting canvas settings
 */
const ControlPanel: React.FC<ControlPanelProps> = ({ 
  mode = 'node',
  selectedPalette,
  onPaletteChange,
  randomColorAnimation = false,
  onRandomColorAnimationChange
}) => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useCanvasSettings();

  // Destructure settings for easier access
  const {
    gapFactor,
    padding,
    strokeWidth,
    hoverScale,
    renderMode,
    fillPercentage
  } = settings;
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [editingGapFactor, setEditingGapFactor] = useState<boolean>(false);
  const [editingPadding, setEditingPadding] = useState<boolean>(false);
  const [editingStrokeWidth, setEditingStrokeWidth] = useState<boolean>(false);
  const [editingHoverScale, setEditingHoverScale] = useState<boolean>(false);
  const [gapInputValue, setGapInputValue] = useState<number>(gapFactor);
  const [paddingInputValue, setPaddingInputValue] = useState<number>(padding);
  const [strokeWidthValue, setStrokeWidthValue] = useState<number>(strokeWidth);
  const [hoverScaleValue, setHoverScaleValue] = useState<number>(hoverScale);

  // Update local states when props change
  useEffect(() => {
    setGapInputValue(gapFactor);
    setPaddingInputValue(padding);
    setStrokeWidthValue(strokeWidth);
    setHoverScaleValue(hoverScale);
  }, [gapFactor, padding, strokeWidth, hoverScale]);

  //------------------------------------------
  // Event Handlers
  //------------------------------------------

  /**
   * Handle gap factor input changes
   */
  const handleGapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setGapInputValue(value);
    }
  };

  /**
   * Submit custom gap factor
   */
  const submitGapFactor = () => {
    if (gapInputValue > 0) {
      updateSettings({ gapFactor: gapInputValue });
      setEditingGapFactor(false);
    }
  };

  /**
   * Handle padding input changes
   */
  const handlePaddingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setPaddingInputValue(value);
    }
  };

  /**
   * Submit custom padding
   */
  const submitPadding = () => {
    if (paddingInputValue >= 0) {
      updateSettings({ padding: paddingInputValue });
      setEditingPadding(false);
    }
  };

  /**
   * Handle stroke width input changes
   */
  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setStrokeWidthValue(value);
    }
  };

  /**
   * Submit custom stroke width
   */
  const submitStrokeWidth = () => {
    if (strokeWidthValue >= 0) {
      updateSettings({ strokeWidth: strokeWidthValue });
      setEditingStrokeWidth(false);
    }
  };

  /**
   * Handle hover scale input changes
   */
  const handleHoverScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setHoverScaleValue(value);
    }
  };

  /**
   * Submit custom hover scale
   */
  const submitHoverScale = () => {
    if (hoverScaleValue > 0) {
      updateSettings({ hoverScale: hoverScaleValue });
      setEditingHoverScale(false);
    }
  };

  //------------------------------------------
  // Render
  //------------------------------------------
  
  const settingsButton = (
    <motion.button
      className={`rounded-full ${
        theme === 'light' ? 'text-black/60' : 'text-white/60'
      } cursor-pointer text-xl flex items-center justify-center w-10 h-10 backdrop-blur-md ${
        theme === 'light'
          ? 'bg-white/90 border border-gray-200'
          : 'bg-black/90 border border-white/10'
      } transition-all duration-200`}
      aria-label='Open settings'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      variants={buttonVariants}
    >
      <RiSettings3Fill />
    </motion.button>
  );

  const settingsContent = (
    <div className={`flex flex-col gap-${isMobile ? '6' : '8'} px-4 pb-6 overflow-y-auto ${
      isMobile ? 'max-h-[calc(66vh-100px)]' : 'max-h-full'
    }`}>
            {/* Shape Configuration Section */}
            <CollapsibleSection title='Shape Configuration' icon={<RiShapeFill />} theme={theme}>
              <div className="flex flex-col gap-4 sm:gap-3 w-full py-4 sm:py-3">
                <label className={theme === 'light' ? 'text-black text-sm font-medium' : 'text-white text-sm font-medium'}>
                  Size
                </label>
                <DimensionSelector mode={mode} theme={theme} />
              </div>

              {/* Only show these controls in node mode */}
              {mode === 'node' && (
                <>
                  <ControlRow label='Spacing' theme={theme} currentValue={gapFactor}>
                    {editingGapFactor ? (
                      <EditableValue
                        theme={theme}
                        value={gapInputValue}
                        onChange={handleGapChange}
                        onSubmit={submitGapFactor}
                        onEditClick={() => setEditingGapFactor(true)}
                        inputProps={{ min: '0.1', max: '2', step: '0.1' }}
                        ariaLabel='Custom Gap Factor'
                      />
                    ) : (
                      <SliderControl
                        theme={theme}
                        currentValue={gapFactor}
                        min={0.1}
                        max={2}
                        step={0.1}
                        onChange={(value) => updateSettings({ gapFactor: value })}
                        ariaLabel='Gap Factor'
                      />
                    )}
                  </ControlRow>

                  <ControlRow label='Padding' theme={theme} currentValue={`${padding}px`}>
                    {editingPadding ? (
                      <EditableValue
                        theme={theme}
                        value={paddingInputValue}
                        onChange={handlePaddingChange}
                        onSubmit={submitPadding}
                        onEditClick={() => setEditingPadding(true)}
                        inputProps={{ min: '0', max: '200' }}
                        ariaLabel='Custom Padding'
                      />
                    ) : (
                      <SliderControl
                        theme={theme}
                        currentValue={padding}
                        min={0}
                        max={200}
                        step={1}
                        onChange={(value) => updateSettings({ padding: value })}
                        ariaLabel='Canvas Padding'
                      />
                    )}
                  </ControlRow>

                  <ControlRow
                    label='Outline'
                    theme={theme}
                    currentValue={strokeWidth === 0 ? 'None' : `${strokeWidth}px`}
                  >
                    {editingStrokeWidth ? (
                      <EditableValue
                        theme={theme}
                        value={strokeWidthValue}
                        onChange={handleStrokeWidthChange}
                        onSubmit={submitStrokeWidth}
                        onEditClick={() => setEditingStrokeWidth(true)}
                        inputProps={{ min: '0', max: '5', step: '0.5' }}
                        ariaLabel='Custom Stroke Width'
                      />
                    ) : (
                      <SliderControl
                        theme={theme}
                        currentValue={strokeWidth}
                        min={0}
                        max={5}
                        step={0.5}
                        onChange={(value) => updateSettings({ strokeWidth: value })}
                        ariaLabel='Stroke Width'
                      />
                    )}
                  </ControlRow>

                  <ControlRow label='Hover Scale' theme={theme} currentValue={`${hoverScale}x`}>
                    {editingHoverScale ? (
                      <EditableValue
                        theme={theme}
                        value={hoverScaleValue}
                        onChange={handleHoverScaleChange}
                        onSubmit={submitHoverScale}
                        onEditClick={() => setEditingHoverScale(true)}
                        inputProps={{ min: '1', max: '3', step: '0.1' }}
                        ariaLabel='Custom Hover Scale'
                      />
                    ) : (
                      <SliderControl
                        theme={theme}
                        currentValue={hoverScale}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(value) => updateSettings({ hoverScale: value })}
                        ariaLabel='Hover Scale Factor'
                      />
                    )}
                  </ControlRow>
                </>
              )}
            </CollapsibleSection>

            {/* Display Options Section */}
            <CollapsibleSection title='Display Options' icon={<RiPaletteFill />} theme={theme}>
              {/* Palette Selector */}
              {selectedPalette && onPaletteChange && (
                <PaletteDropdownControl
                  theme={theme}
                  currentValue={selectedPalette}
                  onValueChange={onPaletteChange}
                  label='Color Palette'
                  ariaLabel='Select color palette'
                />
              )}

              <SwitchControl
                theme={theme}
                isChecked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              />

              {/* Random Color Animation Toggle - only show in block mode */}
              {mode === 'block' && onRandomColorAnimationChange && (
                <SwitchControl
                  theme={theme}
                  isChecked={randomColorAnimation}
                  onCheckedChange={onRandomColorAnimationChange}
                  label='Color Animation'
                  ariaLabel={`${randomColorAnimation ? 'Disable' : 'Enable'} color animation`}
                />
              )}

              {/* Only show render mode in node mode */}
              {mode === 'node' && (
                <DropdownControl
                  theme={theme}
                  currentValue={renderMode}
                  onValueChange={(mode) => updateSettings({ renderMode: mode })}
                  label='Render Mode'
                  ariaLabel='Select render mode'
                />
              )}

              {/* Fill Percentage - only show in block mode */}
              {mode === 'block' && (
                <ControlRow label='Fill Pattern' theme={theme} currentValue={`${fillPercentage}%`}>
                  <SliderControl
                    theme={theme}
                    currentValue={fillPercentage}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(value) => updateSettings({ fillPercentage: value })}
                    ariaLabel='Fill Percentage'
                  />
                </ControlRow>
              )}
            </CollapsibleSection>
    </div>
  );

  // Mobile: Use Drawer for better swipe gestures
  if (isMobile) {
    return (
      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerTrigger asChild>
          {settingsButton}
        </DrawerTrigger>
        <DrawerContent className={`h-[66vh] backdrop-blur-2xl ${
          theme === 'light'
            ? 'border-t border-black/10'
            : 'border-t border-white/10'
        }`}>
          <DrawerHeader />
          {settingsContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Sheet
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        {settingsButton}
      </SheetTrigger>
      <SheetContent
        side='left'
        className={`w-full sm:w-96 md:w-80 p-0 backdrop-blur-2xl ${
          theme === 'light'
            ? 'border-r border-black/10 text-black'
            : 'border-r border-white/10 text-white'
        }`}
      >
        <SheetHeader className='p-4'></SheetHeader>
        {settingsContent}
      </SheetContent>
    </Sheet>
  );
};

export default ControlPanel;
