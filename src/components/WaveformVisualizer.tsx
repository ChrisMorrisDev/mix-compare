import React, { useEffect, useRef, useState } from 'react';
import { AudioFile, LoopSelection } from '../types';

interface WaveformVisualizerProps {
  audioFile: AudioFile | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  color: string;
  loopSelection: LoopSelection | null;
  onLoopSelect: (selection: LoopSelection | null) => void;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  audioFile, 
  audioRef, 
  color,
  loopSelection,
  onLoopSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [mouseDownTime, setMouseDownTime] = useState<number>(0);
  const [initialClickPos, setInitialClickPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const draw = () => {
      if (!canvas || !ctx || !audioData || !audioRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = rect.width;
      const height = rect.height;
      const step = Math.ceil(audioData.length / width);
      const amp = height / 2;

      ctx.beginPath();
      ctx.strokeStyle = color;

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++) {
          const datum = audioData[Math.floor(i * step + j)];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        const x = i;
        ctx.moveTo(x, (1 + min) * amp);
        ctx.lineTo(x, (1 + max) * amp);
      }
      ctx.stroke();

      if (loopSelection) {
        const startX = (loopSelection.start / audioRef.current.duration) * width;
        const endX = (loopSelection.end / audioRef.current.duration) * width;
        
        ctx.fillStyle = `${color}33`;
        ctx.fillRect(startX, 0, endX - startX, height);
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, height);
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, height);
        ctx.stroke();
      }

      if (audioRef.current.duration) {
        const playheadX = (audioRef.current.currentTime / audioRef.current.duration) * width;
        
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(playheadX, height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isDragging && dragStart !== null) {
        const rect = canvas.getBoundingClientRect();
        const currentX = Math.max(0, Math.min(width, dragStart));
        const mouseX = Math.max(0, Math.min(width, dragStart));
        
        ctx.fillStyle = `${color}33`;
        ctx.fillRect(
          Math.min(currentX, mouseX),
          0,
          Math.abs(currentX - mouseX),
          height
        );
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (audioData) {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, color, loopSelection, isDragging, dragStart]);

  useEffect(() => {
    if (!audioFile) return;

    const loadAudioData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const audioContext = new AudioContext();
        const response = await fetch(audioFile.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        setAudioData(audioBuffer.getChannelData(0));
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading audio data:', err);
        setError('Failed to load audio waveform');
        setIsLoading(false);
      }
    };

    loadAudioData();
  }, [audioFile]);

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / rect.width) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !canvasRef.current) return;

    const currentTime = Date.now();
    const isDoubleClick = currentTime - lastClickTime < 300;
    setLastClickTime(currentTime);
    setMouseDownTime(currentTime);
    setInitialClickPos({ x: e.clientX, y: e.clientY });

    if (isDoubleClick) {
      onLoopSelect(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDragStart(x);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart || !initialClickPos) return;

    const moveThreshold = 5;
    const dx = Math.abs(e.clientX - initialClickPos.x);
    const dy = Math.abs(e.clientY - initialClickPos.y);

    if (!isDragging && (dx > moveThreshold || dy > moveThreshold)) {
      setIsDragging(true);
    }

    if (isDragging && audioRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      
      const startTime = (Math.min(dragStart, currentX) / rect.width) * audioRef.current.duration;
      const endTime = (Math.max(dragStart, currentX) / rect.width) * audioRef.current.duration;
      
      onLoopSelect({ start: startTime, end: endTime });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const clickDuration = Date.now() - mouseDownTime;
    
    if (!isDragging && clickDuration < 200) {
      handleSeek(e);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setInitialClickPos(null);
  };

  if (error) {
    return (
      <div className="w-full h-32 bg-black/20 rounded-lg flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-32 bg-black/20 rounded-lg flex items-center justify-center text-gray-400">
        <div className="animate-pulse">Loading waveform...</div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 bg-black/20 rounded-lg cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default WaveformVisualizer;