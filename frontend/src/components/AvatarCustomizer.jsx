import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TaskFlowAvatar, { rolePresets } from './TaskFlowAvatar';
import { api, getUser } from '../utils/api';

const skinToneOptions = [
  { val: '#f7c8a6', label: 'Porcelain Warm' },
  { val: '#e5b38d', label: 'Golden Bisque' },
  { val: '#bf8a59', label: 'Warm Bronze' },
  { val: '#8d5631', label: 'Deep Sienna' },
  { val: '#4a2e1d', label: 'Rich Obsidian' },
  { val: '#6ba5b0', label: 'Android Cyan' },
  { val: '#9b8fb8', label: 'Nebula Violet' }
];

const hairColorOptions = [
  { val: '#00f0ff', label: 'Cyber Cyan' },
  { val: '#ff0077', label: 'Hot Neon Pink' },
  { val: '#a855f7', label: 'Quantum Violet' },
  { val: '#e2e8f0', label: 'Platinum White' },
  { val: '#1e293b', label: 'Midnight Jet' },
  { val: '#f59e0b', label: 'Solar Amber' },
  { val: '#10b981', label: 'Matrix Green' }
];

const clothingColorOptions = [
  { val: '#111827', label: 'Tactical Stealth' },
  { val: '#0254ed', label: 'TaskFlow Cobalt' },
  { val: '#00f0ff', label: 'Aero Cyan' },
  { val: '#842bd2', label: 'Ultraviolet' },
  { val: '#e2e8f0', label: 'Arctic Clean' },
  { val: '#e11d48', label: 'Crimson Hazard' }
];

