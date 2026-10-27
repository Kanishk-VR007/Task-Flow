/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    if (!document.querySelector('#font-awesome-link')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-link';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
      document.head.appendChild(link);
    }

    const handleScroll = () => {
      const sections = ['hero', 'about', 'services', 'contact'];
      let current = 'hero';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-orange-500 selection:text-white">


<div className="fixed inset-0 w-full h-full -z-30 overflow-hidden pointer-events-none">

<div className="absolute top-[20%] right-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-transparent blur-[120px]"></div>
<div className="absolute top-[50%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent blur-[130px]"></div>
<div className="absolute bottom-[-10%] right-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-t from-cyan-600/15 via-blue-500/10 to-transparent blur-[140px]"></div>
</div>

<header className="fixed top-0 z-50 w-full backdrop-blur-xl bg-[#050B18]/75 border-b border-white/10 transition-all duration-300">
<div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">

<a className="flex items-center gap-3 group focus:outline-none" href="#hero">
<div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30 flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 group-hover:scale-105 transition-transform duration-200">
  <i className="fa-solid fa-layer-group text-white text-xl"></i>
</div>
<span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">TaskFlow</span>
</a>

<nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
  {[
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact Us' }
  ].map(item => (
    <a
      key={item.id}
      href={`#${item.id}`}
      className={`relative px-1 py-1 transition-colors duration-200 group hover:text-white ${
        activeSection === item.id ? 'text-white font-semibold' : ''
      }`}
    >
      {item.label}
      {activeSection === item.id && (
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></span>
      )}
    </a>
  ))}
</nav>

<div className="flex items-center gap-3">
<Link className="glass-btn px-6 py-2 rounded-full text-xs font-semibold text-slate-200 hover:text-white transition-all duration-200 shadow-sm" to="/login">
        Login
      </Link>
<Link className="blue-cta px-6 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 transition-all duration-200" to="/register">
        Register
      </Link>
</div>
</div>
</header>

<section className="relative min-h-screen pt-20 flex flex-col justify-between overflow-hidden" id="hero">

<div className="absolute inset-0 w-full h-full -z-20 overflow-hidden pointer-events-none">
<img alt="Cinematic Sunset Mountain Skyline" className="w-full h-full object-cover object-center scale-[1.02] animate-bg-pan-zoom" src="/homepage-background.png" />
</div>

<div className="absolute inset-0 w-full h-full -z-10 pointer-events-none bg-gradient-to-b from-[#050B18]/70 via-[#050B18]/40 to-[#050B18]"></div>
<div className="absolute inset-0 w-full h-full -z-10 pointer-events-none bg-gradient-to-r from-[#050B18]/90 via-[#050B18]/45 to-transparent"></div>
<div className="absolute inset-0 w-full h-full -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_rgba(12,18,36,0.7)_0%,_transparent_70%)]"></div>

<div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 pt-4">
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md shadow-lg text-xs font-medium text-slate-300">
<span className="font-bold text-white tracking-wide">Style 3</span>
<span className="text-slate-400 font-normal">Cinematic Gradient</span>
</div>
</div>

<div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-16 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

<div className="lg:col-span-6 flex flex-col justify-center max-w-xl">

<div className="mb-4">
<span className="text-xs uppercase font-semibold tracking-[0.2em] text-slate-300 drop-shadow">
          WORK SMARTER, TOGETHER
        </span>
</div>

<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5 drop-shadow-lg">
        Build. Plan.<br/>
        Track. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">Succeed.</span>
</h1>

<p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-normal drop-shadow">
        An all-in-one platform to manage projects, assign tasks, collaborate with your team, and achieve more — faster.
      </p>

<div className="flex flex-wrap items-center gap-4 mb-12 sm:mb-14">
<Link className="amber-cta px-7 py-3 rounded-full text-white text-sm font-semibold flex items-center gap-2.5 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]" to="/register">
<span>Get Started</span>
<i className="fa-solid fa-arrow-right text-xs"></i>
</Link>
<a className="glass-btn px-6 py-3 rounded-full text-white text-sm font-medium flex items-center gap-2.5 transition-all duration-200 shadow-md hover:scale-[1.02]" href="#about">
<span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs text-white">
<i className="fa-solid fa-play text-[10px] ml-0.5"></i>
</span>
<span>Watch Demo</span>
</a>
</div>

<div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/15 max-w-md">
<div className="space-y-0.5">
<div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow">10K+</div>
<div className="text-xs font-medium text-slate-400">Projects</div>
</div>
<div className="space-y-0.5">
<div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow">5K+</div>
<div className="text-xs font-medium text-slate-400">Teams</div>
</div>
<div className="space-y-0.5">
<div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow">99%</div>
<div className="text-xs font-medium text-slate-400">Success Rate</div>
</div>
</div>
</div>

<div className="lg:col-span-6 relative w-full h-[470px] flex items-center justify-center lg:justify-end">

<div className="absolute right-10 bottom-12 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none -z-10"></div>
<div className="absolute right-28 top-6 w-72 h-72 rounded-full bg-cyan-500/25 blur-3xl pointer-events-none -z-10"></div>

<div className="relative w-full max-w-[500px] h-[440px]">

<div className="glass-panel absolute top-4 left-0 sm:left-4 w-52 sm:w-56 p-4 rounded-2xl z-20 transform hover:-translate-y-1 transition duration-300 animate-float-slow">
<div className="flex items-center justify-between mb-3">
<span className="text-xs font-medium tracking-wide text-slate-200">Team Collaboration</span>
<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
</div>

<div className="flex items-center -space-x-2 mb-3">
<div className="w-8 h-8 rounded-full border-2 border-indigo-400/60 bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
<i className="fa-solid fa-user text-xs opacity-90"></i>
</div>
<div className="w-8 h-8 rounded-full border-2 border-indigo-400/60 bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
<i className="fa-solid fa-user-tie text-xs opacity-90"></i>
</div>
<div className="w-8 h-8 rounded-full border-2 border-indigo-400/60 bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
<i className="fa-solid fa-user-graduate text-xs opacity-90"></i>
</div>
<div className="w-8 h-8 rounded-full border-2 border-indigo-400/60 bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              +12
            </div>
</div>

<div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
<div className="w-4/5 h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
</div>
</div>

<div className="glass-panel absolute top-0 right-0 sm:right-4 w-64 sm:w-72 p-4 rounded-2xl z-30 transform hover:-translate-y-1 transition duration-300 animate-float-medium">
<div className="flex items-center justify-between mb-3">
<span className="text-xs font-semibold tracking-wide text-slate-100">Project Growth</span>
<span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">+34.8%</span>
</div>

<div className="h-28 w-full flex items-end justify-between gap-2 pt-2 px-1 relative">
<div className="absolute inset-x-0 top-6 border-b border-white/10 border-dashed pointer-events-none"></div>
<div className="absolute inset-x-0 top-14 border-b border-white/10 border-dashed pointer-events-none"></div>

<div className="flex-1 flex flex-col items-center gap-1.5 z-10">
<div className="w-full bg-gradient-to-t from-blue-600/50 to-cyan-400/60 rounded-t h-10 border-t border-cyan-300/40"></div>
<span className="text-[9px] text-slate-400">M1</span>
</div>

<div className="flex-1 flex flex-col items-center gap-1.5 z-10">
<div className="w-full bg-gradient-to-t from-blue-600/60 to-cyan-400/70 rounded-t h-14 border-t border-cyan-300/50"></div>
<span className="text-[9px] text-slate-400">M2</span>
</div>

<div className="flex-1 flex flex-col items-center gap-1.5 z-10">
<div className="w-full bg-gradient-to-t from-blue-600/70 to-cyan-400/80 rounded-t h-18 border-t border-cyan-300/60"></div>
<span className="text-[9px] text-slate-400">M3</span>
</div>

<div className="flex-1 flex flex-col items-center gap-1.5 z-10">
<div className="w-full bg-gradient-to-t from-blue-600/80 to-cyan-400/90 rounded-t h-22 border-t border-cyan-300/80 shadow-sm shadow-cyan-500/50"></div>
<span className="text-[9px] text-slate-300 font-semibold">M4</span>
</div>

<div className="flex-1 flex flex-col items-center gap-1.5 z-10">
<div className="w-full bg-gradient-to-t from-indigo-500 to-cyan-300 rounded-t h-26 border-t border-white shadow-md shadow-cyan-400/60"></div>
<span className="text-[9px] text-cyan-300 font-bold">M5</span>
</div>
</div>
</div>

<div className="glass-panel absolute bottom-4 right-0 sm:right-2 w-64 sm:w-72 p-4 rounded-2xl z-20 transform hover:-translate-y-1 transition duration-300 animate-float-fast">
<div className="flex items-center justify-between mb-3.5">
<span className="text-xs font-semibold tracking-wide text-slate-100">Task Management</span>
<span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">3 Active</span>
</div>

<div className="space-y-2.5">

<div className="flex items-center gap-2.5 bg-black/25 p-2 rounded-xl border border-white/5">
<div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 text-xs">
<i className="fa-solid fa-clock"></i>
</div>
<div className="flex-1 min-w-0">
<div className="w-24 h-2 bg-white/30 rounded-full mb-1"></div>
<div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
<div className="w-3/4 h-full bg-gradient-to-r from-orange-400 to-amber-300 rounded-full"></div>
</div>
</div>
</div>

<div className="flex items-center gap-2.5 bg-black/25 p-2 rounded-xl border border-white/5">
<div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 text-xs">
<i className="fa-solid fa-layer-group"></i>
</div>
<div className="flex-1 min-w-0">
<div className="w-20 h-2 bg-white/30 rounded-full mb-1"></div>
<div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
<div className="w-1/2 h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
</div>
</div>
</div>

<div className="flex items-center gap-2.5 bg-black/25 p-2 rounded-xl border border-white/5">
<div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-xs">
<i className="fa-solid fa-check"></i>
</div>
<div className="flex-1 min-w-0">
<div className="w-28 h-2 bg-white/30 rounded-full mb-1"></div>
<div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
<div className="w-full h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
</div>
</div>
</div>
</div>
</div>


{/* Layer 3: Light Trails */}
<svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 500 440">
  <path className="animate-trail" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="2" d="M 50,400 C 150,300 250,350 400,100" />
  <path className="animate-trail" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="2" d="M 0,200 C 200,100 300,200 500,50" style={{animationDelay: '2s'}} />
  <path className="animate-trail" fill="none" stroke="rgba(192,132,252,0.4)" strokeWidth="2" d="M 100,440 C 200,250 400,300 450,0" style={{animationDelay: '4s'}} />
</svg>

{/* Layer 6: Particles */}
<div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_3px_rgba(56,189,248,0.9)] animate-particle"></div>
<div className="absolute bottom-1/3 left-10 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_2px_rgba(251,191,36,0.9)] animate-particle" style={{animationDelay: '1s'}}></div>
<div className="absolute top-12 right-1/3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] animate-particle" style={{animationDelay: '2.5s'}}></div>
<div className="absolute top-1/2 right-10 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_12px_3px_rgba(192,132,252,0.9)] animate-particle" style={{animationDelay: '1.5s'}}></div>
<div className="absolute bottom-12 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.8)] animate-particle" style={{animationDelay: '3s'}}></div>

