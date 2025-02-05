import React from 'react';

interface DbMeterProps {
  value: number; // -60 to 0 range
  color: string;
}

const DbMeter: React.FC<DbMeterProps> = ({ value, color }) => {
  // Convert dB value to percentage (0-100)
  const percentage = ((value + 60) / 60) * 100;
  
  // Define color stops for gradient
  const gradientStops = [
    { stop: 90, color: 'rgb(239, 68, 68)' }, // red-500
    { stop: 75, color: 'rgb(234, 179, 8)' },  // yellow-500
    { stop: 0, color: 'rgb(34, 197, 94)' }    // green-500
  ];
  
  // Find appropriate color based on level
  const getColor = (level: number) => {
    const stop = gradientStops.find(s => level >= s.stop);
    return stop ? stop.color : gradientStops[gradientStops.length - 1].color;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col justify-between text-xs text-gray-400 h-32">
        <span>0</span>
        <span>-30</span>
        <span>-60</span>
      </div>
      <div className="relative w-6 h-32 bg-black/40 rounded overflow-hidden">
        <div
          className="absolute bottom-0 w-full transition-all duration-100 rounded-t"
          style={{
            height: `${percentage}%`,
            backgroundColor: getColor(percentage),
          }}
        />
        {/* Level markers */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full h-px bg-white/20" />
          <div className="w-full h-px bg-white/20" />
          <div className="w-full h-px bg-white/20" />
        </div>
      </div>
    </div>
  );
};

export default DbMeter;