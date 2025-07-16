/**
 * Mobile Responsive Demo
 * Comprehensive demo showcasing mobile-first design and touch interactions
 */

'use client';

import { useState } from 'react';
import { Smartphone, Tablet, Monitor, Wifi, WifiOff, Battery, Volume2 } from 'lucide-react';
import MobileNavigation from '~/components/ui/mobile/MobileNavigation';
import { MobileBottomSheet } from '~/components/ui/mobile/MobileBottomSheet';
import MobileGameBoard from '~/components/ui/mobile/MobileGameBoard';
import { useMobileDetection } from '~/lib/mobile-utils';

export default function MobileResponsiveDemo() {
  const [activeTab, setActiveTab] = useState<'navigation' | 'gestures' | 'gameboard' | 'components'>('navigation');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  
  const {
    isMobile,
    isTouch,
    isIOS,
    isAndroid,
    viewport,
    performance,
    accessibility,
    gameState,
  } = useMobileDetection();

  // Mock players for game board demo
  const mockPlayers = [
    { id: '1', name: 'Alice', position: { x: 0, y: 0 }, selected: false, isConnected: true },
    { id: '2', name: 'Bob', position: { x: 0, y: 0 }, selected: false, isConnected: true },
    { id: '3', name: 'Charlie', position: { x: 0, y: 0 }, selected: false, isConnected: false },
    { id: '4', name: 'Diana', position: { x: 0, y: 0 }, selected: false, isConnected: true },
    { id: '5', name: 'Eve', position: { x: 0, y: 0 }, selected: false, isConnected: true },
  ];

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
  };

  const renderDeviceInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1a2e] p-4 rounded-lg">
          <h3 className="font-semibold text-white mb-2">Device Type</h3>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {isMobile ? <Smartphone size={16} /> : <Monitor size={16} />}
            <span>{isMobile ? 'Mobile' : 'Desktop'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
            {isTouch ? <span className="text-green-400">Touch</span> : <span className="text-gray-400">No Touch</span>}
          </div>
        </div>

        <div className="bg-[#1a1a2e] p-4 rounded-lg">
          <h3 className="font-semibold text-white mb-2">Platform</h3>
          <div className="text-sm text-gray-300">
            {isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {viewport.orientation}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] p-4 rounded-lg">
        <h3 className="font-semibold text-white mb-2">Viewport</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">Size:</span>
            <span className="text-white ml-2">{viewport.width} × {viewport.height}</span>
          </div>
          <div>
            <span className="text-gray-400">Breakpoint:</span>
            <span className="text-white ml-2">{viewport.breakpoint.name}</span>
          </div>
          <div>
            <span className="text-gray-400">Pixel Ratio:</span>
            <span className="text-white ml-2">{viewport.pixelRatio}x</span>
          </div>
          <div>
            <span className="text-gray-400">Has Notch:</span>
            <span className="text-white ml-2">{viewport.hasNotch ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] p-4 rounded-lg">
        <h3 className="font-semibold text-white mb-2">Performance</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Battery size={16} className="text-yellow-400" />
            <span className="text-gray-400">Battery:</span>
            <span className="text-white">{Math.round(performance.batteryLevel * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            {performance.connectionType === 'wifi' ? 
              <Wifi size={16} className="text-green-400" /> : 
              <WifiOff size={16} className="text-red-400" />
            }
            <span className="text-gray-400">Connection:</span>
            <span className="text-white">{performance.connectionType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-blue-400" />
            <span className="text-gray-400">Memory:</span>
            <span className="text-white">{Math.round(performance.memoryUsage)}MB</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] p-4 rounded-lg">
        <h3 className="font-semibold text-white mb-2">Accessibility</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Reduce Motion:</span>
            <span className={accessibility.reduceMotion ? 'text-green-400' : 'text-gray-400'}>
              {accessibility.reduceMotion ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">High Contrast:</span>
            <span className={accessibility.highContrast ? 'text-green-400' : 'text-gray-400'}>
              {accessibility.highContrast ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Large Text:</span>
            <span className={accessibility.largeText ? 'text-green-400' : 'text-gray-400'}>
              {accessibility.largeText ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBottomSheetContent = () => (
    <div className="space-y-4">
      <div className="bg-[#252547] p-4 rounded-lg">
        <h3 className="font-semibold text-white mb-2">Bottom Sheet Demo</h3>
        <p className="text-gray-300 text-sm">
          This is a mobile-optimized bottom sheet component. You can:
        </p>
        <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
          <li>Swipe up/down to change height</li>
          <li>Tap the handle to adjust</li>
          <li>Tap outside to close</li>
          <li>Use the snap indicators on the right</li>
        </ul>
      </div>

      <div className="bg-[#252547] p-4 rounded-lg">
        <h3 className="font-semibold text-white mb-2">Touch Gestures</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-300">Swipe Up: Expand</div>
          <div className="text-gray-300">Swipe Down: Collapse</div>
          <div className="text-gray-300">Tap Handle: Adjust</div>
          <div className="text-gray-300">Tap Outside: Close</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="bg-[#1a1a2e] p-4 safe-area-top">
        <h1 className="text-2xl font-bold text-center">Mobile Responsive Demo</h1>
        <p className="text-gray-400 text-center mt-2">
          Touch-optimized components and interactions
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#1a1a2e] px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'navigation', label: 'Navigation' },
            { id: 'gestures', label: 'Gestures' },
            { id: 'gameboard', label: 'Game Board' },
            { id: 'components', label: 'Components' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'bg-[#3d3d7a] text-white'
                  : 'bg-[#252547] text-gray-300 hover:text-white'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-20">
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Device Information</h2>
              {renderDeviceInfo()}
            </div>
          </div>
        )}

        {activeTab === 'gestures' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Touch Gestures</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setBottomSheetOpen(true)}
                  className="w-full p-4 bg-[#3d3d7a] text-white rounded-lg hover:bg-[#4a4a8a] transition-colors"
                >
                  Open Bottom Sheet
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#252547] p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Swipe Gestures</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Swipe Left/Right</li>
                      <li>• Swipe Up/Down</li>
                      <li>• Double Tap</li>
                      <li>• Long Press</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#252547] p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Zoom Gestures</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Pinch to Zoom</li>
                      <li>• Double Tap Zoom</li>
                      <li>• Zoom Controls</li>
                      <li>• Reset Zoom</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gameboard' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Mobile Game Board</h2>
              <div className="bg-[#0a0a0f] rounded-lg overflow-hidden">
                <MobileGameBoard
                  orientation={viewport.orientation}
                  players={mockPlayers}
                  onPlayerSelect={handlePlayerSelect}
                  touchFeedback={true}
                  zoomEnabled={true}
                  minZoom={0.8}
                  maxZoom={2.0}
                  currentZoom={zoom}
                  onZoomChange={setZoom}
                />
              </div>
              
              {selectedPlayer && (
                <div className="mt-4 p-3 bg-[#3d3d7a]/20 rounded-lg">
                  <span className="text-sm text-[#3d3d7a]">
                    Selected: {mockPlayers.find(p => p.id === selectedPlayer)?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Mobile Components</h2>
              <div className="space-y-4">
                <div className="bg-[#252547] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Touch Targets</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    All interactive elements meet accessibility guidelines with minimum 44px touch targets.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#3d3d7a] text-white rounded-lg hover:bg-[#4a4a8a] transition-colors">
                      Primary
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
                      Secondary
                    </button>
                  </div>
                </div>

                <div className="bg-[#252547] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Responsive Grid</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
                      <div className="text-2xl mb-2">📱</div>
                      <div className="text-sm text-gray-300">Mobile</div>
                    </div>
                    <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
                      <div className="text-2xl mb-2">💻</div>
                      <div className="text-sm text-gray-300">Tablet</div>
                    </div>
                    <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
                      <div className="text-2xl mb-2">🖥️</div>
                      <div className="text-sm text-gray-300">Desktop</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Bottom Sheet */}
      <MobileBottomSheet
        title="Mobile Bottom Sheet"
        content={renderBottomSheetContent()}
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        snapPoints={[0.3, 0.6, 0.9]}
        initialSnap={0.6}
        backdrop={true}
      />
    </div>
  );
}
