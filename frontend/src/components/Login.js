import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../utils/firebase';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOAuthLogin = async (providerName) => {
    try {
      setError('');
      const provider = providerName === 'google' ? googleProvider : githubProvider;
      const result = await signInWithPopup(auth, provider);
      
      const oauthEmail = result.user.email;
      const name = result.user.displayName || oauthEmail.split('@')[0];
      
      const response = await fetch('http://localhost:9005/auth/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: oauthEmail, name, provider: providerName })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        const text = await response.text();
        setError(`${providerName} login failed: ` + text);
      }
    } catch (err) {
      if (err.code === 'auth/invalid-api-key') {
        setError("Please configure your Firebase API keys in src/utils/firebase.js to use real Google/GitHub authentication!");
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Authentication Error: ' + err.message);
      }
    }
  };

  const handleLogin = async (e, customEmail, customPass) => {
    if (e) e.preventDefault();
    const loginUser = (customEmail !== undefined ? customEmail : email).trim();
    const loginPass = customPass !== undefined ? customPass : password;

    if (!loginUser) {
      setError('Please enter your email or username');
      return;
    }
    if (!loginPass) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:9005/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginUser, password: loginPass })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        const text = await response.text();
        setError(text || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection error: ' + (err.message || 'Could not connect to authentication server. Please ensure backend is running.'));
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = (uEmail, uPass) => {
    setEmail(uEmail);
    setPassword(uPass);
    handleLogin(null, uEmail, uPass);
  };


  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const heroColumn = document.getElementById('left-hero-column');
    const card = document.getElementById('parallax-card');
    const wrapper = document.getElementById('artwork-wrapper');
    const cursorGlow = document.getElementById('cursor-glow');

    if (!heroColumn || !card) return;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let targetTranslateX = 0;
    let targetTranslateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let isHovered = false;
    let animFrameId = null;

    function onMouseMove(e) {
      const rect = heroColumn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const normalizedX = (x / rect.width) * 2 - 1;
      const normalizedY = (y / rect.height) * 2 - 1;

      targetRotateX = -normalizedY * 11;
      targetRotateY = normalizedX * 13;
      targetTranslateX = normalizedX * 10;
      targetTranslateY = normalizedY * 8;

      if (cursorGlow) {
        cursorGlow.style.left = `${x - 240}px`;
        cursorGlow.style.top = `${y - 240}px`;
        cursorGlow.style.opacity = '0.8';
      }
    }

    function onMouseEnter() {
      isHovered = true;
      startAnimationLoop();
    }

    function onMouseLeave() {
      isHovered = false;
      targetRotateX = 0;
      targetRotateY = 0;
      targetTranslateX = 0;
      targetTranslateY = 0;
      if (cursorGlow) {
        cursorGlow.style.opacity = '0.4';
      }
    }

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function renderLoop() {
      currentRotateX = lerp(currentRotateX, targetRotateX, 0.08);
      currentRotateY = lerp(currentRotateY, targetRotateY, 0.08);
      currentTranslateX = lerp(currentTranslateX, targetTranslateX, 0.08);
      currentTranslateY = lerp(currentTranslateY, targetTranslateY, 0.08);

      card.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translate3d(${currentTranslateX.toFixed(2)}px, ${currentTranslateY.toFixed(2)}px, 0)`;

      if (wrapper) {
        const offsetX = currentRotateY * 0.9;
        const offsetY = -currentRotateX * 0.9;
        wrapper.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 15px)`;
      }

      const isSettled = !isHovered && 
        Math.abs(currentRotateX) < 0.02 && 
        Math.abs(currentRotateY) < 0.02 && 
        Math.abs(currentTranslateX) < 0.02 && 
        Math.abs(currentTranslateY) < 0.02;

      if (!isSettled) {
        animFrameId = requestAnimationFrame(renderLoop);
      } else {
        card.style.transform = '';
        if (wrapper) wrapper.style.transform = '';
        animFrameId = null;
      }
    }

    function startAnimationLoop() {
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(renderLoop);
      }
    }

    heroColumn.addEventListener('mousemove', (e) => {
      onMouseMove(e);
      startAnimationLoop();
    });
    heroColumn.addEventListener('mouseenter', onMouseEnter);
    heroColumn.addEventListener('mouseleave', onMouseLeave);

    return () => {
      heroColumn.removeEventListener('mousemove', onMouseMove);
      heroColumn.removeEventListener('mouseenter', onMouseEnter);
      heroColumn.removeEventListener('mouseleave', onMouseLeave);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary selection:text-on-primary min-h-screen relative dark">
      <header className="fixed top-0 left-0 w-full z-50 pointer-events-none p-margin"><div className="flex items-center justify-between pointer-events-auto"><div className="flex items-center gap-space-sm"><div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-105"><span className="material-symbols-outlined text-primary text-headline-sm">terminal</span></div><span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">TaskFlow</span></div><nav className="flex items-center gap-space-lg" data-active-classes="text-on-surface"><Link to="/login" className="font-label-md transition-colors text-on-surface">Sign In</Link><Link to="/register" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">Register</Link></nav></div></header>
      <main className="w-full min-h-screen bg-background relative flex flex-col justify-center">
        <div className="flex flex-col w-full">
<div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
{/*  Left Hero Column (50% on Desktop)  */}
<div className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-space-2xl bg-surface-container-lowest overflow-hidden select-none" id="left-hero-column">
{/*  Ambient Lighting Blobs  */}
<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none transition-all duration-700"></div>
<div className="absolute bottom-10 right-0 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none"></div>
{/*  Top Tagline & Status Indicator  */}
<div className="relative z-10 pt-margin">
<div className="inline-flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-container/60 backdrop-blur-md shadow-sm border border-outline-variant/30 hover:border-primary/40 transition-colors duration-300">
<span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.8)]"></span>
<span className="font-label-sm text-label-sm text-tertiary tracking-wide uppercase">Core Orchestration v4.8</span>
</div>
</div>
{/*  Central Visual Asset Showcase (3D Interactive Tilt & Depth)  */}
<div className="relative z-10 my-auto py-space-md flex flex-col items-center perspective-container w-full">
{/*  Dynamic cursor spotlight glow  */}
<div className="absolute w-[480px] h-[480px] rounded-full bg-radial from-primary/20 via-tertiary/10 to-transparent blur-3xl pointer-events-none transition-opacity duration-500 opacity-60" id="cursor-glow"></div>
<div className="relative w-full max-w-lg aspect-square rounded-2xl bg-surface-container-low/40 backdrop-blur-md overflow-hidden shadow-2xl flex items-center justify-center p-0 preserve-3d border border-outline-variant/30 transition-transform duration-200 ease-out" id="parallax-card">
{/*  Background Ambient Glow behind artwork  */}
<div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary-container/25 via-tertiary-container/30 to-secondary-container/20 blur-3xl pointer-events-none animate-pulse-glow -z-10"></div>
{/*  Image & Overlays Wrapper with 3D Preservation  */}
<div className="relative w-full h-full flex items-center justify-center preserve-3d" id="artwork-wrapper">
{/*  Base 3D Architecture Illustration (Exact user supplied image)  */}
<img alt="TaskFlow Enterprise Architecture" className="w-full h-full object-cover rounded-xl filter drop-shadow-[0_24px_48px_rgba(4,14,33,0.95)]" id="parallax-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZYIdwoFhwVCe8DWgePbRqUv02MAxIXt-6eec5c2AgDFt-LmD_yZLoEVdFwfzlHMmZhywzKfqMn5KooYsNsnflPfMbyDO7k9X7rGo1t0TOO0BJsdRunh7n40QcF9z5VCI-yOofFEIN-_1eD5Wvax-Ako8EMtvJHl61T6EUQhPWf2Y1mpal49maFXwobsc2LxLMefr744YD6NUKkv98siig0k-jHqTxjSxVtejT9FrUnGfcdzdOJ_0E6CJ3CufeAFMr0Q"/>
{/*  ==================== ANIMATION LAYER 1: Radiating Circuit Wire Pulses ====================  */}
<svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
<defs>
{/*  Gradients for electric pulses  */}
<linearGradient id="cyan-pulse-grad" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#4cd7f6" stopOpacity="1" />
<stop offset="50%" stopColor="#adc6ff" stopOpacity="0.8" />
<stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.2" />
</linearGradient>
<linearGradient id="magenta-pulse-grad" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#ff7ee2" stopOpacity="0.9" />
<stop offset="100%" stopColor="#4d8eff" stopOpacity="0.3" />
</linearGradient>
<filter height="140%" id="neon-glow" width="140%" x="-20%" y="-20%">
<feGaussianBlur result="blur" stdDeviation="1.2" />
<feMerge>
<feMergeNode in="blur" />
<feMergeNode in="SourceGraphic" />
</feMerge>
</filter>
</defs>
{/*  Center to Bottom Core wire  */}
<path className="animate-dash-travel-1" d="M 49 61 L 49 76 L 49 84" fill="none" filter="url(#neon-glow)" stroke="url(#cyan-pulse-grad)" strokeWidth="0.9" />
{/*  Center to Bottom-Left Node wire  */}
<path className="animate-dash-travel-2" d="M 41 60 L 28 66 L 27 75" fill="none" filter="url(#neon-glow)" stroke="#4cd7f6" strokeWidth="0.8" />
{/*  Center to Bottom-Right Node wire  */}
<path className="animate-dash-travel-1" d="M 58 60 L 73 66 L 73 76" fill="none" filter="url(#neon-glow)" stroke="url(#magenta-pulse-grad)" strokeWidth="0.85" />
{/*  Center to Top-Left Node wire  */}
<path className="animate-dash-travel-3" d="M 43 51 L 41 44 L 41 38" fill="none" filter="url(#neon-glow)" stroke="#4cd7f6" strokeWidth="0.75" />
{/*  Center to Left Screen bus wire  */}
<path className="animate-dash-travel-2" d="M 37 54 L 28 51 L 24 55" fill="none" filter="url(#neon-glow)" stroke="#adc6ff" strokeWidth="0.75" />
{/*  Center to Right Status Screen bus wire  */}
<path className="animate-dash-travel-1" d="M 59 53 L 66 49 L 71 52" fill="none" filter="url(#neon-glow)" stroke="#4cd7f6" strokeWidth="0.8" />
{/*  Peripheral connecting ring wires  */}
<path className="animate-dash-travel-3" d="M 27 76 L 45 87 L 49 85" fill="none" opacity="0.85" stroke="#c0c1ff" strokeWidth="0.65" />
<path className="animate-dash-travel-2" d="M 49 85 L 53 87 L 73 77" fill="none" opacity="0.85" stroke="#4cd7f6" strokeWidth="0.65" />
{/*  Outermost device node pulse (bottom left terminal)  */}
<path className="animate-dash-travel-1" d="M 24 72 L 13 67 L 12 65" fill="none" stroke="#4cd7f6" strokeWidth="0.7" />
{/*  Outermost device node pulse (far right terminal)  */}
<path className="animate-dash-travel-2" d="M 75 75 L 86 69 L 87 67" fill="none" stroke="#ff7ee2" strokeWidth="0.7" />
</svg>
{/*  ==================== ANIMATION LAYER 2: Central Core Cube Breathing & Energy Shockwaves ====================  */}
<div className="absolute top-[56%] left-[49.5%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 pointer-events-none z-20 flex items-center justify-center">
{/*  Expanding Radiant Shockwaves  */}
<div className="absolute w-20 h-20 rounded-full border border-tertiary/80 animate-shockwave-1"></div>
<div className="absolute w-20 h-20 rounded-full border border-primary/70 animate-shockwave-2"></div>
{/*  Core Breathing Aura / Glow Beacon  */}
<div className="absolute w-14 h-14 rounded-xl bg-gradient-to-tr from-tertiary/40 via-primary/30 to-secondary/35 blur-md animate-core-breathe"></div>
<div className="absolute w-6 h-6 rounded-lg bg-tertiary/70 blur-[3px] animate-pulse"></div>
{/*  Center Energy Sparkle  */}
<div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_#4cd7f6]"></div>
</div>
{/*  Node Glow Bullets / Indicator Sparks on Cubes  */}
<div className="absolute top-[37.5%] left-[42%] w-2 h-2 rounded-full bg-tertiary shadow-[0_0_10px_#4cd7f6] animate-ping pointer-events-none z-20" style={{animationDuration: '3s'}}></div>
<div className="absolute top-[75%] left-[26%] w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#adc6ff] animate-ping pointer-events-none z-20" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
<div className="absolute top-[75.5%] left-[73.5%] w-2 h-2 rounded-full bg-tertiary shadow-[0_0_10px_#4cd7f6] animate-ping pointer-events-none z-20" style={{animationDuration: '3.5s', animationDelay: '0.5s'}}></div>
<div className="absolute top-[88.5%] left-[49.5%] w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_12px_#c0c1ff] animate-ping pointer-events-none z-20" style={{animationDuration: '2.8s', animationDelay: '1.5s'}}></div>
{/*  ==================== ANIMATION LAYER 3: Top-Right Screen Holographic Ticker Overlay ====================  */}
{/*  Positioned exactly aligned over top-right board ("OVERVIEW, ACTIVE TASKS, COMPLETED")  */}
<div className="absolute top-[8.5%] right-[9.5%] w-[42%] h-[27.5%] rounded-lg overflow-hidden pointer-events-none z-20 border border-primary/25 bg-surface-container-lowest/40 backdrop-blur-[2px] shadow-[0_0_20px_rgba(77,142,255,0.2)] flex flex-col p-1.5 transform skew-x-[-1.5deg] rotate-[0.5deg]">
{/*  Scanline shimmer across top hologram  */}
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-tertiary/15 to-transparent pointer-events-none holo-scanline"></div>
{/*  Hologram Screen Header  */}
<div className="relative z-10 flex items-center justify-between px-1 pb-1 border-b border-outline-variant/30">
<div className="flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
<span className="text-[8px] font-bold text-tertiary tracking-wider font-label-sm">LIVE SPRINT</span>
</div>
<div className="flex items-center gap-1">
<span className="text-[8px] font-mono text-primary font-medium">99.4%</span>
<span className="material-symbols-outlined text-[10px] text-tertiary">autorenew</span>
</div>
</div>
{/*  Infinite Vertical Ticker Loop  */}
<div className="relative z-10 w-full flex-1 overflow-hidden mt-1">
<div className="flex flex-col gap-1 w-full animate-ticker">
{/*  Item 1: Active Task  */}
<div className="flex flex-col gap-0.5 bg-surface-container-high/60 rounded px-1.5 py-1 border border-primary/20">
<div className="flex items-center justify-between text-[8px]">
<span className="text-on-surface font-medium truncate max-w-[95px]">Marketing Revamp</span>
<span className="text-[7px] text-tertiary font-bold bg-tertiary/20 px-1 rounded flex items-center gap-0.5">
<span className="w-1 h-1 rounded-full bg-tertiary animate-ping"></span> Syncing
              </span>
