/**
 * Utility functions shared across the application
 */

/**
 * Detects if the current device is a mobile device
 * @returns true if mobile device detected, false otherwise
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (window.innerWidth <= 768) ||
         ('ontouchstart' in window);
};
