import React, { useState, useRef, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import AudioControls from './AudioControls';
import DurationWarning from './DurationWarning';
import TrackUpload from './TrackUpload';
import { AudioFile, LoopSelection } from '../types';
import { checkTrackDurations } from '../utils/audio';

const AudioCompare = () => {
  const [masterTrack, setMasterTrack] = useState<AudioFile | null>(null);
  const [referenceTrack, setReferenceTrack] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<'master' | 'reference'>('master');
  const [loopSelection, setLoopSelection] = useState<LoopSelection | null>(null);
  const [durationWarning, setDurationWarning] = useState<string | null>(null);
  
  const masterAudioRef = useRef<HTMLAudioElement>(null);
  const referenceAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const masterAudio = masterAudioRef.current;
    const referenceAudio = referenceAudioRef.current;

    if (masterAudio && referenceAudio) {
      const checkDurations = () => {
        if (masterAudio.readyState >= 2 && referenceAudio.readyState >= 2) {
          const warning = checkTrackDurations(masterAudio.duration, referenceAudio.duration);
          setDurationWarning(warning);
        }
      };

      masterAudio.addEventListener('loadedmetadata', checkDurations);
      referenceAudio.addEventListener('loadedmetadata', checkDurations);

      return () => {
        masterAudio.removeEventListener('loadedmetadata', checkDurations);
        referenceAudio.removeEventListener('loadedmetadata', checkDurations);
      };
    }
  }, [masterTrack, referenceTrack]);

  useEffect(() => {
    const masterAudio = masterAudioRef.current;
    const referenceAudio = referenceAudioRef.current;

    if (!masterAudio || !referenceAudio) return;

    const handleTimeUpdate = () => {
      const currentAudio = currentTrack === 'master' ? masterAudio : referenceAudio;
      const otherAudio = currentTrack === 'master' ? referenceAudio : masterAudio;

      if (loopSelection && currentAudio.currentTime >= loopSelection.end) {
        currentAudio.currentTime = loopSelection.start;
        if (isPlaying) {
          currentAudio.play();
        }
      }
      
      otherAudio.currentTime = currentAudio.currentTime;
    };

    masterAudio.addEventListener('timeupdate', handleTimeUpdate);
    referenceAudio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      masterAudio.removeEventListener('timeupdate', handleTimeUpdate);
      referenceAudio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentTrack, loopSelection, isPlaying]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'master' | 'reference') => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'audio/wav' || file.type === 'audio/mpeg')) {
      const audioFile: AudioFile = {
        file,
        url: URL.createObjectURL(file),
        name: file.name
      };
      
      if (type === 'master') {
        setMasterTrack(audioFile);
      } else {
        setReferenceTrack(audioFile);
      }
      setLoopSelection(null);
    }
  };

  const togglePlayback = () => {
    const currentAudio = currentTrack === 'master' ? masterAudioRef.current : referenceAudioRef.current;
    const otherAudio = currentTrack === 'master' ? referenceAudioRef.current : masterAudioRef.current;
    
    if (isPlaying) {
      currentAudio?.pause();
      otherAudio?.pause();
    } else {
      if (currentAudio) {
        if (loopSelection && currentAudio.currentTime >= loopSelection.end) {
          currentAudio.currentTime = loopSelection.start;
        }
        currentAudio.play();
        if (otherAudio) {
          otherAudio.currentTime = currentAudio.currentTime;
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleTrack = () => {
    const currentAudio = currentTrack === 'master' ? masterAudioRef.current : referenceAudioRef.current;
    const otherAudio = currentTrack === 'master' ? referenceAudioRef.current : masterAudioRef.current;
    
    if (currentAudio && otherAudio) {
      const currentTime = currentAudio.currentTime;
      const wasPlaying = !currentAudio.paused;
      
      currentAudio.pause();
      otherAudio.currentTime = currentTime;
      
      if (wasPlaying) {
        otherAudio.play();
      }
    }
    
    setCurrentTrack(current => current === 'master' ? 'reference' : 'master');
  };

  const handleLoopSelect = (selection: LoopSelection | null) => {
    setLoopSelection(selection);
  };

  const canPlay = masterTrack && referenceTrack;

  return (
    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
      <DurationWarning message={durationWarning} />

      <div className="space-y-6">
        <div className="space-y-4">
          <TrackUpload
            title="Master Track"
            color="indigo"
            onFileUpload={(e) => handleFileUpload(e, 'master')}
          />
          <AudioPlayer
            audioFile={masterTrack}
            audioRef={masterAudioRef}
            isPlaying={isPlaying && currentTrack === 'master'}
            color="indigo-500"
            isCurrent={currentTrack === 'master'}
            loopSelection={loopSelection}
            onLoopSelect={handleLoopSelect}
          />
        </div>

        <div className="space-y-4">
          <TrackUpload
            title="Reference Track"
            color="purple"
            onFileUpload={(e) => handleFileUpload(e, 'reference')}
          />
          <AudioPlayer
            audioFile={referenceTrack}
            audioRef={referenceAudioRef}
            isPlaying={isPlaying && currentTrack === 'reference'}
            color="purple-500"
            isCurrent={currentTrack === 'reference'}
            loopSelection={loopSelection}
            onLoopSelect={handleLoopSelect}
          />
        </div>
      </div>

      <AudioControls
        isPlaying={isPlaying}
        canPlay={canPlay}
        onPlayPause={togglePlayback}
        onToggleTrack={toggleTrack}
      />

      {!canPlay && (
        <p className="mt-4 text-center text-gray-400">
          Upload both tracks to start comparison
        </p>
      )}

      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Tip: Click and drag on either waveform to create a loop section. Double-click to remove the loop.</p>
      </div>
    </div>
  );
};

export default AudioCompare;