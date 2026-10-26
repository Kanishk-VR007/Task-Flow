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
    api.get('/api/users/me').then(setProfile).catch(() => {});
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
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50 flex flex-col anti-gravity-card">
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
      <AvatarCustomizer isOpen={customizerOpen} onClose={() => setCustomizerOpen(false)} onSave={() => {
        window.dispatchEvent(new CustomEvent('avatarUpdated'));
        api.get('/api/users/me').then(setProfile).catch(() => {});
      }} />
    </div>
  );
};

export default Layout;
