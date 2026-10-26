import React, { useEffect, useState, useRef } from 'react';
import { api, getUser } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('TEAM'); // 'TEAM', 'GLOBAL', or `TASK_${id}`
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => getUser() || {});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/api/users/me').then(u => {
      setUser(u || getUser() || {});
      if (['ADMIN', 'PROJECT_MANAGER'].includes((u || user).role)) {
        setActiveTab('GLOBAL');
      }
      fetchMessages(u || user);
      fetchTasks();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = () => {
    api.get('/tasks/GetallData').then(data => {
      setTasks(Array.isArray(data) ? data : []);
    }).catch(() => setTasks([]));
  };

  const fetchMessages = (u = user) => {
    if (!u) return;
    setLoading(true);
    let targetTab = activeTab;
    if (['ADMIN', 'PROJECT_MANAGER'].includes(u.role) && targetTab === 'TEAM') {
      targetTab = 'GLOBAL';
    }

    let endpoint = null;
    if (targetTab === 'GLOBAL') {
      endpoint = '/api/chat/global-leads';
    } else if (targetTab.startsWith('TASK_')) {
      endpoint = `/api/chat/task/${targetTab.split('_')[1]}`;
    } else if (u.teamId) {
      endpoint = `/api/chat/team/${u.teamId}`;
    } else {
      setMessages([]);
      setLoading(false);
      return;
    }
    
    api.get(endpoint).then(data => {
      setMessages(Array.isArray(data) ? data : []);
      setLoading(false);
      scrollToBottom();
    }).catch(e => {
      console.error(e);
      setMessages([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    
    const dto = {
      channelType: activeTab === 'GLOBAL' ? 'LEAD_GLOBAL' : activeTab.startsWith('TASK_') ? 'TASK_COLLABORATION' : 'INTER_TEAM',
      teamId: user.teamId,
      taskId: activeTab.startsWith('TASK_') ? activeTab.split('_')[1] : null,
      content: input
    };

    const endpoint = activeTab === 'GLOBAL' ? '/api/chat/send' : activeTab.startsWith('TASK_') ? '/api/chat/send' : `/api/chat/team/${user.teamId}`;
    
    try {
      await api.post(endpoint, dto);
      setInput('');
      fetchMessages();
    } catch (e) {
      alert("Failed to send: " + e.message);
    }
  };

  if (!user) return <div className="p-8 text-on-surface-variant">Loading user context...</div>;

  const canViewGlobal = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'].includes(user.role);
  const canViewTeam = user.teamId != null || ['ADMIN', 'PROJECT_MANAGER'].includes(user.role);
  
  const myTasks = tasks.filter(t => 
    (t.user && t.user.id === user.id) || 
    (t.intern && t.intern.id === user.id) || 
    ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) || 
    (user.role === 'TEAM_LEAD' && t.user && t.user.team && t.user.team.id === user.teamId)
  );

  return (
    <div className="flex flex-col gap-space-xl h-[calc(100vh-140px)]">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Communication Hub</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Collaborate with your team, interns, and management</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-space-lg h-full overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
          {canViewTeam && (
            <button onClick={() => setActiveTab('TEAM')}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'TEAM' ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary/20' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`}>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">groups</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Team Chat</span>
                <span className="text-xs opacity-80">{user.teamName || 'Your Team'}</span>
              </div>
            </button>
          )}

          {canViewGlobal && (
            <button onClick={() => setActiveTab('GLOBAL')}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'GLOBAL' ? 'bg-tertiary-container text-on-tertiary-container shadow-lg shadow-tertiary/20' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`}>
              <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">admin_panel_settings</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Management</span>
                <span className="text-xs opacity-80">Global Leadership</span>
              </div>
            </button>
          )}

          <div className="mt-4 mb-2">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-2">Task Collaborations</h3>
          </div>
          {myTasks.length === 0 && <p className="text-sm text-on-surface-variant px-2">No active tasks</p>}
          {myTasks.map(t => (
            <button key={t.id} onClick={() => setActiveTab(`TASK_${t.id}`)}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === `TASK_${t.id}` ? 'bg-secondary-container text-on-secondary-container shadow-lg shadow-secondary/20 border border-secondary/30' : 'bg-surface-container-low hover:bg-surface-container border border-transparent'}`}>
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="font-semibold text-sm truncate w-full">{t.taskName}</span>
                <div className="flex gap-2 items-center text-xs opacity-80 mt-1">
                  <span>Dev: {t.user ? t.user.name || t.user.userName : 'N/A'}</span>
                  {t.intern && <span>| Intern: {t.intern.name || t.intern.userName}</span>}
                </div>
              </div>
              {t.completionStatus === 'COMPLETED' && <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 rounded-2xl bg-surface-container/60 backdrop-blur-xl border border-outline-variant/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="p-space-lg border-b border-outline-variant/10 bg-surface-container-low/50 backdrop-blur-md flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary">{activeTab === 'GLOBAL' ? 'admin_panel_settings' : activeTab.startsWith('TASK_') ? 'work' : 'groups'}</span>
              <div>
                <h2 className="font-headline-sm text-on-surface">
                  {activeTab === 'GLOBAL' ? 'Management Chat' : activeTab.startsWith('TASK_') ? 'Private Collaboration' : `${user.teamName || 'Team'} Chat`}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {activeTab === 'GLOBAL' ? 'Restricted to PMs and TLs' : activeTab.startsWith('TASK_') ? 'Only visible to Dev, Intern and Leads' : 'Internal team communication'}
                </p>
              </div>
            </div>
            {activeTab.startsWith('TASK_') && (
              <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-on-surface-variant border border-outline-variant/20 shadow-inner">ACTIVE</span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-md bg-surface-container-lowest/30 relative z-0">
            {loading && messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-6xl mb-2">forum</span>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const senderName = msg.sender?.name || msg.sender?.userName || msg.sender?.email || msg.senderName || 'User';
                const senderRole = msg.sender?.role || 'USER';
                const isMe = msg.sender?.id === user.id || msg.sender?.email === user.email || senderName === user.name || senderName === user.email;
                return (
                  <div key={msg.id || i} className={`anti-gravity-card flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'} transition-transform hover:-translate-y-1`}>
                    <TaskFlowAvatar user={msg.sender || {name: senderName}} size="small" className="w-8 h-8 mt-1 flex-shrink-0" />
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-on-surface-variant mb-1 flex items-center gap-2 px-1">
                        <span className="font-semibold text-on-surface">{senderName}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest rounded font-bold tracking-wider">{senderRole.replace('_', ' ')}</span>
                        <span className="opacity-70">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                      </span>
                      <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-primary text-on-primary rounded-tr-sm shadow-[0_4px_12px_rgba(77,142,255,0.3)]' : 'bg-surface-container-high text-on-surface rounded-tl-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)]'} text-sm leading-relaxed backdrop-blur-md`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-space-md border-t border-outline-variant/10 bg-surface-container/50">
            {activeTab.startsWith('TASK_') && tasks.find(t => t.id === Number(activeTab.split('_')[1]))?.completionStatus === 'COMPLETED' ? (
              <div className="flex items-center justify-center p-3 text-sm text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/20 italic shadow-inner">
                <span className="material-symbols-outlined text-[18px] mr-2">lock</span>
                This task is completed. The collaboration chat is archived.
              </div>
            ) : (
              <form onSubmit={sendMessage} className="flex items-center gap-space-sm relative">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-surface-container-lowest text-on-surface rounded-full pl-5 pr-12 py-3 border border-outline-variant/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner"
                />
                <button type="submit" disabled={!input.trim()}
                  className="absolute right-2 p-2 rounded-full bg-primary text-on-primary hover:bg-inverse-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(77,142,255,0.3)]">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
