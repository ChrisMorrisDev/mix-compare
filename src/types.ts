export interface AudioFile {
  file: File;
  url: string;
  name: string;
}

export interface LoopSelection {
  start: number;
  end: number;
}

export interface AudioInfo {
  duration: number;
  sampleRate: number;
  bitRate: number;
  loudness: number;
}