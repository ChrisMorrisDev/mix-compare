export const checkTrackDurations = (masterDuration: number, referenceDuration: number): string | null => {
  if (!masterDuration || !referenceDuration) return null;
  
  const diff = Math.abs(masterDuration - referenceDuration);
  if (diff > 1) { // More than 1 second difference
    return `Track lengths differ by ${Math.round(diff)} seconds. This may affect comparison accuracy.`;
  }
  
  return null;
};

export const calculateRMS = (buffer: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
};

export const calculateLUFS = (rms: number): number => {
  // Convert RMS to dB, then approximate LUFS
  // Note: This is a simplified approximation
  const db = 20 * Math.log10(Math.max(rms, 1e-10));
  return Math.round(db);
};

export const getAudioInfo = async (file: File): Promise<AudioInfo> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const audioContext = new AudioContext();
      
      audioContext.decodeAudioData(e.target!.result as ArrayBuffer, (buffer) => {
        const duration = buffer.duration;
        const sampleRate = buffer.sampleRate;
        const bitRate = Math.round((file.size * 8) / (duration * 1000));
        
        // Calculate average loudness
        const channelData = buffer.getChannelData(0);
        const rms = calculateRMS(channelData);
        const loudness = calculateLUFS(rms);
        
        resolve({
          duration,
          sampleRate,
          bitRate,
          loudness
        });
        
        audioContext.close();
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};