</div>
</div>
</div>
<div className="pb-6"></div>
</section>

<section className="relative py-28 border-t border-white/10 bg-[#050B18]" id="about">

<div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-amber-500/10 blur-[100px] pointer-events-none"></div>
<div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

<div className="text-center max-w-3xl mx-auto mb-20">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-xs font-semibold text-indigo-300 tracking-widest uppercase mb-4">
<i className="fa-solid fa-cubes text-[11px] text-cyan-400"></i>
        ENGINEERED FOR MODERN TEAMS
      </div>
<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
        Everything Your Team Needs to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Move Forward at Scale</span>
</h2>
<p className="text-slate-300 text-base sm:text-lg leading-relaxed">
        TaskFlow bridges high-level strategic executive vision with autonomous execution squads. Designed with hyper-tactile 3D workflows, live dependency intelligence, and frictionless engineering velocity.
      </p>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

<div className="glass-panel-subtle rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
<div className="flex items-center justify-between mb-6">
<div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 text-xl">
<i className="fa-solid fa-table-columns"></i>
</div>
<span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300">
            Interactive Canvas
          </span>
</div>
<h3 className="text-2xl font-bold text-white mb-3">Centralized Task Management</h3>
<p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
          Unified Kanban and sprint hierarchy with real-time dependency tracking, blocker triage, and multi-team cross-project linking.
        </p>

