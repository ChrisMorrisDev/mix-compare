import React from 'react';
import { Play, Pause, ArrowLeftRight } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  canPlay: boolean;
  onPlayPause: () => void;
  onToggleTrack: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  canPlay,
  onPlayPause,
  onToggleTrack,
}) => {
  return (
    <div className="mt-8 flex justify-center gap-4">
      <button
        onClick={onPlayPause}
        disabled={!canPlay}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-semibold transition
          ${canPlay 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
            : 'bg-gray-600 cursor-not-allowed'}`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-5 h-5" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Play
          </>
        )}
      </button>

      <button
        onClick={onToggleTrack}
        disabled={!canPlay}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-semibold transition
          ${canPlay 
            ? 'bg-white/10 hover:bg-white/20' 
            : 'bg-gray-600 cursor-not-allowed'}`}
      >
        <ArrowLeftRight className="w-5 h-5" />
        Toggle Track
      </button>
    </div>
  );
};

export default AudioControls;