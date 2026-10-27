import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { api, getUser, logout } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';
import AvatarCustomizer from './AvatarCustomizer';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/tasks', icon: 'task_alt', label: 'Tasks' },
  { path: '/team', icon: 'groups', label: 'Team' },
  { path: '/analytics', icon: 'bar_chart', label: 'Analytics' },
  { path: '/chat', icon: 'forum', label: 'Chat' },
  { path: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { path: '/reports', icon: 'summarize', label: 'Reports' },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [profile, setProfile] = useState(() => getUser() || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Default Password Suggestion State
  const [showPasswordSuggestion, setShowPasswordSuggestion] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState('prompt'); // 'prompt' | 'form'
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Task Deadline Approaching', message: 'Backend Credential Security Improvement is due in 1 hour.', time: '10 mins ago', read: false, type: 'WARNING', taskId: 12 },
    { id: 2, title: 'New Task Assigned', message: 'You have been assigned to "Dashboard UI Polish".', time: '2 hours ago', read: true, type: 'INFO', taskId: 15 },
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    api.get('/api/users/me').then(data => {
      setProfile(data);
      if (data && data.isDefaultPassword && !sessionStorage.getItem('dismissedDefaultPasswordModal')) {
        setShowPasswordSuggestion(true);
      }
    }).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const u = getUser();
      if (u) setProfile(u);
      api.get('/api/users/me').then(setProfile).catch(() => {});
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  const handleDismissDefaultPassword = async () => {
    try {
      await api.put('/api/users/dismiss-default-password', {});
      setProfile(prev => ({ ...prev, isDefaultPassword: false }));
      const cached = getUser() || {};
      cached.isDefaultPassword = false;
      localStorage.setItem('user', JSON.stringify(cached));
      sessionStorage.setItem('dismissedDefaultPasswordModal', 'true');
      setShowPasswordSuggestion(false);
    } catch {
      sessionStorage.setItem('dismissedDefaultPasswordModal', 'true');
      setShowPasswordSuggestion(false);
    }
  };

  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPasswordInput.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await api.put('/api/users/change-password', {
        newPassword: newPasswordInput,
      });

      setPasswordSuccess('Password successfully updated!');
      setProfile(prev => ({ ...prev, isDefaultPassword: false }));
      const cached = getUser() || {};
      cached.isDefaultPassword = false;
      localStorage.setItem('user', JSON.stringify(cached));
      sessionStorage.setItem('dismissedDefaultPasswordModal', 'true');

      setTimeout(() => {
        setShowPasswordSuggestion(false);
        setPasswordModalMode('prompt');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setPasswordSuccess('');
      }, 1500);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const user = profile || getUser() || {};
  // eslint-disable-next-line no-unused-vars
  const initials = (user.name || 'U').charAt(0).toUpperCase();
  const roleName = (user.role || 'USER').replace('_', ' ');

  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen relative overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(77,142,255,0.12),rgba(9,19,38,0))] z-0"></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_60%_at_100%_100%,rgba(76,215,246,0.06),transparent)] z-0"></div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen ${sidebarOpen ? 'w-64' : 'w-20'} bg-surface-container-lowest/80 backdrop-blur-xl z-50 flex flex-col justify-between p-space-md shadow-[4px_0_24px_rgba(0,0,0,0.15)] transition-all duration-300`}>
        <div className="flex flex-col gap-space-lg">
          {/* Logo */}
          <div className="flex items-center gap-space-sm px-space-sm py-space-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-[0_4px_16px_rgba(77,142,255,0.4)]">
              <span className="material-symbols-outlined text-white text-[22px]">terminal</span>
            </div>
            {sidebarOpen && <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">TaskFlow</span>}
          </div>

          {/* Toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors self-end -mt-2 -mr-1">
            <span className="material-symbols-outlined text-[18px]">{sidebarOpen ? 'chevron_left' : 'chevron_right'}</span>
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-space-xs">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${path === item.path
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_20px_rgba(77,142,255,0.25)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                {path === item.path && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary shadow-[0_0_8px_rgba(77,142,255,0.6)]"></div>
                )}
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">{item.icon}</span>
                {sidebarOpen && <span className="font-label-md text-label-md">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="relative">
          <div className="bg-surface-container-low/70 rounded-xl p-space-sm flex items-center justify-between shadow-[0_4px_20px_-2px_rgba(2,6,23,0.5)] cursor-pointer hover:bg-surface-container transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="flex items-center gap-space-sm min-w-0">
              <TaskFlowAvatar user={user} size="small" />
              {sidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="font-body-sm text-on-surface truncate font-semibold leading-tight">{user.name || 'User'}</span>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider truncate">{roleName}</span>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">more_vert</span>
            )}
          </div>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface-container-high/95 backdrop-blur-xl rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50">
              <Link to="/profile" className="flex items-center gap-space-sm px-space-md py-space-sm hover:bg-surface-container transition-colors text-on-surface" onClick={() => setMenuOpen(false)}>
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span className="font-label-md">Profile</span>
              </Link>
              <button onClick={() => { setCustomizerOpen(true); setMenuOpen(false); }} className="flex items-center gap-space-sm px-space-md py-space-sm hover:bg-surface-container transition-colors text-on-surface w-full text-left">
                <span className="material-symbols-outlined text-[18px]">face</span>
                <span className="font-label-md">Customize Avatar</span>
              </button>
              <button onClick={logout} className="flex items-center gap-space-sm px-space-md py-space-sm hover:bg-error-container/30 transition-colors text-error w-full text-left">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="font-label-md">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={`${sidebarOpen ? 'pl-64' : 'pl-20'} transition-all duration-300`}>
        {/* Header */}
        <header className={`fixed top-0 ${sidebarOpen ? 'left-64' : 'left-20'} right-0 h-16 bg-surface-container-lowest/70 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.08)] z-40 flex items-center justify-between px-space-xl transition-all duration-300`}>
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] group-focus-within:text-primary transition-colors">search</span>
              <input className="w-full bg-surface-container-low/80 text-on-surface placeholder:text-outline font-body-md text-body-md rounded-xl pl-10 pr-space-xl py-space-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-surface-container-high transition-all" placeholder="Search tasks, projects..." type="text"/>
              <kbd className="absolute right-space-md top-1/2 -translate-y-1/2 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-space-xs rounded shadow-sm">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high/60 text-on-surface backdrop-blur-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary">flag</span>
              <span className="font-label-md text-label-md">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            
            {/* Notification Dropdown Container */}
            <div className="relative">
              <button aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 hover:shadow-[0_0_12px_rgba(77,142,255,0.15)]" type="button">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container-lowest animate-pulse"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50 flex flex-col taskflow-card">
                  <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest/50">
                    <h3 className="font-headline-sm text-on-surface">Notifications</h3>
                    <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} className="text-xs text-primary hover:text-primary/80 transition-colors">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto flex flex-col">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-on-surface-variant text-sm">No new notifications</div>
                    ) : notifications.map(notif => (
                      <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-outline-variant/5 cursor-pointer hover:bg-surface-container-low transition-colors flex gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-primary shadow-[0_0_8px_rgba(77,142,255,0.8)]' : 'bg-transparent'}`}></div>
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex justify-between items-start">
                            <span className={`text-sm font-semibold ${notif.type === 'WARNING' ? 'text-rose-400' : 'text-on-surface'}`}>{notif.title}</span>
                            <span className="text-[10px] text-on-surface-variant/70 whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-snug">{notif.message}</p>
                          {notif.taskId && (
                            <Link to="/calendar" className="mt-2 text-[10px] uppercase font-bold text-primary hover:underline flex items-center gap-1 w-fit" onClick={() => setNotificationsOpen(false)}>
                              <span className="material-symbols-outlined text-[12px]">link</span> VIEW TASK
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main key={location.pathname} className="relative pt-16 w-full px-space-xl py-space-xl min-h-screen z-10">
          {children || <Outlet />}
        </main>
      </div>

      {/* DEFAULT PASSWORD SUGGESTION MODAL */}
      {showPasswordSuggestion && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-surface-container-highest p-6 md:p-8 rounded-3xl w-full max-w-md shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Change Default Password</h3>
                <span className="text-xs text-amber-400 font-semibold">Security Suggestion</span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Welcome to TaskFlow! You are signed in with a temporary default password assigned by your Project Manager. You can update it now or choose to keep it.
            </p>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordModalMode === 'prompt' ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalMode('form')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-tertiary hover:opacity-90 text-white font-semibold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Set New Password Now</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismissDefaultPassword}
                  className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-semibold text-xs transition-colors"
                >
                  Keep Default Password for Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveNewPassword} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-on-surface text-sm font-mono focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPasswordInput}
                    onChange={e => setConfirmPasswordInput(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-on-surface text-sm font-mono focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setPasswordModalMode('prompt'); setPasswordError(''); }}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingPassword ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <AvatarCustomizer isOpen={customizerOpen} onClose={() => setCustomizerOpen(false)} onSave={() => {
        window.dispatchEvent(new CustomEvent('avatarUpdated'));
        api.get('/api/users/me').then(setProfile).catch(() => {});
      }} />
    </div>
  );
};

export default Layout;