<div className="w-full h-56 rounded-2xl bg-gradient-to-br from-[#0B152E]/90 to-[#040813] border border-cyan-500/25 p-4 flex items-center justify-center perspective-container overflow-hidden relative">
<div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

<div className="isometric-tilt relative w-64 h-36 flex flex-col gap-2">

<div className="w-full h-10 rounded-xl bg-white/15 backdrop-blur-md border border-cyan-300/40 p-2 flex items-center justify-between shadow-xl">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
<span className="text-[11px] font-semibold text-white tracking-wide">Core Infrastructure API</span>
</div>
<span className="text-[10px] bg-cyan-500/30 px-2 py-0.5 rounded text-cyan-200">Sprint 42</span>
</div>

<div className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600/40 to-indigo-600/40 backdrop-blur-lg border border-indigo-400/60 p-2.5 flex flex-col justify-between shadow-2xl translate-x-2 -translate-y-1">
<div className="flex justify-between items-center">
<span className="text-xs font-bold text-white">OAuth2 Multi-Tenant Cluster</span>
<span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded">98% Done</span>
</div>
<div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
<div className="w-11/12 h-full bg-gradient-to-r from-cyan-400 to-amber-400"></div>
</div>
</div>

<div className="w-full h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2 flex items-center justify-between text-slate-300 text-[10px]">
<span>Real-Time WebSockets</span>
<span className="text-amber-400 font-medium">Review Stage</span>
</div>
</div>
<div className="absolute bottom-3 right-4 text-[10px] font-mono text-cyan-400/80 flex items-center gap-1.5">
<i className="fa-solid fa-cube"></i> Three.js / WebGL Ready Canvas
          </div>