const AvatarCustomizer = ({ isOpen, onClose, onSave }) => {
  const [currentUser, setCurrentUser] = useState(() => getUser());

  const [config, setConfig] = useState({
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
  });

  const [activeTab, setActiveTab] = useState('tab-style');
  const [cameraView, setCameraView] = useState('front');
  const [loading, setLoading] = useState(false);

  // ONLY initialize config when modal opens, do NOT overwrite on every render
  useEffect(() => {
    if (isOpen) {
      const u = getUser();
      setCurrentUser(u);
      if (u?.avatarConfig) {
        try {
          const parsed = typeof u.avatarConfig === 'string' ? JSON.parse(u.avatarConfig) : u.avatarConfig;
          setConfig(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse avatarConfig", e);
        }
      } else {
        const role = u?.role || 'DEVELOPER';
        if (rolePresets[role]) {
          setConfig(prev => ({ ...prev, ...rolePresets[role] }));
        }
      }
    }
  }, [isOpen]);

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const configStr = JSON.stringify(config);
      await api.put('/api/users/me/avatar', { avatarConfig: configStr });
      
      // Update local storage user
      const u = getUser();
      if (u) {
        u.avatarConfig = configStr;
        localStorage.setItem('user', JSON.stringify(u));
        setCurrentUser(u);
      }
      
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: configStr }));
      if (onSave) onSave(config);
      onClose();
    } catch (err) {
      alert('Failed to save avatar: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const hairStyles = ['cyber-undercut', 'neon-bob', 'curly-fade', 'spiky-anime', 'dread-locks', 'slick-back'];
    const faceSculpts = ['chiseled', 'soft', 'angular', 'cyber', 'rounded', 'sharp'];
    const outfits = ['techwear-hoodie', 'exec-blazer', 'dev-crewneck', 'spatial-suit', 'minimal-polo', 'lab-coat'];
    const pantsStyles = ['cargo-joggers', 'tailored-slacks', 'cyber-chinos', 'flight-trousers'];
    const shoesList = ['cyber-runner', 'kinetic-high', 'minimalist-low', 'gravity-boots'];
    const eyeweares = ['hud-visor', 'tech-frames', 'round-wire', 'monocle-hud', 'none'];
    const headweares = ['comm-headset', 'snapback', 'holo-beanie', 'vr-halo', 'none'];
    const neckwears = ['taskflow-lanyard', 'cyber-choker', 'titanium-chain', 'none'];
    const companions = ['bot-orbit', 'holo-drone', 'sprite-orb', 'none'];
    const devices = ['holo-laptop', 'quantum-tablet', 'cyberdeck', 'spatial-stylus', 'none'];
    const auras = ['cyber-rings', 'solar-flare', 'matrix-emerald', 'quantum-violet', 'hyper-glitch', 'none'];
    const pedestals = ['holo-disc', 'octa-ring', 'zero-g'];
    const lightings = ['cyber-cyan', 'golden-hour', 'studio-key', 'moody-crimson'];
    const backgrounds = ['cyber-grid', 'tokyo-skyline', 'clean-lab', 'space-nebula', 'server-room', 'sunset-synth'];

    setConfig(prev => ({
      ...prev,
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      faceSculpt: faceSculpts[Math.floor(Math.random() * faceSculpts.length)],
      outfit: outfits[Math.floor(Math.random() * outfits.length)],
      pantsStyle: pantsStyles[Math.floor(Math.random() * pantsStyles.length)],
      shoes: shoesList[Math.floor(Math.random() * shoesList.length)],
      eyewear: eyeweares[Math.floor(Math.random() * eyeweares.length)],
      headwear: headweares[Math.floor(Math.random() * headweares.length)],
      neckwear: neckwears[Math.floor(Math.random() * neckwears.length)],
      companion: companions[Math.floor(Math.random() * companions.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      aura: auras[Math.floor(Math.random() * auras.length)],
      pedestal: pedestals[Math.floor(Math.random() * pedestals.length)],
      lighting: lightings[Math.floor(Math.random() * lightings.length)],
      background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
      skinTone: skinToneOptions[Math.floor(Math.random() * skinToneOptions.length)].val,
      hairColor: hairColorOptions[Math.floor(Math.random() * hairColorOptions.length)].val,
      clothingColor: clothingColorOptions[Math.floor(Math.random() * clothingColorOptions.length)].val,
      smileMorph: Math.floor(Math.random() * 80) + 10,
      browHeight: Math.floor(Math.random() * 70) + 20
    }));
  };

  const handleReset = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const role = currentUser?.role || 'DEVELOPER';
    setConfig({
      ...rolePresets[role] || rolePresets['DEVELOPER']
    });
  };

  const applyRoleArchetype = (roleKey, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (rolePresets[roleKey]) {
      setConfig(prev => ({
        ...prev,
        ...rolePresets[roleKey]
      }));
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-[#0b101b] rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden text-on-surface">
        
        {/* TOP STUDIO BAR */}
        <div className="px-5 py-3.5 bg-surface-container-lowest/90 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.35)]">
              <span className="material-symbols-outlined text-primary-container text-[20px]">deployed_code</span>
            </div>
            <div>
              <div className="font-bold text-primary tracking-tight leading-none text-base">TaskFlow 3D Studio</div>
              <div className="text-[11px] text-primary-fixed-dim uppercase tracking-wider font-mono">Avatar Customizer & Rigging</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">casino</span>
              <span>Randomize</span>
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface-variant transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-surface-container-lowest text-xs font-bold shadow-[0_0_16px_rgba(0,240,255,0.35)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>{loading ? 'Saving...' : 'Save & Apply'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-on-surface ml-2">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* MAIN STUDIO GRID */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 items-start">
          
          {/* LEFT COLUMN: Customizer Tabs (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Tab Nav */}
            <div className="p-1 rounded-xl bg-surface-container/90 backdrop-blur-md flex items-center gap-1 shadow-md overflow-x-auto scrollbar-none">
              {[
                { id: 'tab-style', label: 'Style', icon: 'face' },
                { id: 'tab-clothing', label: 'Clothing', icon: 'apparel' },
                { id: 'tab-accessories', label: 'Accessories', icon: 'eyeglasses' },
                { id: 'tab-tech-gear', label: 'Tech Gear', icon: 'memory' },
                { id: 'tab-background', label: 'Backdrop', icon: 'wallpaper' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center font-semibold text-xs transition-all flex items-center justify-center gap-1 ${
                    activeTab === t.id
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="rounded-2xl bg-surface-container-low/90 backdrop-blur-xl p-4 shadow-xl flex flex-col gap-4 border border-white/5">
              
              {/* TAB 1: STYLE */}
              {activeTab === 'tab-style' && (
                <div className="space-y-4">
                  {/* Skeleton model */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Base Skeleton Model</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'masc', label: 'Masc', desc: 'Type A • 182cm' },
                        { id: 'femme', label: 'Femme', desc: 'Type B • 172cm' },
                        { id: 'neutral', label: 'Synthetic', desc: 'Type C • Dynamic' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setConfig(prev => ({ ...prev, baseModel: m.id }))}
                          className={`p-2 rounded-xl text-left transition-all ${
                            config.baseModel === m.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{m.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Face Sculpt */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Face Sculpt & Bone Topology</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'chiseled', label: 'Chiseled', desc: 'Defined Jaw' },
                        { id: 'soft', label: 'Soft Oval', desc: 'Natural Curve' },
                        { id: 'angular', label: 'Angular', desc: 'High Cheek' },
                        { id: 'cyber', label: 'Augmented', desc: 'Subdermal Seams' },
                        { id: 'rounded', label: 'Youthful', desc: 'Subtle Features' },
                        { id: 'sharp', label: 'Razor V', desc: 'Tapered Chin' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setConfig(prev => ({ ...prev, faceSculpt: f.id }))}
                          className={`p-2 rounded-xl text-left transition-all ${
                            config.faceSculpt === f.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{f.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skin Tone */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Skin Shader Melanin Tone</label>
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
                      {skinToneOptions.map(s => (
                        <button
                          key={s.val}
                          onClick={() => setConfig(prev => ({ ...prev, skinTone: s.val }))}
                          style={{ backgroundColor: s.val }}
                          title={s.label}
                          className={`w-8 h-8 rounded-full shrink-0 transition-all ${
                            config.skinTone === s.val
                              ? 'ring-2 ring-primary-container ring-offset-2 ring-offset-surface scale-110 shadow-[0_0_10px_#00f0ff]'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hairstyle */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Hairstyle Volumetric Mesh</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cyber-undercut', label: 'Cyber Undercut', desc: 'Sharp Fade' },
                        { id: 'neon-bob', label: 'Sleek Bob', desc: 'Sharp Geometry' },
                        { id: 'curly-fade', label: 'Micro Curls', desc: 'High Volume' },
                        { id: 'spiky-anime', label: 'Spiked Apex', desc: 'Dynamic Tips' },
                        { id: 'dread-locks', label: 'Cyber Dreads', desc: 'Bound Neon' },
                        { id: 'slick-back', label: 'Slick Modern', desc: 'Executive Pom' }
                      ].map(h => (
                        <button
                          key={h.id}
                          onClick={() => setConfig(prev => ({ ...prev, hairStyle: h.id }))}
                          className={`p-2 rounded-xl text-left transition-all ${
                            config.hairStyle === h.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{h.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{h.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Hair Luminescence & Pigment</label>
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
                      {hairColorOptions.map(hc => (
                        <button
                          key={hc.val}
                          onClick={() => setConfig(prev => ({ ...prev, hairColor: hc.val }))}
                          style={{ backgroundColor: hc.val }}
                          title={hc.label}
                          className={`w-8 h-8 rounded-full shrink-0 transition-all ${
                            config.hairColor === hc.val
                              ? 'ring-2 ring-primary-container ring-offset-2 ring-offset-surface scale-110 shadow-[0_0_12px_#00f0ff]'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLOTHING */}
              {activeTab === 'tab-clothing' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Upper Wear & Suit Topology</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'techwear-hoodie', label: 'Cyber Techwear Hoodie', desc: 'Straps & seals' },
                        { id: 'exec-blazer', label: 'Executive Blazer', desc: 'Smart silk finish' },
                        { id: 'dev-crewneck', label: 'Dev Oversized Crewneck', desc: 'TaskFlow signature' },
                        { id: 'spatial-suit', label: 'Spatial Flight Suit', desc: 'Pressurized seals' },
                        { id: 'minimal-polo', label: 'Minimalist Aero Polo', desc: 'Laser-cut collar' },
                        { id: 'lab-coat', label: 'R&D Dynamic Lab Coat', desc: 'Clean room smart' }
                      ].map(o => (
                        <button
                          key={o.id}
                          onClick={() => setConfig(prev => ({ ...prev, outfit: o.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.outfit === o.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{o.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{o.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Primary Fabric Color</label>
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
                      {clothingColorOptions.map(c => (
                        <button
                          key={c.val}
                          onClick={() => setConfig(prev => ({ ...prev, clothingColor: c.val }))}
                          style={{ backgroundColor: c.val }}
                          title={c.label}
                          className={`w-8 h-8 rounded-full shrink-0 transition-all ${
                            config.clothingColor === c.val
                              ? 'ring-2 ring-primary-container ring-offset-2 ring-offset-surface scale-110 shadow-[0_0_12px_#00f0ff]'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Pants & Bottom Mesh</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cargo-joggers', label: 'Modular Cargo Joggers', desc: 'Dual utility holsters' },
                        { id: 'tailored-slacks', label: 'Tailored Tech Slacks', desc: 'Pleated hydro-repellent' },
                        { id: 'cyber-chinos', label: 'Kinetic Chinos', desc: 'Articulated knees' },
                        { id: 'flight-trousers', label: 'Exo Flight Trousers', desc: 'Padded zero-g cuffs' }
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => setConfig(prev => ({ ...prev, pantsStyle: p.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.pantsStyle === p.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{p.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Footwear Model</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cyber-runner', label: 'Cyber Runner v4', desc: 'Luminescent air sole' },
                        { id: 'kinetic-high', label: 'Kinetic High-Top', desc: 'Mag-lock straps' },
                        { id: 'minimalist-low', label: 'Minimalist Low Mesh', desc: 'Carbon fiber' },
                        { id: 'gravity-boots', label: 'Gravity Mag-Boots', desc: 'Suspension dampeners' }
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => setConfig(prev => ({ ...prev, shoes: s.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.shoes === s.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{s.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ACCESSORIES */}
              {activeTab === 'tab-accessories' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Optics & Eyewear</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'hud-visor', label: 'Cyber Visor', desc: 'Full optic scan' },
                        { id: 'tech-frames', label: 'Tech Frames', desc: 'Smart AR overlay' },
                        { id: 'round-wire', label: 'Wire Round', desc: 'Titanium thin' },
                        { id: 'monocle-hud', label: 'HUD Monocle', desc: 'Single reticle' },
                        { id: 'none', label: 'No Eyewear', desc: 'Natural gaze' }
                      ].map(e => (
                        <button
                          key={e.id}
                          onClick={() => setConfig(prev => ({ ...prev, eyewear: e.id }))}
                          className={`p-2 rounded-xl text-left transition-all ${
                            config.eyewear === e.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{e.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{e.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Headwear & Audio Nodes</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'comm-headset', label: 'Audio Comm Headset', desc: 'Dual spatial audio' },
                        { id: 'holo-beanie', label: 'Holo Beanie', desc: 'Micro-LED thread' },
                        { id: 'snapback', label: 'TaskFlow Snapback', desc: '3D embroidered' },
                        { id: 'vr-halo', label: 'VR Neural Halo', desc: 'Floating cortical band' },
                        { id: 'none', label: 'No Headwear', desc: 'Bare head' }
                      ].map(h => (
                        <button
                          key={h.id}
                          onClick={() => setConfig(prev => ({ ...prev, headwear: h.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.headwear === h.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{h.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{h.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Badge, Chains & Lanyards</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'taskflow-lanyard', label: 'TaskFlow VIP Lanyard', desc: 'Holographic pass card' },
                        { id: 'cyber-choker', label: 'Cyber LED Choker', desc: 'Pulsing pulse-rate line' },
                        { id: 'titanium-chain', label: 'Titanium Curb Chain', desc: 'Heavy brushed silver' },
                        { id: 'none', label: 'No Neck Accessory', desc: 'Clean neckline' }
                      ].map(n => (
                        <button
                          key={n.id}
                          onClick={() => setConfig(prev => ({ ...prev, neckwear: n.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.neckwear === n.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{n.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{n.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TECH GEAR */}
              {activeTab === 'tab-tech-gear' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Orbital AI Companion Drone</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'bot-orbit', label: 'Bot v1.2 Orbit', desc: 'Dual-thruster scout bot' },
                        { id: 'holo-drone', label: 'Hologram Drone', desc: 'Hexagonal projector drone' },
                        { id: 'sprite-orb', label: 'AI Sprite Orb', desc: 'Plasma sentient particle' },
                        { id: 'none', label: 'No Companion', desc: 'Solo operator' }
                      ].map(cp => (
                        <button
                          key={cp.id}
                          onClick={() => setConfig(prev => ({ ...prev, companion: cp.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.companion === cp.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{cp.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{cp.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Primary Input Device</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'holo-laptop', label: 'Holographic Laptop', desc: 'Code matrix telemetry' },
                        { id: 'quantum-tablet', label: 'Quantum Tablet', desc: 'Bezel-less slate' },
                        { id: 'cyberdeck', label: 'Tactical Cyberdeck', desc: 'Mech-switch console' },
                        { id: 'spatial-stylus', label: 'Spatial Stylus', desc: '3D vector air pen' },
                        { id: 'none', label: 'No Device', desc: 'Hands free' }
                      ].map(d => (
                        <button
                          key={d.id}
                          onClick={() => setConfig(prev => ({ ...prev, device: d.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.device === d.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{d.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{d.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Spatial Aura & Ring Field</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cyber-rings', label: 'Cyber Cyan Rings', desc: 'Concentric orbit telemetry' },
                        { id: 'solar-flare', label: 'Solar Flare Amber', desc: 'Thermal radiance' },
                        { id: 'matrix-emerald', label: 'Matrix Emerald', desc: 'Cascading byte glyphs' },
                        { id: 'quantum-violet', label: 'Quantum Violet', desc: 'Particle string vortex' },
                        { id: 'hyper-glitch', label: 'Hyper Glitch Displacement', desc: 'Chroma shift wave pulses' },
                        { id: 'none', label: 'No Aura', desc: 'Clean void' }
                      ].map(a => (
                        <button
                          key={a.id}
                          onClick={() => setConfig(prev => ({ ...prev, aura: a.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.aura === a.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{a.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{a.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BACKDROP */}
              {activeTab === 'tab-background' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">3D Stage Environment Matrix</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cyber-grid', label: 'Cyber Grid Studio', desc: 'Orthogonal neon floor' },
                        { id: 'tokyo-skyline', label: 'Neon Tokyo Skyline', desc: 'Cyberpunk high-rise towers' },
                        { id: 'clean-lab', label: 'Minimal Clean Lab', desc: 'Sterile white-room geometry' },
                        { id: 'space-nebula', label: 'Deep Space Nebula', desc: 'Gas clouds & distant stars' },
                        { id: 'server-room', label: 'Holo Server Vault', desc: 'Data rack arrays' },
                        { id: 'sunset-synth', label: 'Sunset Synthwave', desc: '80s retrowave horizon' }
                      ].map(bg => (
                        <button
                          key={bg.id}
                          onClick={() => setConfig(prev => ({ ...prev, background: bg.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.background === bg.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{bg.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{bg.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Photometric Lighting Rig</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cyber-cyan', label: 'Cyber Cyan 8500K', color: 'bg-primary-container shadow-[0_0_6px_#00f0ff]' },
                        { id: 'golden-hour', label: 'Golden Warm 3200K', color: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' },
                        { id: 'studio-key', label: 'Studio Neutral 5500K', color: 'bg-slate-100 shadow-[0_0_6px_#ffffff]' },
                        { id: 'moody-crimson', label: 'Moody Crimson Noir', color: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' }
                      ].map(l => (
                        <button
                          key={l.id}
                          onClick={() => setConfig(prev => ({ ...prev, lighting: l.id }))}
                          className={`p-2 rounded-xl text-left transition-all flex items-center gap-2 ${
                            config.lighting === l.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full shrink-0 ${l.color}`}></span>
                          <span className="text-xs font-semibold">{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block mb-1.5">Stage Pedestal Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'holo-disc', label: 'Holo Disc', desc: 'Concentric neon ring' },
                        { id: 'octa-ring', label: 'Octa Plate', desc: 'Brushed steel hazard' },
                        { id: 'zero-g', label: 'Zero-G Void', desc: 'Floating platformless' }
                      ].map(ped => (
                        <button
                          key={ped.id}
                          onClick={() => setConfig(prev => ({ ...prev, pedestal: ped.id }))}
                          className={`p-2.5 rounded-xl text-left transition-all ${
                            config.pedestal === ped.id
                              ? 'bg-surface-container-high text-primary ring-1 ring-primary-container'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="text-xs font-bold">{ped.label}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{ped.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Live 3D Stage Viewport (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col items-center justify-center p-2 bg-[#080d1a]">
              
              {/* TOP HUD */}
              <div className="w-full flex items-center justify-between p-2 z-20 pointer-events-none">
                <div className="flex items-center gap-2 bg-surface-container-low/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm text-[10px] font-mono pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-on-surface">60 FPS</span>
                  <span className="text-outline-variant">|</span>
                  <span className="text-primary-fixed-dim">RIG: OK</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-low/90 backdrop-blur-md p-1 rounded-full text-[10px] pointer-events-auto font-mono text-cyan-300">
                  LOD 0 Cinematic
                </div>
              </div>

              {/* LIVE AVATAR RIG */}
              <div className="w-full flex items-center justify-center min-h-[380px] max-h-[440px]">
                <TaskFlowAvatar 
                  user={{ ...currentUser, avatarConfig: config }} 
                  variant="fullBody" 
                  cameraView={cameraView}
                  disableEntrance={true}
                  className="!border-0 !shadow-none !h-[380px] sm:!h-[420px]"
                />
              </div>

              {/* BOTTOM CAMERA VIEW SELECTOR */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container-high/90 backdrop-blur-xl shadow-lg ring-1 ring-white/10 z-20 my-2">
                {[
                  { id: 'front', label: 'Front', icon: 'photo_camera_front' },
                  { id: 'threequarter', label: '3/4 View', icon: '3d_rotation' },
                  { id: 'side', label: 'Side', icon: 'switch_video' },
                  { id: 'portrait', label: 'Close-Up', icon: 'zoom_in' }
                ].map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraView(cam.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      cameraView === cam.id
                        ? 'bg-primary-container text-on-primary-container shadow-md shadow-primary/20 scale-105'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{cam.icon}</span>
                    <span>{cam.label}</span>
                  </button>
                ))}
              </div>

              {/* TELEMETRY STATS */}
              <div className="w-full grid grid-cols-4 gap-1 p-2 rounded-xl bg-surface-container/60 backdrop-blur-sm text-[10px] font-mono text-center">
                <div>
                  <div className="text-on-surface-variant uppercase text-[8px]">Triangles</div>
                  <div className="text-primary font-bold">18,420</div>
                </div>
                <div>
                  <div className="text-on-surface-variant uppercase text-[8px]">Joints</div>
                  <div className="text-secondary font-bold">68 Bones</div>
                </div>
                <div>
                  <div className="text-on-surface-variant uppercase text-[8px]">Draw Calls</div>
                  <div className="text-cyan-300 font-bold">12 Batches</div>
                </div>
                <div>
                  <div className="text-on-surface-variant uppercase text-[8px]">Sync</div>
                  <div className="text-emerald-400 font-bold">0.8ms</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Archetypes & Kinematic Poses (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            
            {/* Role Archetypes Quick-Apply */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl shadow-xl flex flex-col gap-2 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[16px]">badge</span>
                  <span>Role Archetypes</span>
                </div>
                <span className="text-[10px] text-primary-container font-mono">Preset Sync</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">Instant loadouts tailored for TaskFlow roles:</p>
              
              <div className="space-y-1.5 pt-1">
                {[
                  { id: 'PROJECT_MANAGER', name: 'Project Manager', desc: 'Blazer • Smart Slate', icon: 'analytics', color: 'text-indigo-400 bg-indigo-500/20' },
                  { id: 'TEAM_LEAD', name: 'Team Lead', desc: 'Techwear • Comm • Orbit Bot', icon: 'psychology', color: 'text-cyan-400 bg-cyan-500/20' },
                  { id: 'DEVELOPER', name: 'Developer', desc: 'Hoodie • Visor • Holo Laptop', icon: 'terminal', color: 'text-cyan-300 bg-cyan-500/20' },
                  { id: 'JUNIOR_DEV', name: 'Junior Dev', desc: 'Crewneck • Matrix Emerald', icon: 'code', color: 'text-emerald-400 bg-emerald-500/20' },
                  { id: 'INTERN', name: 'Intern / Explorer', desc: 'Snapback • Lanyard • Casual', icon: 'school', color: 'text-purple-400 bg-purple-500/20' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => applyRoleArchetype(r.id)}
                    className="w-full p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex items-center justify-between text-left group border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${r.color} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[16px]">{r.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">{r.name}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">{r.desc}</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary shrink-0">bolt</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kinematic Poses */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl shadow-xl flex flex-col gap-2 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[16px]">accessibility_new</span>
                  <span>Kinematic Poses</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">IK-Active</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { id: 'DEFAULT', label: 'Default', desc: 'Neutral Stance' },
                  { id: 'WORKING', label: 'Working', desc: 'Keyboard Focus' },
                  { id: 'EXPLAINING', label: 'Explaining', desc: 'Gesturing Left' },
                  { id: 'THINKING', label: 'Thinking', desc: 'Chin Hand Rest' },
                  { id: 'CELEBRATING', label: 'Celebrate', desc: 'Victory Raise' },
                  { id: 'CASUAL', label: 'Casual', desc: 'Relaxed Hip Shift' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setConfig(prev => ({ ...prev, pose: p.id }))}
                    className={`p-2 rounded-lg text-left transition-all ${
                      config.pose === p.id
                        ? 'bg-surface-container-high text-primary ring-1 ring-primary-container shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-on-surface-variant/70">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Procedural Morph Targets */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl shadow-xl flex flex-col gap-2.5 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">tune</span>
                  <span>Morph Targets</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">Realtime</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-on-surface-variant">Smile Morph</span>
                  <span className="text-primary font-bold">{config.smileMorph ?? 35}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={config.smileMorph ?? 35}
                  onChange={(e) => setConfig(prev => ({ ...prev, smileMorph: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-on-surface-variant">Eyebrow Archetype Height</span>
                  <span className="text-primary font-bold">{config.browHeight ?? 50}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={config.browHeight ?? 50}
                  onChange={(e) => setConfig(prev => ({ ...prev, browHeight: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};

export default AvatarCustomizer;
