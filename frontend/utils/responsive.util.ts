import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

// Base dimensions that designs are created for
const BASE_WIDTH = 375; // Standard iPhone width for designs
const BASE_HEIGHT = 812; // Standard iPhone height for designs

// Default screen dimensions for static contexts
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

/**
 * Responsive width calculation - scales values relative to design's base width
 */
export const wp = (widthPercent: number): number => {
  const screenWidth = WINDOW_WIDTH;
  return PixelRatio.roundToNearestPixel((screenWidth * widthPercent) / BASE_WIDTH);
};

/**
 * Responsive height calculation - scales values relative to design's base height
 */
export const hp = (heightPercent: number): number => {
  const screenHeight = WINDOW_HEIGHT;
  return PixelRatio.roundToNearestPixel((screenHeight * heightPercent) / BASE_HEIGHT);
};

/**
 * Responsive font scaling
 * Scales the font size based on the screen size while respecting user's device font scale settings
 */
export const fontScale = (fontSize: number): number => {
  const standardLength = WINDOW_WIDTH > WINDOW_HEIGHT ? WINDOW_HEIGHT : WINDOW_WIDTH;
  const offset = WINDOW_WIDTH > 550 ? 1.25 : 1; // Bigger fonts for tablet-sized screens
  
  const scale = standardLength / BASE_WIDTH;
  
  const newSize = (fontSize * scale) * offset;
  
  // Cap the font size for very large screens
  if (WINDOW_WIDTH > 1024) {
    return Math.round(Math.min(newSize, fontSize * 1.5));
  }
  
  return Math.round(Math.min(newSize, fontSize * 1.3));
};

/**
 * Calculate responsive dimensions based on current screen size
 * Use this hook to get real-time dimensions as the component renders
 */
export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();
  
  // Calculate the current scale ratio compared to our base dimensions
  const widthRatio = width / BASE_WIDTH;
  const heightRatio = height / BASE_HEIGHT;
  
  // Create responsive sizing functions using the current dimensions
  const wpDynamic = (size: number): number => {
    return PixelRatio.roundToNearestPixel(size * widthRatio);
  };
  
  const hpDynamic = (size: number): number => {
    return PixelRatio.roundToNearestPixel(size * heightRatio);
  };
  
  const fontScaleDynamic = (size: number): number => {
    const standardLength = width > height ? height : width;
    const offset = width > 550 ? 1.25 : 1;
    const scale = standardLength / BASE_WIDTH;
    
    const newSize = (size * scale) * offset;
    
    if (width > 1024) {
      return Math.round(Math.min(newSize, size * 1.5));
    }
    
    return Math.round(Math.min(newSize, size * 1.3));
  };
  
  // Return screen metrics and responsive functions
  return {
    width,
    height,
    wpDynamic,
    hpDynamic,
    fontScaleDynamic,
    isSmallScreen: width < 375,
    isMediumScreen: width >= 375 && width < 768,
    isLargeScreen: width >= 768,
    isTablet: width >= 768 && width < 1024,
    isLandscape: width > height,
  };
};

/**
 * Get responsive paddings that scale with the screen size
 */
export const getResponsivePadding = () => {
  const { width } = Dimensions.get('window');
  
  if (width < 350) {
    return {
      horizontal: 10,
      vertical: 8
    };
  } else if (width >= 350 && width < 400) {
    return {
      horizontal: 15,
      vertical: 12
    };
  } else {
    return {
      horizontal: 20,
      vertical: 16
    };
  }
};

/**
 * Calculate a responsive value based on screen size with constraints
 */
export const responsiveSize = (size: number, factor = 0.5): number => {
  const { width } = Dimensions.get('window');
  
  // Base size for reference device width
  const baseWidth = 375;
  
  // Calculate the scale factor based on current width vs base width
  let scaleFactor = width / baseWidth;
  
  // Apply the user-specified factor to control how much scaling happens
  scaleFactor = 1 + ((scaleFactor - 1) * factor);
  
  // Apply limits to avoid too small or too large values
  scaleFactor = Math.max(0.8, Math.min(scaleFactor, 1.3));
  
  return Math.round(size * scaleFactor);
}; 