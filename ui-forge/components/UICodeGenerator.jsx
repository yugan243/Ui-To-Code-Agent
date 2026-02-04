'use client';

import { createNewProject, getProjectChatHistory, saveUserMessage, createUIFile } from '@/app/actions/project-actions'; 
import { uploadImage } from '@/app/actions/upload';
import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import ContextSwitchAlert from './ContextSwitchAlert';
import { generateComponent } from '@/app/actions/generate';
import SandpackPreview from './SandpackPreview';

// Helper: Transforms Database Structure -> UI Structure
const transformToUI = (dbProjects) => {
  if (!dbProjects) return [];
  
  return dbProjects.map(p => ({
    id: p.id,
    name: p.name,
    createdAt: new Date(p.createdAt).toLocaleDateString(),
    // This is the magic fix: We treat 'Files' as 'Components'
    components: p.sessions.flatMap(session => 
      session.files?.map(file => ({
        id: file.id,
        name: file.name,
        versions: file.versions.map(v => ({
          id: v.id,
          name: `v${v.versionNumber}`, // e.g. "v1"
          timestamp: new Date(v.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          code: v.code
        }))
      })) || []
    )
  }));
};

export default function UICodeGenerator({ initialProjects = [], user }) {
  // ALL hooks must be called before any conditional returns
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeProject');
      return saved || null;
    }
    return null;
  });
  const [activeVersion, setActiveVersion] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'code', 'preview', 'split'
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Welcome! Upload a UI screenshot to generate code.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [contextSwitch, setContextSwitch] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Stores base64 string
  const fileInputRef = useRef(null); // Reference to hidden file input
  const messagesEndRef = useRef(null); // Reference for auto-scroll
  const [activeFileId, setActiveFileId] = useState(null);
  const [collapsedProjects, setCollapsedProjects] = useState(new Set()); // Track collapsed projects
  const [collapsedFiles, setCollapsedFiles] = useState(new Set()); // Track collapsed file groups
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Track profile menu visibility
  
  // Auto-logout after 5 minutes of inactivity
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
    let inactivityTimer;

    const resetTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Set new timer
      inactivityTimer = setTimeout(async () => {
        console.log('User inactive for 5 minutes, signing out...');
        try {
          await signOut({ callbackUrl: '/login', redirect: true });
        } catch (error) {
          window.location.href = '/api/auth/signout';
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initialize timer on mount
    resetTimer();

    // Cleanup on unmount
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  // Save active project to localStorage
  useEffect(() => {
    if (activeProject) {
      localStorage.setItem('activeProject', activeProject);
    } else {
      localStorage.removeItem('activeProject');
    }
  }, [activeProject]);

  // Load chat history when switching projects
  useEffect(() => {
    async function loadChat() {
      if (!activeProject) return;
      
      try {
        const history = await getProjectChatHistory(activeProject);
        
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          // If no history, show default welcome message
          setMessages([
            { id: 'welcome', role: 'assistant', content: 'Welcome! Upload a UI screenshot to generate code.' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    }

    loadChat();
  }, [activeProject]); // <--- Runs every time you click a different project
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleLogout = async () => {
    try {
      // Clear localStorage before logout
      localStorage.removeItem('activeProject');
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if there's an error
      window.location.href = '/api/auth/signout';
    }
  };

  // Initialize with the real data passed from the server
  const [projects, setProjects] = useState(transformToUI(initialProjects));
  // Mock data structure - moved here with other hooks
  // const [projects] = useState([
  //   {
  //     id: 'project-1',
  //     name: 'E-commerce Dashboard',
  //     createdAt: '2024-01-28',
  //     components: [
  //       {
  //         id: 'comp-1',
  //         name: 'Login Form',
  //         versions: [
  //           { id: 'v1', name: 'Initial Design', timestamp: '10:30 AM', code: '<div class="login">...</div>' },
  //           { id: 'v2', name: 'With Glassmorphism', timestamp: '11:45 AM', code: '<div class="login glass">...</div>' },
  //           { id: 'v3', name: 'Mobile Optimized', timestamp: '2:15 PM', code: '<div class="login responsive">...</div>' }
  //         ]
  //       },
  //       {
  //         id: 'comp-2',
  //         name: 'Product Card',
  //         versions: [
  //           { id: 'v1', name: 'Basic Layout', timestamp: '3:20 PM', code: '<div class="product-card">...</div>' },
  //           { id: 'v2', name: 'With Hover Effects', timestamp: '4:10 PM', code: '<div class="product-card animated">...</div>' }
  //         ]
  //       }
  //     ]
  //   },
  //   {
  //     id: 'project-2',
  //     name: 'Portfolio Website',
  //     createdAt: '2024-01-29',
  //     components: [
  //       {
  //         id: 'comp-3',
  //         name: 'Hero Section',
  //         versions: [
  //           { id: 'v1', name: 'Initial Version', timestamp: 'Yesterday', code: '<section class="hero">...</section>' }
  //         ]
  //       }
  //     ]
  //   }
  // ]);

// 1. Just open the modal
  const openCreateModal = () => {
    setNewProjectName(''); // Reset input
    setShowCreateModal(true);
  };

  // 2. actually create it when they click "Create" in the modal
  const confirmCreateProject = async (e) => {
    e.preventDefault(); // Prevent form submit refresh
    if (!newProjectName.trim()) return;

    // Use the custom name
    const result = await createNewProject(newProjectName);
    
    if (result.success) {
      const newProjectFormatted = transformToUI([result.project])[0];
      setProjects([newProjectFormatted, ...projects]);
      setActiveProject(result.project.id);
      setShowCreateModal(false); // Close modal
    } else {
      alert("Failed to create project");
    }
  };

  // --- IMAGE HANDLERS (Paste & Select) ---

  // 1. Handle File Selection (Button)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  // 2. Handle Paste (Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        processFile(file);
      }
    }
  };

  // 3. Process File -> Base64
  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result); // Save Base64 for the API
    };
    reader.readAsDataURL(file);
  };

  const getActiveContextImage = async (url) => {
    try {
      const response = await fetch(url, { cache: 'force-cache' }); 
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Browser cache fetch failed:", e);
      return null;
    }
  };

  // Helper: Context Switch Handler
  const handleSwitchContext = (fileId, fileName) => {
    setActiveFileId(fileId);
    setContextSwitch(fileName); // Triggers your existing Alert
  };

  // Toggle project collapse
  const toggleProjectCollapse = (projectId, e) => {
    e.stopPropagation();
    setCollapsedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Toggle file group collapse
  const toggleFileCollapse = (fileId, e) => {
    e.stopPropagation();
    setCollapsedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;
    
    let userText = inputValue;
    let imagePayload = selectedImage; 
    let currentFileId = activeFileId;

    setInputValue(''); 
    setSelectedImage(null); 

    // Optimistic UI
    const tempUserId = Date.now();
    setMessages(prev => [...prev, { 
      id: tempUserId, 
      role: 'user', 
      content: userText,
      image: imagePayload 
    }]);

    try {
      // --- PATH A: NEW UPLOAD (Create "Screen X") ---
      if (imagePayload) {
        const uploadRes = await uploadImage(imagePayload);
        
        if (uploadRes.success) {
           const fileRes = await createUIFile(activeProject, uploadRes.url);
           
           if (fileRes.success) {
             currentFileId = fileRes.file.id;
             setActiveFileId(currentFileId); 
             
             // Update Local State (Add new file to sidebar)
             setProjects(prev => prev.map(p => {
                if (p.id !== activeProject) return p;
                const newComp = {
                    id: fileRes.file.id,
                    name: fileRes.file.name,
                    referenceImageUrl: uploadRes.url,
                    versions: []
                };
                // Avoid duplicates
                const exists = p.components.find(c => c.id === newComp.id);
                if (!exists) p.components.push(newComp);
                return { ...p };
             }));
           }
        }
      } 
      // --- PATH B: CONTEXT RE-USE (Talking about "Screen 1") ---
      else if (activeFileId) {
         const currentProject = projects.find(p => p.id === activeProject);
         const activeFile = currentProject?.components.find(c => c.id === activeFileId);

         if (activeFile?.referenceImageUrl) {
            // Fetch cached image as Base64 so AI can see it
            const cachedBase64 = await getActiveContextImage(activeFile.referenceImageUrl);
            if (cachedBase64) {
                imagePayload = cachedBase64; 
            }
         }
      }

      // Save Message to DB (Pass URL if new upload, otherwise null)
      // Note: We use 'selectedImage' check to ensure we only save URL if it's a FRESH upload
      await saveUserMessage(activeProject, userText, 'USER', selectedImage ? activeProject?.components?.find(c => c.id === currentFileId)?.referenceImageUrl : null); 

      const tempAiId = Date.now() + 1;
      setMessages(prev => [...prev, { 
        id: tempAiId, 
        role: 'assistant', 
        content: 'Analyzing context & generating...' 
      }]);

      const currentCode = activeVersionData?.code || "";
      
      // Call AI with the Image Payload (New or Cached)
      // Pass currentFileId so version is saved to the correct file
      const result = await generateComponent(activeProject, userText, imagePayload, currentCode, currentFileId);

      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempAiId 
            ? { ...msg, content: "Generated! Check the preview." } 
            : msg
        ));

        // Update Versions List
        setProjects(prevProjects => prevProjects.map(proj => {
          if (proj.id !== activeProject) return proj;
          
          const updatedProj = { ...proj };
          const compIndex = updatedProj.components.findIndex(c => c.id === currentFileId);
          
          if (compIndex > -1) {
             const newVersion = {
                id: result.versionId,
                name: `v${updatedProj.components[compIndex].versions.length + 1}`,
                timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                code: result.code
             };
             updatedProj.components[compIndex].versions.unshift(newVersion);
          }
          return updatedProj;
        }));

        setActiveVersion(result.versionId);
        setViewMode('preview');
        setRightSidebarOpen(true); 

      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === tempAiId 
            ? { ...msg, content: `Error: ${result.error}` } 
            : msg
        ));
      }

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const handleCopyCode = async () => {
    if (!activeVersionData?.code) return;
    
    try {
      await navigator.clipboard.writeText(activeVersionData.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleExportZip = async () => {
    if (!activeVersionData?.code) return;

    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add the HTML file to the zip
      zip.file('index.html', activeVersionData.code);
      
      // Generate the zip file
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeVersionData.name || 'code'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to export. Please try again.');
    }
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
              
              <button 
                onClick={openCreateModal}  className="w-full px-4 py-2.5 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
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
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            onClick={(e) => toggleProjectCollapse(project.id, e)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors shrink-0"
                          >
                            <svg 
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                collapsedProjects.has(project.id) ? '-rotate-90' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <h3 className="font-semibold text-sm line-clamp-1">{project.name}</h3>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
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

                    {/* Component List - shown when not collapsed */}
                    {!collapsedProjects.has(project.id) && (
                    <div className="ml-4 mt-2 space-y-1 animate-fade-in">
                      {project.components.map((component) => (
                        <div key={component.id} className="text-sm">
                          <div 
                            onClick={() => handleSwitchContext(component.id, component.name)} 
                            className={`
                              px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all duration-200
                              ${activeFileId === component.id 
                                ? 'bg-indigo-500/20 text-white border border-indigo-500/30' // ACTIVE STYLE (Blueish)
                                : 'text-white/60 hover:bg-white/5 hover:text-white'}          // INACTIVE STYLE
                            `}
                          >
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

            {/* User Profile Section - Bottom */}
            <div className="p-3 border-t border-white/10 relative z-50">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500 to-pink-500 text-white font-semibold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm truncate">{user?.name || 'User'}</div>
                  <div className="text-xs text-white/40">Free</div>
                </div>
                <svg 
                  className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                    showProfileMenu ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in z-50">
                  {/* User Info Header */}
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-white/20">
                        {user?.image ? (
                          <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500 to-pink-500 text-white font-bold text-lg">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{user?.name || 'User'}</div>
                        <div className="text-xs text-white/50 truncate">{user?.email || 'No email'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group">
                      <svg className="w-5 h-5 text-white/60 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm text-white/80 group-hover:text-white">Personalization</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group">
                      <svg className="w-5 h-5 text-white/60 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-white/80 group-hover:text-white">Help</span>
                    </button>
                    <div className="h-px bg-white/10 my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
                    >
                      <svg className="w-5 h-5 text-white/60 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm text-white/80 group-hover:text-red-400">Log out</span>
                    </button>
                  </div>
                </div>
              )}
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
        <div className="flex-1 flex flex-col min-w-0 relative">
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
              {/* Logout button removed - now in profile menu */}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-40 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="max-w-4xl mx-auto space-y-4">
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
            {/* Invisible scroll target */}
            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Floating Input Area with Smooth Transition */}
          <div className={`absolute inset-x-0 transition-all duration-700 ease-out ${
            !activeProject && messages.length <= 1 
              ? 'top-1/2 -translate-y-1/2' 
              : 'bottom-0'
          }`}>
            {/* Welcome Message - Only shown when centered */}
            {!activeProject && messages.length <= 1 && (
              <div className="text-center mb-8 animate-fade-in">
                <h2 className="font-syne font-bold text-4xl mb-3 bg-linear-to-r from-white via-indigo-200 to-pink-200 bg-clip-text text-transparent">
                  Hi {user?.name?.split(' ')[0] || 'there'}! 👋
                </h2>
                <p className="text-white/50 text-lg">
                  Let's turn your UI designs into beautiful code
                </p>
              </div>
            )}

            <div className="max-w-4xl mx-auto px-6 relative">
              
              {/* --- IMAGE PREVIEW (Before Sending) --- */}
              {selectedImage && (
                <div className="absolute -top-24 left-0 bg-[#1a1a2e] border border-white/10 p-2 rounded-xl flex items-center gap-3 shadow-xl animate-fade-in-up">
                  <div className="h-16 w-16 rounded-lg overflow-hidden relative border border-white/10">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white/70 font-medium">Image attached</span>
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors text-left"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPaste={handlePaste} // <--- Add Paste Handler
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe your UI or paste a screenshot..." // Update placeholder
                  className="w-full bg-[#1a1a2e]/95 border border-white/10 rounded-2xl px-5 py-4 pr-32 text-sm resize-none focus:outline-none focus:border-indigo-500/50 focus:bg-[#1a1a2e] focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent placeholder:text-white/30 shadow-2xl"
                  rows={3}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {/* Paperclip Icon (Unused for now) */}
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  
                  {/* Image Icon - Triggers File Input */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white/90"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() && !selectedImage} // Enable if text OR image
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
                    <button 
                      onClick={(e) => toggleFileCollapse(component.id, e)}
                      className="w-full flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <button className="p-0.5 shrink-0">
                        <svg 
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            collapsedFiles.has(component.id) ? '-rotate-90' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="font-semibold text-sm text-white/90">{component.name}</span>
                      <span className="ml-auto text-xs text-white/30">{component.versions.length}</span>
                    </button>
                    
                    {!collapsedFiles.has(component.id) && (
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
                    )}
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
                <button 
                  onClick={handleExportZip}
                  className="px-4 py-2 rounded-lg text-sm transition-all duration-300 border flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
                <button 
                  onClick={handleCopyCode}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 border flex items-center gap-2 ${
                    isCopied 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </>
                  )}
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

              {/* Preview Panel - THE NEW ENGINE */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-white overflow-hidden h-full relative`}>
                    <div className="flex-1 h-full w-full absolute inset-0">
                      <SandpackPreview code={activeVersionData?.code} />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Context Switch Alert */}
      {contextSwitch && (
        <ContextSwitchAlert 
          key={contextSwitch}
          componentName={contextSwitch} 
          onClose={() => setContextSwitch(null)} 
        />
      )}
      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-syne font-bold text-xl text-white mb-1">New Project</h3>
            <p className="text-sm text-white/50 mb-6">Give your new idea a name</p>

            <form onSubmit={confirmCreateProject}>
              <div className="mb-6">
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Project Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Crypto Dashboard"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    
  );
}
