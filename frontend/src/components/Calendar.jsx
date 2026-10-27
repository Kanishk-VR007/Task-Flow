import React, { useEffect, useState } from 'react';
import { api, getUser } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOMAINS = ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing', 'Mobile', 'UI/UX', 'AI/ML', 'Cybersecurity'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED', 'OVERDUE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [profile, setProfile] = useState(() => getUser() || null);
  
  // Date context
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modals & State
  const [selectedTask, setSelectedTask] = useState(null);
  const [reminders, setReminders] = useState({}); // taskId -> array of reminders

  // Filters
  const [filterTime, setFilterTime] = useState('All'); // All, Today, Tomorrow, This Week, Next Week, Overdue, Upcoming
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDomain, setFilterDomain] = useState('All');

  useEffect(() => {
    Promise.all([
      api.get('/tasks/GetallData').catch(() => []),
      api.get('/api/users/me').catch(() => null)
    ]).then(([tData, pData]) => {
      setTasks(Array.isArray(tData) ? tData : []);
      setProfile(pData || getUser() || null);
    });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const calendarDays = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= totalDays; d++) calendarDays.push(d);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isTodayDate = (d) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getUrgencyClasses = (task) => {
    const now = new Date();
    const deadline = task.endTime ? new Date(task.endTime) : null;
    const isOverdue = deadline && deadline < now && task.completionStatus !== 'COMPLETED';
    
    if (isOverdue || task.completionStatus === 'OVERDUE') {
      return 'bg-rose-500/20 border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.5)]';
    }
    
    if (task.priority === 'CRITICAL' || task.priority === 'HIGH') {
      return 'bg-rose-500/10 border-rose-500/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]';
    }
    
    if (task.priority === 'MEDIUM') {
      return 'bg-amber-500/10 border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    }
    
    return 'bg-emerald-500/10 border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]';
  };

  const getUrgencyIconClasses = (task) => {
    const p = task.priority;
    if (p === 'CRITICAL' || p === 'HIGH') return 'text-rose-400';
    if (p === 'MEDIUM') return 'text-amber-400';
    return 'text-emerald-400 opacity-60';
  };

  const isNearingDeadline = (task) => {
    if (!task.endTime) return false;
    const now = new Date();
    const deadline = new Date(task.endTime);
    const diffHours = (deadline - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48 && task.completionStatus !== 'COMPLETED';
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'All' && t.completionStatus !== filterStatus) return false;
    if (filterDomain !== 'All' && t.domain !== filterDomain) return false;
    
    if (filterTime !== 'All') {
      if (!t.endTime) return false;
      const tDate = new Date(t.endTime);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      if (filterTime === 'Today' && tDate.toDateString() !== today.toDateString()) return false;
      if (filterTime === 'Tomorrow' && tDate.toDateString() !== tomorrow.toDateString()) return false;
      if (filterTime === 'Overdue' && (tDate >= today || t.completionStatus === 'COMPLETED')) return false;
      if (filterTime === 'Upcoming' && tDate <= today) return false;
    }
    return true;
  });

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredTasks.filter(t => t.endTime && t.endTime.startsWith(dateStr));
  };

  const addReminder = (taskId, type) => {
    const existing = reminders[taskId] || [];
    if (!existing.includes(type)) {
      setReminders({ ...reminders, [taskId]: [...existing, type] });
    }
  };

  const removeReminder = (taskId, type) => {
    const existing = reminders[taskId] || [];
    setReminders({ ...reminders, [taskId]: existing.filter(r => r !== type) });
  };

  return (
    <div className="flex flex-col gap-space-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Calendar</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Schedule, prioritize, and meet deadlines</p>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-4 bg-surface-container/60 p-2 rounded-xl backdrop-blur-md border border-outline-variant/10">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="font-headline-sm font-bold w-40 text-center">{monthName}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="taskflow-card bg-surface-container/60 rounded-xl p-space-md backdrop-blur-md border border-outline-variant/10 flex flex-wrap gap-4 items-center z-20 relative">
        <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
        
        <select value={filterTime} onChange={e => setFilterTime(e.target.value)} className="bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="All">Time: All</option>
          <option value="Today">Today</option>
          <option value="Tomorrow">Tomorrow</option>
          <option value="Overdue">Overdue</option>
          <option value="Upcoming">Upcoming</option>
        </select>

        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="All">Priority: All</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="All">Status: All</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>

        <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className="bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="All">Domain: All</option>
          {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface-container-lowest/40 rounded-2xl border border-outline-variant/10 overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-7 bg-surface-container-low/80 border-b border-outline-variant/10">
          {daysOfWeek.map(d => (
            <div key={d} className="p-3 text-center font-label-md font-semibold text-on-surface-variant uppercase tracking-wider">{d}</div>
          ))}
        </div>
        
        {/* Days */}
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-outline-variant/5 gap-[1px]">
          {calendarDays.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day && isTodayDate(day);
            return (
              <div key={i} className={`bg-surface-container-lowest p-2 min-h-[140px] flex flex-col gap-1 transition-colors ${!day ? 'opacity-30 pointer-events-none' : 'hover:bg-surface-container-lowest/80'}`}>
                {day && (
                  <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary text-white shadow-[0_0_12px_rgba(77,142,255,0.6)]' : 'text-on-surface-variant'}`}>
                    {day}
                  </div>
                )}
                
                {/* Tasks inside cell */}
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[250px] no-scrollbar">
                  {dayTasks.map(task => (
                    <div key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className={`relative group cursor-pointer border p-2 rounded-lg flex flex-col gap-1 transition-all duration-300 transform preserve-3d hover:scale-[1.02] hover:-translate-y-0.5 hover:z-10 ${getUrgencyClasses(task)}`}
                      title={task.taskName}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 truncate pr-4">{task.domain}</span>
                        <div className="flex items-center gap-1 absolute top-2 right-2">
                          
                          {/* Priority Checklist Icon */}
                          <div className={`hover-tick-draw flex items-center justify-center ${getUrgencyIconClasses(task)}`} title={`Priority: ${task.priority}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 11l3 3L22 4" className="tick-path transition-all" />
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" opacity="0.4" />
                            </svg>
                          </div>

                          {/* Deadline Clock Icon */}
                          {isNearingDeadline(task) && (
                            <div className="hover-clock-spin text-rose-400 ml-0.5 group-hover:text-rose-300 transition-colors" title="Deadline approaching">
                              <svg className="clock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" opacity="0.4"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-on-surface leading-tight line-clamp-2">{task.taskName}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <TaskFlowAvatar user={task.user || {name: task.assignee || 'Unassigned'}} size="small" className="w-4 h-4" />
                        <span className="text-[9px] text-on-surface-variant truncate flex-1">{task.assignee || task.user?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setSelectedTask(null)}>
          <div className="bg-surface-container-highest backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-outline-variant/20 w-full max-w-xl p-0 flex flex-col overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            {/* Header Banner */}
            <div className={`p-6 border-b border-outline-variant/10 relative overflow-hidden ${selectedTask.priority === 'CRITICAL' ? 'bg-rose-500/10' : 'bg-primary/5'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-surface-container text-on-surface border border-outline-variant/20">{selectedTask.domain}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getUrgencyIconClasses(selectedTask)} bg-surface-container border border-outline-variant/20`}>{selectedTask.priority}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface leading-tight">{selectedTask.taskName}</h2>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Assigned To</span>
                  <div className="flex items-center gap-2">
                    <TaskFlowAvatar user={selectedTask.user || {name: selectedTask.assignee || 'Unassigned'}} size="small" className="w-6 h-6" />
                    <span className="text-sm font-semibold">{selectedTask.assignee || selectedTask.user?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Status</span>
                  <span className="text-sm font-semibold text-on-surface">{selectedTask.completionStatus?.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Project</span>
                  <span className="text-sm font-semibold text-on-surface">{selectedTask.project?.name || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Deadline</span>
                  <span className={`text-sm font-semibold ${isNearingDeadline(selectedTask) ? 'text-rose-400' : 'text-on-surface'}`}>
                    {selectedTask.endTime ? new Date(selectedTask.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'None'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Est. Hours</span>
                  <span className="text-sm font-semibold text-on-surface">{selectedTask.estimatedHours || 0}h</span>
                </div>
              </div>

              {/* Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Completion Progress</span>
                  <span className="text-primary">{selectedTask.progress || 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden shadow-inner border border-outline-variant/10">
                  <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-[0_0_8px_rgba(77,142,255,0.5)] transition-all" style={{ width: `${selectedTask.progress || 0}%` }}></div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Description</span>
                <p className="text-sm text-on-surface-variant/90 leading-relaxed bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              {/* Reminders Section */}
              <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  <h3 className="font-semibold text-sm">Reminders</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '5 min before', val: '5m' },
                    { label: '15 min before', val: '15m' },
                    { label: '30 min before', val: '30m' },
                    { label: '1 hour before', val: '1h' },
                    { label: '1 day before', val: '1d' }
                  ].map(rem => {
                    const isActive = (reminders[selectedTask.id] || []).includes(rem.val);
                    return (
                      <button 
                        key={rem.val}
                        onClick={() => isActive ? removeReminder(selectedTask.id, rem.val) : addReminder(selectedTask.id, rem.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border
                          ${isActive ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(77,142,255,0.2)]' : 'bg-surface-container text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-high'}
                        `}
                      >
                        {isActive && <span className="material-symbols-outlined text-[12px]">check</span>}
                        {rem.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1 italic">* Reminders sync with your Notification Center.</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
