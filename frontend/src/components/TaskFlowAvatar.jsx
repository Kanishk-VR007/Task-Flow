import React, { useMemo, useState, useEffect, useId } from 'react';

export const hairPaths = {
  'cyber-undercut': 'M 148 155 C 145 105 160 90 200 90 C 245 90 255 105 252 155 C 246 142 238 135 220 135 C 190 135 185 145 170 142 C 158 140 152 148 148 155 Z',
  'neon-bob': 'M 144 140 C 140 90 260 90 256 140 L 262 205 L 244 195 L 244 145 C 240 130 160 130 156 145 L 156 195 L 138 205 Z',
  'curly-fade': 'M 146 150 C 142 110 150 80 200 80 C 250 80 258 110 254 150 C 245 140 240 130 220 132 C 205 130 195 135 180 130 C 160 135 152 140 146 150 Z',
  'spiky-anime': 'M 148 155 L 140 120 L 160 110 L 168 85 L 195 95 L 202 75 L 222 92 L 245 88 L 248 120 L 258 135 L 246 155 C 235 138 165 138 148 155 Z',
  'dread-locks': 'M 144 140 C 140 95 260 95 256 140 L 264 220 L 252 220 L 248 150 C 230 135 170 135 152 150 L 148 220 L 136 220 Z',
  'slick-back': 'M 150 150 C 150 95 250 95 250 150 C 240 132 230 125 200 125 C 170 125 160 132 150 150 Z',
  'Short': 'M 148 155 C 145 105 160 90 200 90 C 245 90 255 105 252 155 C 246 142 238 135 220 135 C 190 135 185 145 170 142 C 158 140 152 148 148 155 Z',
  'Long': 'M 144 140 C 140 90 260 90 256 140 L 262 205 L 244 195 L 244 145 C 240 130 160 130 156 145 L 156 195 L 138 205 Z',
  'Curly': 'M 146 150 C 142 110 150 80 200 80 C 250 80 258 110 254 150 C 245 140 240 130 220 132 C 205 130 195 135 180 130 C 160 135 152 140 146 150 Z'
};

export const facePaths = {
  'chiseled': 'M 152 145 C 150 110 250 110 248 145 C 248 190 236 226 200 230 C 164 226 152 190 152 145 Z',
  'soft': 'M 152 145 C 150 110 250 110 248 145 C 248 195 235 228 200 228 C 165 228 152 195 152 145 Z',
  'angular': 'M 152 145 C 148 110 252 110 248 145 C 252 185 240 220 200 232 C 160 220 148 185 152 145 Z',
  'cyber': 'M 152 145 C 150 108 250 108 248 145 C 248 190 236 225 200 230 C 164 225 152 190 152 145 Z',
  'rounded': 'M 150 145 C 150 110 250 110 250 145 C 250 200 235 230 200 230 C 165 230 150 200 150 145 Z',
  'sharp': 'M 154 145 C 150 110 250 110 246 145 C 246 185 230 228 200 235 C 170 228 154 185 154 145 Z'
};

export const rolePresets = {
  'DEVELOPER': {
    baseModel: 'masc',
    faceSculpt: 'chiseled',
    skinTone: '#bf8a59',
    hairStyle: 'cyber-undercut',
    hairColor: '#00f0ff',
    outfit: 'dev-crewneck',
    clothingColor: '#111827',
    pantsStyle: 'cargo-joggers',
    shoes: 'cyber-runner',
    eyewear: 'hud-visor',
    headwear: 'comm-headset',
    neckwear: 'taskflow-lanyard',
    companion: 'bot-orbit',
    device: 'holo-laptop',
    aura: 'cyber-rings',
    background: 'cyber-grid',
    lighting: 'cyber-cyan',
    pedestal: 'holo-disc',
    pose: 'WORKING',
    smileMorph: 35,
    browHeight: 50
  },
  'TEAM_LEAD': {
    baseModel: 'femme',
    faceSculpt: 'angular',
    skinTone: '#e5b38d',
    hairStyle: 'neon-bob',
    hairColor: '#00f0ff',
    outfit: 'techwear-hoodie',
    clothingColor: '#0254ed',
    pantsStyle: 'tailored-slacks',
    shoes: 'kinetic-high',
    eyewear: 'tech-frames',
    headwear: 'comm-headset',
    neckwear: 'taskflow-lanyard',
    companion: 'bot-orbit',
    device: 'quantum-tablet',
    aura: 'cyber-rings',
    background: 'TaskFlow blue',
    lighting: 'cyber-cyan',
    pedestal: 'holo-disc',
    pose: 'EXPLAINING',
    smileMorph: 45,
    browHeight: 55
  },
  'PROJECT_MANAGER': {
    baseModel: 'masc',
    faceSculpt: 'chiseled',
    skinTone: '#8d5631',
    hairStyle: 'slick-back',
    hairColor: '#1e293b',
    outfit: 'exec-blazer',
    clothingColor: '#1e293b',
    pantsStyle: 'tailored-slacks',
    shoes: 'minimalist-low',
    eyewear: 'none',
    headwear: 'none',
    neckwear: 'none',
    companion: 'bot-orbit',
    device: 'quantum-tablet',
    aura: 'quantum-violet',
    background: 'Project environment',
    lighting: 'studio-key',
    pedestal: 'holo-disc',
    pose: 'THINKING',
    smileMorph: 30,
    browHeight: 45
  },
  'JUNIOR_DEV': {
    baseModel: 'neutral',
    faceSculpt: 'rounded',
    skinTone: '#f7c8a6',
    hairStyle: 'curly-fade',
    hairColor: '#10b981',
    outfit: 'dev-crewneck',
    clothingColor: '#10b981',
    pantsStyle: 'cyber-chinos',
    shoes: 'cyber-runner',
    eyewear: 'tech-frames',
    headwear: 'none',
    neckwear: 'taskflow-lanyard',
    companion: 'bot-orbit',
    device: 'holo-laptop',
    aura: 'matrix-emerald',
    background: 'Cyan/blue glow',
    lighting: 'cyber-cyan',
    pedestal: 'holo-disc',
    pose: 'DEFAULT',
    smileMorph: 50,
    browHeight: 60
  },
  'INTERN': {
    baseModel: 'femme',
    faceSculpt: 'rounded',
    skinTone: '#f7c8a6',
    hairStyle: 'dread-locks',
    hairColor: '#ff0077',
    outfit: 'minimal-polo',
    clothingColor: '#842bd2',
    pantsStyle: 'cargo-joggers',
    shoes: 'gravity-boots',
    eyewear: 'none',
    headwear: 'snapback',
    neckwear: 'taskflow-lanyard',
    companion: 'none',
    device: 'none',
    aura: 'solar-flare',
    background: 'Minimal professional environment',
    lighting: 'golden-hour',
    pedestal: 'holo-disc',
    pose: 'CASUAL',
    smileMorph: 60,
    browHeight: 55
  }
};