</div>
</div>

<div className="glass-panel-subtle rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden group hover:border-indigo-400/50 transition-all duration-300">
<div className="flex items-center justify-between mb-6">
<div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 text-xl">
<i className="fa-solid fa-comments"></i>
</div>
<span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/30 text-indigo-300">
            Global Sync
          </span>
</div>
<h3 className="text-2xl font-bold text-white mb-3">Team Collaboration &amp; Sync</h3>
<p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
          Context-aware inline discussions, instantaneous code-review integration, multi-region timezone syncing, and ambient room threads.
        </p>

<div className="w-full h-56 rounded-2xl bg-gradient-to-br from-[#0F172E]/90 to-[#040813] border border-indigo-500/25 p-4 flex items-center justify-center perspective-container overflow-hidden relative">
<div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

<div className="relative w-64 h-36 flex items-center justify-center">

<div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-[0_0_25px_rgba(99,102,241,0.6)] z-20 flex items-center justify-center">
<div className="w-full h-full bg-[#0a1224] rounded-[14px] flex items-center justify-center text-cyan-300 text-lg">
<i className="fa-solid fa-network-wired"></i>
</div>
</div>

<div className="absolute w-48 h-48 border border-indigo-400/20 rounded-full animate-spin [animation-duration:15s] pointer-events-none"></div>

<div className="absolute top-1 left-8 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/50 backdrop-blur-md text-[10px] text-blue-200 flex items-center gap-1.5 shadow-lg">
<span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
<span>San Francisco (12ms)</span>
</div>

<div className="absolute bottom-2 right-4 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 backdrop-blur-md text-[10px] text-purple-200 flex items-center gap-1.5 shadow-lg">
<span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
<span>Tokyo Edge</span>
</div>

<div className="absolute bottom-4 left-6 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-md text-[10px] text-amber-200 flex items-center gap-1.5 shadow-lg">
<span className="w-2 h-2 rounded-full bg-amber-400"></span>
<span>London Office</span>
</div>
</div>
<div className="absolute bottom-3 right-4 text-[10px] font-mono text-indigo-400/80 flex items-center gap-1.5">
<i className="fa-solid fa-cube"></i> Interactive Node Mesh
          </div>
</div>
</div>

<div className="glass-panel-subtle rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
<div className="flex items-center justify-between mb-6">
<div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 text-xl">
<i className="fa-solid fa-diagram-project"></i>
</div>
<span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
            Critical Path
          </span>
</div>
<h3 className="text-2xl font-bold text-white mb-3">Real-Time Project Graph</h3>
<p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
          Live milestone propagation, dynamic Gantt projection, automated critical path computation, and forward-looking risk mitigation curves.
        </p>