</div>
{/*  Dynamic Progress Bar  */}
<div className="w-full bg-surface-container-lowest rounded-full h-1 overflow-hidden mt-0.5">
<div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full animate-bar-1"></div>
</div>
</div>
{/*  Item 2: Design Ops  */}
<div className="flex flex-col gap-0.5 bg-surface-container-high/60 rounded px-1.5 py-1 border border-tertiary/20">
<div className="flex items-center justify-between text-[8px]">
<span className="text-on-surface font-medium truncate max-w-[95px]">Design Sys Tokens</span>
<span className="text-[7px] text-primary font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[9px] text-primary">check_circle</span> Ready
              </span>
</div>
<div className="w-full bg-surface-container-lowest rounded-full h-1 overflow-hidden mt-0.5">
<div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full animate-bar-2"></div>
</div>
</div>
{/*  Item 3: Core API Microservices  */}
<div className="flex flex-col gap-0.5 bg-surface-container-high/60 rounded px-1.5 py-1 border border-secondary/20">
<div className="flex items-center justify-between text-[8px]">
<span className="text-on-surface font-medium truncate max-w-[95px]">GraphQL Gateway</span>
<span className="text-[7px] text-emerald-400 font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[9px] text-emerald-400">done_all</span> Deployed
              </span>
</div>
<div className="w-full bg-surface-container-lowest rounded-full h-1 overflow-hidden mt-0.5">
<div className="h-full bg-gradient-to-r from-emerald-400 to-tertiary rounded-full w-[96%]"></div>
</div>
</div>
</div>
</div>
</div>
{/*  ==================== ANIMATION LAYER 4: Project Status Tracker Timeline Overlay ====================  */}
{/*  Positioned over the middle timeline board ("PROJECT STATUS / OCT 14 - 20")  */}
<div className="absolute top-[37%] right-[11%] w-[38%] h-[20%] rounded-lg overflow-hidden pointer-events-none z-20 border border-tertiary/25 bg-surface-container-lowest/35 backdrop-blur-[2px] shadow-[0_0_16px_rgba(76,215,246,0.18)] p-1.5 flex flex-col justify-between">
{/*  Live scrubbing scanner  */}
<div className="flex items-center justify-between border-b border-outline-variant/30 pb-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[10px] text-tertiary">timeline</span>
<span className="text-[7.5px] font-bold text-on-surface uppercase tracking-wider">OCT 14 - 20</span>
</div>
{/*  Morphing Status Badge  */}
<span className="text-[7px] font-semibold px-1.5 py-0.5 rounded border animate-status-badge">
          Active Sprint
        </span>
