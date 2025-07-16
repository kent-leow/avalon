/**
 * Real-time Synchronization Demo Page
 * Interactive demonstration of real-time sync features
 */

import RealTimeSyncDemo from '~/components/features/real-time/RealTimeSyncDemo';

export default function RealTimeSyncDemoPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Real-time Synchronization Demo
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore the real-time synchronization features including connection status monitoring,
            event notifications, sync conflict resolution, and player activity tracking.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <RealTimeSyncDemo />
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Features Demonstrated</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">🔗 Connection Status</h3>
                  <p className="text-gray-400 text-sm">
                    Real-time connection monitoring with latency tracking, retry count,
                    and visual indicators for different connection states.
                  </p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">📡 Event Notifications</h3>
                  <p className="text-gray-400 text-sm">
                    Real-time event notifications with automatic positioning,
                    dismissal, and interactive event handling.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">🔄 Sync Status</h3>
                  <p className="text-gray-400 text-sm">
                    Synchronization status monitoring with optimistic updates,
                    conflict detection, and resolution mechanisms.
                  </p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">👥 Player Activities</h3>
                  <p className="text-gray-400 text-sm">
                    Real-time player activity tracking with visual indicators
                    for typing, voting, selecting teams, and other actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
