import React, { useEffect, useState } from 'react';
import { api, getUser, logout } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';
import AvatarCustomizer from './AvatarCustomizer';

const Profile = () => {
  const [profile, setProfile] = useState(() => getUser() || null);
  const [loading, setLoading] = useState(() => !getUser());
  const [customizerOpen, setCustomizerOpen] = useState(false);

  useEffect(() => {
    api.get('/api/users/me').then(data => {
      setProfile(data);
      setLoading(false);
    }).catch(() => { setProfile(getUser()); setLoading(false); });
  }, []);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const u = getUser();
      if (u) setProfile(u);
      api.get('/api/users/me').then(setProfile).catch(() => {});
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-space-md">
        <div className="w-24 h-24 rounded-full bg-surface-container/40 animate-pulse"></div>
        <div className="w-48 h-6 rounded bg-surface-container/40 animate-pulse"></div>
      </div>
    );
  }

  const user = profile || getUser() || {};
  // eslint-disable-next-line no-unused-vars
  const initials = (user.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-space-xl max-w-3xl mx-auto">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Profile</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Your account information</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden relative">
        {/* Background ambient glow behind text */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-space-xl md:gap-8 relative z-10">
          
          {/* TOP-LEFT / LEFT: Full Body Avatar */}
          <div className="w-full max-w-[280px] shrink-0 flex flex-col items-center gap-3">
            <div 
              onClick={() => setCustomizerOpen(true)}
              className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] w-full group relative"
              title="Click avatar to customize"
            >
              <TaskFlowAvatar user={user} variant="fullBody" />
              <div className="absolute inset-0 bg-primary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-black/70 backdrop-blur-md text-primary font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-primary/30">
                  <span className="material-symbols-outlined text-[14px]">tune</span> Click to Customize
                </span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setCustomizerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary font-semibold text-xs border border-primary/20 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer w-full justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Customize 3D Avatar</span>
            </button>
          </div>

          {/* RIGHT: User Information */}
          <div className="flex-1 flex flex-col justify-center py-4 md:py-8">
            <h2 className="font-headline-lg text-on-surface font-bold text-3xl md:text-4xl tracking-tight mb-2">
              {user.name || 'Unknown User'}
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-space-md py-1.5 rounded-full bg-primary-container/20 text-primary font-label-lg font-bold text-[13px] uppercase tracking-wider shadow-sm border border-primary/10">
                {(user.role || 'USER').replace('_', ' ')}
              </span>
              <span className="px-space-md py-1.5 rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[13px] border border-outline/20">
                Team: <strong>{user.teamName || 'Unassigned'}</strong>
              </span>
            </div>
            
            <p className="font-body-lg text-on-surface-variant/80 max-w-xl leading-relaxed mb-8">
              Core responsibilities include leading cross-functional initiatives, ensuring architectural integrity, and driving feature delivery within the designated product domain.
            </p>
            
            <div className="flex flex-wrap items-center gap-8 bg-surface/40 p-4 rounded-xl border border-white/5 w-fit">
              <div className="flex flex-col">
                <span className="text-3xl text-primary font-bold">{user.workloadScore || 0}%</span>
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Workload</span>
              </div>
              <div className="h-10 w-px bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="text-3xl text-on-surface font-bold">3</span>
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Projects</span>
              </div>
              <div className="h-10 w-px bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="text-3xl text-on-surface font-bold">12</span>
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Active Tasks</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
        {[
          { label: 'Email', value: user.email, icon: 'mail' },
          { label: 'Full Name', value: user.fullName || user.name || '—', icon: 'person' },
          { label: 'Role', value: (user.role || 'DEVELOPER').replace('_', ' '), icon: 'badge' },
          { label: 'Team', value: user.teamName || 'Unassigned', icon: 'groups' },
          { label: 'Workload Score', value: `${user.workloadScore || 0}%`, icon: 'speed' },
          { label: 'GitHub', value: user.githubLink || '—', icon: 'code' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl bg-surface-container/60 p-space-lg backdrop-blur-md border border-outline-variant/10 flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <div className="min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant block">{item.label}</span>
              <span className="font-body-md text-on-surface font-medium truncate block">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-space-md">
        <button onClick={logout}
          className="flex items-center gap-space-sm px-space-lg py-space-sm rounded-xl bg-error-container/20 hover:bg-error-container/40 text-error font-label-md font-semibold transition-all duration-200">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Log Out</span>
        </button>
      </div>

      <AvatarCustomizer 
        isOpen={customizerOpen} 
        onClose={() => setCustomizerOpen(false)} 
        onSave={(newConfig) => {
          setProfile(prev => ({ 
            ...prev, 
            avatarConfig: typeof newConfig === 'string' ? newConfig : JSON.stringify(newConfig) 
          }));
        }} 
      />
    </div>
  );
};

export default Profile;
