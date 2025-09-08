/** @format */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiSettings3Fill, RiShapeFill, RiPaletteFill, RiArrowDownSLine } from '@remixicon/react';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from './ui/sheet';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useTheme } from '../theme/theme-provider';
import { useCanvasSettings } from '../contexts/CanvasSettingsContext';

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
    return theme === 'light'
      ? 'bg-black/5 border border-black/10 rounded-lg p-4 sm:p-3'
      : 'bg-white/5 border border-white/10 rounded-lg p-4 sm:p-3';
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
            ? '[&_[data-slot=slider-track]]:bg-black/10 [&_[data-slot=slider-track]]:h-3 sm:[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-black/40 [&_[data-slot=slider-thumb]]:border-black/40 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:w-6 [&_[data-slot=slider-thumb]]:h-6 sm:[&_[data-slot=slider-thumb]]:w-5 sm:[&_[data-slot=slider-thumb]]:h-5'
            : '[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-track]]:h-3 sm:[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-white/40 [&_[data-slot=slider-thumb]]:border-white/40 [&_[data-slot=slider-thumb]]:bg-black [&_[data-slot=slider-thumb]]:w-6 [&_[data-slot=slider-thumb]]:h-6 sm:[&_[data-slot=slider-thumb]]:w-5 sm:[&_[data-slot=slider-thumb]]:h-5'
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
      ? 'border-black/30 bg-black/10 text-black'
      : 'border-white/30 bg-white/10 text-white';
  };

  const getInputClass = () => {
    return theme === 'light'
      ? 'bg-black/10 border-black/30 rounded-full py-2 sm:py-1.5 px-3 text-black text-sm w-[80px] sm:w-[70px] min-h-[44px] sm:min-h-0'
      : 'bg-white/10 border-white/30 rounded-full py-2 sm:py-1.5 px-3 text-white text-sm w-[80px] sm:w-[70px] min-h-[44px] sm:min-h-0';
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
        className={`${
          theme === 'light'
            ? 'data-[state=checked]:bg-black/70 data-[state=unchecked]:bg-black/10 border-black/20'
            : 'data-[state=checked]:bg-white/70 data-[state=unchecked]:bg-white/10 border-white/20'
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
      ? 'bg-black/10 border-black/20 text-black hover:bg-black/15'
      : 'bg-white/10 border-white/20 text-white hover:bg-white/15';
  };

  const getContentClass = () => {
    return theme === 'light'
      ? 'bg-white/95 border-black/20 text-black backdrop-blur-md'
      : 'bg-black/95 border-white/20 text-white backdrop-blur-md';
  };

  const getItemClass = () => {
    return theme === 'light'
      ? 'hover:bg-black/10 focus:bg-black/10 text-black cursor-pointer'
      : 'hover:bg-white/10 focus:bg-white/10 text-white cursor-pointer';
  };

  const getCurrentValueDisplay = () => {
    switch (currentValue) {
      case 'circle':
        return '⭕ Circle';
      case 'emoji':
        return '🌟 Emoji';
      case 'dollar':
        return '💲 Dollar';
      default:
        return '⭕ Circle';
    }
  };

  return (
    <div className='flex items-center justify-between w-full'>
      <label className={getLabelClass()}>{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className={`px-4 py-3 sm:px-3 sm:py-2 rounded-md border text-sm ${getTriggerClass()} min-h-[44px] sm:min-h-0`}
            aria-label={ariaLabel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {getCurrentValueDisplay()}
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={getContentClass()}>
          <DropdownMenuItem className={getItemClass()} onClick={() => onValueChange('circle')}>
            ⭕ Circle
          </DropdownMenuItem>
          <DropdownMenuItem className={getItemClass()} onClick={() => onValueChange('emoji')}>
            🌟 Emoji
          </DropdownMenuItem>
          <DropdownMenuItem className={getItemClass()} onClick={() => onValueChange('dollar')}>
            💲 Dollar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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
}

/**
 * ControlPanel provides UI controls for adjusting canvas settings
 */
const ControlPanel: React.FC<ControlPanelProps> = ({ mode = 'node' }) => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useCanvasSettings();

  // Destructure settings for easier access
  const {
    gridSize,
    gridWidth,
    gridHeight,
    gapFactor,
    padding,
    strokeWidth,
    hoverScale,
    renderMode,
    magneticEffect,
    animationsEnabled,
    fillPercentage
  } = settings;
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [editingGridSize, setEditingGridSize] = useState<boolean>(false);
  const [editingGapFactor, setEditingGapFactor] = useState<boolean>(false);
  const [editingPadding, setEditingPadding] = useState<boolean>(false);
  const [editingStrokeWidth, setEditingStrokeWidth] = useState<boolean>(false);
  const [editingHoverScale, setEditingHoverScale] = useState<boolean>(false);
  const [gridInputValue, setGridInputValue] = useState<number>(gridSize);
  const [, setGridWidthValue] = useState<number>(gridWidth || gridSize);
  const [, setGridHeightValue] = useState<number>(gridHeight || gridSize);
  const [gapInputValue, setGapInputValue] = useState<number>(gapFactor);
  const [paddingInputValue, setPaddingInputValue] = useState<number>(padding);
  const [strokeWidthValue, setStrokeWidthValue] = useState<number>(strokeWidth);
  const [hoverScaleValue, setHoverScaleValue] = useState<number>(hoverScale);

  // Update local states when props change
  useEffect(() => {
    setGridInputValue(gridSize);
    setGridWidthValue(gridWidth || gridSize);
    setGridHeightValue(gridHeight || gridSize);
    setGapInputValue(gapFactor);
    setPaddingInputValue(padding);
    setStrokeWidthValue(strokeWidth);
    setHoverScaleValue(hoverScale);
  }, [gridSize, gridWidth, gridHeight, gapFactor, padding, strokeWidth, hoverScale]);

  //------------------------------------------
  // Event Handlers
  //------------------------------------------

  /**
   * Handle grid size input changes
   */
  const handleGridChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setGridInputValue(value);
    }
  };

  /**
   * Submit custom grid size
   */
  const submitGridSize = () => {
    if (gridInputValue > 0) {
      updateSettings({
        gridSize: gridInputValue,
        gridWidth: gridInputValue,
        gridHeight: gridInputValue
      });
      setEditingGridSize(false);
    }
  };

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
  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
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
        </SheetTrigger>

        <SheetContent
          side='left'
          className={`w-full sm:w-96 md:w-80 p-0 ${
            theme === 'light'
              ? 'border-r border-black/20 text-black bg-white/98 backdrop-blur-xl'
              : 'border-r border-white/20 text-white bg-black/98 backdrop-blur-xl'
          }`}
        >
          <SheetHeader className='p-4'></SheetHeader>

          <div className='flex flex-col gap-8 px-4 pb-6 overflow-y-auto max-h-full'>
            {/* Shape Configuration Section */}
            <CollapsibleSection title='Shape Configuration' icon={<RiShapeFill />} theme={theme}>
              <ControlRow label='Size' theme={theme} currentValue={`${gridSize} x ${gridSize}`}>
                {editingGridSize ? (
                  <EditableValue
                    theme={theme}
                    value={gridInputValue}
                    onChange={handleGridChange}
                    onSubmit={submitGridSize}
                    onEditClick={() => setEditingGridSize(true)}
                    inputProps={{ min: '2', max: '100' }}
                    ariaLabel='Custom Grid Size'
                  />
                ) : (
                  <SliderControl
                    theme={theme}
                    currentValue={gridSize}
                    min={2}
                    max={100}
                    step={1}
                    onChange={(value) =>
                      updateSettings({
                        gridSize: value,
                        gridWidth: value,
                        gridHeight: value
                      })
                    }
                    ariaLabel='Grid Size'
                  />
                )}
              </ControlRow>

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
            </CollapsibleSection>

            {/* Display Options Section */}
            <CollapsibleSection title='Display Options' icon={<RiPaletteFill />} theme={theme}>
              <SwitchControl
                theme={theme}
                isChecked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              />

              <SwitchControl
                theme={theme}
                isChecked={animationsEnabled}
                onCheckedChange={(enabled) => updateSettings({ animationsEnabled: enabled })}
                label='Animations'
                ariaLabel={`${animationsEnabled ? 'Disable' : 'Enable'} animations`}
              />

              <SwitchControl
                theme={theme}
                isChecked={magneticEffect}
                onCheckedChange={(enabled) => updateSettings({ magneticEffect: enabled })}
                label='Magnetic Effect'
                ariaLabel={`${magneticEffect ? 'Disable' : 'Enable'} magnetic effect`}
              />

              <DropdownControl
                theme={theme}
                currentValue={renderMode}
                onValueChange={(mode) => updateSettings({ renderMode: mode })}
                label='Render Mode'
                ariaLabel='Select render mode'
              />

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
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ControlPanel;
