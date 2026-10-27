import React, { useEffect, useState } from 'react';
import { api, getUser, logout } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';
import AvatarCustomizer from './AvatarCustomizer';

const Profile = () => {
  const [profile, setProfile] = useState(() => getUser() || null);
  const [loading, setLoading] = useState(() => !getUser());
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Edit Mode & Form States
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'edit' | 'security'
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    name: '',
    githubLink: '',
    primaryDomain: '',
    secondaryDomains: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const populateEditForm = (data) => {
    if (!data) return;
    setEditForm({
      fullName: data.fullName || '',
      name: data.name || data.userName || '',
      githubLink: data.githubLink || '',
      primaryDomain: data.primaryDomain || 'BACKEND',
      secondaryDomains: data.secondaryDomains || '',
    });
  };

  useEffect(() => {
    api.get('/api/users/me').then(data => {
      setProfile(data);
      populateEditForm(data);
      setLoading(false);
    }).catch(() => {
      const u = getUser();
      setProfile(u);
      populateEditForm(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const u = getUser();
      if (u) setProfile(u);
      api.get('/api/users/me').then(data => {
        setProfile(data);
        populateEditForm(data);
      }).catch(() => {});
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const updated = await api.put('/api/users/profile', editForm);
      setProfile(prev => ({ ...prev, ...editForm, ...updated }));
      
      // Update cached user in localStorage
      const cached = getUser() || {};
      localStorage.setItem('user', JSON.stringify({ ...cached, ...editForm, ...updated }));

      setStatusMsg({ type: 'success', text: 'Profile details saved successfully!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsChangingPassword(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.put('/api/users/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      // Update local profile state
      setProfile(prev => ({ ...prev, isDefaultPassword: false }));
      const cached = getUser() || {};
      cached.isDefaultPassword = false;
      localStorage.setItem('user', JSON.stringify(cached));

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setStatusMsg({ type: 'success', text: 'Password updated successfully! Default password flag cleared.' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-space-md">
        <div className="w-24 h-24 rounded-full bg-surface-container/40 animate-pulse"></div>
        <div className="w-48 h-6 rounded bg-surface-container/40 animate-pulse"></div>
      </div>
    );
  }

  const user = profile || getUser() || {};

  return (
    <div className="flex flex-col gap-space-xl max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Account & Profile</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your personal credentials, identity, and engineering focus</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container/60 border border-outline-variant/10 backdrop-blur-md self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('overview'); setStatusMsg({ type: '', text: '' }); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('edit'); setStatusMsg({ type: '', text: '' }); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'edit' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => { setActiveTab('security'); setStatusMsg({ type: '', text: '' }); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all relative ${activeTab === 'security' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span>Password & Security</span>
            {user.isDefaultPassword && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-surface-container animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Default Password Alert */}
      {user.isDefaultPassword && (
        <div className="rounded-2xl bg-amber-500/15 border border-amber-500/30 p-4 flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">lock_reset</span>
            <div>
              <h4 className="text-sm font-bold text-amber-300">Default Password Active</h4>
              <p className="text-xs text-amber-200/80">You are currently using a temporary password set by your Project Manager. Please update it to secure your account.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('security')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all shrink-0"
          >
            Change Now
          </button>
        </div>
      )}

      {/* Global Status Message */}
      {statusMsg.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in ${statusMsg.type === 'error' ? 'bg-error-container/20 border border-error/30 text-error' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'}`}>
          <span className="material-symbols-outlined text-[20px]">
            {statusMsg.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* Profile Card */}
          <div className="rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden relative">
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
                  {user.fullName || user.name || 'Unknown User'}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-space-md py-1.5 rounded-full bg-primary-container/20 text-primary font-label-lg font-bold text-[13px] uppercase tracking-wider shadow-sm border border-primary/10">
                    {(user.role || 'USER').replace('_', ' ')}
                  </span>
                  <span className="px-space-md py-1.5 rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[13px] border border-outline/20">
                    Team: <strong>{user.teamName || 'Unassigned'}</strong>
                  </span>
                  <span className="px-space-md py-1.5 rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[13px] border border-outline/20">
                    Domain: <strong>{user.primaryDomain || 'GENERAL'}</strong>
                  </span>
                </div>
                
                <p className="font-body-lg text-on-surface-variant/80 max-w-xl leading-relaxed mb-8">
                  Active member of the engineering organization contributing to architectural planning, task delivery, and code reviews across designated team initiatives.
                </p>
                
                <div className="flex flex-wrap items-center gap-8 bg-surface/40 p-4 rounded-xl border border-white/5 w-fit">
                  <div className="flex flex-col">
                    <span className="text-3xl text-primary font-bold">{user.workloadScore || 0}%</span>
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Workload</span>
                  </div>
                  <div className="h-10 w-px bg-outline-variant/30"></div>
                  <div className="flex flex-col">
                    <span className="text-3xl text-on-surface font-bold">{user.githubLink ? 'Linked' : 'Not Set'}</span>
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">GitHub</span>
                  </div>
                  <div className="h-10 w-px bg-outline-variant/30"></div>
                  <div className="flex flex-col">
                    <span className="text-3xl text-emerald-400 font-bold">{user.isDefaultPassword ? 'Default' : 'Secured'}</span>
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Password</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
            {[
              { label: 'Work Email', value: user.email, icon: 'mail' },
              { label: 'Display Name', value: user.name || '—', icon: 'badge' },
              { label: 'Full Legal Name', value: user.fullName || user.name || '—', icon: 'person' },
              { label: 'Engineering Domain', value: user.primaryDomain || 'Not Specified', icon: 'layers' },
              { label: 'Secondary Domains', value: user.secondaryDomains || 'None', icon: 'hub' },
              { label: 'GitHub Profile', value: user.githubLink || 'Not configured', icon: 'code', isLink: !!user.githubLink },
            ].map((item, i) => (
              <div key={i} className="rounded-xl bg-surface-container/60 p-space-lg backdrop-blur-md border border-outline-variant/10 flex items-start gap-space-md">
                <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">{item.label}</span>
                  {item.isLink ? (
                    <a href={item.value.startsWith('http') ? item.value : `https://github.com/${item.value}`} target="_blank" rel="noopener noreferrer" className="font-body-md text-primary hover:underline font-medium truncate block">
                      {item.value}
                    </a>
                  ) : (
                    <span className="font-body-md text-on-surface font-medium truncate block">{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setActiveTab('edit')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 font-semibold text-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Profile Details</span>
            </button>

            <button onClick={logout}
              className="flex items-center gap-space-sm px-space-lg py-space-sm rounded-xl bg-error-container/20 hover:bg-error-container/40 text-error font-label-md font-semibold transition-all duration-200">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === 'edit' && (
        <div className="rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold text-on-surface mb-1">Edit Profile Details</h3>
            <p className="text-xs text-on-surface-variant">Update your public identity, display name, and GitHub repository links</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Display / User Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Jhon"
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">GitHub Profile / Username</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">code</span>
                  <input
                    type="text"
                    value={editForm.githubLink}
                    onChange={e => setEditForm({ ...editForm, githubLink: e.target.value })}
                    placeholder="e.g. https://github.com/johndoe or johndoe"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Primary Domain</label>
                <select
                  value={editForm.primaryDomain}
                  onChange={e => setEditForm({ ...editForm, primaryDomain: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all"
                >
                  <option value="FULLSTACK">FULLSTACK</option>
                  <option value="BACKEND">BACKEND</option>
                  <option value="FRONTEND">FRONTEND</option>
                  <option value="MOBILE">MOBILE</option>
                  <option value="DEVOPS">DEVOPS</option>
                  <option value="DATABASE">DATABASE</option>
                  <option value="TESTING">QA / TESTING</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Secondary Domains (Comma-separated)</label>
              <input
                type="text"
                value={editForm.secondaryDomains}
                onChange={e => setEditForm({ ...editForm, secondaryDomains: e.target.value })}
                placeholder="e.g. DOCKER, KUBERNETES, GRAPHQL"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-lg shadow-primary/25 transition-all cursor-pointer"
              >
                {isSavingProfile ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10 shadow-xl flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-1">Password & Credentials</h3>
              <p className="text-xs text-on-surface-variant">Update your account authentication password</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5 max-w-lg">
            {!user.isDefaultPassword && (
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">New Password (Min 6 Characters)</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new strong password"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary focus:outline-none transition-all font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-tertiary hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-primary/25 transition-all cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Avatar Customizer Modal */}
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
