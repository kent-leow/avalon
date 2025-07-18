'use client';

import { useEffect, useState } from 'react';
import { type ViewportInfo, type LayoutInfo } from '~/types/mobile-experience';
import { calculateLayoutInfo } from '~/lib/mobile-experience-utils';

interface MobileLayoutAdapterProps {
  adaptationLevel: 'basic' | 'enhanced' | 'native';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  viewportInfo: ViewportInfo;
  className?: string;
}

export function MobileLayoutAdapter({
  adaptationLevel,
  deviceType,
  orientation,
  viewportInfo,
  className,
}: MobileLayoutAdapterProps) {
  const [layoutInfo, setLayoutInfo] = useState<LayoutInfo>(() => 
    calculateLayoutInfo(viewportInfo, adaptationLevel)
  );

  // Update layout when props change
  useEffect(() => {
    const newLayoutInfo = calculateLayoutInfo(viewportInfo, adaptationLevel);
    setLayoutInfo(newLayoutInfo);
  }, [viewportInfo, adaptationLevel]);

  // Apply layout adaptations via CSS custom properties
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const { components } = layoutInfo;

    // Set CSS custom properties for layout components
    root.style.setProperty('--mobile-header-height', `${components.header.height}px`);
    root.style.setProperty('--mobile-footer-height', `${components.footer.height}px`);
    root.style.setProperty('--mobile-sidebar-width', `${components.sidebar.width}px`);
    root.style.setProperty('--mobile-content-width', `${components.content.width}px`);
    root.style.setProperty('--mobile-content-height', `${components.content.height}px`);
    
    // Set visibility flags
    root.style.setProperty('--mobile-header-visible', components.header.visible ? '1' : '0');
    root.style.setProperty('--mobile-footer-visible', components.footer.visible ? '1' : '0');
    root.style.setProperty('--mobile-sidebar-visible', components.sidebar.visible ? '1' : '0');
    
    // Set device-specific properties
    root.style.setProperty('--mobile-device-type', deviceType);
    root.style.setProperty('--mobile-orientation', orientation);
    root.style.setProperty('--mobile-adaptation-level', adaptationLevel);
    root.style.setProperty('--mobile-layout-type', layoutInfo.layout);
    
    // Set viewport properties
    root.style.setProperty('--mobile-viewport-width', `${viewportInfo.width}px`);
    root.style.setProperty('--mobile-viewport-height', `${viewportInfo.height}px`);
    
    // Set safe area insets
    root.style.setProperty('--mobile-safe-area-top', `${viewportInfo.safeAreaInsets.top}px`);
    root.style.setProperty('--mobile-safe-area-right', `${viewportInfo.safeAreaInsets.right}px`);
    root.style.setProperty('--mobile-safe-area-bottom', `${viewportInfo.safeAreaInsets.bottom}px`);
    root.style.setProperty('--mobile-safe-area-left', `${viewportInfo.safeAreaInsets.left}px`);
    
    // Apply responsive classes to body
    const body = document.body;
    body.classList.remove('mobile-layout-compact', 'mobile-layout-regular', 'mobile-layout-expanded');
    body.classList.add(`mobile-layout-${layoutInfo.layout}`);
    
    body.classList.remove('mobile-device-mobile', 'mobile-device-tablet', 'mobile-device-desktop');
    body.classList.add(`mobile-device-${deviceType}`);
    
    body.classList.remove('mobile-orientation-portrait', 'mobile-orientation-landscape');
    body.classList.add(`mobile-orientation-${orientation}`);
    
    body.classList.remove('mobile-adaptation-basic', 'mobile-adaptation-enhanced', 'mobile-adaptation-native');
    body.classList.add(`mobile-adaptation-${adaptationLevel}`);
    
    return () => {
      // Cleanup classes when component unmounts
      body.classList.remove(
        'mobile-layout-compact', 'mobile-layout-regular', 'mobile-layout-expanded',
        'mobile-device-mobile', 'mobile-device-tablet', 'mobile-device-desktop',
        'mobile-orientation-portrait', 'mobile-orientation-landscape',
        'mobile-adaptation-basic', 'mobile-adaptation-enhanced', 'mobile-adaptation-native'
      );
    };
  }, [layoutInfo, deviceType, orientation, adaptationLevel, viewportInfo]);

  return (
    <div 
      className={`mobile-layout-adapter ${className || ''}`}
      data-device-type={deviceType}
      data-orientation={orientation}
      data-adaptation-level={adaptationLevel}
      data-layout={layoutInfo.layout}
    >
      {/* Global Layout Styles */}
      <style jsx global>{`
        /* Mobile Layout Adapter Styles */
        .mobile-layout-adapter {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: -1;
        }
        
        /* Layout-specific styles */
        .mobile-layout-compact {
          --mobile-spacing-xs: 4px;
          --mobile-spacing-sm: 8px;
          --mobile-spacing-md: 12px;
          --mobile-spacing-lg: 16px;
          --mobile-spacing-xl: 24px;
          --mobile-font-size-xs: 12px;
          --mobile-font-size-sm: 14px;
          --mobile-font-size-md: 16px;
          --mobile-font-size-lg: 18px;
          --mobile-font-size-xl: 20px;
        }
        
        .mobile-layout-regular {
          --mobile-spacing-xs: 6px;
          --mobile-spacing-sm: 12px;
          --mobile-spacing-md: 16px;
          --mobile-spacing-lg: 20px;
          --mobile-spacing-xl: 32px;
          --mobile-font-size-xs: 14px;
          --mobile-font-size-sm: 16px;
          --mobile-font-size-md: 18px;
          --mobile-font-size-lg: 20px;
          --mobile-font-size-xl: 24px;
        }
        
        .mobile-layout-expanded {
          --mobile-spacing-xs: 8px;
          --mobile-spacing-sm: 16px;
          --mobile-spacing-md: 20px;
          --mobile-spacing-lg: 24px;
          --mobile-spacing-xl: 40px;
          --mobile-font-size-xs: 16px;
          --mobile-font-size-sm: 18px;
          --mobile-font-size-md: 20px;
          --mobile-font-size-lg: 24px;
          --mobile-font-size-xl: 28px;
        }
        
        /* Device-specific styles */
        .mobile-device-mobile {
          --mobile-max-width: 100%;
          --mobile-min-touch-target: 44px;
        }
        
        .mobile-device-tablet {
          --mobile-max-width: 768px;
          --mobile-min-touch-target: 40px;
        }
        
        .mobile-device-desktop {
          --mobile-max-width: 1200px;
          --mobile-min-touch-target: 32px;
        }
        
        /* Orientation-specific styles */
        .mobile-orientation-portrait {
          --mobile-primary-axis: column;
          --mobile-secondary-axis: row;
        }
        
        .mobile-orientation-landscape {
          --mobile-primary-axis: row;
          --mobile-secondary-axis: column;
        }
        
        /* Adaptation level styles */
        .mobile-adaptation-basic {
          --mobile-animation-duration: 0ms;
          --mobile-transition-timing: linear;
        }
        
        .mobile-adaptation-enhanced {
          --mobile-animation-duration: 200ms;
          --mobile-transition-timing: ease-in-out;
        }
        
        .mobile-adaptation-native {
          --mobile-animation-duration: 300ms;
          --mobile-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Safe area handling */
        .mobile-safe-area-padding {
          padding-top: var(--mobile-safe-area-top);
          padding-right: var(--mobile-safe-area-right);
          padding-bottom: var(--mobile-safe-area-bottom);
          padding-left: var(--mobile-safe-area-left);
        }
        
        .mobile-safe-area-margin {
          margin-top: var(--mobile-safe-area-top);
          margin-right: var(--mobile-safe-area-right);
          margin-bottom: var(--mobile-safe-area-bottom);
          margin-left: var(--mobile-safe-area-left);
        }
        
        /* Component visibility */
        .mobile-header {
          height: var(--mobile-header-height);
          opacity: var(--mobile-header-visible);
          visibility: var(--mobile-header-visible) === 1 ? visible : hidden;
        }
        
        .mobile-footer {
          height: var(--mobile-footer-height);
          opacity: var(--mobile-footer-visible);
          visibility: var(--mobile-footer-visible) === 1 ? visible : hidden;
        }
        
        .mobile-sidebar {
          width: var(--mobile-sidebar-width);
          opacity: var(--mobile-sidebar-visible);
          visibility: var(--mobile-sidebar-visible) === 1 ? visible : hidden;
        }
        
        .mobile-content {
          width: var(--mobile-content-width);
          height: var(--mobile-content-height);
        }
        
        /* Responsive utilities */
        .mobile-hide-on-mobile {
          display: none;
        }
        
        .mobile-device-tablet .mobile-hide-on-mobile,
        .mobile-device-desktop .mobile-hide-on-mobile {
          display: initial;
        }
        
        .mobile-show-on-mobile {
          display: initial;
        }
        
        .mobile-device-tablet .mobile-show-on-mobile,
        .mobile-device-desktop .mobile-show-on-mobile {
          display: none;
        }
        
        /* Touch-friendly styles */
        .mobile-device-mobile button,
        .mobile-device-mobile a,
        .mobile-device-mobile input,
        .mobile-device-mobile select {
          min-height: var(--mobile-min-touch-target);
          min-width: var(--mobile-min-touch-target);
        }
        
        /* Improved scrolling on mobile */
        .mobile-device-mobile {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        
        /* Prevent zoom on input focus */
        .mobile-device-mobile input,
        .mobile-device-mobile select,
        .mobile-device-mobile textarea {
          font-size: 16px;
        }
      `}</style>
      
      {/* Development Mode Layout Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mobile-layout-info fixed bottom-36 left-4 z-50 rounded-lg bg-black/80 p-2 text-xs text-white">
          <div>Layout: {layoutInfo.layout}</div>
          <div>Device: {deviceType}</div>
          <div>Orientation: {orientation}</div>
          <div>Adaptation: {adaptationLevel}</div>
          <div>Header: {layoutInfo.components.header.height}px</div>
          <div>Footer: {layoutInfo.components.footer.height}px</div>
          <div>Sidebar: {layoutInfo.components.sidebar.width}px</div>
          <div>Content: {layoutInfo.components.content.width}x{layoutInfo.components.content.height}</div>
        </div>
      )}
    </div>
  );
}
