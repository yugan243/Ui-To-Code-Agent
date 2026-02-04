'use client';

import { useEffect } from 'react';

export default function ContextSwitchAlert({ componentName, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none animate-fade-in">
      <div className="pointer-events-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl px-8 py-6 shadow-2xl shadow-indigo-500/20 animate-scale-in">
        <div className="flex items-center gap-4">
          {/* Rotating Icon */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50 animate-pulse-glow">
              <svg 
                className="w-8 h-8 text-white animate-spin-slow" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </div>
            {/* Check mark overlay after rotation */}
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center opacity-0 animate-check-appear">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white/60">Context Switched</span>
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <div className="font-syne font-bold text-xl text-white flex items-center gap-2">
              <span className="text-white/40">{"{"}</span>
              <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {componentName}
              </span>
              <span className="text-white/40">{"}"}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-green-400 to-emerald-500 rounded-full animate-progress-bar" />
        </div>
      </div>
    </div>
  );
}
