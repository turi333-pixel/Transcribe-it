
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Recorder } from './components/Recorder';
import { AudioUploader } from './components/AudioUploader';
import { Editor } from './components/Editor';
import { TranscriptionItem, ProcessingStatus } from './types';
import { transcribeAudio } from './services/geminiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<TranscriptionItem[]>([]);
  const [activeItem, setActiveItem] = useState<TranscriptionItem | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('voxscribe_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('voxscribe_history', JSON.stringify(history));
  }, [history]);

  const handleTranscriptionComplete = async (base64: string, mimeType: string, filename?: string) => {
    setStatus('processing');
    setError(null);
    
    try {
      const text = await transcribeAudio(base64, mimeType);
      
      const newItem: TranscriptionItem = {
        id: crypto.randomUUID(),
        title: filename || `Transcription ${new Date().toLocaleTimeString()}`,
        content: text,
        date: Date.now(),
        status: 'draft'
      };

      setHistory(prev => [newItem, ...prev]);
      setActiveItem(newItem);
      setStatus('idle');
    } catch (err: any) {
      setError(err.message || "Something went wrong during transcription.");
      setStatus('error');
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<TranscriptionItem>) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (activeItem?.id === id) {
      setActiveItem(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeItem?.id === id) {
      setActiveItem(null);
    }
  };

  const createNew = () => {
    setActiveItem(null);
    setStatus('idle');
    setIsSidebarOpen(false);
  };

  const selectItem = (item: TranscriptionItem) => {
    setActiveItem(item);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Drawer on mobile, fixed on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          items={history} 
          activeId={activeItem?.id} 
          onSelect={selectItem} 
          onDelete={handleDeleteItem}
          onNew={createNew}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">VoxScribe AI</h1>
          </div>
          <div className="flex items-center gap-4">
            {status === 'processing' && (
              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Transcribing...</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-5xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-900 hover:text-red-700 font-bold ml-4">✕</button>
            </div>
          )}

          {!activeItem && status === 'idle' && (
            <div className="space-y-8 md:space-y-12 py-4 md:py-10">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight px-2">
                  Convert Voice to Document
                </h2>
                <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto px-4">
                  Upload recordings to generate high-quality transcriptions with <strong>timestamps</strong> and <strong>speaker detection</strong> powered by Gemini 3 Pro.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition-colors">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 md:w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Microphone Input
                  </h3>
                  <Recorder onComplete={handleTranscriptionComplete} status={status} />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-400 transition-colors">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 md:w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    File Upload
                  </h3>
                  <AudioUploader onComplete={handleTranscriptionComplete} status={status} />
                </div>
              </div>
            </div>
          )}

          {activeItem && (
            <div className="h-full">
              <Editor 
                item={activeItem} 
                onSave={(content) => handleUpdateItem(activeItem.id, { content })} 
                onTitleChange={(title) => handleUpdateItem(activeItem.id, { title })}
                isProcessing={status === 'processing'}
              />
            </div>
          )}

          {status === 'processing' && !activeItem && (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-blue-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <svg className="w-10 h-10 md:w-12 md:h-12 text-blue-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                   </svg>
                </div>
              </div>
              <div className="text-center px-4">
                <h3 className="text-lg md:text-xl font-semibold text-slate-800">Analyzing Conversation</h3>
                <p className="text-sm md:text-base text-slate-500">Detecting speakers and adding timestamps...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
