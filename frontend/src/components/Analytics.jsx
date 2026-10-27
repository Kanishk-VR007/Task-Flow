import React, { useEffect, useState } from 'react';
import { api, getUser } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const Analytics = () => {
  // eslint-disable-next-line no-unused-vars
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(() => getUser() || null);
  const [loading, setLoading] = useState(true);

  // For interactive line chart
  const [hoveredLine, setHoveredLine] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard/stats').catch(() => null),
      api.get('/api/users/all').catch(() => []),
      api.get('/tasks/GetallData').catch(() => []),
      api.get('/api/users/me').catch(() => null),
    ]).then(([s, u, t, me]) => {
      let filteredUsers = Array.isArray(u) ? u : [];
      let filteredTasks = Array.isArray(t) ? t : [];

      if (me && me.role === 'TEAM_LEAD' && me.teamId) {
        filteredUsers = filteredUsers.filter(user => user.teamId === me.teamId);
        filteredTasks = filteredTasks.filter(task => {
          const owner = filteredUsers.find(u => (u.name === task.assignee || u.email === task.assignee || (task.user && task.user.id === u.id)));
          return !!owner;
        });
      }

      setProfile(me || getUser() || null);
      setStats(s);
      setUsers(filteredUsers);
      setTasks(filteredTasks);
      setLoading(false);
    });
  }, []);

  const statusCounts = {
    COMPLETED: tasks.filter(t => t.completionStatus === 'COMPLETED').length,
    IN_PROGRESS: tasks.filter(t => t.completionStatus === 'IN_PROGRESS').length,
    PENDING: tasks.filter(t => t.completionStatus === 'TODO' || t.completionStatus === 'PENDING').length,
    OVERDUE: tasks.filter(t => t.endTime && new Date(t.endTime) < new Date() && t.completionStatus !== 'COMPLETED').length
  };

  const domainCounts = {};
  tasks.forEach(t => {
    const d = t.domain || 'UNKNOWN';
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  });
  const domainData = Object.entries(domainCounts).map(([name, value]) => ({ name, value }));
  const DOMAIN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const workloadSorted = [...users].filter(u => u.role !== 'PROJECT_MANAGER' && u.role !== 'ADMIN').sort((a, b) => (b.effectiveWorkload || 0) - (a.effectiveWorkload || 0));

  if (loading) {
    return (
      <div className="flex flex-col gap-space-xl">
        <div><h1 className="font-headline-lg text-headline-lg text-on-surface">Analytics</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {Array.from({length: 4}).map((_, i) => <div key={i} className="rounded-xl bg-surface-container/40 h-64 animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  const isTL = profile?.role === 'TEAM_LEAD';

  const trendData = [
    { name: 'Mon', Created: 5, InProgress: 3, Completed: 2, developers: 'Karthik, Ava' },
    { name: 'Tue', Created: 8, InProgress: 5, Completed: 4, developers: 'Karthik, Ethan' },
    { name: 'Wed', Created: 12, InProgress: 8, Completed: 7, developers: 'Ava, Ethan' },
    { name: 'Thu', Created: 15, InProgress: 12, Completed: 10, developers: 'Karthik' },
    { name: 'Fri', Created: 18, InProgress: 15, Completed: 14, developers: 'Ava, Karthik' },
    { name: 'Sat', Created: 20, InProgress: 16, Completed: 18, developers: 'Ethan, Mia' },
    { name: 'Sun', Created: 22, InProgress: 12, Completed: 20, developers: 'All' },
  ];

  const CustomLegend = () => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {[
          { key: 'Created', color: '#a1a1aa' },
          { key: 'InProgress', color: '#f59e0b', label: 'In Progress' },
          { key: 'Completed', color: '#10b981' }
        ].map(item => (
          <div 
            key={item.key}
            className={`flex items-center gap-2 cursor-pointer transition-all duration-300 px-3 py-1.5 rounded-full ${hoveredLine === item.key ? 'bg-surface-container-high scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : hoveredLine ? 'opacity-40' : 'hover:bg-surface-container'}`}
            onMouseEnter={() => setHoveredLine(item.key)}
            onMouseLeave={() => setHoveredLine(null)}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: hoveredLine === item.key ? `0 0 10px ${item.color}` : 'none' }}></div>
            <span className="text-sm font-semibold text-on-surface-variant">{item.label || item.key}</span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="taskflow-card bg-surface-container-high/95 backdrop-blur-xl p-4 rounded-xl border border-outline-variant/20 shadow-2xl">
          <p className="font-bold text-on-surface mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm my-1" style={{ opacity: hoveredLine && hoveredLine !== entry.dataKey ? 0.3 : 1 }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}></span>
              <span className="text-on-surface-variant">{entry.name}:</span>
              <span className="font-bold text-on-surface">{entry.value}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-outline-variant/20">
            <p className="text-[10px] uppercase text-on-surface-variant mb-1 tracking-wider">Active Developers</p>
            <p className="text-xs font-semibold text-primary">{payload[0].payload.developers}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-space-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          {isTL ? `${profile.teamName || 'Team'} Analytics` : 'Global Organization Analytics'}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {isTL ? 'Monitor your team\'s workload and progress' : 'Project performance and workload distribution across all teams'}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-md">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: 'assignment', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Completed', value: statusCounts.COMPLETED, icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'In Progress', value: statusCounts.IN_PROGRESS, icon: 'pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Overdue', value: statusCounts.OVERDUE, icon: 'warning', color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Avg Time', value: '18h', icon: 'schedule', color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Win Rate', value: `${tasks.length ? Math.round((statusCounts.COMPLETED / tasks.length) * 100) : 0}%`, icon: 'speed', color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map((kpi, i) => (
          <div key={i} className="taskflow-card rounded-xl bg-surface-container/60 p-space-md backdrop-blur-md border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[16px]">{kpi.icon}</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-on-surface">{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Performance Trends Chart */}
        <div className="taskflow-card lg:col-span-2 rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-lg">Productivity Trend</h2>
          <div className="w-full h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff1a', strokeWidth: 40, fill: '#ffffff05' }} />
                
                <Line type="monotone" dataKey="Created" stroke="#a1a1aa" strokeWidth={hoveredLine === 'Created' ? 4 : 2} 
                  dot={{ r: hoveredLine === 'Created' ? 6 : 0, fill: '#a1a1aa' }} activeDot={{ r: 8, strokeWidth: 0 }} 
                  style={{ opacity: hoveredLine && hoveredLine !== 'Created' ? 0.2 : 1 }} filter={hoveredLine === 'Created' ? "url(#glow)" : ""} />
                
                <Line type="monotone" dataKey="InProgress" name="In Progress" stroke="#f59e0b" strokeWidth={hoveredLine === 'InProgress' ? 4 : 2} 
                  dot={{ r: hoveredLine === 'InProgress' ? 6 : 0, fill: '#f59e0b' }} activeDot={{ r: 8, strokeWidth: 0 }} 
                  style={{ opacity: hoveredLine && hoveredLine !== 'InProgress' ? 0.2 : 1 }} filter={hoveredLine === 'InProgress' ? "url(#glow)" : ""} />
                
                <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={hoveredLine === 'Completed' ? 4 : 2} 
                  dot={{ r: hoveredLine === 'Completed' ? 6 : 0, fill: '#10b981' }} activeDot={{ r: 8, strokeWidth: 0 }} 
                  style={{ opacity: hoveredLine && hoveredLine !== 'Completed' ? 0.2 : 1 }} filter={hoveredLine === 'Completed' ? "url(#glow)" : ""} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <CustomLegend />
        </div>

        {/* Domain Distribution */}
        <div className="taskflow-card rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10 flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Domain Distribution</h2>
          <div className="flex-1 w-full relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={domainData.length ? domainData : [{name: 'Empty', value: 1}]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {(domainData.length ? domainData : [{name: 'Empty', value: 1}]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Developer Leaderboard & Metrics */}
        <div className="taskflow-card lg:col-span-3 rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-lg">Developer Analytics</h2>
          
          <div className="flex flex-col gap-space-md relative z-10">
            {workloadSorted.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">No workload data available</p>
            ) : workloadSorted.map((user, i) => {
              const w = user.effectiveWorkload || 0;
              const barColor = w >= 80 ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : w >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]';
              
              const completed = user.tasksCompleted || 0;
              const rate = user.completionRate || 0;
              const avgTime = user.averageCompletionTime || 0;
              const currentProg = user.currentProgress || 0;

              return (
                <div key={user.id} className="taskflow-card group relative bg-surface-container-low/40 border border-outline-variant/10 rounded-2xl p-space-md overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md relative z-10">
                    
                    {/* User Identity */}
                    <div className="flex items-center gap-space-md min-w-[250px]">
                      <div className="relative group-hover:shadow-[0_0_15px_rgba(77,142,255,0.3)] transition-shadow rounded-full">
                        <TaskFlowAvatar user={user} size="medium" />
                        {i < 3 && (
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white shadow-md ${i===0 ? 'bg-amber-400' : i===1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700'}`}>
                            #{i+1}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-lg text-on-surface font-bold group-hover:text-primary transition-colors">{user.fullName || user.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider bg-surface-container-high px-1.5 py-0.5 rounded">{user.primaryDomain || 'NO DOMAIN'}</span>
                          <span className="text-[10px] uppercase font-medium text-on-surface-variant/70">{user.role.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-space-sm md:gap-space-md">
                      <div className="flex flex-col items-center md:items-start justify-center">
                        <span className="text-[10px] uppercase text-on-surface-variant tracking-wide font-medium">Completed</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-sm text-on-surface font-bold">{completed}</span>
                          <span className="text-xs text-on-surface-variant">tasks</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-start justify-center">
                        <span className="text-[10px] uppercase text-on-surface-variant tracking-wide font-medium">Avg Time</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-sm text-tertiary font-bold">{avgTime}h</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-start justify-center">
                        <span className="text-[10px] uppercase text-on-surface-variant tracking-wide font-medium">Win Rate</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-sm text-emerald-400 font-bold">{rate}%</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-start justify-center">
                        <span className="text-[10px] uppercase text-on-surface-variant tracking-wide font-medium">Act. Prog</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-sm text-primary font-bold">{currentProg}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Workload */}
                    <div className="flex flex-col justify-center min-w-[150px] md:items-end mt-2 md:mt-0">
                      <div className="flex justify-between items-end w-full mb-1">
                        <span className="text-[10px] uppercase text-on-surface-variant tracking-wide font-medium md:hidden">Workload</span>
                        <span className={`font-headline-sm text-sm font-bold ${w >= 80 ? 'text-rose-400' : w >= 50 ? 'text-amber-400' : 'text-emerald-400'} ml-auto`}>{w}% LOAD</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden shadow-inner border border-outline-variant/10">
                        <div className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(w, 100)}%` }}></div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
