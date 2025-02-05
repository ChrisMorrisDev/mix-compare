import { RefObject } from 'react';

interface AudioContextState {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
}

const audioContextMap = new WeakMap<HTMLMediaElement, AudioContextState>();

export const createAudioContext = (audioElement: HTMLMediaElement): AudioContextState => {
  // Return existing context if already created
  if (audioContextMap.has(audioElement)) {
    return audioContextMap.get(audioElement)!;
  }

  const context = new AudioContext();
  const source = context.createMediaElementSource(audioElement);
  const analyser = context.createAnalyser();

  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.3; // More responsive meter updates
  
  source.connect(analyser);
  analyser.connect(context.destination);

  const state = { context, source, analyser };
  audioContextMap.set(audioElement, state);

  return state;
};

export const getAudioContext = (audioRef: RefObject<HTMLMediaElement>): AudioContextState | null => {
  if (!audioRef.current) return null;
  return audioContextMap.get(audioRef.current) || null;
};

export const cleanupAudioContext = (audioElement: HTMLMediaElement) => {
  const state = audioContextMap.get(audioElement);
  if (state) {
    state.source.disconnect();
    state.analyser.disconnect();
    state.context.close();
    audioContextMap.delete(audioElement);
  }
};