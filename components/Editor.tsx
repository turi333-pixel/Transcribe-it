
import React, { useState, useEffect } from 'react';
import { TranscriptionItem } from '../types';

interface EditorProps {
  item: TranscriptionItem;
  onSave: (content: string) => void;
  onTitleChange: (title: string) => void;
  isProcessing: boolean;
}

export const Editor: React.FC<EditorProps> = ({ item, onSave, onTitleChange, isProcessing }) => {
  const [content, setContent] = useState(item.content);
  const [title, setTitle] = useState(item.title);

  useEffect(() => {
    setContent(item.content);
    setTitle(item.title);
  }, [item.id]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`# ${title}\n\n${content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px] h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <input 
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            onTitleChange(e.target.value);
          }}
          placeholder="Enter document title..."
          className="text-2xl font-bold text-slate-900 border-none focus:ring-0 w-full bg-transparent"
        />
        <div className="flex gap-2 ml-4">
          <button 
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Export as .txt"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-8 relative">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onSave(e.target.value);
          }}
          placeholder="Transcription content appears here..."
          className="w-full h-full resize-none border-none focus:ring-0 text-slate-700 leading-relaxed text-lg"
          spellCheck={false}
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-b-2xl">
            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="font-semibold text-slate-700">Updating...</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Words: {content.split(/\s+/).filter(x => x.length > 0).length}</span>
          <span>Characters: {content.length}</span>
        </div>
        <div>
          Last edited: {new Date(item.date).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
