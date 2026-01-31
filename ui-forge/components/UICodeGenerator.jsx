'use client';

import { useState } from 'react';

export default function UICodeGenerator() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeProject, setActiveProject] = useState('project-1');
  const [activeVersion, setActiveVersion] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'code', 'preview', 'split'
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Welcome! Upload a UI screenshot to generate code.' }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Mock data structure
  const [projects] = useState([
    {
      id: 'project-1',
      name: 'E-commerce Dashboard',
      createdAt: '2024-01-28',
      components: [
        {
          id: 'comp-1',
          name: 'Login Form',
          versions: [
            { id: 'v1', name: 'Initial Design', timestamp: '10:30 AM', code: '<div class="login">...</div>' },
            { id: 'v2', name: 'With Glassmorphism', timestamp: '11:45 AM', code: '<div class="login glass">...</div>' },
            { id: 'v3', name: 'Mobile Optimized', timestamp: '2:15 PM', code: '<div class="login responsive">...</div>' }
          ]
        },
        {
          id: 'comp-2',
          name: 'Product Card',
          versions: [
            { id: 'v1', name: 'Basic Layout', timestamp: '3:20 PM', code: '<div class="product-card">...</div>' },
            { id: 'v2', name: 'With Hover Effects', timestamp: '4:10 PM', code: '<div class="product-card animated">...</div>' }
          ]
        }
      ]
    },
    {
      id: 'project-2',
      name: 'Portfolio Website',
      createdAt: '2024-01-29',
      components: [
        {
          id: 'comp-3',
          name: 'Hero Section',
          versions: [
            { id: 'v1', name: 'Initial Version', timestamp: 'Yesterday', code: '<section class="hero">...</section>' }
          ]
        }
      ]
    }
  ]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    setMessages([...messages, { 
      id: messages.length + 1, 
      role: 'user', 
      content: inputValue 
    }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: 'I\'ve generated the code for your UI. Check the right sidebar for the new version!'
      }]);
    }, 1000);
    
    setInputValue('');
  };

  const currentProject = projects.find(p => p.id === activeProject);
  const activeVersionData = activeVersion ? 
    currentProject?.components.flatMap(c => c.versions).find(v => v.id === activeVersion) : null;

  return (
    <div className="h-screen bg-[#0f0f23] text-white font-dm overflow-hidden relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-125 h-125 bg-linear-to-br from-indigo-500 to-pink-500 rounded-full blur-[100px] opacity-30 -top-40 -left-20 animate-float" />
        <div className="absolute w-100 h-100 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-[100px] opacity-30 -bottom-32 -right-20 animate-float-delayed" />
        <div className="absolute w-87.5 h-87.5 bg-linear-to-br from-cyan-500 to-blue-500 rounded-full blur-[100px] opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
      </div>

      {/* Main Container */}
      <div className="h-full flex relative z-10">
        
        {/* LEFT SIDEBAR - Projects & Chats */}
        <div className={`transition-all duration-300 ease-out ${leftSidebarOpen ? 'w-80' : 'w-0'} relative`}>
          <div className={`h-full bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden ${!leftSidebarOpen && 'invisible'}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-linear-to-r from-indigo-500/10 to-pink-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-syne font-bold text-lg shadow-lg shadow-indigo-500/50 animate-pulse-glow">
                    N
                  </div>
                  <div>
                    <h1 className="font-syne font-bold text-lg">UI Forge</h1>
                    <p className="text-xs text-white/50">Design to Code</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full px-4 py-2.5 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="p-3 space-y-2">
                {projects.map((project, idx) => (
                  <div 
                    key={project.id}
                    className="group animate-slide-in-left"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <button
                      onClick={() => setActiveProject(project.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                        activeProject === project.id 
                          ? 'bg-white/10 border border-indigo-500/50 shadow-lg shadow-indigo-500/20' 
                          : 'bg-white/5 border border-transparent hover:bg-white/8 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-1">{project.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeProject === project.id 
                            ? 'bg-indigo-500/20 text-indigo-300' 
                            : 'bg-white/10 text-white/50'
                        }`}>
                          {project.components.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {project.createdAt}
                      </div>
                    </button>

                    {/* Component List - shown when project is active */}
                    {activeProject === project.id && (
                      <div className="ml-4 mt-2 space-y-1 animate-fade-in">
                        {project.components.map((component) => (
                          <div key={component.id} className="text-sm">
                            <div className="px-3 py-2 text-white/60 hover:text-white/90 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {component.name}
                              <span className="ml-auto text-xs text-white/30">{component.versions.length}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="absolute -right-3 top-6 w-6 h-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 z-20"
          >
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${!leftSidebarOpen && 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* CENTER - Chat Interface */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="font-syne font-bold text-xl bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                {currentProject?.name || 'Select a Project'}
              </h2>
              {currentProject && (
                <span className="text-sm text-white/40">
                  {currentProject.components.reduce((sum, c) => sum + c.versions.length, 0)} versions
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all duration-300 border border-white/10 hover:border-white/20 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((message, idx) => (
              <div 
                key={message.id}
                className={`flex gap-4 animate-slide-in-up ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                  message.role === 'assistant' 
                    ? 'bg-linear-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30' 
                    : 'bg-white/10 border border-white/20'
                }`}>
                  {message.role === 'assistant' ? (
                    <span className="text-sm font-bold">N</span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className={`max-w-2xl ${message.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-4 py-3 rounded-2xl backdrop-blur-xl ${
                    message.role === 'assistant' 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-linear-to-r from-indigo-500/20 to-pink-500/20 border border-indigo-500/30'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe your UI or upload a screenshot..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-32 text-sm resize-none focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all duration-300 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent placeholder:text-white/30"
                  rows={3}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-white/50 hover:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-white/50 hover:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="px-4 py-2 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
                  >
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Code Versions */}
        <div className={`transition-all duration-300 ease-out ${rightSidebarOpen ? 'w-96' : 'w-0'} relative`}>
          <div className={`h-full bg-white/5 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden ${!rightSidebarOpen && 'invisible'}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-linear-to-l from-indigo-500/10 to-pink-500/10">
              <h3 className="font-syne font-bold text-lg mb-1">Versions</h3>
              <p className="text-xs text-white/50">Code history & variants</p>
            </div>

            {/* Versions List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="p-3 space-y-4">
                {currentProject?.components.map((component, compIdx) => (
                  <div key={component.id} className="animate-slide-in-right" style={{ animationDelay: `${compIdx * 50}ms` }}>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="font-semibold text-sm text-white/90">{component.name}</span>
                      <span className="ml-auto text-xs text-white/30">{component.versions.length}</span>
                    </div>
                    
                    <div className="space-y-1.5">
                      {component.versions.map((version, verIdx) => (
                        <button
                          key={version.id}
                          onClick={() => setActiveVersion(version.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-300 group ${
                            activeVersion === version.id 
                              ? 'bg-linear-to-r from-indigo-500/20 to-pink-500/20 border border-indigo-500/50 shadow-lg shadow-indigo-500/20' 
                              : 'bg-white/5 border border-transparent hover:bg-white/8 hover:border-white/10'
                          }`}
                          style={{ animationDelay: `${(compIdx * 50) + (verIdx * 30)}ms` }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-sm font-medium ${activeVersion === version.id ? 'text-white' : 'text-white/80'}`}>
                              {version.name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              activeVersion === version.id 
                                ? 'bg-indigo-500/30 text-indigo-200' 
                                : 'bg-white/10 text-white/40'
                            }`}>
                              v{verIdx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {version.timestamp}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="absolute -left-3 top-6 w-6 h-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 z-20"
          >
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${!rightSidebarOpen && 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Code Preview Modal - Shows when a version is selected */}
      {activeVersion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-7xl h-[90vh] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <h3 className="font-syne font-bold text-xl">
                  {activeVersionData?.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('code')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      viewMode === 'code' 
                        ? 'bg-indigo-500/30 text-white border border-indigo-500/50' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      viewMode === 'preview' 
                        ? 'bg-indigo-500/30 text-white border border-indigo-500/50' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      viewMode === 'split' 
                        ? 'bg-indigo-500/30 text-white border border-indigo-500/50' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    Split
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all duration-300 border border-white/10 hover:border-white/20 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </button>
                <button 
                  onClick={() => setActiveVersion(null)}
                  className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20 flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="h-[calc(100%-4rem)] flex">
              {/* Code Panel */}
              {(viewMode === 'code' || viewMode === 'split') && (
                <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-white/10 flex flex-col bg-[#1a1a2e]`}>
                  <div className="h-12 bg-white/5 border-b border-white/10 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-white/40 font-mono">index.html</span>
                  </div>
                  <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-6">
                    <pre className="text-sm text-white/80 font-mono leading-relaxed">
                      <code>{activeVersionData?.code}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Preview Panel */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-white`}>
                  <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-center gap-2 px-4">
                    <div className="flex-1 flex items-center gap-2 max-w-2xl bg-white border border-gray-300 rounded-lg px-3 py-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-mono">localhost:3000</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-linear-to-br from-gray-50 to-gray-100">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                      <div className="text-center text-gray-600">
                        <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-pink-500 rounded-2xl mx-auto mb-4" />
                        <p className="font-semibold mb-2">Preview Mode</p>
                        <p className="text-sm text-gray-500">Your generated UI will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