const backgroundGradients = {
  'cyber-grid': 'from-[#070b14] via-[#0b1329] to-[#0f172a]',
  'tokyo-skyline': 'from-[#0d1117] via-[#24103a] to-[#0c1829]',
  'clean-lab': 'from-[#0f172a] via-[#1a2333] to-[#1e293b]',
  'space-nebula': 'from-[#0a051b] via-[#190a36] to-[#0a1532]',
  'server-room': 'from-[#06121e] via-[#0b202c] to-[#0d1520]',
  'sunset-synth': 'from-[#1f0d2b] via-[#2b1233] to-[#110e26]',
  'TaskFlow blue': 'from-[#0B1426] via-[#102042] to-[#1A2D54]',
  'Indigo': 'from-[#1A1B41] to-[#2E3176]',
  'Violet': 'from-[#1E1135] to-[#402273]',
  'Developer environment': 'from-[#0F172A] to-[#1E293B]',
  'Analytics environment': 'from-[#0A192F] to-[#172A45]',
  'Project environment': 'from-[#17122B] to-[#2D2454]',
  'Minimal professional environment': 'from-[#1F2937] to-[#374151]',
  'Cyan/blue glow': 'from-[#0B2545] to-[#133C55]'
};

const TaskFlowAvatar = ({ 
  user, 
  size = 'medium', 
  className = '', 
  variant = 'circle',
  cameraView = 'front',
  disableEntrance = false
}) => {
  let config = null;
  if (user?.avatarConfig) {
    try {
      config = typeof user.avatarConfig === 'string' ? JSON.parse(user.avatarConfig) : user.avatarConfig;
    } catch (e) {
      console.error("Failed to parse avatarConfig", e);
    }
  }

  const role = user?.role || 'DEVELOPER';
  const preset = rolePresets[role] || rolePresets['DEVELOPER'];

  config = {
    ...preset,
    ...config
  };

  // Compatibility normalization
  if (config.character === 'Female') config.baseModel = 'femme';
  if (config.character === 'Male') config.baseModel = 'masc';
  if (config.accessories === 'Headphones' || config.accessories === 'Tech headset') config.headwear = 'comm-headset';
  if (config.accessories === 'Glasses') config.eyewear = 'tech-frames';
  if (config.accessories === 'ID badge') config.neckwear = 'taskflow-lanyard';

  const isFullBody = variant === 'fullBody';

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-32 h-32',
    xlarge: 'w-48 h-48'
  };

  const dim = sizeClasses[size] || sizeClasses.medium;
  const bgGradient = backgroundGradients[config.background] || backgroundGradients['cyber-grid'];

  const workload = user?.workloadScore ?? user?.workload ?? 0;
  let workloadTier = 'NORMAL';
  if (workload > 100) workloadTier = 'OVERLOADED';
  else if (workload >= 85) workloadTier = 'VERY_HIGH';
  else if (workload >= 70) workloadTier = 'HIGH';
  else if (workload < 40) workloadTier = 'LOW';

  const isOverloaded = workloadTier === 'OVERLOADED';
  const isVeryHigh = isOverloaded || workloadTier === 'VERY_HIGH';
  const isHigh = isVeryHigh || workloadTier === 'HIGH';

  const [isEntering, setIsEntering] = useState(false);
  useEffect(() => {
    if (isFullBody) {
      setIsEntering(true);
      const timer = setTimeout(() => setIsEntering(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isFullBody]);

  const poseAnim = ['WORKING', 'EXPLAINING', 'THINKING', 'CELEBRATING', 'CASUAL'].includes(config.pose) 
    ? config.pose.toLowerCase() 
    : 'casual';

  const breatheClass = isVeryHigh ? 'avatar-breathe-subtle-fast' : 'avatar-breathe-subtle';
  const glanceClass = isVeryHigh ? 'avatar-glance' : '';
  const auraClass = isOverloaded ? 'overloaded-aura border-rose-500/40' : 'border-white/10';

  // Randomized timing so avatars don't sync
  const { randBlink, randBreathe, randHead, randRobot } = useMemo(() => ({
    randBlink: `-${Math.random() * 5}s`,
    randBreathe: `-${Math.random() * 4}s`,
    randHead: `-${Math.random() * 6}s`,
    randRobot: `-${Math.random() * 7}s`
  }), []);

  // Geometry paths
  const currentHairPath = hairPaths[config.hairStyle] || hairPaths['cyber-undercut'];
  const currentFacePath = facePaths[config.faceSculpt] || facePaths['chiseled'];

  // Dynamic smile & eyebrow offsets from morph sliders or defaults
  const smileVal = config.smileMorph !== undefined ? Number(config.smileMorph) : 35;
  const browVal = config.browHeight !== undefined ? Number(config.browHeight) : 50;

  const mouthCurveY = 212 + (smileVal / 8);
  let mouthPath = `M 188 212 Q 200 ${mouthCurveY} 212 212`;
  if (config.pose === 'CELEBRATE' || config.pose === 'CELEBRATING') {
    mouthPath = `M 184 210 Q 200 ${222 + (smileVal / 10)} 216 210`;
  } else if (config.pose === 'THINKING') {
    mouthPath = `M 190 214 L 210 211`;
  } else if (config.pose === 'WORKING') {
    mouthPath = `M 188 212 L 212 212`;
  } else if (config.pose === 'EXPLAINING') {
    mouthPath = `M 188 210 Q 200 ${217 + (smileVal / 12)} 212 210`;
  }

  const browOffset = (browVal - 50) / 8;
  const leftBrowPath = `M 158 ${166 - browOffset} Q 170 ${161 - browOffset} 182 ${167 - browOffset}`;
  const rightBrowPath = `M 218 ${167 - browOffset} Q 230 ${161 - browOffset} 242 ${167 - browOffset}`;

  // Dynamic 3D Camera Rig transforms
  let cameraTransform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1) translateY(0px)';
  let cameraOrigin = 'center center';

  if (cameraView === 'threequarter') {
    // Dynamic 3/4 isometric perspective angle
    cameraTransform = 'perspective(1000px) rotateY(-26deg) rotateX(3deg) scale(0.96) translateX(-6px)';
    cameraOrigin = 'center center';
  } else if (cameraView === 'side') {
    // Profile side angle view
    cameraTransform = 'perspective(1000px) rotateY(-56deg) rotateX(2deg) scale(0.94) translateX(-10px)';
    cameraOrigin = 'center center';
  } else if (cameraView === 'portrait') {
    // Cinematic close-up framing focused on head sculpt, hair, expression, eyewear and chest details
    cameraTransform = 'perspective(1200px) scale(1.85) translateY(20px) rotateY(-4deg)';
    cameraOrigin = '50% 36%';
  }

  const entranceStyle = isFullBody && isEntering && !disableEntrance ? { animation: `entrance-${poseAnim} 2.5s ease-out forwards` } : {};

  // Unique IDs for SVG gradients per component instance (prevents cross-avatar defs collisions)
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, '_');
  const uid = `${user?.id || (user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'guest')}_${instanceId}`;
  const leftEyeSocketId = `left-eye-socket-clip-${uid}`;
  const rightEyeSocketId = `right-eye-socket-clip-${uid}`;
  const skinGradId = `skin-grad-${uid}`;
  const hairGradId = `hair-grad-${uid}`;
  const clothGradId = `cloth-grad-${uid}`;
  const visorGradId = `visor-grad-${uid}`;
  const glowFilterId = `glow-filter-${uid}`;

  const containerClasses = isFullBody
    ? `relative overflow-hidden flex flex-col items-center justify-center rounded-3xl border-[1.5px] ${auraClass} w-full h-[400px] sm:h-[450px] md:h-[550px] bg-gradient-to-br ${bgGradient} shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out group select-none ${className}`
    : `relative rounded-full overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-[1.5px] ${auraClass} ${dim} bg-gradient-to-br ${bgGradient} hover:shadow-[0_8px_30px_rgba(0,240,255,0.4)] transition-all duration-300 hover:scale-105 group select-none shrink-0 ${className}`;

  // Photometric ambient key light color tint
  const lightColor = config.lighting === 'golden-hour' 
    ? 'rgba(251, 191, 36, 0.15)' 
    : config.lighting === 'moody-crimson' 
    ? 'rgba(244, 63, 94, 0.18)' 
    : config.lighting === 'studio-key' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 240, 255, 0.15)';

  return (
    <div className={containerClasses}>
      
      {/* Background Environment Art for Full Body */}
      {isFullBody && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none transition-opacity duration-700" 
          style={{ 
            backgroundImage: config.background === 'space-nebula' 
              ? "radial-gradient(circle at 70% 30%, rgba(168,85,247,0.4), transparent 60%)" 
              : config.background === 'tokyo-skyline' 
              ? "linear-gradient(to top, rgba(168,85,247,0.3), transparent), url('/cyber_city_backdrop.png')" 
              : "url('/cyber_city_backdrop.png')" 
          }}
        />
      )}

      {/* Cyber Grid Pattern Overlay for Full Body */}
      {isFullBody && config.background !== 'clean-lab' && (
        <div className="absolute inset-0 opacity-40 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_40%,black_85%,transparent)]">
          <svg className="w-full h-full stroke-cyan-400/20" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`grid-pattern-${uid}`} width="30" height="30" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="30" y2="0" strokeWidth="0.8" />
                <line x1="0" y1="0" x2="0" y2="30" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-pattern-${uid})`} />
          </svg>
        </div>
      )}

      {/* Dynamic Lighting Tint Ambient Blob */}
      <div 
        className="pointer-events-none absolute -top-20 left-1/4 w-[150%] h-[150%] rounded-full blur-[100px] transition-all duration-700" 
        style={{ backgroundColor: lightColor }}
      />

      {/* Profile Entrance Light Sweep */}
      {isFullBody && isEntering && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent w-[200%] pointer-events-none z-30" 
          style={{ animation: 'sweep-light 2.5s ease-out forwards' }} 
        />
      )}

      {/* Overloaded Warning Badge */}
      {isOverloaded && (
        <div className="absolute top-3 right-3 flex items-center justify-center bg-rose-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg z-30 animate-pulse">
          MAX LOAD
        </div>
      )}

      {/* 3D Camera Rig Stage Wrapper */}
      <div 
        className="w-full h-full flex items-center justify-center relative z-10 transition-transform duration-700 ease-out"
        style={{
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          transform: isFullBody ? cameraTransform : 'none',
          transformOrigin: isFullBody ? cameraOrigin : 'center center',
          willChange: 'transform'
        }}
      >
        {/* Procedural 3D SVG Rig */}
        <svg
          viewBox={isFullBody ? "0 40 400 500" : "105 85 190 190"}
          className={`w-full h-full relative z-10 ${breatheClass}`}
          style={{ 
            animationDelay: randBreathe,
            ...entranceStyle 
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          {/* Anatomical Eyelid Sockets */}
          <clipPath id={leftEyeSocketId}>
            <ellipse cx="170" cy="180" rx="14" ry="10" />
          </clipPath>
          <clipPath id={rightEyeSocketId}>
            <ellipse cx="230" cy="180" rx="14" ry="10" />
          </clipPath>

          {/* Skin Shader Gradient */}
          <radialGradient cx="45%" cy="40%" id={skinGradId} r="65%">
            <stop offset="0%" stopColor="#fce1cb" />
            <stop offset="80%" stopColor={config.skinTone || '#bf8a59'} />
            <stop offset="100%" stopColor="#8d5631" />
          </radialGradient>

          {/* Hair Shader Gradient */}
          <linearGradient id={hairGradId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={config.hairColor || '#00f0ff'} />
            <stop offset="100%" stopColor="#004f54" />
          </linearGradient>

          {/* Clothing Fabric Gradient */}
          <linearGradient id={clothGradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={config.clothingColor || '#111827'} />
            <stop offset="100%" stopColor="#0b0f19" />
          </linearGradient>

          {/* Hologram Visor Gradient */}
          <linearGradient id={visorGradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0254ed" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#842bd2" stopOpacity="0.85" />
          </linearGradient>

          {/* Cyber Glow Filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ================= 1. PEDESTAL & SHADOW BASE (Full body mode) ================= */}
        {isFullBody && config.pedestal !== 'zero-g' && (
          <g id="rig-pedestal">
            {config.pedestal === 'octa-ring' ? (
              /* Octagonal Brushed Steel Plate */
              <g>
                <polygon points="120,500 280,500 320,520 280,535 120,535 80,520" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.5" />
                <polygon points="135,505 265,505 295,518 265,528 135,528 105,518" fill="#0f172a" stroke="#7df4ff" strokeDasharray="6 4" strokeWidth="1" />
                {/* Hazard Stripe accents */}
                <line x1="150" y1="520" x2="165" y2="528" stroke="#fbbf24" strokeWidth="2.5" />
                <line x1="175" y1="520" x2="190" y2="528" stroke="#fbbf24" strokeWidth="2.5" />
                <line x1="210" y1="520" x2="225" y2="528" stroke="#fbbf24" strokeWidth="2.5" />
                <line x1="235" y1="520" x2="250" y2="528" stroke="#fbbf24" strokeWidth="2.5" />
              </g>
            ) : (
              /* Concentric Holo Disc */
              <g>
                <ellipse cx="200" cy="510" fill="#080e18" opacity="0.85" rx="130" ry="24" stroke="#00f0ff" strokeWidth="1.5" />
                <ellipse cx="200" cy="510" fill="none" opacity="0.5" rx="90" ry="16" stroke="#7df4ff" strokeDasharray="6 6" strokeWidth="1" />
                <ellipse cx="200" cy="510" fill="#00f0ff" filter={`url(#${glowFilterId})`} opacity="0.3" rx="55" ry="8" />
              </g>
            )}
          </g>
        )}

        {/* ================= 2. SPATIAL AURA & SPINNING RINGS ================= */}
        {config.aura && config.aura !== 'none' && (
          <g className="aura-spin" opacity="0.65">
            {config.aura === 'solar-flare' ? (
              <g>
                <circle cx="200" cy="200" r="115" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="12 8" />
                <circle cx="200" cy="200" r="135" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 20" />
                <circle cx="200" cy="200" r="95" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
              </g>
            ) : config.aura === 'matrix-emerald' ? (
              <g>
                <circle cx="200" cy="200" r="115" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 14" />
                <circle cx="200" cy="200" r="130" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="8 8" />
                <circle cx="200" cy="200" r="100" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="2 10" />
              </g>
            ) : config.aura === 'quantum-violet' ? (
              <g>
                <circle cx="200" cy="200" r="120" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="14 10" />
                <circle cx="200" cy="200" r="105" fill="none" stroke="#e879f9" strokeWidth="1" strokeDasharray="2 12" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="6 18" />
              </g>
            ) : config.aura === 'hyper-glitch' ? (
              <g>
                <circle cx="197" cy="200" r="115" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="16 10" opacity="0.7" />
                <circle cx="203" cy="200" r="115" fill="none" stroke="#00f0ff" strokeWidth="1.8" strokeDasharray="10 14" opacity="0.7" />
                <circle cx="200" cy="200" r="130" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 20" />
              </g>
            ) : (
              /* cyber-rings default */
              <g>
                <circle cx="200" cy="200" r="110" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="8 12" />
                <circle cx="200" cy="200" r="130" fill="none" stroke="#b5c4ff" strokeWidth="1" strokeDasharray="4 24" />
                <circle cx="200" cy="200" r="95" fill="none" stroke="#7df4ff" strokeWidth="0.8" strokeDasharray="2 18" />
              </g>
            )}
          </g>
        )}

        {/* ================= 3. LEGS & PANTS (Full body mode) ================= */}
        {isFullBody && (
          <g id="rig-legs">
            {/* Base leg shapes */}
            <path d="M 160 380 L 155 470 L 180 470 L 185 380 Z" fill="#0d1424" stroke="#1f2c4c" strokeWidth="1" />
            <path d="M 215 380 L 220 470 L 245 470 L 240 380 Z" fill="#0d1424" stroke="#1f2c4c" strokeWidth="1" />

            {/* Pants Styles */}
            {config.pantsStyle === 'cargo-joggers' && (
              <g>
                {/* Left Cargo Pocket & Straps */}
                <rect x="148" y="405" width="12" height="20" rx="2" fill="#1e293b" stroke="#00f0ff" strokeWidth="0.8" />
                <line x1="156" y1="415" x2="183" y2="418" stroke="#00f0ff" strokeWidth="1.5" opacity="0.7" />
                {/* Right Cargo Pocket & Straps */}
                <rect x="240" y="405" width="12" height="20" rx="2" fill="#1e293b" stroke="#00f0ff" strokeWidth="0.8" />
                <line x1="217" y1="418" x2="244" y2="415" stroke="#00f0ff" strokeWidth="1.5" opacity="0.7" />
              </g>
            )}

            {config.pantsStyle === 'tailored-slacks' && (
              <g>
                {/* Sharp Center Crease Lines */}
                <line x1="168" y1="382" x2="167" y2="468" stroke="#334155" strokeWidth="1.2" />
                <line x1="232" y1="382" x2="233" y2="468" stroke="#334155" strokeWidth="1.2" />
              </g>
            )}

            {config.pantsStyle === 'cyber-chinos' && (
              <g>
                {/* Articulated Reinforced Knee Plates */}
                <rect x="156" y="415" width="24" height="18" rx="3" fill="#1e293b" stroke="#00f0ff" strokeWidth="1" />
                <line x1="160" y1="424" x2="176" y2="424" stroke="#00f0ff" strokeWidth="1" />
                <rect x="220" y="415" width="24" height="18" rx="3" fill="#1e293b" stroke="#00f0ff" strokeWidth="1" />
                <line x1="224" y1="424" x2="240" y2="424" stroke="#00f0ff" strokeWidth="1" />
              </g>
            )}

            {config.pantsStyle === 'flight-trousers' && (
              <g>
                {/* Padded zero-g cuffs & pressure gauges */}
                <rect x="153" y="450" width="28" height="16" rx="2" fill="#0f172a" stroke="#7df4ff" strokeWidth="1" />
                <circle cx="167" cy="458" r="3" fill="#00f0ff" />
                <rect x="219" y="450" width="28" height="16" rx="2" fill="#0f172a" stroke="#7df4ff" strokeWidth="1" />
                <circle cx="233" cy="458" r="3" fill="#00f0ff" />
              </g>
            )}
          </g>
        )}

        {/* ================= 4. SNEAKERS & SHOES (Full body mode) ================= */}
        {isFullBody && (
          <g id="rig-shoes">
            {config.shoes === 'gravity-boots' ? (
              /* Heavy Armored Mag-Boots */
              <g>
                <g transform="translate(140, 462)">
                  <rect x="0" y="5" width="46" height="24" rx="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
                  <rect x="0" y="24" width="46" height="6" rx="1" fill="#00f0ff" filter={`url(#${glowFilterId})`} />
                  <line x1="12" y1="12" x2="34" y2="12" stroke="#7df4ff" strokeWidth="2" />
                  <circle cx="36" cy="18" r="3" fill="#f43f5e" />
                </g>
                <g transform="translate(214, 462)">
                  <rect x="0" y="5" width="46" height="24" rx="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
                  <rect x="0" y="24" width="46" height="6" rx="1" fill="#00f0ff" filter={`url(#${glowFilterId})`} />
                  <line x1="12" y1="12" x2="34" y2="12" stroke="#7df4ff" strokeWidth="2" />
                  <circle cx="10" cy="18" r="3" fill="#f43f5e" />
                </g>
              </g>
            ) : config.shoes === 'kinetic-high' ? (
              /* Kinetic High-Top Sneaker */
              <g>
                <g transform="translate(142, 460)">
                  <path d="M 5 20 L 12 0 L 36 2 L 44 20 L 40 32 L 0 32 Z" fill="#1e293b" />
                  <rect x="10" y="8" width="28" height="5" rx="1" fill="#0254ed" stroke="#00f0ff" strokeWidth="0.8" />
                  <path d="M 0 29 L 42 29 L 42 33 L 0 33 Z" fill="#e2e8f0" />
                </g>
                <g transform="translate(214, 460)">
                  <path d="M 0 20 L 8 2 L 32 0 L 39 20 L 44 32 L 4 32 Z" fill="#1e293b" />
                  <rect x="6" y="8" width="28" height="5" rx="1" fill="#0254ed" stroke="#00f0ff" strokeWidth="0.8" />
                  <path d="M 2 29 L 44 29 L 44 33 L 2 33 Z" fill="#e2e8f0" />
                </g>
              </g>
            ) : config.shoes === 'minimalist-low' ? (
              /* Minimalist Low Mesh */
              <g>
                <g transform="translate(142, 468)">
                  <path d="M 6 12 L 14 6 L 36 7 L 42 16 L 38 25 L 2 25 Z" fill="#334155" />
                  <path d="M 2 23 L 40 23 L 40 26 L 2 26 Z" fill="#f8fafc" />
                </g>
                <g transform="translate(214, 468)">
                  <path d="M 2 16 L 8 7 L 30 6 L 38 12 L 42 25 L 6 25 Z" fill="#334155" />
                  <path d="M 4 23 L 42 23 L 42 26 L 4 26 Z" fill="#f8fafc" />
                </g>
              </g>
            ) : (
              /* Cyber Runner v4 (Default) */
              <g>
                <g transform="translate(142, 465)">
                  <path d="M 5 15 L 12 5 L 36 7 L 44 20 L 40 28 L 0 28 Z" fill="#1e293b" />
                  <path d="M 0 25 L 42 25 L 42 29 L 0 29 Z" fill="#00f0ff" filter={`url(#${glowFilterId})`} opacity="0.9" />
                  <circle cx="28" cy="16" r="3" fill="#b5c4ff" />
                </g>
                <g transform="translate(214, 465)">
                  <path d="M 0 20 L 8 7 L 32 5 L 39 15 L 44 28 L 4 28 Z" fill="#1e293b" />
                  <path d="M 2 25 L 44 25 L 44 29 L 2 29 Z" fill="#00f0ff" filter={`url(#${glowFilterId})`} opacity="0.9" />
                  <circle cx="16" cy="16" r="3" fill="#b5c4ff" />
                </g>
              </g>
            )}
          </g>
        )}

        {/* ================= 5. TORSO & APPAREL ================= */}
        <g id="rig-torso">
          {/* Main Torso Base Shape - Adjusts for BaseModel (masc, femme, neutral) */}
          <path 
            d={isFullBody 
              ? (config.baseModel === 'femme'
                  ? "M 142 250 Q 200 242 258 250 L 265 390 Q 200 405 135 390 Z"
                  : "M 140 250 Q 200 240 260 250 L 275 390 Q 200 405 125 390 Z")
              : (config.baseModel === 'femme'
                  ? "M 135 245 Q 200 240 265 245 L 275 300 Q 200 310 125 300 Z"
                  : "M 130 245 Q 200 238 270 245 L 285 300 Q 200 310 115 300 Z")
            } 
            fill={`url(#${clothGradId})`} 
            stroke="#223354" 
            strokeWidth="1" 
          />

          {/* Synthetic Neutral Android Chassis Lines */}
          {config.baseModel === 'neutral' && (
            <g opacity="0.8">
              <circle cx="200" cy="290" r="8" fill="#00f0ff" filter={`url(#${glowFilterId})`} />
              <circle cx="200" cy="290" r="4" fill="#ffffff" />
              <line x1="165" y1="270" x2="190" y2="290" stroke="#00f0ff" strokeWidth="1" />
              <line x1="235" y1="270" x2="210" y2="290" stroke="#00f0ff" strokeWidth="1" />
              <line x1="200" y1="298" x2="200" y2="340" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" />
            </g>
          )}

          {/* OUTFIT SPECIFIC DETAILS */}
          {config.outfit === 'exec-blazer' ? (
            /* Executive Blazer with Lapels, Shirt & Tie */
            <g>
              {/* White collared shirt */}
              <polygon points="180,246 200,285 220,246 200,256" fill="#f8fafc" />
              {/* Silk Tie */}
              <polygon points="196,260 204,260 206,325 200,335 194,325" fill="#0254ed" stroke="#00f0ff" strokeWidth="0.8" />
              {/* Blazer Lapels */}
              <path d="M 165 248 L 192 315 L 175 390" fill="none" stroke="#334155" strokeWidth="2.5" />
              <path d="M 235 248 L 208 315 L 225 390" fill="none" stroke="#334155" strokeWidth="2.5" />
              {/* Pocket Square */}
              <rect x="225" y="275" width="18" height="6" fill="#00f0ff" rx="1" />
            </g>
          ) : config.outfit === 'spatial-suit' ? (
            /* Spatial Flight Suit with Regulators & High Collar Ring */
            <g>
              {/* High Collar Seal */}
              <path d="M 165 245 Q 200 265 235 245" fill="none" stroke="#00f0ff" strokeWidth="3" filter={`url(#${glowFilterId})`} />
              {/* Dual Oxygen Regulators on Chest */}
              <circle cx="178" cy="285" r="7" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
              <circle cx="178" cy="285" r="3" fill="#00f0ff" className="animate-pulse" />
              <circle cx="222" cy="285" r="7" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
              <circle cx="222" cy="285" r="3" fill="#00f0ff" className="animate-pulse" />
              <line x1="185" y1="285" x2="215" y2="285" stroke="#7df4ff" strokeWidth="1.5" strokeDasharray="2 2" />
              {/* Pressure Valve Lines */}
              <line x1="200" y1="300" x2="200" y2="380" stroke="#00f0ff" strokeWidth="1.5" />
            </g>
          ) : config.outfit === 'dev-crewneck' ? (
            /* Dev Oversized Crewneck with Glowing Developer Glyphs */
            <g>
              {/* Ribbed Collar */}
              <path d="M 170 248 Q 200 268 230 248" fill="none" stroke="#334155" strokeWidth="3.5" />
              {/* Developer "< / >" Glowing Glyph on Chest */}
              <g transform="translate(182, 275)">
                <path d="M 10 3 L 3 10 L 10 17" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
                <line x1="21" y1="2" x2="15" y2="18" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
                <path d="M 26 3 L 33 10 L 26 17" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>
          ) : config.outfit === 'minimal-polo' ? (
            /* Minimalist Aero Polo */
            <g>
              <path d="M 170 246 L 188 272 L 200 256 L 212 272 L 230 246" fill="#0f172a" stroke="#00f0ff" strokeWidth="1" />
              <circle cx="200" cy="270" r="1.5" fill="#ffffff" />
              <circle cx="200" cy="280" r="1.5" fill="#ffffff" />
              <rect x="220" y="275" width="14" height="10" rx="2" fill="#00f0ff" opacity="0.6" />
            </g>
          ) : config.outfit === 'lab-coat' ? (
            /* R&D Dynamic Lab Coat Overlay */
            <g>
              <path d="M 150 250 L 180 320 L 175 390 L 140 390 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" opacity="0.9" />
              <path d="M 250 250 L 220 320 L 225 390 L 260 390 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" opacity="0.9" />
              {/* Breast Pocket with Biosensor Pens */}
              <rect x="230" y="275" width="14" height="18" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" rx="1" />
              <line x1="233" y1="270" x2="233" y2="280" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
              <line x1="238" y1="272" x2="238" y2="280" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : (
            /* Cyber Techwear Hoodie (Default) */
            <g>
              <path d="M 165 248 Q 200 280 235 248 L 225 240 Q 200 252 175 240 Z" fill="#0f172a" />
              <line x1="200" y1="265" x2="200" y2={isFullBody ? "390" : "300"} stroke="#00f0ff" strokeDasharray="6 3" strokeWidth="2" opacity="0.8" />
              {/* Badge */}
              <rect x="220" y="275" width="24" height="14" rx="3" fill="#00363a" stroke="#00f0ff" strokeWidth="1" />
              <circle cx="227" cy="282" r="2.5" fill="#00f0ff" />
              <line x1="233" y1="280" x2="241" y2="280" stroke="#7df4ff" strokeWidth="1.2" />
              <line x1="233" y1="284" x2="239" y2="284" stroke="#7df4ff" strokeWidth="1.2" />
            </g>
          )}
        </g>

        {/* ================= 6. NECKWEAR ================= */}
        {config.neckwear === 'taskflow-lanyard' && (
          <g id="rig-neckwear">
            <path d="M 180 240 L 195 315 L 205 315 L 220 240" fill="none" stroke="#0254ed" strokeWidth="2.5" />
            <g transform="translate(193, 290)">
              <rect x="0" y="0" width="14" height="22" rx="2" fill="#0f172a" stroke="#00f0ff" strokeWidth="1" />
              <rect x="2.5" y="3" width="9" height="7" fill="#00f0ff" opacity="0.8" />
              <line x1="2.5" y1="13" x2="11.5" y2="13" stroke="#b5c4ff" strokeWidth="1" />
              <line x1="2.5" y1="16" x2="8.5" y2="16" stroke="#b5c4ff" strokeWidth="1" />
            </g>
          </g>
        )}

        {config.neckwear === 'cyber-choker' && (
          <g id="rig-neckwear">
            <path d="M 185 235 Q 200 243 215 235" fill="none" stroke="#0f172a" strokeWidth="5" />
            <path d="M 185 235 Q 200 243 215 235" fill="none" stroke="#00f0ff" strokeWidth="2" filter={`url(#${glowFilterId})`} />
            <circle cx="200" cy="239" r="2.5" fill="#00f0ff" />
          </g>
        )}

        {config.neckwear === 'titanium-chain' && (
          <g id="rig-neckwear">
            <path d="M 180 240 Q 200 268 220 240" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="3 2" />
            <polygon points="196,268 204,268 200,276" fill="#00f0ff" filter={`url(#${glowFilterId})`} />
          </g>
        )}

        {/* ================= 7. ARMS, HANDS & CARRIED DEVICE (Full body mode) ================= */}
        {isFullBody && (
          <g id="rig-arms">
            {/* Pose-reactive Arm Positions */}
            {config.pose === 'CELEBRATING' || config.pose === 'CELEBRATE' ? (
              /* Right Arm Raised in Victory Fist */
              <g>
                <path d="M 140 250 L 115 320 L 118 375 L 132 375 L 132 325 L 152 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="125" cy="385" r="9" fill={`url(#${skinGradId})`} />
                {/* Arm raised up */}
                <path d="M 260 250 L 290 190 L 305 130 L 290 130 L 275 190 L 248 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="298" cy="122" r="10" fill={`url(#${skinGradId})`} />
              </g>
            ) : config.pose === 'THINKING' ? (
              /* Right Arm Bent Toward Chin */
              <g>
                <path d="M 140 250 L 115 320 L 118 375 L 132 375 L 132 325 L 152 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="125" cy="385" r="9" fill={`url(#${skinGradId})`} />
                {/* Right hand near chin */}
                <path d="M 260 250 L 285 300 L 240 245 L 225 245 L 265 315 L 248 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="225" cy="235" r="9" fill={`url(#${skinGradId})`} />
              </g>
            ) : config.pose === 'CASUAL' ? (
              /* Left Arm Waving */
              <g>
                <path d="M 140 250 L 105 190 L 90 140 L 105 140 L 120 190 L 152 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="98" cy="132" r="9" fill={`url(#${skinGradId})`} />
                {/* Right arm relaxed */}
                <path d="M 260 250 L 285 320 L 270 365 L 255 365 L 270 325 L 248 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="260" cy="370" r="9" fill={`url(#${skinGradId})`} />
              </g>
            ) : config.pose === 'EXPLAINING' ? (
              /* Left Arm Gesturing Outward */
              <g>
                <path d="M 140 250 L 100 270 L 85 310 L 98 315 L 115 280 L 152 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="85" cy="318" r="9" fill={`url(#${skinGradId})`} />
                <path d="M 260 250 L 285 320 L 270 365 L 255 365 L 270 325 L 248 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="260" cy="370" r="9" fill={`url(#${skinGradId})`} />
              </g>
            ) : (
              /* DEFAULT or WORKING pose */
              <g>
                <path d="M 140 250 L 115 320 L 118 375 L 132 375 L 132 325 L 152 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="125" cy="385" r="9" fill={`url(#${skinGradId})`} />
                <path d="M 260 250 L 285 320 L 270 365 L 255 365 L 270 325 L 248 260 Z" fill={`url(#${clothGradId})`} />
                <circle cx="260" cy="370" r="9" fill={`url(#${skinGradId})`} />
              </g>
            )}

            {/* PRIMARY INPUT DEVICES */}
            {config.device === 'quantum-tablet' && (
              <g transform="translate(235, 335)">
                <rect x="0" y="0" width="38" height="26" rx="2" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.2" />
                <rect x="3" y="3" width="32" height="20" rx="1" fill="rgba(0, 240, 255, 0.2)" />
                <line x1="6" y1="8" x2="28" y2="8" stroke="#00f0ff" strokeWidth="1" />
                <line x1="6" y1="13" x2="20" y2="13" stroke="#7df4ff" strokeWidth="1" />
                <rect x="22" y="16" width="3" height="5" fill="#00f0ff" />
                <rect x="27" y="14" width="3" height="7" fill="#00f0ff" />
                <rect x="32" y="11" width="3" height="10" fill="#00f0ff" />
              </g>
            )}

            {config.device === 'cyberdeck' && (
              <g transform="translate(225, 340)">
                <rect x="0" y="0" width="46" height="20" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                <rect x="4" y="4" width="38" height="6" fill="#0f172a" stroke="#00f0ff" strokeWidth="0.8" />
                <line x1="42" y1="0" x2="48" y2="-15" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="48" cy="-15" r="2" fill="#f59e0b" />
                {/* Mechanical keys */}
                <line x1="6" y1="14" x2="38" y2="14" stroke="#7df4ff" strokeWidth="1" strokeDasharray="2 2" />
              </g>
            )}

            {config.device === 'spatial-stylus' && (
              <g transform="translate(255, 345)">
                <line x1="0" y1="0" x2="-20" y2="-30" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="-20" cy="-30" r="4" fill="#00f0ff" filter={`url(#${glowFilterId})`} />
                {/* Luminous Vector Ribbon in air */}
                <path d="M -20 -30 Q -45 -50 -15 -65" fill="none" stroke="#00f0ff" strokeWidth="2" filter={`url(#${glowFilterId})`} />
              </g>
            )}

            {(config.device === 'holo-laptop' || (!config.device && config.pose === 'WORKING')) && (
              <g transform="translate(235, 345)">
                <polygon points="5,22 45,22 38,32 0,32" fill="#1e293b" stroke="#00f0ff" strokeWidth="1" />
                <polygon points="5,21 45,21 52,-15 12,-15" fill="#00f0ff" fillOpacity="0.2" stroke="#00f0ff" strokeWidth="1.2" filter={`url(#${glowFilterId})`} />
                <line x1="16" y1="-8" x2="38" y2="-8" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
                <line x1="18" y1="-2" x2="44" y2="-2" stroke="#7df4ff" strokeWidth="1" opacity="0.8" />
                <line x1="15" y1="4" x2="32" y2="4" stroke="#b5c4ff" strokeWidth="1" opacity="0.7" />
                <line x1="17" y1="10" x2="42" y2="10" stroke="#00f0ff" strokeWidth="1" opacity="0.9" />
              </g>
            )}
          </g>
        )}

        {/* ================= 8. NECK & HEAD ================= */}
        <g id="rig-head-group" className={glanceClass} style={{ animationDelay: randHead }}>
          {/* Neck */}
          <path d="M 185 210 L 185 255 Q 200 262 215 255 L 215 210 Z" fill={`url(#${skinGradId})`} />

          {/* Face Sculpt */}
          <path d={currentFacePath} fill={`url(#${skinGradId})`} stroke="#1a2538" strokeWidth="0.75" />

          {/* Ears */}
          <ellipse cx="149" cy="180" rx="5" ry="9" fill={`url(#${skinGradId})`} />
          <ellipse cx="251" cy="180" rx="5" ry="9" fill={`url(#${skinGradId})`} />

          {/* Cyber Seams */}
          {config.faceSculpt === 'cyber' && (
            <g opacity="0.75">
              <path d="M 158 195 L 168 205 L 182 205" fill="none" stroke="#00f0ff" strokeWidth="1" />
              <circle cx="182" cy="205" r="1.5" fill="#00f0ff" />
              <path d="M 242 195 L 232 205 L 218 205" fill="none" stroke="#00f0ff" strokeWidth="1" />
              <circle cx="218" cy="205" r="1.5" fill="#00f0ff" />
            </g>
          )}

          {/* Nose & Mouth */}
          <path d="M 197 175 L 195 194 Q 200 197 205 194 Z" fill="none" stroke="#9e6d4c" strokeLinecap="round" strokeWidth="1.5" />
          <path d={mouthPath} fill="none" stroke="#7a4b33" strokeLinecap="round" strokeWidth="2" />

          {/* Eyebrows */}
          <path d={leftBrowPath} fill="none" stroke="#1e293b" strokeLinecap="round" strokeWidth="3" />
          <path d={rightBrowPath} fill="none" stroke="#1e293b" strokeLinecap="round" strokeWidth="3" />

          {/* CRITICAL ANATOMICAL EYELIDS & EYES */}
          <g clipPath={`url(#${leftEyeSocketId})`}>
            <ellipse cx="170" cy="180" rx="14" ry="10" fill="#f8fafc" />
            <circle cx="170" cy="180" r="6" fill="#00f0ff" />
            <circle cx="170" cy="180" r="3" fill="#080e18" />
            <circle cx="168" cy="178" r="1.5" fill="#ffffff" />
            <path 
              d="M 150 165 L 190 165 L 190 170 Q 170 172 150 170 Z" 
              fill={`url(#${skinGradId})`} 
              className="anatomical-upper-lid" 
              style={{ animationDelay: randBlink }} 
            />
            <path 
              d="M 150 195 L 190 195 L 190 190 Q 170 188 150 190 Z" 
              fill={`url(#${skinGradId})`} 
              className="anatomical-lower-lid" 
              style={{ animationDelay: randBlink }} 
            />
          </g>

          <g clipPath={`url(#${rightEyeSocketId})`}>
            <ellipse cx="230" cy="180" rx="14" ry="10" fill="#f8fafc" />
            <circle cx="230" cy="180" r="6" fill="#00f0ff" />
            <circle cx="230" cy="180" r="3" fill="#080e18" />
            <circle cx="228" cy="178" r="1.5" fill="#ffffff" />
            <path 
              d="M 210 165 L 250 165 L 250 170 Q 230 172 210 170 Z" 
              fill={`url(#${skinGradId})`} 
              className="anatomical-upper-lid" 
              style={{ animationDelay: randBlink }} 
            />
            <path 
              d="M 210 195 L 250 195 L 250 190 Q 230 188 210 190 Z" 
              fill={`url(#${skinGradId})`} 
              className="anatomical-lower-lid" 
              style={{ animationDelay: randBlink }} 
            />
          </g>

          {/* Eyewear */}
          {config.eyewear === 'hud-visor' && (
            <g>
              <path d="M 150 172 Q 200 165 250 172 L 252 188 Q 200 197 148 188 Z" fill={`url(#${visorGradId})`} filter={`url(#${glowFilterId})`} opacity="0.9" />
              <line x1="165" y1="180" x2="235" y2="180" stroke="#ffffff" strokeDasharray="8 4" strokeWidth="1.2" opacity="0.9" />
              <rect x="146" y="174" width="6" height="10" rx="1.5" fill="#1e293b" />
              <rect x="248" y="174" width="6" height="10" rx="1.5" fill="#1e293b" />
            </g>
          )}

          {(config.eyewear === 'tech-frames' || config.eyewear === 'Glasses') && (
            <g>
              <rect x="153" y="170" width="34" height="20" rx="3" fill="rgba(56, 189, 248, 0.2)" stroke="#00f0ff" strokeWidth="1.5" />
              <rect x="213" y="170" width="34" height="20" rx="3" fill="rgba(56, 189, 248, 0.2)" stroke="#00f0ff" strokeWidth="1.5" />
              <line x1="187" y1="178" x2="213" y2="178" stroke="#00f0ff" strokeWidth="1.5" />
              <line x1="147" y1="178" x2="153" y2="178" stroke="#00f0ff" strokeWidth="1.5" />
              <line x1="247" y1="178" x2="253" y2="178" stroke="#00f0ff" strokeWidth="1.5" />
            </g>
          )}

          {config.eyewear === 'round-wire' && (
            <g>
              <circle cx="170" cy="180" r="14" fill="rgba(255, 255, 255, 0.15)" stroke="#e2e8f0" strokeWidth="1.2" />
              <circle cx="230" cy="180" r="14" fill="rgba(255, 255, 255, 0.15)" stroke="#e2e8f0" strokeWidth="1.2" />
              <line x1="184" y1="180" x2="216" y2="180" stroke="#e2e8f0" strokeWidth="1.2" />
            </g>
          )}

          {config.eyewear === 'monocle-hud' && (
            <g>
              <circle cx="230" cy="180" r="15" fill="rgba(0, 240, 255, 0.25)" stroke="#00f0ff" strokeWidth="1.5" filter={`url(#${glowFilterId})`} />
              <line x1="220" y1="180" x2="240" y2="180" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="230" y1="170" x2="230" y2="190" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          )}

          {/* Hairstyle Mesh */}
          <g id="rig-hair">
            <path d={currentHairPath} fill={`url(#${hairGradId})`} />
            {config.hairStyle === 'cyber-undercut' && (
              <path d="M 150 150 L 152 170 L 156 160 Z" fill="#00363a" opacity="0.8" />
            )}
          </g>

          {/* Headwear & Audio Nodes */}
          {(config.headwear === 'comm-headset' || config.headwear === 'Headphones' || config.headwear === 'Tech headset') && (
            <g id="mesh-headwear-item">
              <path d="M 148 175 C 140 100 260 100 252 175" fill="none" stroke="#1e293b" strokeLinecap="round" strokeWidth="4.5" />
              <path d="M 148 175 C 140 100 260 100 252 175" fill="none" opacity="0.8" stroke="#00f0ff" strokeLinecap="round" strokeWidth="1.5" />
              <rect x="142" y="165" width="8" height="24" rx="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
              <rect x="250" y="165" width="8" height="24" rx="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
              <path d="M 254 182 L 235 212" fill="none" stroke="#1e293b" strokeWidth="2" />
              <circle cx="234" cy="213" r="2.5" fill="#00f0ff" filter={`url(#${glowFilterId})`} />
            </g>
          )}

          {config.headwear === 'snapback' && (
            <g>
              <path d="M 144 140 C 144 95 256 95 256 140 Z" fill="#0f172a" stroke="#00f0ff" strokeWidth="1" />
              <path d="M 140 140 Q 200 135 260 140 L 275 145 Q 200 148 125 145 Z" fill="#1e293b" />
              <rect x="190" y="112" width="20" height="12" rx="2" fill="#00f0ff" opacity="0.8" />
            </g>
          )}

          {config.headwear === 'holo-beanie' && (
            <g>
              <path d="M 144 145 C 140 85 260 85 256 145 Z" fill="#1e293b" />
              <path d="M 142 140 Q 200 135 258 140 L 258 148 Q 200 143 142 148 Z" fill="#0254ed" />
            </g>
          )}

          {config.headwear === 'vr-halo' && (
            <g>
              <ellipse cx="200" cy="115" rx="65" ry="16" fill="none" stroke="#00f0ff" strokeWidth="2.5" filter={`url(#${glowFilterId})`} />
              <ellipse cx="200" cy="115" rx="65" ry="16" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="8 12" />
            </g>
          )}
        </g>

        {/* High Workload Floating Telemetry Holograms */}
        {isHigh && (
          <g className="float-holo opacity-70" style={{ animationDelay: randRobot }}>
            <rect x="250" y="130" width="34" height="22" rx="3" fill="rgba(0, 240, 255, 0.15)" stroke="#00f0ff" strokeWidth="0.8" />
            <line x1="254" y1="136" x2="278" y2="136" stroke="#00f0ff" strokeWidth="0.8" />
            <line x1="254" y1="141" x2="272" y2="141" stroke="#00f0ff" strokeWidth="0.8" />
            <circle cx="278" cy="146" r="2" fill="#00f0ff" />
          </g>
        )}

        {/* ================= 9. ORBIT COMPANION DRONE ================= */}
        {config.companion && config.companion !== 'none' && (
          <g 
            className="companion-hover" 
            transform={isFullBody ? "translate(285, 90) scale(0.9)" : "translate(230, 80) scale(0.65)"} 
            style={{ animationDelay: randRobot }}
          >
            {config.companion === 'holo-drone' ? (
              /* Hexagonal Projector Drone with 4 spinning rotors */
              <g filter={`url(#${glowFilterId})`}>
                <polygon points="40,25 55,33 55,50 40,58 25,50 25,33" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
                <circle cx="40" cy="41" r="5" fill="#00f0ff" className="animate-pulse" />
                {/* Rotors */}
                <ellipse cx="20" cy="28" rx="8" ry="3" fill="none" stroke="#7df4ff" strokeWidth="1" />
                <ellipse cx="60" cy="28" rx="8" ry="3" fill="none" stroke="#7df4ff" strokeWidth="1" />
                <ellipse cx="20" cy="54" rx="8" ry="3" fill="none" stroke="#7df4ff" strokeWidth="1" />
                <ellipse cx="60" cy="54" rx="8" ry="3" fill="none" stroke="#7df4ff" strokeWidth="1" />
                {/* Downward Scanning Beam */}
                <polygon points="35,58 45,58 55,75 25,75" fill="rgba(0, 240, 255, 0.25)" />
              </g>
            ) : config.companion === 'sprite-orb' ? (
              /* Sentient Energy Sprite Orb */
              <g filter={`url(#${glowFilterId})`}>
                <circle cx="40" cy="40" r="14" fill="#a855f7" opacity="0.6" />
                <circle cx="40" cy="40" r="9" fill="#e879f9" className="animate-pulse" />
                <circle cx="40" cy="40" r="4" fill="#ffffff" />
                <path d="M 30 40 Q 20 50 15 65" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="48" cy="28" r="2" fill="#ffffff" />
                <circle cx="32" cy="52" r="1.5" fill="#ffffff" />
              </g>
            ) : (
              /* bot-orbit (Default) */
              <g filter={`url(#${glowFilterId})`}>
                <circle cx="40" cy="40" r="16" fill="#0f172a" stroke="#00f0ff" strokeWidth="2" />
                <circle cx="40" cy="40" r="8" fill={isOverloaded ? "#f43f5e" : isVeryHigh ? "#f59e0b" : "#00f0ff"} className="animate-pulse" />
                <ellipse cx="40" cy="40" rx="30" ry="12" fill="none" stroke="#7df4ff" strokeDasharray="3 4" strokeWidth="1" opacity="0.6" transform="rotate(-20 40 40)" />
                <circle cx="68" cy="30" r="4" fill="#0254ed" />
                <circle cx="12" cy="50" r="3" fill="#b5c4ff" />
                <path d="M 36 56 L 40 68 L 44 56 Z" fill="#00f0ff" opacity="0.8" className="animate-pulse" />
                {isOverloaded && (
                  <text x="36" y="24" fontSize="14" fill="#f43f5e" fontWeight="bold">!</text>
                )}
              </g>
            )}
          </g>
        )}
      </svg>
      </div>
    </div>
  );
};

export default TaskFlowAvatar;
