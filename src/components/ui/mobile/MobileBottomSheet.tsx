/**
 * Mobile Bottom Sheet Component
 * Slide-up panel for mobile interfaces
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getMobileViewport } from '~/lib/mobile-utils';
import { useTouchGestures } from './MobileTouchGestures';
import type { MobileBottomSheet } from '~/types/mobile-navigation';

interface MobileBottomSheetProps extends Omit<MobileBottomSheet, 'id'> {
  className?: string;
}

export function MobileBottomSheet({
  title,
  content,
  isOpen,
  onClose,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 0.6,
  backdrop = true,
  className = '',
}: MobileBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [viewport, setViewport] = useState(() => getMobileViewport());
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const { ref: gestureRef } = useTouchGestures({
    onSwipeUp: () => {
      const currentIndex = snapPoints.indexOf(currentSnap);
      const nextIndex = Math.min(currentIndex + 1, snapPoints.length - 1);
      setCurrentSnap(snapPoints[nextIndex]!);
    },
    onSwipeDown: () => {
      const currentIndex = snapPoints.indexOf(currentSnap);
      const nextIndex = Math.max(currentIndex - 1, 0);
      if (nextIndex === 0) {
        onClose();
      } else {
        setCurrentSnap(snapPoints[nextIndex]!);
      }
    },
  });

  // Update viewport on resize
  useEffect(() => {
    const updateViewport = () => setViewport(getMobileViewport());
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Connect gesture handler to handle element
  useEffect(() => {
    if (handleRef.current && gestureRef.current) {
      gestureRef.current = handleRef.current;
    }
  }, [gestureRef]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sheetHeight = viewport.height * currentSnap;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          relative w-full bg-[#1a1a2e] rounded-t-2xl shadow-2xl
          transform transition-transform duration-300 ease-out
          ${className}
        `}
        style={{
          height: `${sheetHeight}px`,
          paddingBottom: `${viewport.safeArea.bottom}px`,
        }}
      >
        {/* Handle */}
        <div
          ref={handleRef}
          className="flex items-center justify-center py-4 cursor-grab active:cursor-grabbing"
        >
          <div className="w-10 h-1 bg-gray-400 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {content}
        </div>

        {/* Snap indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
          {snapPoints.map((point, index) => (
            <button
              key={index}
              onClick={() => setCurrentSnap(point)}
              className={`
                w-2 h-6 rounded-full transition-colors
                ${point === currentSnap ? 'bg-[#3d3d7a]' : 'bg-gray-600'}
              `}
              aria-label={`Snap to ${Math.round(point * 100)}%`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
