
import React, { useRef } from 'react';
import { ProcessingStatus } from '../types';

interface AudioUploaderProps {
  onComplete: (base64: string, mimeType: string, filename: string) => void;
  status: ProcessingStatus;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onComplete, status }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support iPhone audio (.m4a, .mp4, .aac)
    const allowedTypes = [
      'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/ogg', 'audio/webm',
      'audio/x-m4a', 'audio/aac', 'video/mp4' // iPhone recordings are sometimes tagged as video/mp4
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.m4a')) {
      alert("Unsupported file format. Please upload common audio formats like .m4a (iPhone), .mp3, or .wav.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onComplete(base64, file.type || 'audio/m4a', file.name);
    };
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".mp3,.wav,.m4a,.aac,.mp4,.webm"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'processing'}
        className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 hover:bg-purple-50 hover:text-purple-600 transition-all shadow-sm border border-slate-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </button>
      <div className="text-center space-y-1">
        <p className="text-sm text-slate-500 font-medium">Click to select audio file</p>
        <p className="text-xs text-slate-400">Supports iPhone .m4a recordings</p>
      </div>
    </div>
  );
};
