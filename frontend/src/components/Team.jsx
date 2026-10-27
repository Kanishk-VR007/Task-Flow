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
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [teamSuccessMsg, setTeamSuccessMsg] = useState('');
  
  // Rich Team Builder State
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    domain: 'FULLSTACK',
    lead: {
      name: '',
      email: '',
      password: 'Welcome@123',
      domain: 'BACKEND',
    },
    members: [], // array of { name, email, role: 'DEVELOPER' | 'JUNIOR_DEV', password, domain }
    interns: [], // array of { name, email, password, domain, supervisorEmail }
  });

  // Single User Form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'DEVELOPER',
    primaryDomain: 'BACKEND',
    teamId: '',
    password: 'Welcome@123'
  });
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
      const userList = Array.isArray(u) ? u : [];
      const teamList = Array.isArray(tm) ? tm : [];
      setUsers(userList);
      setProfile(me || getUser() || null);
      setTasks(Array.isArray(t) ? t : []);
      setTeamsData(teamList);
      
      if (me && me.role === 'TEAM_LEAD' && me.teamName) {
        setSelectedTeam(me.teamName);
      }

      // If user is PM and has 0 teams, trigger popup once per session if not dismissed
      const isPmUser = me?.role === 'PROJECT_MANAGER' || profile?.role === 'PROJECT_MANAGER';
      if (isPmUser && teamList.length === 0 && !sessionStorage.getItem('createTeamPrompted')) {
        sessionStorage.setItem('createTeamPrompted', 'true');
        setShowNewTeamModal(true);
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Compile all teams: prioritize teamsData from DB, supplemented with any legacy team names from users
  const uniqueTeams = [];
  const seenTeamNames = new Set();

  teamsData.forEach(t => {
    if (t.teamName && !seenTeamNames.has(t.teamName.toLowerCase())) {
      seenTeamNames.add(t.teamName.toLowerCase());
      uniqueTeams.push(t);
    }
  });

  users.forEach(u => {
    if (u.teamName && !seenTeamNames.has(u.teamName.toLowerCase())) {
      seenTeamNames.add(u.teamName.toLowerCase());
      uniqueTeams.push({ id: `user-team-${u.teamName}`, teamName: u.teamName, domain: u.primaryDomain || 'GENERAL' });
    }
  });

  const isPM = profile?.role === 'PROJECT_MANAGER' || profile?.role === 'ADMIN';

  // Builder Helpers
  const addMemberRow = () => {
    setTeamForm(prev => ({
      ...prev,
      members: [
        ...prev.members,
        { name: '', email: '', role: 'DEVELOPER', password: 'Welcome@123', domain: 'BACKEND' }
      ]
    }));
  };

  const removeMemberRow = (index) => {
    setTeamForm(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const updateMemberRow = (index, field, value) => {
    setTeamForm(prev => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, members: updated };
    });
  };

  const addInternRow = () => {
    setTeamForm(prev => ({
      ...prev,
      interns: [
        ...prev.interns,
        { name: '', email: '', password: 'Welcome@123', domain: 'FRONTEND', supervisorEmail: '' }
      ]
    }));
  };

  const removeInternRow = (index) => {
    setTeamForm(prev => ({
      ...prev,
      interns: prev.interns.filter((_, i) => i !== index)
    }));
  };

  const updateInternRow = (index, field, value) => {
    setTeamForm(prev => {
      const updated = [...prev.interns];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, interns: updated };
    });
  };

  const resetTeamForm = () => {
    setTeamForm({
      teamName: '',
      domain: 'FULLSTACK',
      lead: { name: '', email: '', password: 'Welcome@123', domain: 'BACKEND' },
      members: [],
      interns: []
    });
  };

  // Submit Rich Team Builder
  const handleBuildTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    setIsSubmittingTeam(true);
    try {
      const payload = {
        teamName: teamForm.teamName.trim(),
        domain: teamForm.domain,
        lead: teamForm.lead.email ? teamForm.lead : null,
        members: teamForm.members.filter(m => m.email && m.email.trim()),
        interns: teamForm.interns.filter(i => i.email && i.email.trim())
      };

      await api.post('/api/users/teams/build', payload);
      setTeamSuccessMsg(`Team "${teamForm.teamName}" created successfully with all credentials provisioned!`);
      resetTeamForm();
      setShowNewTeamModal(false);
      fetchData();
      setTimeout(() => setTeamSuccessMsg(''), 5000);
    } catch (err) {
      alert('Error building team: ' + (err.message || 'Please check input data'));
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/add', newUser);
      setNewUser({ name: '', email: '', role: 'DEVELOPER', primaryDomain: 'BACKEND', teamId: '', password: 'Welcome@123' });
      setShowAddUserModal(false);
      fetchData();
    } catch (err) {
      alert('Error adding user: ' + (err.message || 'Failed to add'));
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

  const renderOrganizationView = () => {
    if (uniqueTeams.length === 0) {
      return (
        <div className="rounded-3xl bg-surface-container/40 p-12 backdrop-blur-xl border border-outline-variant/10 text-center flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(77,142,255,0.3)]">
            <span className="material-symbols-outlined text-primary text-4xl animate-pulse">group_add</span>
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Create Your First Team</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              No teams have been created for your organization yet. Build your engineering team, assign team leads, developers, and interns with professional emails and secure default passwords.
            </p>
          </div>

          <button
            onClick={() => { resetTeamForm(); setShowNewTeamModal(true); }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-tertiary hover:opacity-95 text-white font-semibold text-sm shadow-[0_0_24px_rgba(77,142,255,0.4)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Build Engineering Team</span>
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        {uniqueTeams.map(team => {
          const teamName = team.teamName;
          const teamMembers = users.filter(u => 
            (u.teamId && team.id && u.teamId.toString() === team.id.toString()) ||
            (u.teamName && u.teamName.toLowerCase() === teamName.toLowerCase())
          );
          const lead = teamMembers.find(u => u.role === 'TEAM_LEAD');
          const workload = teamMembers.length > 0 
            ? Math.round(teamMembers.reduce((sum, u) => sum + (u.effectiveWorkload || 0), 0) / teamMembers.length)
            : 0;
          
          return (
            <div key={team.id || teamName} onClick={() => setSelectedTeam(teamName)}
              className="taskflow-card cursor-pointer group rounded-2xl bg-surface-container/60 p-space-xl backdrop-blur-md border border-outline-variant/10 hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center border border-primary/20 shadow-inner group-hover:shadow-[0_0_15px_rgba(77,142,255,0.4)] transition-all">
                      <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">{teamName}</h2>
                      <span className="text-[11px] text-on-surface-variant/80 uppercase font-semibold tracking-wider">
                        {team.domain || 'FULLSTACK'}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
                </div>

                <div className="flex flex-col gap-3">
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
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/10">
                <div className="flex justify-between items-center text-xs mb-1.5 text-on-surface-variant">
                  <span>Workload Capacity</span>
                  <span className="font-mono">{workload}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full ${getWorkloadColor(workload)} transition-all duration-1000 taskflow-glow`} style={{ width: `${Math.min(workload, 100)}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTeamView = () => {
    const teamMembers = users.filter(u => 
      u.teamName && selectedTeam && u.teamName.toLowerCase() === selectedTeam.toLowerCase()
    );

    return (
      <div className="flex flex-col gap-6">
        {teamMembers.length === 0 ? (
          <div className="p-12 text-center bg-surface-container/40 rounded-2xl border border-outline-variant/10 flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">person_off</span>
            <p className="text-on-surface-variant">No members assigned to {selectedTeam} yet.</p>
            {isPM && (
              <button onClick={() => setShowAddUserModal(true)} className="px-4 py-2 bg-primary rounded-xl text-white font-semibold text-sm">
                + Add Member to this Team
              </button>
            )}
          </div>
        ) : (
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
                  className="taskflow-card cursor-pointer group rounded-2xl bg-surface-container/60 p-space-lg backdrop-blur-md border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden">
                  
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
                      <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-1000 taskflow-glow"
                        style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-space-xl">
      {/* Toast Notification */}
      {teamSuccessMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="font-medium text-sm">{teamSuccessMsg}</span>
          </div>
          <button onClick={() => setTeamSuccessMsg('')} className="text-emerald-300 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

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
          <p className="font-body-md text-body-md text-on-surface-variant">
            {selectedTeam ? `Managing roster and workloads for ${selectedTeam}` : 'Manage and monitor all teams across your organization'}
          </p>
        </div>
        
        {isPM && (
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => { resetTeamForm(); setShowNewTeamModal(true); }} 
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-tertiary hover:opacity-90 transition-all text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              <span>Create Team</span>
            </button>
            <button 
              onClick={() => setShowAddUserModal(true)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-bright transition-colors text-on-surface border border-outline-variant/20 rounded-xl font-semibold text-sm cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg animate-pulse">
           {Array.from({length: 3}).map((_, i) => <div key={i} className="rounded-2xl bg-surface-container/40 h-56"></div>)}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Role</label>
                    <select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface">
                      <option value="TEAM_LEAD">TEAM_LEAD</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="JUNIOR_DEV">JUNIOR_DEV</option>
                      <option value="INTERN">INTERN</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Primary Domain</label>
                    <input type="text" value={editUser.primaryDomain} onChange={e => setEditUser({...editUser, primaryDomain: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Assign Team</label>
                  <select value={editUser.teamId} onChange={e => setEditUser({...editUser, teamId: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface">
                    <option value="">No Team</option>
                    {teamsData.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setIsEditingUser(false)} className="px-4 py-2 rounded bg-surface-container text-on-surface">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-semibold">Save Changes</button>
                </div>
              </form>
            ) : null}

            {/* Interns Supervised Section */}
            {(selectedDeveloper.role === 'DEVELOPER' || selectedDeveloper.role === 'TEAM_LEAD') && (
              <div className="bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-on-surface">Supervised Interns</span>
                  {isPM && (
                    <button onClick={() => setShowAssignInternModal(true)} className="text-xs text-primary font-semibold hover:underline">
                      + Assign Intern
                    </button>
                  )}
                </div>
                {selectedDeveloper.supervisedInterns && selectedDeveloper.supervisedInterns.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDeveloper.supervisedInterns.map(intern => (
                      <div key={intern.id} className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/10 flex items-center gap-2">
                        <span className="text-xs text-on-surface">{intern.name}</span>
                        {isPM && (
                          <button onClick={() => handleRemoveIntern(intern.id)} className="text-on-surface-variant hover:text-error">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-on-surface-variant">No interns assigned to mentor.</span>
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

      {/* RICH TEAM BUILDER MODAL */}
      {showNewTeamModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setShowNewTeamModal(false)}>
          <div className="bg-surface-container-highest p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-outline-variant/20 my-8 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                  <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Build Engineering Team</h2>
                  <p className="text-xs text-on-surface-variant">Create team, appoint leadership, and provision team member credentials</p>
                </div>
              </div>
              <button onClick={() => setShowNewTeamModal(false)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBuildTeam} className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* SECTION 1: Team Fundamentals */}
              <div className="bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10 flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">domain</span> Team Information
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Team Name *</label>
                    <input 
                      required 
                      type="text" 
                      value={teamForm.teamName} 
                      onChange={e => setTeamForm({...teamForm, teamName: e.target.value})} 
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm focus:border-primary focus:outline-none transition-all" 
                      placeholder="e.g. Platform Core Squad" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Engineering Domain</label>
                    <select 
                      value={teamForm.domain} 
                      onChange={e => setTeamForm({...teamForm, domain: e.target.value})} 
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="FULLSTACK">FULLSTACK</option>
                      <option value="BACKEND">BACKEND</option>
                      <option value="FRONTEND">FRONTEND</option>
                      <option value="MOBILE">MOBILE (iOS / Android)</option>
                      <option value="DEVOPS">DEVOPS & CLOUD</option>
                      <option value="DATABASE">DATA & DATABASE</option>
                      <option value="AI_ML">AI / MACHINE LEARNING</option>
                      <option value="TESTING">QA & TESTING</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Team Lead */}
              <div className="bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">star</span> Team Lead (Optional)
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Will manage sprints & review team code</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Lead Full Name</label>
                    <input 
                      type="text" 
                      value={teamForm.lead.name} 
                      onChange={e => setTeamForm({...teamForm, lead: {...teamForm.lead, name: e.target.value}})} 
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm focus:border-primary focus:outline-none" 
                      placeholder="e.g. Arun Kumar" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Professional Email</label>
                    <input 
                      type="email" 
                      value={teamForm.lead.email} 
                      onChange={e => setTeamForm({...teamForm, lead: {...teamForm.lead, email: e.target.value}})} 
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm focus:border-primary focus:outline-none" 
                      placeholder="e.g. arun@company.com" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Default Login Password</label>
                    <input 
                      type="text" 
                      value={teamForm.lead.password} 
                      onChange={e => setTeamForm({...teamForm, lead: {...teamForm.lead, password: e.target.value}})} 
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm font-mono focus:border-primary focus:outline-none" 
                      placeholder="Default password" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant mb-1 block">Primary Domain</label>
                    <input 
                      type="text" 
                      value={teamForm.lead.domain} 
                      onChange={e => setTeamForm({...teamForm, lead: {...teamForm.lead, domain: e.target.value}})} 
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm focus:border-primary focus:outline-none" 
                      placeholder="e.g. BACKEND" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Team Members */}
              <div className="bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">code</span> Developers & Junior Devs ({teamForm.members.length})
                  </span>
                  <button 
                    type="button" 
                    onClick={addMemberRow}
                    className="text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add</span> Add Member
                  </button>
                </div>

                {teamForm.members.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/70 italic py-2">No individual developers added yet. Click &ldquo;Add Member&rdquo; to add developers.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {teamForm.members.map((m, idx) => (
                      <div key={idx} className="bg-surface-container-high/60 p-3 rounded-xl border border-outline-variant/10 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-on-surface-variant">Member #{idx + 1}</span>
                          <button type="button" onClick={() => removeMemberRow(idx)} className="text-on-surface-variant hover:text-error">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input 
                            type="text" 
                            required 
                            placeholder="Full Name" 
                            value={m.name} 
                            onChange={e => updateMemberRow(idx, 'name', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface" 
                          />
                          <input 
                            type="email" 
                            required 
                            placeholder="Professional Email" 
                            value={m.email} 
                            onChange={e => updateMemberRow(idx, 'email', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface" 
                          />
                          <select 
                            value={m.role} 
                            onChange={e => updateMemberRow(idx, 'role', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                          >
                            <option value="DEVELOPER">Developer (Mid/Senior)</option>
                            <option value="JUNIOR_DEV">Junior Developer</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="Default Password" 
                            value={m.password} 
                            onChange={e => updateMemberRow(idx, 'password', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono" 
                          />
                          <input 
                            type="text" 
                            placeholder="Domain (e.g. FRONTEND)" 
                            value={m.domain} 
                            onChange={e => updateMemberRow(idx, 'domain', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: Interns */}
              <div className="bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">school</span> Interns ({teamForm.interns.length})
                  </span>
                  <button 
                    type="button" 
                    onClick={addInternRow}
                    className="text-xs bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add</span> Add Intern
                  </button>
                </div>

                {teamForm.interns.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/70 italic py-2">No interns added. Click &ldquo;Add Intern&rdquo; to add engineering interns.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {teamForm.interns.map((intern, idx) => (
                      <div key={idx} className="bg-surface-container-high/60 p-3 rounded-xl border border-outline-variant/10 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-on-surface-variant">Intern #{idx + 1}</span>
                          <button type="button" onClick={() => removeInternRow(idx)} className="text-on-surface-variant hover:text-error">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            required 
                            placeholder="Intern Full Name" 
                            value={intern.name} 
                            onChange={e => updateInternRow(idx, 'name', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface" 
                          />
                          <input 
                            type="email" 
                            required 
                            placeholder="Intern Email" 
                            value={intern.email} 
                            onChange={e => updateInternRow(idx, 'email', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface" 
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input 
                            type="text" 
                            placeholder="Default Password" 
                            value={intern.password} 
                            onChange={e => updateInternRow(idx, 'password', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono" 
                          />
                          <input 
                            type="text" 
                            placeholder="Domain (e.g. FRONTEND)" 
                            value={intern.domain} 
                            onChange={e => updateInternRow(idx, 'domain', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface" 
                          />
                          <select 
                            value={intern.supervisorEmail} 
                            onChange={e => updateInternRow(idx, 'supervisorEmail', e.target.value)} 
                            className="bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                          >
                            <option value="">Supervisor (Lead/Dev)</option>
                            {teamForm.lead.email && <option value={teamForm.lead.email}>{teamForm.lead.name || 'Team Lead'} (Lead)</option>}
                            {teamForm.members.filter(m => m.email).map((m, mi) => (
                              <option key={mi} value={m.email}>{m.name || m.email}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/10">
                <button 
                  type="button" 
                  disabled={isSubmittingTeam}
                  onClick={() => setShowNewTeamModal(false)} 
                  className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingTeam}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-tertiary hover:opacity-90 text-white font-semibold text-sm shadow-lg shadow-primary/30 transition-all cursor-pointer">
                  {isSubmittingTeam ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      <span>Provisioning Team...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Build & Provision Team</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowAddUserModal(false)}>
          <div className="bg-surface-container-highest p-6 rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/20" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-on-surface mb-4">Add Individual Member</h2>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Full Name</label>
                  <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface text-sm" placeholder="e.g. Sarah Connor" />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Work Email</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface text-sm" placeholder="sarah@company.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface text-sm">
                    <option value="TEAM_LEAD">TEAM_LEAD</option>
                    <option value="DEVELOPER">DEVELOPER</option>
                    <option value="JUNIOR_DEV">JUNIOR_DEV</option>
                    <option value="INTERN">INTERN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Team Assignment</label>
                  <select value={newUser.teamId} onChange={e => setNewUser({...newUser, teamId: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface text-sm">
                    <option value="">Unassigned</option>
                    {uniqueTeams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Primary Domain</label>
                  <input required type="text" value={newUser.primaryDomain} onChange={e => setNewUser({...newUser, primaryDomain: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface text-sm" placeholder="e.g. BACKEND" />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">Default Password</label>
                  <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-on-surface font-mono text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white font-semibold text-sm">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
