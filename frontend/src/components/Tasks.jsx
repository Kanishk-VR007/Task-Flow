import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';

const statusOptions = ['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'];
const filterOptions = ['ALL', 'PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'OVERDUE', 'BLOCKED'];

const statusColors = {
  COMPLETED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  IN_PROGRESS: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  PENDING: { bg: 'bg-sky-500/15', text: 'text-sky-400', dot: 'bg-sky-400' },
  REVIEW: { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
  BLOCKED: { bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ taskName: '', completionStatus: 'PENDING', startTime: '', endTime: '', internId: '' });

  const fetchTasks = () => {
    setLoading(true);
    api.get('/tasks/GetallData').then(data => {
      setTasks(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => { setTasks([]); setLoading(false); });
  };

  useEffect(() => { fetchTasks(); }, []);

  const [suggestions, setSuggestions] = useState([]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ taskName: '', description: '', domain: 'FRONTEND', priority: 'MEDIUM', completionStatus: 'PENDING', startTime: '', endTime: '', userId: '', internId: '' });
    fetchSuggestions('FRONTEND');
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      taskName: task.taskName || '',
      description: task.description || '',
      domain: task.domain || 'FRONTEND',
      priority: task.priority || 'MEDIUM',
      completionStatus: task.completionStatus || 'PENDING',
      startTime: task.startTime ? task.startTime.slice(0, 16) : '',
      endTime: task.endTime ? task.endTime.slice(0, 16) : '',
      userId: task.user?.id || '',
      internId: task.intern?.id || ''
    });
    fetchSuggestions(task.domain || 'FRONTEND');
    setShowModal(true);
  };

  const fetchSuggestions = (domain) => {
    api.get(`/tasks/suggestions/${domain}`).then(data => {
      setSuggestions(Array.isArray(data) ? data : []);
    }).catch(() => setSuggestions([]));
  };

  const handleDomainChange = (e) => {
    const d = e.target.value;
    setForm({ ...form, domain: d });
    fetchSuggestions(d);
  };

  const handleSave = async () => {
    const body = {
      taskName: form.taskName,
      description: form.description,
      domain: form.domain,
      priority: form.priority,
      completionStatus: form.completionStatus,
      startTime: form.startTime ? form.startTime + ':00' : null,
      endTime: form.endTime ? form.endTime + ':00' : null,
      user: form.userId ? { id: form.userId } : null,
      intern: form.internId ? { id: form.internId } : null
    };
    try {
      if (editTask) {
        await api.put(`/tasks/update/${editTask.id}`, body);
      } else {
        await api.post('/tasks/save', body);
      }
      setShowModal(false);
      fetchTasks();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.del(`/tasks/delete/${id}`);
      fetchTasks();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'OVERDUE') return task.endTime && new Date(task.endTime) < new Date() && task.completionStatus !== 'COMPLETED';
    return task.completionStatus === activeFilter;
  });

  return (
    <div className="flex flex-col gap-space-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Tasks</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your team's work across all projects</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-space-sm px-space-lg py-space-sm rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary font-label-md text-label-md font-semibold shadow-[0_4px_16px_rgba(77,142,255,0.25)] hover:shadow-[0_6px_24px_rgba(77,142,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-space-sm overflow-x-auto pb-2 scrollbar-hide">
        {filterOptions.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-space-md py-space-xs rounded-full font-label-sm text-label-sm transition-all whitespace-nowrap ${
              activeFilter === f 
                ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(77,142,255,0.3)]' 
                : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-primary-container/30 hover:text-primary'
            }`}>
            {f === 'ALL' ? `ALL (${tasks.length})` : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-container/40 h-40 animate-pulse"></div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-space-md">
          <span className="material-symbols-outlined text-6xl text-outline">search_off</span>
          <p className="font-headline-sm">No tasks match filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {filteredTasks.map(task => {
            const s = statusColors[task.completionStatus] || statusColors.PENDING;
            const progress = task.progress || Math.floor(Math.random() * 60) + 10; // Mock progress if missing
            const estHours = task.estimatedHours || 12;
            const actualHours = Math.round(estHours * (progress / 100)) || 0;
            const isOverdue = task.endTime && new Date(task.endTime) < new Date() && task.completionStatus !== 'COMPLETED';
            
            return (
              <div key={task.id}
                className="taskflow-card group rounded-2xl bg-surface-container/60 p-space-lg backdrop-blur-md border border-outline-variant/10 flex flex-col gap-4">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center border border-primary/20 shadow-inner group-hover:shadow-[0_0_15px_rgba(77,142,255,0.4)] transition-all">
                      <span className="material-symbols-outlined text-primary text-xl">assignment</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-on-surface leading-tight font-bold">{task.taskName}</h3>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{task.project?.name || 'TaskFlow Core'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${s.bg} ${s.text} font-bold text-[10px]`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                      {(task.completionStatus || 'PENDING').replace('_', ' ')}
                    </span>
                    {isOverdue && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">OVERDUE</span>}
                  </div>
                </div>

                {/* Description Preview */}
                <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">
                  {task.description || 'No detailed description provided for this task.'}
                </p>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-3 mt-2 bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase text-on-surface-variant/70 font-semibold tracking-wider">Assigned To</span>
                    <div className="flex items-center gap-1.5">
                      <TaskFlowAvatar user={task.user || {name: 'Unassigned'}} size="small" className="w-6 h-6" />
                      <span className="text-xs font-semibold text-on-surface">{task.user ? task.user.name || task.user.userName : 'Unassigned'}</span>
                    </div>
                    {task.intern && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <TaskFlowAvatar user={task.intern || {name: 'I'}} size="small" className="w-5 h-5" />
                        <span className="text-[10px] font-semibold text-on-surface-variant">Intern: {task.intern.name || task.intern.userName}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase text-on-surface-variant/70 font-semibold tracking-wider">Domain</span>
                    <span className="text-xs font-semibold text-on-surface">{task.domain || 'UNKNOWN'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase text-on-surface-variant/70 font-semibold tracking-wider">Deadline</span>
                    <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-400' : 'text-on-surface'}`}>{task.endTime ? new Date(task.endTime).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : 'None'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase text-on-surface-variant/70 font-semibold tracking-wider">Priority</span>
                    <span className={`text-xs font-bold ${task.priority==='CRITICAL'?'text-rose-400':task.priority==='HIGH'?'text-amber-400':'text-on-surface'}`}>{task.priority || 'MEDIUM'}</span>
                  </div>
                </div>

                {/* Progress Area */}
                <div className="mt-2 group/progress">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-on-surface-variant group-hover/progress:text-on-surface transition-colors">Progress</span>
                    <span className="text-primary group-hover/progress:text-primary transition-colors">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden shadow-inner relative">
                    <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(77,142,255,0.6)] taskflow-glow" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-medium">
                    <span>Est: {estHours}h</span>
                    <span>Act: {actualHours}h</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/10">
                  <button onClick={() => openEdit(task)} className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10 hover:border-primary/20">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-high/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-2xl p-space-xl flex flex-col gap-space-lg overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{editTask ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
              <div className="flex flex-col gap-space-md">
                <h3 className="text-on-surface font-semibold border-b border-outline-variant/10 pb-2">Task Details</h3>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Task Name</label>
                  <input value={form.taskName} onChange={e => setForm({...form, taskName: e.target.value})}
                    className="w-full bg-surface-container-low/80 text-on-surface rounded-xl px-space-md py-space-sm border border-outline-variant/20 focus:border-primary/50 focus:outline-none transition-all"/>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full bg-surface-container-low/80 text-on-surface rounded-xl px-space-md py-space-sm border border-outline-variant/20 focus:border-primary/50 focus:outline-none transition-all h-20"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">Domain</label>
                    <select value={form.domain} onChange={handleDomainChange}
                      className="w-full bg-surface-container-low/80 text-on-surface rounded-xl px-space-md py-space-sm border border-outline-variant/20 focus:border-primary/50 focus:outline-none transition-all">
                      {['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'TESTING', 'MOBILE', 'UI_UX'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                      className="w-full bg-surface-container-low/80 text-on-surface rounded-xl px-space-md py-space-sm border border-outline-variant/20 focus:border-primary/50 focus:outline-none transition-all">
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Status</label>
                  <select value={form.completionStatus} onChange={e => setForm({...form, completionStatus: e.target.value})}
                    className="w-full bg-surface-container-low/80 text-on-surface rounded-xl px-space-md py-space-sm border border-outline-variant/20 focus:border-primary/50 focus:outline-none transition-all">
                    {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">Start Date</label>
                    <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})}
                      className="w-full bg-surface-container-low/80 text-on-surface rounded-xl px-space-md py-space-sm border border-outline-variant/20 focus:border-primary/50 focus:outline-none transition-all"/>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">End Date</label>
                    <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})}
                      className="w-full bg-surface-container-low/80 text-on-surface rounded-xl px-space-md py-space-sm border border-outline-variant/20 focus:border-primary/50 focus:outline-none transition-all"/>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-space-md bg-surface-container/50 rounded-xl p-space-md">
                <h3 className="text-on-surface font-semibold border-b border-outline-variant/10 pb-2 flex items-center justify-between">
                  <span>Assignment Suggestions</span>
                  <span className="text-xs font-normal text-on-surface-variant">Ordered by Lowest Workload</span>
                </h3>
                
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2">
                  {suggestions.filter(s => s.role !== 'INTERN').length === 0 ? (
                    <p className="text-on-surface-variant text-sm py-2 text-center">No developers available</p>
                  ) : suggestions.filter(s => s.role !== 'INTERN').map(dev => {
                    const isSelected = form.userId === dev.id;
                    const w = dev.workload || 0;
                    const isMismatch = dev.domainMatch === 'LOW';
                    const highWorkload = w > 70;
                    
                    return (
                      <div key={dev.id} onClick={() => setForm({...form, userId: dev.id})}
                        className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col gap-2 ${isSelected ? 'bg-primary-container/20 border-primary shadow-[0_0_12px_rgba(77,142,255,0.2)]' : 'bg-surface-container-low/50 border-outline-variant/10 hover:border-outline-variant/40 hover:bg-surface-container-low'}`}>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-on-surface flex items-center gap-2">
                            {dev.name}
                            {isSelected && <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${highWorkload ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {w}% Workload
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-on-surface-variant">Domain: {dev.primaryDomain}</span>
                          <span className="text-on-surface-variant text-[10px]">Ticket: {form.domain}</span>
                        </div>

                        {/* Mismatch Decision Support Info */}
                        {isMismatch && (
                          <div className={`mt-1 flex flex-col gap-1 p-2 rounded border ${highWorkload ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'} text-[10px] font-semibold tracking-wide`}>
                            {highWorkload && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> ⚠ HIGH WORKLOAD</span>}
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> ⚠ DOMAIN MISMATCH</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Interns section */}
                  <h3 className="text-on-surface font-semibold border-b border-outline-variant/10 pb-2 mt-4 flex items-center justify-between">
                    <span>Supporting Intern</span>
                    <span className="text-xs font-normal text-on-surface-variant">Optional</span>
                  </h3>
                  {suggestions.filter(s => s.role === 'INTERN').length === 0 ? (
                    <p className="text-on-surface-variant text-sm py-2 text-center">No interns assigned to you yet.</p>
                  ) : suggestions.filter(s => s.role === 'INTERN').map(intern => {
                    const isSelected = form.internId === intern.id;
                    return (
                      <div key={intern.id} onClick={() => setForm({...form, internId: isSelected ? '' : intern.id})}
                        className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col gap-1 ${isSelected ? 'bg-tertiary/20 border-tertiary shadow-[0_0_12px_rgba(200,100,255,0.2)]' : 'bg-surface-container-low/50 border-outline-variant/10 hover:border-outline-variant/40 hover:bg-surface-container-low'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-on-surface flex items-center gap-2">
                            {intern.name}
                            {isSelected && <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>}
                          </span>
                          <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">INTERN</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-space-md pt-space-sm border-t border-outline-variant/10">
              <button onClick={() => setShowModal(false)}
                className="px-space-lg py-space-sm rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-label-md transition-all">Cancel</button>
              <button onClick={handleSave}
                className="px-space-lg py-space-sm rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary font-label-md font-semibold shadow-[0_4px_16px_rgba(77,142,255,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                {editTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