<div className="w-full h-56 rounded-2xl bg-gradient-to-br from-[#121729]/90 to-[#040813] border border-amber-500/25 p-4 flex items-center justify-center perspective-container overflow-hidden relative">
<div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
<div className="w-full max-w-xs space-y-3 z-10">
<div className="flex items-center justify-between text-[11px] text-slate-300 pb-1 border-b border-white/10">
<span className="font-semibold text-white">Q3 Release Timeline</span>
<span className="text-amber-400 font-mono">Ahead by 4.2d</span>
</div>

<div className="relative py-2">
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full"></div>
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-3/4 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"></div>
<div className="relative flex justify-between items-center">
<div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] text-black font-bold shadow-md">✓</div>
<div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[10px] text-black font-bold shadow-md">✓</div>
<div className="w-7 h-7 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center text-[10px] text-slate-900 font-extrabold ring-4 ring-cyan-500/30 animate-pulse">M3</div>
<div className="w-6 h-6 rounded-full bg-slate-700 border border-white/30 flex items-center justify-center text-[9px] text-slate-400">M4</div>
</div>
</div>

<div className="flex items-center justify-between text-[10px] bg-black/40 p-2 rounded-lg border border-white/5">
<span className="text-slate-300">Risk Coefficient: <strong className="text-emerald-400">0.08 (Minimal)</strong></span>
<span className="text-slate-400">32 Tasks Left</span>
</div>
</div>
<div className="absolute bottom-3 right-4 text-[10px] font-mono text-amber-400/80 flex items-center gap-1.5">
<i className="fa-solid fa-cube"></i> 3D Graph Model Container
          </div>
</div>
</div>

<div className="glass-panel-subtle rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden group hover:border-emerald-400/50 transition-all duration-300">
<div className="flex items-center justify-between mb-6">
<div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 text-xl">
<i className="fa-solid fa-chart-line"></i>
</div>
<span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300">
            SLA 99.99%
          </span>
</div>
<h3 className="text-2xl font-bold text-white mb-3">Performance &amp; Engineering Intelligence</h3>
<p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
          Cycle time analytics, sprint velocity forecasting, code pull-request turnaround metrics, and SLA compliance health monitors.
        </p>

<div className="w-full h-56 rounded-2xl bg-gradient-to-br from-[#091722]/90 to-[#040813] border border-emerald-500/25 p-4 flex items-center justify-center perspective-container overflow-hidden relative">
<div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
<div className="w-full max-w-xs space-y-2.5 z-10">
<div className="flex justify-between items-center text-xs">
<span className="text-slate-200 font-semibold">Sprint Velocity Forecast</span>
<span className="text-emerald-400 font-mono font-bold">+28.4 pts</span>
</div>

<div className="h-20 flex items-end justify-between gap-2 pt-2 px-2 bg-black/30 rounded-xl border border-white/5">
<div className="w-full bg-emerald-500/40 rounded-t h-[40%]"></div>
<div className="w-full bg-emerald-500/55 rounded-t h-[65%]"></div>
<div className="w-full bg-emerald-500/70 rounded-t h-[55%]"></div>
<div className="w-full bg-cyan-400/80 rounded-t h-[80%] shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
<div className="w-full bg-gradient-to-t from-emerald-400 to-cyan-300 rounded-t h-[95%] shadow-[0_0_15px_rgba(16,185,129,0.8)] border-t border-white"></div>
</div>
<div className="flex justify-between text-[10px] text-slate-400 px-1">
<span>Wk 1</span><span>Wk 2</span><span>Wk 3</span><span>Wk 4</span><span className="text-emerald-300 font-bold">Wk 5</span>
</div>
</div>
<div className="absolute bottom-3 right-4 text-[10px] font-mono text-emerald-400/80 flex items-center gap-1.5">
<i className="fa-solid fa-cube"></i> Real-time Telemetry Frame
          </div>
</div>
</div>
</div>
</div>
</section>

<section className="relative py-28 border-t border-white/10 bg-[#050B18]" id="services">

<div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-gradient-to-l from-orange-500/10 via-amber-500/5 to-transparent blur-[120px] pointer-events-none"></div>
<div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/10 via-cyan-500/5 to-transparent blur-[130px] pointer-events-none"></div>
<div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

