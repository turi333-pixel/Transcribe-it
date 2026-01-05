
import React from 'react';
import { TranscriptionItem } from '../types';

interface SidebarProps {
  items: TranscriptionItem[];
  activeId?: string;
  onSelect: (item: TranscriptionItem) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeId, onSelect, onDelete, onNew }) => {
  return (
    <aside className="w-80 h-full border-r border-slate-200 bg-white flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-100">
        <button 
          onClick={onNew}
          className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Transcription
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Past Documents</h3>
        {items.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="text-slate-300 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No transcriptions yet.</p>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group p-3 rounded-lg cursor-pointer transition-all border ${
                activeId === item.id 
                ? 'bg-blue-50 border-blue-200' 
                : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-semibold text-sm truncate pr-2 ${activeId === item.id ? 'text-blue-700' : 'text-slate-700'}`}>
                  {item.title}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span className="truncate max-w-[100px]">{item.content.substring(0, 40)}...</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center uppercase tracking-wider">
        VoxScribe AI v1.0
      </div>
    </aside>
  );
};