</div>
{/*  Animated Progress Track with Scrub Head  */}
<div className="relative w-full my-auto flex flex-col gap-1">
<div className="relative w-full h-2 rounded-full bg-surface-container-high/80 overflow-hidden border border-outline-variant/20">
<div className="absolute inset-y-0 left-0 bg-gradient-to-r from-tertiary via-primary to-secondary/80 rounded-full w-[68%] shadow-[0_0_10px_rgba(76,215,246,0.6)]"></div>
{/*  Scrubbing neon marker head  */}
<div className="absolute top-0 bottom-0 w-2.5 rounded-full bg-white shadow-[0_0_8px_#4cd7f6] animate-scrub"></div>
</div>
{/*  Milestones Dots Row  */}
<div className="flex items-center justify-between px-1 text-[7px] text-on-surface-variant font-mono">
<span className="flex items-center gap-0.5 text-tertiary"><span className="w-1 h-1 rounded-full bg-tertiary animate-ping"></span>DEV</span>
<span className="text-primary font-semibold">QA PASS</span>
<span className="text-on-surface-variant">STAGING</span>
<span className="text-tertiary font-bold">RELEASE</span>
</div>
</div>
</div>
{/*  ==================== ANIMATION LAYER 5: Left Side Screen Board ("WEEKLY / Current Events") ====================  */}
{/*  Positioned over the left dashboard screen  */}
<div className="absolute top-[26.5%] left-[8%] w-[27%] h-[32%] rounded-lg overflow-hidden pointer-events-none z-20 border border-primary/25 bg-surface-container-lowest/40 backdrop-blur-[2px] shadow-[0_0_16px_rgba(77,142,255,0.18)] p-1.5 flex flex-col justify-between">
{/*  Left Screen Header with Syncing Pulse  */}
<div className="flex items-center justify-between border-b border-outline-variant/30 pb-1">
<div className="flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#adc6ff] animate-pulse"></span>
<span className="text-[7.5px] font-bold text-primary tracking-wide">WEEKLY SYNC</span>
</div>
<span className="material-symbols-outlined text-[10px] text-tertiary animate-spin" style={{animationDuration: '9s'}}>sync</span>
</div>
{/*  Real-time Activity Equalizer / Metrics Bar Chart  */}
<div className="flex items-end justify-between h-9 px-1 gap-1 my-1">
<div className="w-full bg-surface-container-high/60 rounded-t h-full flex items-end overflow-hidden p-0.5">
<div className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t bar-f1"></div>
</div>
<div className="w-full bg-surface-container-high/60 rounded-t h-full flex items-end overflow-hidden p-0.5">
<div className="w-full bg-gradient-to-t from-tertiary/30 to-tertiary rounded-t bar-f2"></div>
</div>
<div className="w-full bg-surface-container-high/60 rounded-t h-full flex items-end overflow-hidden p-0.5">
<div className="w-full bg-gradient-to-t from-secondary/30 to-secondary rounded-t bar-f3"></div>
</div>
<div className="w-full bg-surface-container-high/60 rounded-t h-full flex items-end overflow-hidden p-0.5">
<div className="w-full bg-gradient-to-t from-tertiary/30 to-primary rounded-t bar-f4"></div>
</div>
</div>
{/*  Updating Realtime Event Pill  */}
<div className="bg-surface-container-high/70 border border-outline-variant/30 rounded px-1.5 py-0.5 flex items-center justify-between">
<div className="flex items-center gap-1 overflow-hidden">
<span className="material-symbols-outlined text-[9px] text-tertiary">bolt</span>
<span className="text-[6.5px] text-on-surface truncate font-medium">94 Commits Synced</span>
</div>
<span className="text-[6.5px] font-mono text-tertiary font-bold">NOW</span>
</div>
</div>
</div>
</div>
</div>
{/*  Left Bottom Narrative  */}
<div className="relative z-10 pb-space-lg max-w-lg">
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          Orchestrate Every Milestone with Precision.
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
          Experience the high-throughput operational cockpit engineered specifically for resilient cross-functional product and engineering organizations.
        </p>
{/*  Social Proof Metrics Strip  */}
<div className="flex items-center gap-space-xl mt-space-xl pt-space-lg bg-surface-container/30 border border-outline-variant/20 px-space-lg py-space-md rounded-lg backdrop-blur-sm">
<div className="transition-transform duration-300 hover:-translate-y-0.5">
<div className="font-metric-display text-metric-display text-primary font-bold">14.8M</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">Issues Closed</div>
</div>
<div className="w-px h-8 bg-surface-variant"></div>
<div className="transition-transform duration-300 hover:-translate-y-0.5">
<div className="font-metric-display text-metric-display text-tertiary font-bold">&lt; 34ms</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">Sync Latency</div>
</div>
<div className="w-px h-8 bg-surface-variant"></div>
<div className="transition-transform duration-300 hover:-translate-y-0.5">
<div className="font-metric-display text-metric-display text-secondary font-bold">4.9/5</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">Dev Sat Score</div>
</div>
</div>
</div>
</div>
{/*  Right Authentication Panel (50% on Desktop)  */}
<div className="col-span-1 lg:col-span-6 flex flex-col justify-center items-center px-space-lg py-space-2xl md:px-space-2xl bg-surface relative z-20 min-h-screen">
{/*  Glow ambient backdrop for form panel  */}
<div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
<div className="w-full max-w-md flex flex-col my-auto pt-16 lg:pt-0">
{/*  Panel Header  */}
<div className="mb-space-xl">
<div className="flex items-center gap-space-xs text-primary mb-space-xs">
<span className="material-symbols-outlined text-[20px]">verified_user</span>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Enterprise Portal</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Welcome back
          </h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
            Sign in to access your projects, delivery graphs, and live team intelligence.
          </p>