<div className="text-center max-w-3xl mx-auto mb-20">
<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-xs font-semibold text-amber-300 tracking-widest uppercase mb-4">
<i className="fa-solid fa-bolt text-amber-400"></i>
        CAPABILITIES &amp; PLATFORM SERVICES
      </div>
<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
        Powerful Tools Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">High-Velocity Delivery</span>
</h2>
<p className="text-slate-300 text-base sm:text-lg leading-relaxed">
        Equip every engineering squad, product architect, and leadership stakeholder with a cohesive operations stack tailored to modern agile velocity.
      </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

<div className="glass-panel-subtle rounded-2xl p-7 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1">
<div>
<div className="flex items-center justify-between mb-5">
<div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-md shadow-cyan-500/30">
<i className="fa-solid fa-terminal"></i>
</div>
<span className="text-[10px] font-mono text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">CLI + GUI</span>
</div>
<h3 className="text-xl font-bold text-white mb-2.5">Autonomous Task Operations</h3>
<p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Command palette with natural language triggers, multi-tier sprint backlogs, and automatic git branch provisioning on task pickup.
          </p>
</div>

<div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
<span className="text-slate-400">Avg. Triaged</span>
<span className="font-bold text-cyan-300">0.4s Automated</span>
</div>
</div>

<div className="glass-panel-subtle rounded-2xl p-7 border border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1">
<div>
<div className="flex items-center justify-between mb-5">
<div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg shadow-md shadow-amber-500/30">
<i className="fa-solid fa-map-location-dot"></i>
</div>
<span className="text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Live OKRs</span>
</div>
<h3 className="text-xl font-bold text-white mb-2.5">Milestones &amp; Roadmaps</h3>
<p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Strategic quarterly OKR alignment, automated blocker cascades, stakeholder view-only client portals, and Gantt synchronizers.
          </p>
</div>
<div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
<span className="text-slate-400">Alignment Index</span>
<span className="font-bold text-amber-300">98.2% Accuracy</span>
</div>
</div>

<div className="glass-panel-subtle rounded-2xl p-7 border border-white/10 hover:border-indigo-400/50 transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1">
<div>
<div className="flex items-center justify-between mb-5">
<div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-md shadow-indigo-500/30">
<i className="fa-solid fa-arrows-split-up-and-left"></i>
</div>
<span className="text-[10px] font-mono text-indigo-300 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-400/20">Webhooks v3</span>
</div>
<h3 className="text-xl font-bold text-white mb-2.5">Bi-Directional Ecosystem Sync</h3>
<p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Deep integrations with GitHub, GitLab, Slack, Linear, Jira, and CI/CD pipelines with sub-second bi-directional state synchronization.
          </p>
</div>
<div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
<span className="text-slate-400">Integrations</span>
<span className="font-bold text-indigo-300">45+ Native Connectors</span>
</div>
</div>

<div className="glass-panel-subtle rounded-2xl p-7 border border-white/10 hover:border-rose-400/50 transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1">
<div>
<div className="flex items-center justify-between mb-5">
<div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white text-lg shadow-md shadow-rose-500/30">
<i className="fa-solid fa-heart-pulse"></i>
</div>
<span className="text-[10px] font-mono text-rose-300 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">Burnout Shield</span>
</div>
<h3 className="text-xl font-bold text-white mb-2.5">Workload &amp; Capacity Heatmaps</h3>
<p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Burnout prevention algorithms, team bandwidth balance indicators, and intuitive drag-and-drop reassignment during unexpected sprint spikes.
          </p>
</div>
<div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
<span className="text-slate-400">Team Health Index</span>
<span className="font-bold text-rose-300">Optimal (84%)</span>
</div>
</div>
</div>
</div>
</section>

<section className="relative py-28 border-t border-white/10 bg-[#050B18]" id="contact">

<div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none"></div>
<div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

<div className="text-center max-w-3xl mx-auto mb-20">
<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs font-semibold text-cyan-300 tracking-widest uppercase mb-4">
<i className="fa-solid fa-paper-plane text-cyan-400"></i>
        GET IN TOUCH
      </div>
<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
        Let's Build Better Projects <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Together</span>
</h2>
<p className="text-slate-300 text-base sm:text-lg leading-relaxed">
        Speak directly with our enterprise solutions engineering team. Learn how TaskFlow adapts to your org chart, custom pipelines, and security guidelines.
      </p>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

