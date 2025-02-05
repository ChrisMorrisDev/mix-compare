import React, { useEffect, useState } from 'react';
import { Volume2, Info } from 'lucide-react';
import { AudioFile, LoopSelection, AudioInfo } from '../types';
import WaveformVisualizer from './WaveformVisualizer';
import { getAudioInfo } from '../utils/audio';

interface AudioPlayerProps {
  audioFile: AudioFile | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  color: string;
  isCurrent: boolean;
  loopSelection: LoopSelection | null;
  onLoopSelect: (selection: LoopSelection | null) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioFile, 
  audioRef, 
  color, 
  isCurrent,
  loopSelection,
  onLoopSelect
}) => {
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);

  useEffect(() => {
    if (audioFile && audioRef.current) {
      getAudioInfo(audioFile.file).then(setAudioInfo);
    }
  }, [audioFile]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative bg-black/20 rounded-lg p-4 min-h-[120px] flex flex-col transition-all duration-300 ${isCurrent ? 'ring-2 ring-' + color : ''}`}>
      {audioFile ? (
        <>
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300 truncate flex-1">{audioFile.name}</span>
          </div>
          {audioInfo && (
            <div className="flex gap-4 mb-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>{formatTime(audioInfo.duration)}</span>
              </div>
              <div>{audioInfo.sampleRate} Hz</div>
              <div>{audioInfo.bitRate} kbps</div>
              <div className={audioInfo.loudness > -14 ? 'text-yellow-400' : ''}>
                {audioInfo.loudness} LUFS
              </div>
            </div>
          )}
          <WaveformVisualizer
            audioFile={audioFile}
            audioRef={audioRef}
            color={color}
            loopSelection={loopSelection}
            onLoopSelect={onLoopSelect}
          />
          <audio
            ref={audioRef}
            src={audioFile.url}
            className="hidden"
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          No audio file selected
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;