</div>
{/*  SSO Identity Providers Grid  */}
<div className="grid grid-cols-2 gap-space-md mb-space-lg">
<button onClick={() => handleOAuthLogin('google')} className="group flex items-center justify-center gap-space-sm h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container border border-transparent hover:border-outline-variant/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm" type="button">
<svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
<path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335" />
<path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z" fill="#4285F4" />
<path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" fill="#FBBC05" />
<path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" fill="#34A853" />
</svg>
<span className="font-label-md text-label-md text-on-surface">Google</span>
</button>
<button onClick={() => handleOAuthLogin('github')} className="group flex items-center justify-center gap-space-sm h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container border border-transparent hover:border-outline-variant/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm" type="button">
<svg className="w-4 h-4 fill-on-surface transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
<path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd" />
</svg>
<span className="font-label-md text-label-md text-on-surface">GitHub</span>
</button>
</div>
<button className="w-full flex items-center justify-center gap-space-sm h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container border border-transparent hover:border-outline-variant/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm mb-space-lg text-on-surface-variant hover:text-on-surface" type="button">
<span className="material-symbols-outlined text-[18px]">domain_verification</span>
<span className="font-label-md text-label-md">Single Sign-On (SAML / Okta)</span>
</button>
{/*  Divider  */}
<div className="relative flex items-center justify-center my-space-sm mb-space-lg">
<div className="w-full h-px bg-surface-container-high"></div>
<span className="absolute bg-surface px-space-md font-label-sm text-label-sm text-on-surface-variant lowercase tracking-wider">
            or continue with enterprise email
          </span>
