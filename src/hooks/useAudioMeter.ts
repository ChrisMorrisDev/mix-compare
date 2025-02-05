import { useState, useEffect, RefObject } from 'react';
import { createAudioContext, getAudioContext } from '../utils/audioContext';
import { calculateDecibels } from '../utils/audio';

export function useAudioMeter(audioRef: RefObject<HTMLMediaElement>) {
  const [dbLevel, setDbLevel] = useState<number>(-60);

  useEffect(() => {
    if (!audioRef.current) return;

    const audioState = createAudioContext(audioRef.current);
    const dataArray = new Float32Array(audioState.analyser.frequencyBinCount);
    let animationFrame: number;
    let isActive = true;

    const updateMeter = () => {
      if (!isActive) return;
      
      audioState.analyser.getFloatTimeDomainData(dataArray);
      const db = calculateDecibels(dataArray);
      setDbLevel(prev => Math.max(db, prev - 3)); // Smooth falloff
      
      animationFrame = requestAnimationFrame(updateMeter);
    };

    updateMeter();

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrame);
    };
  }, [audioRef]);

  return dbLevel;
}