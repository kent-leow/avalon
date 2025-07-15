import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
            Avalon
          </h1>
          <p className="text-xl text-slate-200 opacity-90">
            The ultimate online experience for The Resistance: Avalon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room */}
          <Link
            href="/create-room"
            className="group bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Create Room</h2>
              <p className="text-slate-300">
                Start a new game and invite friends to join your Avalon adventure
              </p>
            </div>
          </Link>

          {/* Join Room */}
          <Link
            href="/join"
            className="group bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full group-hover:bg-green-500/30 transition-colors">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Join Room</h2>
              <p className="text-slate-300">
                Enter a room code to join an existing game with your friends
              </p>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">Game Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#252547]/60 backdrop-blur-xl border border-slate-600/30 rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Character Selection</h4>
              <p className="text-slate-300 text-sm">
                Choose from all official Avalon characters with proper validation
              </p>
            </div>

            <div className="bg-[#252547]/60 backdrop-blur-xl border border-slate-600/30 rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Play</h4>
              <p className="text-slate-300 text-sm">
                Synchronized gameplay with live updates for all players
              </p>
            </div>

            <div className="bg-[#252547]/60 backdrop-blur-xl border border-slate-600/30 rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mb-4">
                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Mobile Friendly</h4>
              <p className="text-slate-300 text-sm">
                Optimized for mobile devices with QR code joining
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