<div className="lg:col-span-5 space-y-6">
<div className="glass-panel rounded-3xl p-8 border border-white/15">
<h3 className="text-xl font-bold text-white mb-2">Global Headquarters</h3>
<p className="text-slate-300 text-sm leading-relaxed mb-6">
            100 Montgomery Street, Suite 2400<br/>
            Financial District, San Francisco, CA 94104
          </p>
<div className="space-y-4 pt-4 border-t border-white/10">
<div className="flex items-center gap-3 text-sm">
<div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
<i className="fa-solid fa-envelope text-xs"></i>
</div>
<div>
<div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Priority Engineering Email</div>
<a className="text-white hover:text-cyan-300 transition-colors font-medium" href="mailto:solutions@taskflow.io">solutions@taskflow.io</a>
</div>
</div>
<div className="flex items-center gap-3 text-sm">
<div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
<i className="fa-solid fa-phone text-xs"></i>
</div>
<div>
<div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">24/7 Enterprise Hotline</div>
<a className="text-white hover:text-amber-300 transition-colors font-medium" href="tel:+18889243569">+1 (888) 924-FLOW</a>
</div>
</div>
</div>
</div>

<div className="glass-panel-subtle rounded-3xl p-7 border border-emerald-400/30 relative overflow-hidden">
<div className="flex items-center gap-4 mb-3">
<div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 text-xl shadow-lg">
<i className="fa-solid fa-award"></i>
</div>
<div>
<div className="text-xs uppercase font-semibold tracking-wider text-emerald-300">Enterprise SLA Commitment</div>
<div className="text-xl font-bold text-white">99.99% Uptime Guarantee</div>
</div>
</div>
<p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Backed by financially protected SLAs, dedicated technical account managers, and continuous multi-region failover replication.
          </p>
</div>

<div className="glass-panel-subtle rounded-3xl p-6 border border-white/10 space-y-3">
<div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Every Executive Briefing Includes</div>
<div className="flex items-center gap-2.5 text-xs text-slate-200">
<i className="fa-solid fa-circle-check text-cyan-400"></i>
<span>Custom Architecture Audit &amp; Migration Blueprint</span>
</div>
<div className="flex items-center gap-2.5 text-xs text-slate-200">
<i className="fa-solid fa-circle-check text-cyan-400"></i>
<span>Tailored 30-Day Sandbox with Synthetic Data</span>
</div>
<div className="flex items-center gap-2.5 text-xs text-slate-200">
<i className="fa-solid fa-circle-check text-cyan-400"></i>
<span>Dedicated Solutions Architect &amp; Security Compliance Review</span>
</div>
</div>
</div>

<div className="lg:col-span-7">
<form className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl relative" onsubmit="event.preventDefault();">
<h3 className="text-2xl font-bold text-white mb-2">Request an Executive Briefing</h3>
<p className="text-slate-300 text-sm mb-8">
            Tell us about your organization's delivery bottlenecks. An enterprise engineer will respond within 4 business hours.
          </p>
<div className="space-y-6">

<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
<div>
<label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">Full Name</label>
<input className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm" placeholder="Sarah Jenkins" required="" type="text"/>
</div>
<div>
<label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">Work Email</label>
<input className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm" placeholder="sarah@company.com" required="" type="email"/>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
<div>
<label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">Company / Team Size</label>
<select className="w-full px-4 py-3 rounded-xl bg-[#070e1c] border border-white/15 text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm">
<option value="50-100">50 - 150 Engineers</option>
<option value="150-500">150 - 500 Engineers</option>
<option value="500-2000">500 - 2,000 Engineers</option>
<option value="2000+">2,000+ Global Enterprise</option>
</select>
</div>
<div>
<label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">Deployment Preference</label>
<select className="w-full px-4 py-3 rounded-xl bg-[#070e1c] border border-white/15 text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm">
<option value="cloud">TaskFlow Dedicated Cloud (Multi-Region)</option>
<option value="vpc">Customer Virtual Private Cloud (AWS / GCP)</option>
<option value="onprem">Air-Gapped On-Premises Cluster</option>
</select>
</div>
</div>

<div>
<label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">Project Scope &amp; Needs</label>
<textarea className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm resize-none" placeholder="Briefly describe your current tools (e.g. Jira, GitHub, Slack) and primary goals for acceleration..." rows="4"></textarea>
</div>

