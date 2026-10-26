import React, { useEffect, useState } from 'react';
import { api, getUser } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(() => getUser() || {});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [form, setForm] = useState({ taskId: '', title: '', description: '', fileUrl: '' });
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'APPROVED', reviewFeedback: '' });

  useEffect(() => {
    Promise.all([
      api.get('/api/users/me').catch(() => null),
      api.get('/api/reports/all').catch(() => []),
      api.get('/tasks/GetallData').catch(() => [])
    ]).then(([uData, rData, tData]) => {
      setUser(uData || getUser() || {});
      setReports(Array.isArray(rData) ? rData : []);
      setTasks(Array.isArray(tData) ? tData : []);
      setLoading(false);
    });
  }, []);

  const fetchReports = () => {
    api.get('/api/reports/all').then(data => setReports(Array.isArray(data) ? data : []));
  };

  const handleSubmit = async () => {
    if (!form.taskId || !form.title) return alert("Task and Title are required");
    try {
      await api.post(`/api/reports/submit/${form.taskId}`, form);
      setShowSubmitModal(false);
      fetchReports();
    } catch(e) {
      alert("Error: " + e.message);
    }
  };

  const handleReview = async () => {
    try {
      await api.put(`/api/reports/review/${selectedReport.id}`, reviewForm);
      setShowReviewModal(false);
      fetchReports();
    } catch(e) {
      alert("Error: " + e.message);
    }
  };

  if (loading || !user) return <div className="p-8">Loading reports...</div>;

  const isReviewer = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'].includes(user.role);
  const myCompletedTasks = tasks.filter(t => t.user?.id === user.id && t.completionStatus === 'COMPLETED');

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'REDO_REQUESTED') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (status === 'UNDER_REVIEW') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  };

  return (
    <div className="flex flex-col gap-space-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Reports</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Submit and review task completion reports</p>
        </div>
        {!isReviewer && (
          <button onClick={() => { setForm({taskId: '', title: '', description: '', fileUrl: ''}); setShowSubmitModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-inverse-primary transition-all shadow-[0_0_15px_rgba(77,142,255,0.4)]">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span className="font-semibold">Submit Report</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REDO_REQUESTED'].map(status => (
          <div key={status} className="anti-gravity-card bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-4 flex flex-col gap-2 shadow-sm backdrop-blur-md">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{status.replace('_', ' ')}</h3>
            <span className="text-3xl font-bold text-on-surface">{reports.filter(r => r.status === status).length}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 overflow-hidden backdrop-blur-md shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high text-on-surface-variant uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-4">Task & Project</th>
              <th className="px-6 py-4">Developer</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {reports.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">No reports found</td></tr>
            )}
            {reports.map(report => (
              <tr key={report.id} className="hover:bg-surface-container/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">{report.title}</span>
                    <span className="text-xs text-on-surface-variant">Task: {report.task?.taskName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TaskFlowAvatar user={report.developer || {name: 'Unknown'}} size="small" className="w-6 h-6" />
                    <span className="font-medium text-on-surface">{report.developer?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-on-surface-variant font-mono">v{report.version}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider border ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-on-surface-variant">
                  {new Date(report.submissionDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {isReviewer ? (
                    <button onClick={() => { setSelectedReport(report); setReviewForm({ status: 'APPROVED', reviewFeedback: '' }); setShowReviewModal(true); }} className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded hover:bg-primary hover:text-white transition-all text-xs font-semibold">Review</button>
                  ) : (
                    report.status === 'REDO_REQUESTED' ? (
                      <button onClick={() => { setForm({taskId: report.task.id, title: report.title, description: report.description, fileUrl: report.fileUrl}); setShowSubmitModal(true); }} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold">Revise</button>
                    ) : (
                      <span className="text-xs text-on-surface-variant">View Only</span>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)}>
          <div className="bg-surface-container-high rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 border border-outline-variant/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-on-surface">Submit Task Report</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Select Completed Task</label>
                <select value={form.taskId} onChange={e => setForm({...form, taskId: e.target.value})} className="w-full mt-1 bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-outline-variant/20 focus:border-primary">
                  <option value="">-- Select Task --</option>
                  {myCompletedTasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Report Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full mt-1 bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-outline-variant/20 focus:border-primary" placeholder="e.g. API Security Impl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full mt-1 bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-outline-variant/20 focus:border-primary h-24" placeholder="Detail the work done..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Report File (Mock Upload)</label>
                <input type="file" className="w-full mt-1 text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary hover:file:text-white transition-all" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowSubmitModal(false)} className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-inverse-primary shadow-lg shadow-primary/30">Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}>
          <div className="bg-surface-container-high rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 border border-outline-variant/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-on-surface">Review Report</h2>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 text-sm">
              <p><strong className="text-on-surface">Title:</strong> {selectedReport.title}</p>
              <p className="mt-1"><strong className="text-on-surface">Developer:</strong> {selectedReport.developer?.name}</p>
              <p className="mt-1"><strong className="text-on-surface">Task:</strong> {selectedReport.task?.taskName}</p>
              <p className="mt-2"><strong className="text-on-surface">Description:</strong> {selectedReport.description}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Review Action</label>
                <select value={reviewForm.status} onChange={e => setReviewForm({...reviewForm, status: e.target.value})} className="w-full mt-1 bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-outline-variant/20 focus:border-primary">
                  <option value="APPROVED">Approve</option>
                  <option value="REDO_REQUESTED">Request Redo</option>
                </select>
              </div>
              {reviewForm.status === 'REDO_REQUESTED' && (
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant">Reason for Redo</label>
                  <textarea value={reviewForm.reviewFeedback} onChange={e => setReviewForm({...reviewForm, reviewFeedback: e.target.value})} className="w-full mt-1 bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-rose-500/30 focus:border-rose-500 h-24" placeholder="e.g. API error handling needs additional test coverage..." />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowReviewModal(false)} className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container">Cancel</button>
              <button onClick={handleReview} className={`px-4 py-2 rounded-lg text-white font-semibold shadow-lg ${reviewForm.status === 'APPROVED' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>Confirm Action</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
