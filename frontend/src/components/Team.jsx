import React, { useEffect, useState } from 'react';
import { api, getUser } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(() => getUser() || null);

  // Drill Down State
  const [selectedTeam, setSelectedTeam] = useState(null); // String (team name)
  const [selectedDeveloper, setSelectedDeveloper] = useState(null); // User object
  const [selectedTask, setSelectedTask] = useState(null); // Task object

  // Management State
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  
  // Forms
  const [newTeamName, setNewTeamName] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'DEVELOPER', primaryDomain: 'BACKEND', teamId: '' });
  const [editUser, setEditUser] = useState({ role: '', primaryDomain: '', teamId: '' });
  
  // Intern Assignment
  const [showAssignInternModal, setShowAssignInternModal] = useState(false);
  const [selectedInternForAssignment, setSelectedInternForAssignment] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/users/all').catch(() => []),
      api.get('/api/users/me').catch(() => null),
      api.get('/tasks/GetallData').catch(() => []),
      api.get('/api/users/teams').catch(() => [])
    ]).then(([u, me, t, tm]) => {
      setUsers(Array.isArray(u) ? u : []);
      setProfile(me || getUser() || null);
      setTasks(Array.isArray(t) ? t : []);
      setTeamsData(Array.isArray(tm) ? tm : []);
      
      if (me && me.role === 'TEAM_LEAD' && me.teamName) {
        setSelectedTeam(me.teamName);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const roleColors = {
    ADMIN: { bg: 'bg-rose-500/15', text: 'text-rose-400', icon: 'shield' },
    PROJECT_MANAGER: { bg: 'bg-violet-500/15', text: 'text-violet-400', icon: 'account_tree' },
    TEAM_LEAD: { bg: 'bg-sky-500/15', text: 'text-sky-400', icon: 'supervisor_account' },
    DEVELOPER: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: 'code' },
    JUNIOR_DEV: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: 'school' },
    INTERN: { bg: 'bg-slate-500/15', text: 'text-slate-400', icon: 'person' },
  };

  const getWorkloadColor = (score) => {
    if (score >= 80) return 'bg-rose-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const teams = [...new Set(users.map(u => u.teamName).filter(Boolean))];
  const isPM = profile?.role === 'PROJECT_MANAGER' || profile?.role === 'ADMIN';

  // Management Handlers
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/teams', { teamName: newTeamName });
      setNewTeamName('');
      setShowNewTeamModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating team');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/add', newUser);
      setNewUser({ name: '', email: '', role: 'DEVELOPER', primaryDomain: 'BACKEND', teamId: '' });
      setShowAddUserModal(false);
      fetchData();
    } catch (err) {
      alert('Error adding user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${selectedDeveloper.id}/role`, editUser);
      setIsEditingUser(false);
      
      const updatedUser = { ...selectedDeveloper, ...editUser };
      if (editUser.teamId) {
         const t = teamsData.find(t => t.id.toString() === editUser.teamId.toString());
         if (t) updatedUser.teamName = t.teamName;
      }
      setSelectedDeveloper(updatedUser);
      fetchData();
    } catch (err) {
      alert('Error updating user');
    }
  };

  const startEditing = () => {
    setEditUser({
      role: selectedDeveloper.role,
      primaryDomain: selectedDeveloper.primaryDomain || '',
      teamId: selectedDeveloper.teamId || ''
    });
    setIsEditingUser(true);
  };

  const handleAssignIntern = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${selectedInternForAssignment}/supervisor`, { supervisorId: selectedDeveloper.id });
      setShowAssignInternModal(false);
      setSelectedInternForAssignment('');
      fetchData();
      
      // Update selectedDeveloper with new intern
      const intern = users.find(u => u.id.toString() === selectedInternForAssignment);
      if (intern) {
        setSelectedDeveloper(prev => ({
          ...prev,
          supervisedInterns: [...(prev.supervisedInterns || []), { id: intern.id, name: intern.name }]
        }));
      }
    } catch (err) {
      alert('Error assigning intern');
    }
  };

  const handleRemoveIntern = async (internId) => {
    try {
      await api.put(`/api/users/${internId}/supervisor`, { supervisorId: null });
      fetchData();
      setSelectedDeveloper(prev => ({
        ...prev,
        supervisedInterns: (prev.supervisedInterns || []).filter(i => i.id !== internId)
      }));
    } catch (err) {
      alert('Error removing intern');
    }
  };

  // --- VIEWS ---

  const renderOrganizationView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
      {teams.map(teamName => {
        const teamMembers = users.filter(u => u.teamName === teamName);
        const lead = teamMembers.find(u => u.role === 'TEAM_LEAD');
        const workload = Math.round(teamMembers.reduce((sum, u) => sum + (u.effectiveWorkload || 0), 0) / (teamMembers.length || 1));
        
        return (
          <div key={teamName} onClick={() => setSelectedTeam(teamName)}
            className="anti-gravity-card cursor-pointer group rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center border border-primary/20 shadow-inner group-hover:shadow-[0_0_15px_rgba(77,142,255,0.4)] transition-all">
                  <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                </div>
                <h2 className="font-headline-sm text-on-surface group-hover:text-primary transition-colors">{teamName}</h2>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-sm text-on-surface-variant bg-surface-container-low/50 p-3 rounded-lg border border-outline-variant/5">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Team Lead</span>
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
                  {lead ? lead.name : 'Unassigned'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low/50 p-3 rounded-lg border border-outline-variant/5 text-center">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider block mb-1">Members</span>
                  <span className="font-bold text-lg text-on-surface">{teamMembers.length}</span>
                </div>
                <div className="bg-surface-container-low/50 p-3 rounded-lg border border-outline-variant/5 text-center">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider block mb-1">Avg Workload</span>
                  <span className={`font-bold text-lg ${workload > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>{workload}%</span>
                </div>
              </div>
              <div className="mt-2 group/progress">
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full ${getWorkloadColor(workload)} transition-all duration-1000 anti-gravity-glow`} style={{ width: `${Math.min(workload, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTeamView = () => {
    const teamMembers = users.filter(u => u.teamName === selectedTeam);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
        {teamMembers.map(user => {
          const rc = roleColors[user.role] || roleColors.DEVELOPER;
          const workload = user.effectiveWorkload || 0;
          const userTasks = tasks.filter(t => t.user && t.user.id === user.id);
          const tasksAssigned = userTasks.length;
          const tasksCompleted = userTasks.filter(t => t.completionStatus === 'COMPLETED').length;
          const progress = tasksAssigned ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
          
          return (
            <div key={user.id} onClick={() => setSelectedDeveloper(user)}
              className="anti-gravity-card cursor-pointer group rounded-2xl bg-surface-container/60 p-space-lg backdrop-blur-md border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden">
              
              {user.role === 'TEAM_LEAD' && (
                <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-b border-l border-amber-500/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">star</span>
                  LEAD
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <TaskFlowAvatar user={user} size="medium" />
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface-container ${workload > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  </div>
                  <div>
                    <h3 className="font-body-lg text-on-surface font-bold leading-tight group-hover:text-primary transition-colors">{user.name || 'Unknown'}</h3>
                    <p className="font-body-sm text-on-surface-variant/80 text-xs mt-0.5">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md ${rc.bg} ${rc.text} font-label-sm text-[10px] uppercase font-bold tracking-wider`}>
                  <span className="material-symbols-outlined text-[14px]">{rc.icon}</span>
                  {(user.role || 'DEVELOPER').replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] uppercase font-bold tracking-wider border border-outline-variant/10">
                  {user.primaryDomain || 'GENERAL'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/5 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Workload</span>
                  <span className={`text-sm font-bold ${workload > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>{workload}%</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-outline-variant/10 pl-2">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Assigned</span>
                  <span className="text-sm font-bold text-on-surface">{tasksAssigned}</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-outline-variant/10 pl-2">
                  <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Completed</span>
                  <span className="text-sm font-bold text-emerald-400">{tasksCompleted}</span>
                </div>
              </div>

              <div className="mt-1 group/progress">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-label-sm text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Progress</span>
                  <span className="font-label-sm text-xs text-primary font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-1000 anti-gravity-glow"
                    style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-space-xl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-on-surface-variant">
            <span className="cursor-pointer hover:text-primary transition-colors font-medium" onClick={() => { setSelectedTeam(null); setSelectedDeveloper(null); setSelectedTask(null); }}>
              {isPM ? 'Organization' : 'My Team'}
            </span>
            {selectedTeam && (
              <>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="cursor-pointer hover:text-primary transition-colors font-medium" onClick={() => { setSelectedDeveloper(null); setSelectedTask(null); }}>
                  {selectedTeam}
                </span>
              </>
            )}
            {selectedDeveloper && (
              <>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-primary font-bold">{selectedDeveloper.name}</span>
              </>
            )}
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Team Overview</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Drill down into organizational workload</p>
        </div>
        
        {isPM && (
          <div className="flex gap-2">
            <button onClick={() => setShowNewTeamModal(true)} className="px-4 py-2 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors text-on-surface border border-outline-variant/10 text-sm font-semibold">
              Create Team
            </button>
            <button onClick={() => setShowAddUserModal(true)} className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/90 transition-colors text-white font-semibold text-sm shadow-lg shadow-primary/20">
              + Add Person
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg animate-pulse">
           {Array.from({length: 4}).map((_, i) => <div key={i} className="rounded-xl bg-surface-container/40 h-44"></div>)}
        </div>
      ) : !selectedTeam && isPM ? (
        renderOrganizationView()
      ) : renderTeamView()}

      {/* DEVELOPER DRILL DOWN MODAL */}
      {selectedDeveloper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm" onClick={() => { setSelectedDeveloper(null); setIsEditingUser(false); }}>
          <div className="bg-surface-container-lowest h-full w-full max-w-2xl shadow-2xl border-l border-outline-variant/20 p-space-xl flex flex-col gap-space-lg overflow-y-auto animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
              <div className="flex items-center gap-4">
                <TaskFlowAvatar user={selectedDeveloper} size="large" className="w-16 h-16" />
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-3">
                    {selectedDeveloper.name} 
                    {isPM && !isEditingUser && (
                      <button onClick={startEditing} className="text-xs bg-surface-container px-2 py-1 rounded text-primary hover:bg-primary/10 transition-colors">Edit</button>
                    )}
                  </h2>
                  <p className="text-sm text-on-surface-variant">{selectedDeveloper.role.replace('_', ' ')} • {selectedDeveloper.primaryDomain}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedDeveloper(null); setIsEditingUser(false); }} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {isEditingUser ? (
              <form onSubmit={handleUpdateUser} className="bg-surface-container/30 p-6 rounded-xl border border-primary/20 flex flex-col gap-4">
                <h3 className="font-semibold text-primary">Edit User Management</h3>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Role</label>
                  <select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface">
                    <option value="TEAM_LEAD">TEAM_LEAD</option>
                    <option value="DEVELOPER">DEVELOPER</option>
                    <option value="JUNIOR_DEV">JUNIOR_DEV</option>
                    <option value="INTERN">INTERN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Team</label>
                  <select value={editUser.teamId} onChange={e => setEditUser({...editUser, teamId: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface">
                    <option value="">Unassigned</option>
                    {teamsData.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Primary Domain</label>
                  <input type="text" value={editUser.primaryDomain} onChange={e => setEditUser({...editUser, primaryDomain: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface" />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setIsEditingUser(false)} className="px-4 py-2 rounded bg-surface-container text-on-surface">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-primary text-white">Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                {/* Developer Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                <div className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Workload</div>
                <div className={`text-xl font-bold ${selectedDeveloper.effectiveWorkload > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedDeveloper.effectiveWorkload || 0}%</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                <div className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Avg Time</div>
                <div className="text-xl font-bold text-primary">{selectedDeveloper.averageCompletionTime || 0}h</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                <div className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Win Rate</div>
                <div className="text-xl font-bold text-emerald-400">{selectedDeveloper.completionRate || 0}%</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                <div className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Mentoring</div>
                <div className="text-xl font-bold text-tertiary">{selectedDeveloper.mentoringWorkload || 0}%</div>
              </div>
              </div>
              </>
            )}

            {/* Assigned Interns Section */}
            {(selectedDeveloper.role === 'DEVELOPER' || selectedDeveloper.role === 'JUNIOR_DEV') && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                  <h3 className="font-semibold text-on-surface">Assigned Interns</h3>
                  {(isPM || profile?.role === 'TEAM_LEAD') && (
                    <button onClick={() => setShowAssignInternModal(true)} className="text-xs bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5 rounded transition-colors font-semibold">
                      + Assign Intern
                    </button>
                  )}
                </div>
                {(!selectedDeveloper.supervisedInterns || selectedDeveloper.supervisedInterns.length === 0) ? (
                  <p className="text-sm text-on-surface-variant">No interns assigned.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDeveloper.supervisedInterns.map(intern => {
                      const fullIntern = users.find(u => u.id === intern.id) || intern;
                      return (
                      <div key={intern.id} className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/10 group/intern hover:border-primary/30 transition-all anti-gravity-card">
                        <div className="flex items-center gap-3">
                          <TaskFlowAvatar user={fullIntern} size="small" />
                          <span className="font-semibold text-sm text-on-surface">{intern.name}</span>
                        </div>
                        {(isPM || profile?.role === 'TEAM_LEAD') && (
                          <button onClick={() => handleRemoveIntern(intern.id)} className="text-xs text-rose-400 hover:text-rose-300 opacity-0 group-hover/intern:opacity-100 transition-opacity">
                            Remove
                          </button>
                        )}
                      </div>
                    )})}
                  </div>
                )}
              </div>
            )}

            {/* Tasks List */}
            <div className="flex flex-col gap-3 flex-1">
              <h3 className="font-semibold text-on-surface flex justify-between items-end border-b border-outline-variant/10 pb-2 mt-4">
                Assigned Tasks
              </h3>
              {tasks.filter(t => t.user?.id === selectedDeveloper.id).length === 0 ? (
                <p className="text-center text-on-surface-variant py-8">No tasks assigned to this developer.</p>
              ) : tasks.filter(t => t.user?.id === selectedDeveloper.id).map(t => (
                <div key={t.id} onClick={() => setSelectedTask(t)}
                  className="cursor-pointer bg-surface-container-low/50 hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 p-4 rounded-xl flex items-center justify-between transition-all">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">{t.taskName}</span>
                    <span className="text-xs text-on-surface-variant flex items-center gap-2 mt-1">
                      <span className="bg-surface-container px-1.5 py-0.5 rounded uppercase tracking-wider">{t.domain}</span>
                      <span className={`${t.priority==='CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>{t.priority}</span>
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.completionStatus === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {t.completionStatus.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">{t.progress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN INTERN MODAL */}
      {showAssignInternModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowAssignInternModal(false)}>
          <div className="bg-surface-container-highest p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-outline-variant/20" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-on-surface mb-4">Assign Intern to {selectedDeveloper?.name}</h2>
            <form onSubmit={handleAssignIntern} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-on-surface-variant mb-1 block">Select Intern</label>
                <select required value={selectedInternForAssignment} onChange={e => setSelectedInternForAssignment(e.target.value)} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface">
                  <option value="">Choose...</option>
                  {users
                    .filter(u => u.role === 'INTERN' && u.teamId === selectedDeveloper?.teamId)
                    .map(intern => (
                      <option key={intern.id} value={intern.id}>
                        {intern.name} {intern.supervisorId ? `(Currently assigned to ${users.find(d => d.id === intern.supervisorId)?.name || 'another'})` : ''}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAssignInternModal(false)} className="px-4 py-2 rounded bg-surface-container text-on-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-semibold">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK DRILL DOWN MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setSelectedTask(null)}>
          <div className="bg-surface-container-highest backdrop-blur-xl rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-md p-space-xl flex flex-col gap-space-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">task</span>
                <span className="font-headline-sm text-on-surface tracking-tight">Task Details</span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-body-lg text-on-surface font-bold mb-1">{selectedTask.taskName}</h3>
                <p className="text-sm text-on-surface-variant">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 grid grid-cols-2 gap-4 border border-outline-variant/10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Project</span>
                  <span className="text-sm text-on-surface">{selectedTask.project?.name || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Domain</span>
                  <span className="text-sm text-on-surface">{selectedTask.domain}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Priority</span>
                  <span className={`text-sm font-semibold ${selectedTask.priority==='CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>{selectedTask.priority}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Status</span>
                  <span className="text-sm text-on-surface">{selectedTask.completionStatus.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Est. Time</span>
                  <span className="text-sm text-on-surface">{selectedTask.estimatedHours || 0}h</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Deadline</span>
                  <span className="text-sm text-on-surface">{selectedTask.endTime ? new Date(selectedTask.endTime).toLocaleDateString() : 'None'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-on-surface-variant">Progress</span>
                  <span className="text-primary">{selectedTask.progress || 0}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container-low border border-outline-variant/10 overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-[0_0_8px_rgba(77,142,255,0.5)]" style={{ width: `${selectedTask.progress || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW TEAM MODAL */}
      {showNewTeamModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowNewTeamModal(false)}>
          <div className="bg-surface-container-highest p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-outline-variant/20" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-on-surface mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-on-surface-variant mb-1 block">Team Name</label>
                <input required type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface" placeholder="e.g. Mobile App Squad" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowNewTeamModal(false)} className="px-4 py-2 rounded bg-surface-container text-on-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowAddUserModal(false)}>
          <div className="bg-surface-container-highest p-6 rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/20" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-on-surface mb-4">Add New Person</h2>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Full Name</label>
                  <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface" />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Email</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface">
                    <option value="TEAM_LEAD">TEAM_LEAD</option>
                    <option value="DEVELOPER">DEVELOPER</option>
                    <option value="JUNIOR_DEV">JUNIOR_DEV</option>
                    <option value="INTERN">INTERN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Team</label>
                  <select value={newUser.teamId} onChange={e => setNewUser({...newUser, teamId: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface">
                    <option value="">Unassigned</option>
                    {teamsData.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-on-surface-variant mb-1 block">Primary Domain</label>
                <input required type="text" value={newUser.primaryDomain} onChange={e => setNewUser({...newUser, primaryDomain: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface" placeholder="e.g. BACKEND" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded bg-surface-container text-on-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-semibold">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