</div>
{/*  Error Alert Banner  */}
{error && (
  <div className="mb-4 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-2.5 animate-shake">
    <span className="material-symbols-outlined text-[20px] shrink-0 text-error">error</span>
    <span className="text-xs leading-relaxed">{error}</span>
  </div>
)}

{/*  Quick Demo Accounts Helper  */}
<div className="mb-space-md p-3 rounded-xl bg-surface-container-high/60 border border-primary/20 flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <span className="text-[11px] font-bold text-primary flex items-center gap-1 font-mono uppercase tracking-wide">
      <span className="material-symbols-outlined text-[14px]">bolt</span> Quick Demo Accounts
    </span>
    <span className="text-[10px] text-on-surface-variant font-mono">Password: password</span>
  </div>
  <div className="grid grid-cols-3 gap-1.5">
    <button 
      type="button" 
      onClick={() => fillAndLogin('rahul@taskflow.com', 'password')}
      className="p-1.5 rounded-lg bg-surface-container hover:bg-primary-container/20 hover:text-primary border border-outline-variant/10 text-center transition-all cursor-pointer text-xs"
      title="Login as Developer"
    >
      <div className="font-semibold truncate">Rahul</div>
      <div className="text-[9px] text-on-surface-variant truncate">Developer</div>
    </button>
    <button 
      type="button" 
      onClick={() => fillAndLogin('arun@taskflow.com', 'password')}
      className="p-1.5 rounded-lg bg-surface-container hover:bg-primary-container/20 hover:text-primary border border-outline-variant/10 text-center transition-all cursor-pointer text-xs"
      title="Login as Team Lead"
    >
      <div className="font-semibold truncate">Arun</div>
      <div className="text-[9px] text-on-surface-variant truncate">Team Lead</div>
    </button>
    <button 
      type="button" 
      onClick={() => fillAndLogin('priya@taskflow.com', 'password')}
      className="p-1.5 rounded-lg bg-surface-container hover:bg-primary-container/20 hover:text-primary border border-outline-variant/10 text-center transition-all cursor-pointer text-xs"
      title="Login as Project Manager"
    >
      <div className="font-semibold truncate">Priya</div>
      <div className="text-[9px] text-on-surface-variant truncate">Manager</div>
    </button>
  </div>
