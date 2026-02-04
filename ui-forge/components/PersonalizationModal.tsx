'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalizationModal({ isOpen, onClose }: PersonalizationModalProps) {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  // Sync with actual theme when modal opens
  useEffect(() => {
    if (isOpen) {
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => setSelectedTheme(theme));
    }
  }, [isOpen, theme]);

  // Handle theme selection
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--modal-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Personalization</h2>
              <p className="text-sm text-[var(--text-secondary)]">Customize your experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--hover-bg)] transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Appearance Section */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Appearance
            </h3>

            {/* Theme Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Dark Mode Option */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedTheme === 'dark'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--card-bg)]'
                }`}
              >
                {/* Preview */}
                <div className="w-full aspect-video rounded-lg mb-3 overflow-hidden bg-[#0f0f23] border border-white/10">
                  <div className="h-full flex">
                    {/* Mini Sidebar */}
                    <div className="w-1/4 bg-[#1a1a2e] border-r border-white/10 p-1">
                      <div className="w-full h-2 rounded bg-gradient-to-r from-indigo-500 to-pink-500 mb-1" />
                      <div className="w-full h-1 rounded bg-white/20 mb-0.5" />
                      <div className="w-3/4 h-1 rounded bg-white/10" />
                    </div>
                    {/* Mini Content */}
                    <div className="flex-1 p-1">
                      <div className="w-2/3 h-1.5 rounded bg-white/30 mb-1" />
                      <div className="w-1/2 h-1 rounded bg-white/10" />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">Dark</span>
                  {selectedTheme === 'dark' && (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Moon Icon */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                </div>
              </button>

              {/* Light Mode Option */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedTheme === 'light'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--card-bg)]'
                }`}
              >
                {/* Preview */}
                <div className="w-full aspect-video rounded-lg mb-3 overflow-hidden bg-[#f8fafc] border border-slate-200">
                  <div className="h-full flex">
                    {/* Mini Sidebar */}
                    <div className="w-1/4 bg-white border-r border-slate-200 p-1">
                      <div className="w-full h-2 rounded bg-gradient-to-r from-purple-500 to-pink-500 mb-1" />
                      <div className="w-full h-1 rounded bg-slate-300 mb-0.5" />
                      <div className="w-3/4 h-1 rounded bg-slate-200" />
                    </div>
                    {/* Mini Content */}
                    <div className="flex-1 p-1">
                      <div className="w-2/3 h-1.5 rounded bg-slate-400 mb-1" />
                      <div className="w-1/2 h-1 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">Light</span>
                  {selectedTheme === 'light' && (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Sun Icon */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border-color)] my-6" />

          {/* Info */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--info-bg)]">
            <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-[var(--text-secondary)]">
              Your preference is saved automatically and will persist across sessions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-color)] bg-[var(--footer-bg)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-[var(--text-primary)] bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover)] border border-[var(--border-color)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
