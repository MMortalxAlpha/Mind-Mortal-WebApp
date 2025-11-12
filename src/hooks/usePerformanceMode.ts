
import { useState, useEffect } from 'react';

export const usePerformanceMode = () => {
  // Check if device is low-end (approximation)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check if device is low-end (approximate method)
    const checkDevicePerformance = () => {
      // Device memory API (Chrome only)
      const memory = (navigator as any).deviceMemory;
      if (memory && memory < 4) {
        setIsLowEndDevice(true);
        return;
      }
      
      // Check if low-end mobile device via user agent (rough approximation)
      const ua = navigator.userAgent.toLowerCase();
      const isOldDevice = /android 4|android 5|android 6|iphone os 9|iphone os 10|iphone os 11/.test(ua);
      
      // Check if device has battery API and if battery level is low
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level < 0.2) {
            setIsLowEndDevice(true);
          }
        }).catch(() => {
          // If getBattery fails, fallback to user agent check
          setIsLowEndDevice(isOldDevice);
        });
      } else {
        // Fallback to user agent check if battery API not available
        setIsLowEndDevice(isOldDevice);
      }
    };
    
    // Check if reduced motion is enabled
    const checkReducedMotion = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(prefersReducedMotion.matches);
      
      // Listen for changes to the reduced motion preference
      prefersReducedMotion.addEventListener('change', (e) => {
        setReducedMotion(e.matches);
      });
    };
    
    checkMobile();
    checkDevicePerformance();
    checkReducedMotion();
    
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Determine if we should use lightweight animations
  const shouldReduceMotion = reducedMotion || isLowEndDevice || isMobile;
  
  // Recommended animation settings based on device capabilities
  const getAnimationSettings = (type: 'full' | 'reduced' | 'minimal') => {
    if (shouldReduceMotion) {
      // Minimal animations for low-end devices or reduced motion preference
      return {
        duration: 0.2,
        staggerChildren: 0.05,
        delayChildren: 0.05,
        transition: { duration: 0.2 },
        animate: { opacity: 1, y: 0 },
        initial: { opacity: 0, y: 10 }
      };
    } else if (isMobile) {
      // Reduced animations for mobile devices
      return {
        duration: 0.3,
        staggerChildren: 0.08,
        delayChildren: 0.08,
        transition: { duration: 0.3 },
        animate: { opacity: 1, y: 0 },
        initial: { opacity: 0, y: 15 }
      };
    } else {
      // Full animations for desktop
      return {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.1,
        transition: { duration: 0.5 },
        animate: { opacity: 1, y: 0 },
        initial: { opacity: 0, y: 20 }
      };
    }
  };

  return {
    isMobile,
    isLowEndDevice,
    reducedMotion,
    shouldReduceMotion,
    getAnimationSettings
  };
};