</div>

{/*  Form Elements  */}
<form className="flex flex-col gap-space-lg" onSubmit={handleLogin}>
{/*  Work Email or Username  */}
<div className="flex flex-col gap-space-xs group">
<label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between transition-colors group-focus-within:text-primary" htmlFor="email">
<span>Email or Username</span>
<span className="font-label-sm text-label-sm text-on-surface-variant font-normal">e.g. rahul or rahul@taskflow.com</span>
</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[18px] pointer-events-none transition-colors group-focus-within:text-primary">person</span>
<input 
  className="w-full h-11 pl-10 pr-space-md rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md border border-transparent focus:border-primary/50 focus:outline-none focus:bg-surface-container-low focus:shadow-[0_0_16px_rgba(77,142,255,0.15)] shadow-sm transition-all" 
  id="email" 
  value={email}
  onChange={e => setEmail(e.target.value)}
  placeholder="rahul@taskflow.com or rahul" 
  required
  type="text"
/>
</div>
</div>
{/*  Password  */}
<div className="flex flex-col gap-space-xs group">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface font-medium transition-colors group-focus-within:text-primary" htmlFor="password">Password</label>
<Link className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors underline-offset-2 hover:underline" to="/forgot-password">Forgot password?</Link>
</div>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[18px] pointer-events-none transition-colors group-focus-within:text-primary">lock</span>
<input 
  className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md border border-transparent focus:border-primary/50 focus:outline-none focus:bg-surface-container-low focus:shadow-[0_0_16px_rgba(77,142,255,0.15)] shadow-sm transition-all" 
  id="password" 
  value={password}
  onChange={e => setPassword(e.target.value)}
  placeholder="••••••••••••" 
  required
  type={showPassword ? "text" : "password"}
