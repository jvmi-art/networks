/** @format */

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '../../components/ui/switch';
import { useTheme } from '../../theme/theme-provider';
import { processImageFromCanvas, generateMaskFromCanvas, MaskConfig } from '../../utils/imageProcessor';


/**
 * Props for the ImageUploader component
 */
interface ImageUploaderProps {
  gridSize: number;
  onPixelDataReady: (colorGrid: { [key: string]: string }) => void;
  onMaskDataReady?: (maskPoints: { [key: string]: boolean }) => void;
  isMaskMode?: boolean;
  onMaskModeToggle?: (enabled: boolean) => void;
  maskConfig?: MaskConfig;
  maxPreviewHeight?: number;
  showModeToggle?: boolean;
}

/**
 * Styling utilities for theme-aware components
 */
const createThemeStyles = (theme: string) => ({
  title:
    theme === 'light' ? 'text-black text-lg font-semibold' : 'text-white text-lg font-semibold',

  uploadArea:
    theme === 'light'
      ? 'border-black/20 text-black/70 hover:border-black/30 hover:bg-black/5'
      : 'border-white/20 text-white/70 hover:border-white/30 hover:bg-white/5',

  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',

  text: theme === 'light' ? 'text-black' : 'text-white',

  switch:
    theme === 'light'
      ? 'data-[state=checked]:bg-black/70 data-[state=unchecked]:bg-black/10 border-black/20'
      : 'data-[state=checked]:bg-white/70 data-[state=unchecked]:bg-white/10 border-white/20'
});

/**
 * Button variant styles
 */
const getButtonStyles = (
  theme: string,
  variant: 'primary' | 'secondary' | 'disabled' = 'primary'
) => {
  const baseClass = 'w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200';

  const variants = {
    primary:
      theme === 'light'
        ? 'bg-green-500/20 border border-green-500/30 text-black hover:bg-green-500/30'
        : 'bg-green-500/20 border border-green-500/30 text-white hover:bg-green-500/30',
    secondary:
      theme === 'light'
        ? 'bg-black/10 border border-black/20 text-black hover:bg-black/15'
        : 'bg-white/10 border border-white/20 text-white hover:bg-white/15',
    disabled:
      theme === 'light'
        ? 'bg-gray-500/10 border border-gray-500/20 text-black/50 cursor-not-allowed'
        : 'bg-gray-500/10 border border-gray-500/20 text-white/50 cursor-not-allowed'
  };

  return `${baseClass} ${variants[variant]}`;
};


/**
 * Component that handles image upload and pixel sampling
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  gridSize,
  onPixelDataReady,
  onMaskDataReady,
  isMaskMode = false,
  onMaskModeToggle,
  maskConfig = {},
  maxPreviewHeight = 192, // 48 * 4 (12rem)
  showModeToggle = true
}) => {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const styles = createThemeStyles(theme);

  // Button animation variants
  const buttonVariants = {
    hover: { scale: 1.03, boxShadow: '0px 0px 8px rgba(255, 255, 255, 0.3)' },
    tap: { scale: 0.95, boxShadow: '0px 0px 0px rgba(255, 255, 255, 0)' }
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setPreviewUrl(fileUrl);
  };

  /**
   * Process image data
   */
  const processImage = useCallback(() => {
    if (!selectedImage || !previewUrl || !canvasRef.current) {
      setError('No image selected or canvas not ready');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setError('Could not get canvas context');
          setIsProcessing(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (isMaskMode && onMaskDataReady) {
          const maskData = generateMaskFromCanvas(ctx, img, gridSize, gridSize, maskConfig);
          onMaskDataReady(maskData);
        } else {
          const colorGrid = processImageFromCanvas(ctx, img, gridSize, gridSize);
          onPixelDataReady(colorGrid);
        }

        setIsProcessing(false);
      } catch (err) {
        setError('Error processing image: ' + (err instanceof Error ? err.message : String(err)));
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [
    selectedImage,
    previewUrl,
    gridSize,
    onPixelDataReady,
    onMaskDataReady,
    isMaskMode,
    maskConfig
  ]);

  /**
   * Handle mask mode toggle
   */
  const handleMaskModeToggle = () => {
    onMaskModeToggle?.(!isMaskMode);
  };

  return (
    <div className='flex flex-col gap-6 w-full py-2'>
      <h3 className={styles.title}>{isMaskMode ? 'Image Mask' : 'Image to Grid'}</h3>

      {/* File Upload Section */}
      <div className='space-y-3'>
        <motion.label
          className={`
            w-full py-4 px-4 rounded-lg text-sm font-medium cursor-pointer
            transition-all duration-200 border-2 border-dashed
            flex items-center justify-center gap-2
            ${styles.uploadArea}
          `}
          htmlFor='imageUpload'
          whileHover='hover'
          whileTap='tap'
          variants={buttonVariants}
        >
          {selectedImage ? (
            <>
              Change Image <span>🖼️</span>
            </>
          ) : (
            <>
              Choose Image <span>🖼️</span>
            </>
          )}
        </motion.label>
        <input
          type='file'
          id='imageUpload'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
      </div>

      {/* Image Preview Section */}
      {previewUrl && (
        <div className='space-y-3'>
          <img
            src={previewUrl}
            alt='Preview'
            className='w-full object-contain rounded-lg border border-opacity-20'
            style={{
              maxHeight: `${maxPreviewHeight}px`,
              borderColor: styles.borderColor
            }}
          />
        </div>
      )}

      {/* Process Button Section */}
      <div className='space-y-3'>
        <motion.button
          className={getButtonStyles(
            theme,
            selectedImage && !isProcessing ? 'primary' : 'disabled'
          )}
          onClick={processImage}
          disabled={!selectedImage || isProcessing}
          whileHover={selectedImage && !isProcessing ? 'hover' : undefined}
          whileTap={selectedImage && !isProcessing ? 'tap' : undefined}
          variants={buttonVariants}
        >
          {isProcessing ? (
            <span className='flex items-center justify-center gap-2'>
              Processing... <span className='animate-spin'>⚙️</span>
            </span>
          ) : isMaskMode ? (
            <span className='flex items-center justify-center gap-2'>
              Generate Mask <span>🎭</span>
            </span>
          ) : (
            <span className='flex items-center justify-center gap-2'>
              Generate Grid <span>🔳</span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Mode Toggle Section */}
      {showModeToggle && onMaskModeToggle && (
        <div className='flex items-center justify-between w-full py-2'>
          <span className={`${styles.text} text-sm font-medium`}>Mask Mode</span>
          <Switch
            checked={isMaskMode}
            onCheckedChange={handleMaskModeToggle}
            aria-label='Toggle mask mode'
            className={styles.switch}
            size='lg'
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/20'>
          <div className='text-red-400 text-sm font-medium'>{error}</div>
        </div>
      )}

      {/* Hidden canvas used for image processing */}
      <canvas ref={canvasRef} className='hidden' />
    </div>
  );
};

export default ImageUploader;
