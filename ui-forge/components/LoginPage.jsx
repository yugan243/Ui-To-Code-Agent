'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, googleSignIn, githubSignIn } from '@/app/actions/auth-actions';

export default function LoginPage({ onLoginSuccess }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeAnimationPhase, setCodeAnimationPhase] = useState('typing'); // 'typing', 'preview'
  const [typedCode, setTypedCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  // Features carousel
  const features = [
    {
      icon: '🎨',
      title: 'Screenshot to Code',
      description: 'Transform any UI design into production-ready code instantly',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Generate HTML, React, or Vue code in seconds',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🎯',
      title: 'Pixel Perfect',
      description: 'Accurate layouts with Tailwind CSS styling',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: '📦',
      title: 'Version Control',
      description: 'Track every iteration and refinement automatically',
      gradient: 'from-rose-500 to-orange-500'
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Code typing animation
  useEffect(() => {
    const codeSnippet = `<div className="card">
  <div className="header">
    <h2>UI Component</h2>
  </div>
  <div className="content">
    <p>Beautiful Design</p>
  </div>
</div>`;

    let currentIndex = 0;
    let typingInterval;

    const startTyping = () => {
      setCodeAnimationPhase('typing');
      setTypedCode('');
      currentIndex = 0;

      typingInterval = setInterval(() => {
        if (currentIndex < codeSnippet.length) {
          setTypedCode(codeSnippet.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // Wait a moment, then show preview
          setTimeout(() => {
            setCodeAnimationPhase('preview');
            // After showing preview, restart the cycle
            setTimeout(() => {
              startTyping();
            }, 4000);
          }, 800);
        }
      }, 30);
    };

    startTyping();

    return () => {
      if (typingInterval) clearInterval(typingInterval);
    };
  }, []);

  // Track mouse position for spotlight effect
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Generate floating particles when hovered
  useEffect(() => {
    if (!isHovered) return;
    
    const interval = setInterval(() => {
      if (particles.length < 15) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 2 + 2,
          delay: Math.random() * 0.3
        };
        setParticles(prev => [...prev, newParticle]);
        
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, (newParticle.duration + newParticle.delay) * 1000);
      }
    }, 150);
    
    return () => clearInterval(interval);
  }, [isHovered, particles.length]);

  // Create ripple effect on click
  const createRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('email', formData.email);
      formDataObj.append('password', formData.password);

      const result = await login(formDataObj);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // Success - NextAuth will redirect automatically
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error) {
      // NEXT_REDIRECT is thrown on successful login - this is expected
      // Don't show error, the redirect is happening
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        return; // Let the redirect happen silently
      }
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        await googleSignIn();
      } else if (provider === 'github') {
        await githubSignIn();
      }
    } catch (error) {
      // NEXT_REDIRECT is thrown on successful OAuth - this is expected
      // Don't show error, the redirect is happening
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        return; // Let the redirect happen silently
      }
      console.error('Social login error:', error);
      setError('Social login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white font-dm flex items-center justify-center overflow-hidden relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-125 h-125 bg-linear-to-br from-indigo-500 to-pink-500 rounded-full blur-[100px] opacity-30 -top-40 -left-20 animate-float" />
        <div className="absolute w-100 h-100 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-[100px] opacity-30 -bottom-32 -right-20 animate-float-delayed" />
        <div className="absolute w-87.5 h-87.5 bg-linear-to-br from-cyan-500 to-blue-500 rounded-full blur-[100px] opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 relative z-10">
        
        {/* LEFT PANEL - Features Showcase */}
        <div className="hidden lg:flex flex-col gap-6 w-95 animate-slide-in-left">
          {/* Brand Header */}
          <div className="text-center mb-4 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center font-syne font-bold text-lg shadow-lg shadow-indigo-500/50">
                N
              </div>
              <div className="text-left">
                <h2 className="font-syne font-bold text-xl">UI Forge</h2>
                <p className="text-xs text-white/50">Design to Code Platform</p>
              </div>
            </div>
          </div>

          {/* Rotating Feature Cards */}
          <div className="relative h-80">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  activeFeature === index
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                }`}
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-6 inline-block animate-bounce-slow">{feature.icon}</div>
                    <h3 className="font-syne font-bold text-2xl mb-3 bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/10 rounded-tr-2xl group-hover:border-white/30 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Feature Indicators */}
          <div className="flex justify-center gap-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeFeature === index
                    ? 'w-8 bg-linear-to-r from-indigo-500 to-pink-500'
                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 animate-slide-in-left" style={{ animationDelay: '200ms' }}>
            {[
              { value: '50K+', label: 'Designs' },
              { value: '99.9%', label: 'Accuracy' },
              { value: '2M+', label: 'Lines of Code' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="font-syne font-bold text-2xl bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER - Login Form */}
        <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <div 
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 w-110 max-w-[90vw] shadow-2xl shadow-black/30 relative overflow-hidden group cursor-default"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            onClick={createRipple}
          >
            {/* Animated Gradient Border */}
            <div 
              className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"
              style={{
                animation: isHovered ? 'borderRotate 4s linear infinite' : 'none',
                backgroundSize: '200% 200%'
              }}
            />

            {/* Spotlight Effect */}
            {isHovered && (
              <div
                className="absolute w-64 h-64 rounded-full opacity-30 pointer-events-none transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}

            {/* Floating Particles */}
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute w-1 h-1 rounded-full bg-linear-to-r from-indigo-400 to-pink-400 pointer-events-none"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animation: `floatUp ${particle.duration}s ease-out ${particle.delay}s forwards`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)'
                }}
              />
            ))}

            {/* Ripple Effects */}
            {ripples.map(ripple => (
              <div
                key={ripple.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                }}
              >
                <div className="absolute w-0 h-0 rounded-full border-2 border-indigo-400/50 animate-ripple" />
              </div>
            ))}

            {/* Corner Accents */}
            <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-400/0 rounded-tr-xl transition-all duration-500 ${isHovered ? 'border-indigo-400/50 scale-110' : ''}`} />
            <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-pink-400/0 rounded-bl-xl transition-all duration-500 ${isHovered ? 'border-pink-400/50 scale-110' : ''}`} />

            {/* Animated Grid Pattern */}
            <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-10' : ''}`}>
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                animation: isHovered ? 'gridSlide 20s linear infinite' : 'none'
              }} />
            </div>

            {/* Header */}
            <div className="text-center mb-10 relative z-10">
              <div className="w-16 h-16 mx-auto mb-5 bg-linear-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl shadow-lg shadow-indigo-500/50 animate-pulse-glow relative overflow-hidden group/logo">
                <span className="relative z-10">N</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-700" />
              </div>
              <h1 className="font-syne font-bold text-4xl mb-2 bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-white/50 text-[15px]">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center animate-fade-in">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Email Input */}
              <div className="group/input">
                <label htmlFor="email" className="block mb-2 font-medium text-sm text-white transition-colors group-focus-within/input:text-indigo-400">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-[15px] placeholder:text-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 relative z-10"
                  />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 -z-10">
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 to-pink-500/20 blur-xl" />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="group/input">
                <label htmlFor="password" className="block mb-2 font-medium text-sm text-white transition-colors group-focus-within/input:text-indigo-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-[15px] placeholder:text-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 pr-12 relative z-10"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-all duration-300 p-1 z-20"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="#1f2937" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="#1f2937" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 -z-10">
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 to-pink-500/20 blur-xl" />
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 group/check">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={formData.remember}
                    onChange={(e) => setFormData({...formData, remember: e.target.checked})}
                    className="w-4.5 h-4.5 cursor-pointer accent-indigo-500 transition-transform group-hover/check:scale-110"
                  />
                  <label htmlFor="remember" className="text-sm text-white/60 cursor-pointer group-hover/check:text-white/90 transition-colors">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-indigo-400 hover:text-pink-400 transition-colors relative group/link">
                  Forgot password?
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-linear-to-r from-indigo-400 to-pink-400 group-hover/link:w-full transition-all duration-300" />
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl font-syne font-semibold text-base transition-all duration-300 shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100 relative overflow-hidden group/button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                <span className="relative z-10">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </span>
                {!isLoading && (
                  <>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700" />
                    <div className="absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity">
                      <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-ping" />
                      <div className="absolute bottom-3 right-8 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                      <div className="absolute top-4 right-12 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6 relative z-10">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-white/40 text-[13px]">Or continue with</span>
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-xl text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20 active:translate-y-0 flex items-center justify-center gap-2 group/social relative overflow-hidden"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="relative z-10">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                <span className="relative z-10">Google</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/social:translate-x-full transition-transform duration-700" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-xl text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20 active:translate-y-0 flex items-center justify-center gap-2 group/social relative overflow-hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="relative z-10">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="relative z-10">GitHub</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/social:translate-x-full transition-transform duration-700" />
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-8 text-sm text-white/60 relative z-10">
              Don&apos;t have an account?{' '}
              <a href="#" className="text-indigo-400 hover:text-pink-400 font-semibold transition-colors relative group/signup">
                Sign up
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-linear-to-r from-indigo-400 to-pink-400 group-hover/signup:w-full transition-all duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - App Preview & Benefits */}
        <div className="hidden lg:flex flex-col gap-6 w-95 animate-slide-in-right">
          {/* App Preview Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <h3 className="font-syne font-bold text-xl mb-4">Live Preview</h3>
              
              {/* Mock Browser Window */}
              <div className="bg-white/10 rounded-xl overflow-hidden border border-white/10 shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                {/* Browser Bar */}
                <div className="bg-white/5 px-3 py-2 flex items-center gap-2 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/60" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                    <div className="w-2 h-2 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded px-2 py-1">
                    <span className="text-[10px] text-white/40">uiforge.app</span>
                  </div>
                </div>
                
                {/* Content Area - Animated */}
                <div className="relative h-48 bg-[#1e1e1e]">
                  {/* Code Typing View */}
                  <div className={`absolute inset-0 p-4 font-mono text-xs leading-relaxed transition-all duration-500 ${
                    codeAnimationPhase === 'typing' 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}>
                    <pre className="text-green-400">
                      {typedCode}
                      <span className="inline-block w-1.5 h-4 bg-green-400 animate-pulse ml-0.5" />
                    </pre>
                  </div>

                  {/* Preview View */}
                  <div className={`absolute inset-0 p-4 transition-all duration-500 ${
                    codeAnimationPhase === 'preview' 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}>
                    <div className="space-y-3 bg-linear-to-br from-white/5 to-white/0 h-full rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-pink-500 animate-pulse-glow" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-white/20 rounded-full w-3/4 animate-pulse" />
                          <div className="h-2 bg-white/10 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '0.1s' }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-16 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="h-16 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '0.3s' }} />
                      </div>
                      <div className="h-3 bg-white/10 rounded-full w-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      <div className="h-3 bg-white/10 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/50 mt-4 text-center">
                {codeAnimationPhase === 'typing' ? 'Writing code...' : 'See your designs come to life instantly'}
              </p>
            </div>
          </div>

          {/* Benefits List
          <div className="space-y-3 animate-slide-in-right" style={{ animationDelay: '200ms' }}>
            {[
              { icon: '🚀', text: 'Deploy-ready code' },
              { icon: '🎨', text: 'Multiple frameworks' },
              { icon: '⚙️', text: 'Customizable output' },
              { icon: '🔒', text: 'Secure & private' }
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/8 hover:border-white/20 hover:-translate-x-2 transition-all duration-300 group/benefit"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-2xl group-hover/benefit:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <span className="text-white/80 font-medium">{benefit.text}</span>
                <svg className="w-4 h-4 ml-auto text-white/30 group-hover/benefit:text-indigo-400 group-hover/benefit:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div> */}

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden animate-slide-in-right" style={{ animationDelay: '300ms' }}>
            <div className="absolute top-0 right-0 text-6xl text-indigo-500/10 font-serif leading-none">&quot;</div>
            <p className="text-white/70 text-sm leading-relaxed mb-4 relative z-10">
              &quot;This tool cut our development time by 70%. It&apos;s like having a senior developer on standby 24/7.&quot;
            </p>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-pink-500" />
              <div>
                <div className="font-semibold text-sm">Yugan Nimsara</div>
                <div className="text-xs text-white/40">Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}