/>
<button className="absolute right-space-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center p-1 rounded hover:bg-surface-container" id="toggle-pwd" onClick={() => setShowPassword(!showPassword)} type="button">
<span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
</button>
</div>
</div>
{/*  Checkbox Device Memory  */}
<div className="flex items-center gap-space-sm select-none">
<input defaultChecked className="w-4 h-4 rounded bg-surface-container-lowest text-primary-container focus:ring-0 focus:outline-none cursor-pointer transition-transform active:scale-95" id="remember" type="checkbox"/>
<label className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors" htmlFor="remember">
              Remember this device for 30 days
            </label>
</div>
{/*  Submit Button  */}
<button 
  disabled={loading}
  className="group w-full h-12 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-space-sm shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-space-xs disabled:opacity-60 cursor-pointer" 
  type="submit"
>
<span>{loading ? 'Authenticating...' : 'Sign In to TaskFlow'}</span>
<span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
</button>
</form>
{/*  Compliance Badges  */}
<div className="mt-space-xl pt-space-md flex items-center justify-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
<div className="flex items-center gap-space-xs hover:text-on-surface transition-colors">
<span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
<span>256-bit AES Encryption</span>
</div>
<span>•</span>
<div className="flex items-center gap-space-xs hover:text-on-surface transition-colors">
<span className="material-symbols-outlined text-[14px] text-primary">verified</span>
<span>SOC 2 Type II Certified</span>
</div>
</div>
{/*  Registration Switch Link  */}
<div className="mt-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
          Don't have an enterprise account? 
          <Link className="text-primary hover:text-primary-fixed font-medium underline-offset-4 hover:underline ml-1 transition-colors" to="/register">Sign up / Register</Link>
</div>
</div>
</div>
</div>
</div>
      </main>
    </div>
  );
};

export default Login;
