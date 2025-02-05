import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DurationWarningProps {
  message: string | null;
}

const DurationWarning: React.FC<DurationWarningProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-500" />
      <p className="text-yellow-200">{message}</p>
    </div>
  );
};

export default DurationWarning;