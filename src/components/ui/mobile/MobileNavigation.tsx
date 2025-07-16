/**
 * Mobile Navigation Component
 * Bottom navigation bar optimized for mobile devices
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, Settings, Trophy, HelpCircle } from 'lucide-react';
import { triggerHapticFeedback, getMobileViewport } from '~/lib/mobile-utils';
import type { MobileNavPage, DeviceOrientation } from '~/types/mobile-navigation';

interface MobileNavigationProps {
  className?: string;
  onNavigate?: (page: string) => void;
}

export default function MobileNavigation({ className = '', onNavigate }: MobileNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [orientation, setOrientation] = useState<DeviceOrientation>('portrait');
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);

  // Navigation pages configuration
  const pages: MobileNavPage[] = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      path: '/',
      isActive: pathname === '/',
    },
    {
      id: 'create',
      title: 'Create',
      icon: 'users',
      path: '/create-room',
      isActive: pathname === '/create-room',
    },
    {
      id: 'join',
      title: 'Join',
      icon: 'settings',
      path: '/join',
      isActive: pathname === '/join',
    },
    {
      id: 'results',
      title: 'Results',
      icon: 'trophy',
      path: '/results',
      isActive: pathname.startsWith('/results'),
    },
    {
      id: 'help',
      title: 'Help',
      icon: 'help',
      path: '/help',
      isActive: pathname === '/help',
    },
  ];

  // Update viewport information
  useEffect(() => {
    const updateViewport = () => {
      const viewport = getMobileViewport();
      setOrientation(viewport.orientation);
      setSafeAreaBottom(viewport.safeArea.bottom);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  const handleNavigation = (page: MobileNavPage) => {
    if (page.disabled) return;

    triggerHapticFeedback('light');
    
    if (onNavigate) {
      onNavigate(page.id);
    } else {
      router.push(page.path);
    }
  };

  const getIcon = (iconName: string) => {
    const iconProps = {
      size: 20,
      strokeWidth: 2,
    };

    switch (iconName) {
      case 'home':
        return <Home {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'settings':
        return <Settings {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      case 'help':
        return <HelpCircle {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      style={{
        paddingBottom: `${safeAreaBottom}px`,
      }}
    >
      {/* Background with glassmorphism effect */}
      <div className="absolute inset-0 bg-[#1a1a2e]/95 backdrop-blur-lg border-t border-[#252547]/50" />
      
      {/* Navigation items */}
      <div className="relative flex items-center justify-around h-16 px-4">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => handleNavigation(page)}
            disabled={page.disabled}
            className={`
              relative flex flex-col items-center justify-center
              min-w-[56px] min-h-[56px] p-2 rounded-lg
              transition-all duration-200 ease-out
              ${page.isActive
                ? 'text-[#3d3d7a] bg-[#3d3d7a]/20 scale-105'
                : 'text-gray-400 hover:text-white hover:bg-[#252547]/50'
              }
              ${page.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'active:scale-95 hover:scale-105'
              }
            `}
            aria-label={page.title}
            aria-current={page.isActive ? 'page' : undefined}
          >
            {/* Icon */}
            <div className="flex items-center justify-center mb-1">
              {getIcon(page.icon)}
            </div>
            
            {/* Label */}
            <span className={`
              text-xs font-medium leading-none
              ${orientation === 'landscape' ? 'hidden' : 'block'}
            `}>
              {page.title}
            </span>
            
            {/* Badge */}
            {page.badge && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                <span className="text-xs font-bold text-white">
                  {page.badge > 99 ? '99+' : page.badge}
                </span>
              </div>
            )}
            
            {/* Active indicator */}
            {page.isActive && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#3d3d7a] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
