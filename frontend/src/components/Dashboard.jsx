import React, { useEffect, useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { api, getUser } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';

// eslint-disable-next-line no-unused-vars
const statusColors = {
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Completed' },
  IN_PROGRESS: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'In Progress' },
  PENDING: { bg: 'bg-sky-500/10', text: 'text-sky-400', label: 'Pending' },
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => getUser() || {});

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const u = getUser();
      if (u) setUser(u);
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard/stats').catch(() => null),
      api.get('/tasks/GetallData').catch(() => []),
    ]).then(([s, t]) => {
      setStats(s);
      const allTasks = Array.isArray(t) ? t : [];
      setTasks(allTasks);

      // Mock recent activities based on tasks
      const mockActivities = allTasks.slice(0, 5).map(task => ({
        id: task.id,
        user: task.user?.name || task.assignee || 'Unknown',
        fullUser: task.user,
        action: task.completionStatus === 'COMPLETED' ? 'completed' : 'updated',
        target: task.taskName,
        time: 'Just now',
        avatar: (task.user?.name || task.assignee || 'U')[0]
      }));
      setActivities(mockActivities);

      setLoading(false);
    });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const kpis = stats ? [
    { label: 'Total Tasks', value: stats.totalTasks, icon: 'fact_check', color: 'primary', hex: '#4d8eff', trend: '+12%', spark: [10, 20, 15, 30, 25, 40] },
    { label: 'In Progress', value: stats.inProgressTasks, icon: 'pending_actions', color: 'amber-400', hex: '#fbbf24', trend: 'Active', spark: [5, 10, 12, 8, 15, 20] },
    { label: 'Completed', value: stats.completedTasks, icon: 'check_circle', color: 'emerald-400', hex: '#34d399', trend: `${stats.completionRate}%`, spark: [2, 5, 8, 12, 18, 25] },
    { label: 'Overdue', value: stats.overdueTasks, icon: 'warning', color: 'rose-400', hex: '#fb7185', trend: 'Needs action', spark: [1, 0, 2, 1, 3, 2] },
  ] : [];

  return (
    <div className="flex flex-col w-full gap-y-space-xl">
      {/* Greeting Banner */}
      <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1200} transitionSpeed={1500}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] flex items-center justify-between">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 -top-16 w-64 h-64 bg-tertiary/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 bottom-0 w-48 h-48 bg-secondary/6 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col gap-space-xs z-10">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{greeting()}, {user.name || 'Admin'}!</h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Here's what's happening with your team today.</p>
        </div>

        <div className="relative z-10 flex items-center justify-end pr-space-md">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-container/15 rounded-2xl blur-xl"></div>
            <svg className="w-24 h-24 drop-shadow-[0_10px_25px_rgba(77,142,255,0.35)]" fill="none" viewBox="0 0 120 120">
              <polygon fill="url(#cube-top)" points="60,14 102,38 60,62 18,38"></polygon>
              <polygon fill="url(#cube-left)" points="18,38 60,62 60,106 18,82"></polygon>
              <polygon fill="url(#cube-right)" points="60,62 102,38 102,82 60,106"></polygon>
              <circle className="animate-ping" cx="60" cy="38" fill="#acedff" r="4" style={{transformOrigin: '60px 38px', animationDuration: '3s'}}></circle>
              <circle cx="60" cy="38" fill="#ffffff" r="3"></circle>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="cube-top" x1="18" x2="102" y1="14" y2="62">
                  <stop stopColor="#4cd7f6"></stop><stop offset="1" stopColor="#3131c0"></stop>
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="cube-left" x1="18" x2="60" y1="38" y2="106">
                  <stop stopColor="#202a3e"></stop><stop offset="1" stopColor="#091326"></stop>
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="cube-right" x1="60" x2="102" y1="62" y2="106">
                  <stop stopColor="#4d8eff"></stop><stop offset="1" stopColor="#161f33"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </Tilt>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        {loading ? (
          Array.from({length: 4}).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-container/50 p-space-lg animate-pulse h-32"></div>
          ))
        ) : kpis.map((kpi, i) => (
          <div key={i} className="anti-gravity-card group relative rounded-xl bg-surface-container/60 p-space-lg backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-300 border border-outline-variant/10 overflow-hidden">
            <div className={`absolute -right-12 -top-12 w-32 h-32 bg-${kpi.color}/10 rounded-full blur-2xl group-hover:bg-${kpi.color}/20 transition-all duration-500 pointer-events-none`}></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${kpi.color}/10 text-${kpi.color} flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
                  <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant font-medium tracking-wide uppercase">{kpi.label}</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between relative z-10">
              <div>
                <span className="text-3xl font-bold text-on-surface tabular-nums">{kpi.value}</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-[10px] font-bold text-${kpi.color} bg-${kpi.color}/10 px-2 py-0.5 rounded-full`}>{kpi.trend}</span>
                </div>
              </div>
              
              <div className="w-20 h-10 flex items-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {kpi.spark.map((val, idx) => (
                  <div key={idx} className={`w-2 rounded-t-sm bg-${kpi.color}`} style={{ height: `${(val / Math.max(...kpi.spark)) * 100}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Project Overview */}
        <div className="lg:col-span-2 flex flex-col gap-space-lg">
          <div className="anti-gravity-card rounded-xl bg-surface-container/60 p-space-xl backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-outline-variant/10">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Project Overview</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                    TF
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">TaskFlow MVP v1.0</h3>
                    <p className="text-sm text-on-surface-variant">Core Management System</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-on-surface-variant mb-1">Status</div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">ON TRACK</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Progress</div>
                  <div className="text-xl font-bold text-primary">{stats?.completionRate || 0}%</div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Tasks</div>
                  <div className="text-xl font-bold text-on-surface">{stats?.totalTasks || 0}</div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Deadline</div>
                  <div className="text-xl font-bold text-amber-400">Oct 15</div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Team Size</div>
                  <div className="text-xl font-bold text-on-surface">{stats?.totalUsers || 0}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-on-surface-variant">Overall Completion</span>
                  <span className="text-primary">{stats?.completionRate || 0}%</span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats?.completionRate || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="anti-gravity-card rounded-xl bg-surface-container/60 p-space-xl backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Recent Activities</h2>
          
          <div className="flex flex-col gap-4 flex-1">
            {loading ? (
              <div className="text-center py-8 text-on-surface-variant">Loading activities...</div>
            ) : activities.length > 0 ? (
              activities.map((act, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="relative flex flex-col items-center">
                    <div className="z-10 group-hover:scale-110 transition-transform">
                      <TaskFlowAvatar user={act.fullUser || {name: act.user}} size="small" className="w-10 h-10" />
                    </div>
                    {i !== activities.length - 1 && (
                      <div className="w-px h-full bg-outline-variant/20 absolute top-10 group-hover:bg-primary/50 transition-colors"></div>
                    )}
                  </div>
                  <div className="pb-4 pt-1">
                    <p className="text-sm text-on-surface">
                      <span className="font-bold text-primary mr-1">{act.user}</span>
                      <span className="text-on-surface-variant">{act.action}</span>
                    </p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5 line-clamp-1">{act.target}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-1">{act.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2 block text-outline">history</span>
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
