import { useState, useEffect } from 'react';

export type DeviceType = 'tv' | 'mobile' | 'desktop';
export type ScreenOrientation = 'portrait' | 'landscape';

export function detectDeviceType(): DeviceType {
  const userAgent = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();

  // Smart TV Detection
  const isTvUserAgent =
    /smart-tv|smarttv|googletv|androidtv|appletv|hbbtv|tizen|webos|vizio|aft|netcast|nexus player|shield|bravia|roku|chromecast|\btv\b|\bbox\b/i.test(
      userAgent
    );

  if (isTvUserAgent) return 'tv';

  // Mobile / Tablet Detection
  const isMobileUserAgent =
    /iphone|ipad|ipod|android|mobile|blackberry|opera mini|windows phone|iemobile|kindle/i.test(
      userAgent
    );

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isMobileUserAgent || (isTouchDevice && window.innerWidth <= 1024)) {
    return 'mobile';
  }

  return 'desktop';
}

export function detectOrientation(): ScreenOrientation {
  if (typeof window === 'undefined') return 'landscape';
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
  }
  return window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';
}

export function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    const saved = localStorage.getItem('redstream_device_mode');
    if (saved === 'tv' || saved === 'mobile' || saved === 'desktop') return saved;
    return detectDeviceType();
  });

  const [orientation, setOrientation] = useState<ScreenOrientation>(detectOrientation);
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleResize = () => {
      setOrientation(detectOrientation());
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setOrientation(detectOrientation());
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    if (window.screen?.orientation?.addEventListener) {
      window.screen.orientation.addEventListener('change', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen?.orientation?.removeEventListener) {
        window.screen.orientation.removeEventListener('change', handleResize);
      }
    };
  }, []);

  const changeDeviceType = (newType: DeviceType) => {
    setDeviceType(newType);
    localStorage.setItem('redstream_device_mode', newType);
  };

  return {
    deviceType,
    setDeviceType: changeDeviceType,
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    isTouch,
    isTvMode: deviceType === 'tv',
    isMobileMode: deviceType === 'mobile',
    isDesktopMode: deviceType === 'desktop'
  };
}

export async function requestFullscreenWithFit(element?: HTMLElement | null): Promise<boolean> {
  const target = element || document.documentElement;
  try {
    if (!document.fullscreenElement) {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        await (target as any).webkitRequestFullscreen();
      } else if ((target as any).msRequestFullscreen) {
        await (target as any).msRequestFullscreen();
      }
    }

    // Try orientation lock for mobile screen fill
    if (window.screen?.orientation && 'lock' in window.screen.orientation) {
      try {
        await (window.screen.orientation as any).lock('landscape');
      } catch (e) {
        // Ignore restriction if not allowed by browser
      }
    }
    return true;
  } catch (err) {
    console.warn('Fullscreen request error:', err);
    return false;
  }
}
