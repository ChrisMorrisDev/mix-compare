import React from 'react';
import AudioCompare from './components/AudioCompare';
import { Music } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
      <header className="p-6 border-b border-white/10">
        <div className="container mx-auto flex items-center gap-3">
          <Music className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Mix Compare</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-3">Audio Reference Checker</h2>
            <p className="text-gray-300">
              Compare your mix against a reference track. Upload both files to analyze and compare them in real-time.
            </p>
          </div>
          <AudioCompare />
        </div>
      </main>
      
      <footer className="fixed bottom-0 w-full bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-3 text-center text-sm text-gray-400">
          Built with Web Audio API • Supports WAV and MP3 formats
        </div>
      </footer>
    </div>
  );
}

export default App;