'use client';

import React, { useEffect, useRef } from 'react';
import type { GamePhase } from '~/types/game-state';
import type { GameSidebarProps } from '~/types/game-layout';
import { useGameLayout } from '~/context/GameLayoutContext';
import { getSidebarClasses, createMockSidebarSections } from '~/lib/game-layout-utils';

/**
 * Game Sidebar
 * 
 * Collapsible sidebar containing game information, player list, rules, and settings.
 */

export function GameSidebar({
  isOpen,
  onClose,
  currentPhase,
  sections,
  onRulesOpen,
  onSettingsOpen,
  className = ''
}: GameSidebarProps) {
  const { layout, toggleSidebar } = useGameLayout();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Use layout state if not provided via props
  const sidebarOpen = isOpen ?? layout.sidebarOpen;
  const phase = currentPhase || layout.currentPhase;
  
  // Use mock data if not provided
  const sidebarSections = sections || createMockSidebarSections(phase);
  
  const sidebarClasses = getSidebarClasses({
    ...layout,
    sidebarOpen
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      toggleSidebar();
    }
  };

  const handleRulesOpen = () => {
    if (onRulesOpen) {
      onRulesOpen();
    } else {
      console.log('Rules opened');
    }
  };

  const handleSettingsOpen = () => {
    if (onSettingsOpen) {
      onSettingsOpen();
    } else {
      console.log('Settings opened');
    }
  };

  // Handle click outside to close on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        layout.isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [layout.isMobile, sidebarOpen, handleClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, handleClose]);

  return (
    <>
      {/* Backdrop for mobile */}
      {layout.isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${sidebarClasses} ${className}`}
        aria-label="Game sidebar"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3d3d7a]">
          <h2 className="text-lg font-semibold text-[#f39c12]">
            Game Info
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#3d3d7a] rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          {sidebarSections.map((section) => (
            <div key={section.id} className="border-b border-[#3d3d7a] last:border-b-0">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#3d3d7a] transition-colors"
                onClick={() => console.log(`Toggle section: ${section.id}`)}
              >
                <div className="flex items-center space-x-3">
                  {section.icon && (
                    <span className="text-lg">{section.icon}</span>
                  )}
                  <span className="font-medium">{section.title}</span>
                </div>
                <svg
                  className="w-5 h-5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {section.defaultOpen && (
                <div className="p-4 pt-0 text-sm text-[#9ca3af]">
                  {typeof section.content === 'string' ? (
                    <p>{section.content}</p>
                  ) : (
                    section.content
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-[#3d3d7a] space-y-2">
          <button
            onClick={handleRulesOpen}
            className="w-full flex items-center space-x-3 p-3 hover:bg-[#3d3d7a] rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>Game Rules</span>
          </button>
          
          <button
            onClick={handleSettingsOpen}
            className="w-full flex items-center space-x-3 p-3 hover:bg-[#3d3d7a] rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Export default for easier importing
export default GameSidebar;