<div className="pt-2">
<button className="amber-cta w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3" type="submit">
<span>Request Executive Briefing</span>
<i className="fa-solid fa-arrow-right text-xs"></i>
</button>
<p className="text-center text-[11px] text-slate-400 mt-3">
                No credit card required. Encrypted with 256-bit TLS security. Non-disclosure agreement included upon request.
              </p>
</div>
</div>
</form>
</div>
</div>
</div>
</section>

<footer className="w-full border-t border-white/10 bg-[#030712] py-14 relative z-10">
<div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

<div className="lg:col-span-2 space-y-4">
<a className="flex items-center gap-3" href="#hero">
<div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30 flex items-center justify-center p-0.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400">
<img alt="TaskFlow Logo" className="w-full h-full object-contain rounded-[9px]" src="https://lh3.googleusercontent.com/aida/AEtjO1VBJZGolWsrDgLH0IkWmApUYG-IzRZP6N_8VdZHjLvwxr2-iJb6JGr1WB9hVL4VbDArVkXG4hPPuITymsjrE8aeB_WlN7R86YUyrXKk2b50_CymcxnELmEwfBKgY4d2QQnabxLA6ZAol05GbnJlA3IMT45X2KcTYdOCUWFmJ7v7EmkQR_UZ6GTJ6L4cFB4phgQNr2v6rsYJyIU0jnj9lpGy5RBYvqsrBC0EmWQQZfL3f1CZA1sxkhm0dmo"/>
</div>
<span className="text-2xl font-bold tracking-tight text-white">TaskFlow</span>
</a>
<p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
          The next-generation project intelligence and engineering velocity platform. Orchestrate high-impact deliverables from conception to cloud deployment.
        </p>
<div className="flex items-center gap-3 pt-2 text-slate-400">
<a className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors" href="#">
<i className="fa-brands fa-github text-sm"></i>
</a>
<a className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors" href="#">
<i className="fa-brands fa-x-twitter text-sm"></i>
</a>
<a className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors" href="#">
<i className="fa-brands fa-linkedin-in text-sm"></i>
</a>
<a className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors" href="#">
<i className="fa-brands fa-discord text-sm"></i>
</a>
</div>
</div>

<div className="space-y-3">
<div className="text-xs font-bold text-white uppercase tracking-wider">Platform</div>
<ul className="space-y-2 text-xs text-slate-400">
<li><a className="hover:text-cyan-300 transition-colors" href="#about">Autonomous Tasking</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#about">3D Timeline Graph</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#services">Integrations Hub</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#services">Engineering Telemetry</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#services">Capacity Heatmaps</a></li>
</ul>
</div>

<div className="space-y-3">
<div className="text-xs font-bold text-white uppercase tracking-wider">Solutions</div>
<ul className="space-y-2 text-xs text-slate-400">
<li><a className="hover:text-cyan-300 transition-colors" href="#contact">Enterprise Engineering</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#contact">High-Growth Startups</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#contact">SOC 2 Compliance</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#contact">Customer Success</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#contact">Executive Briefing</a></li>
</ul>
</div>

<div className="space-y-3">
<div className="text-xs font-bold text-white uppercase tracking-wider">Trust &amp; Legal</div>
<ul className="space-y-2 text-xs text-slate-400">
<li><a className="hover:text-cyan-300 transition-colors" href="#">Privacy Policy</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#">Terms of Service</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#">Security Whitepaper</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#">GDPR / CCPA Portal</a></li>
<li><a className="hover:text-cyan-300 transition-colors" href="#">System Status (99.99%)</a></li>
</ul>
</div>
</div>

<div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
<div>© 2026 TaskFlow Technologies Inc. All rights reserved.</div>
<div className="flex items-center gap-6 mt-3 sm:mt-0">
<span className="inline-flex items-center gap-1.5 text-emerald-400">
<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          All Systems Operational
        </span>
<a className="hover:text-slate-200 transition-colors" href="#">Privacy</a>
<a className="hover:text-slate-200 transition-colors" href="#">Terms</a>
<a className="hover:text-slate-200 transition-colors" href="#">Support</a>
</div>
</div>
</div>
</footer>

</div>
  );
};

export default LandingPage;
