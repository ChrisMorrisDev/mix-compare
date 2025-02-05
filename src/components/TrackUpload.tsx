import React from 'react';
import { Upload } from 'lucide-react';

interface TrackUploadProps {
  title: string;
  color: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TrackUpload: React.FC<TrackUploadProps> = ({ title, color, onFileUpload }) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <label className={`flex items-center gap-2 px-4 py-2 bg-${color}-600 hover:bg-${color}-700 rounded-lg cursor-pointer transition`}>
        <Upload className="w-4 h-4" />
        <span>Upload</span>
        <input
          type="file"
          accept=".wav,.mp3"
          className="hidden"
          onChange={onFileUpload}
        />
      </label>
    </div>
  );
};

export default TrackUpload;