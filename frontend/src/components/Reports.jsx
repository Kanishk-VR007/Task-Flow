import React, { useEffect, useState } from 'react';
import { api, getUser, API_BASE } from '../utils/api';
import TaskFlowAvatar from './TaskFlowAvatar';

const sampleArtifactPresets = [
  {
    name: 'Security_Audit_Report.md',
    type: 'text/markdown',
    size: 1420,
    content: `# Security & Access Control Review Report
**Author:** TaskFlow Security Implementation Team
**Target Module:** /api/reports & /auth/login
**Audit Status:** PENDING TEAM LEAD SIGN-OFF

## Executive Summary
Comprehensive vulnerability analysis and role-based access validation for TaskFlow microservices.

### 1. Cryptographic Compliance
- [x] Passwords hashed using SHA-256 with cryptographically secure salt algorithms
- [x] JWT sessions enforced with 24-hour expiration and automatic token rotation
- [x] Strict CORS origin policies verified across cross-origin backend filters

### 2. Role-Based Permissions Matrix
| Role | Reports Read | Reports Submit | Review Action |
|---|---|---|---|
| DEVELOPER | Own reports | Assigned tasks | ❌ Denied |
| TEAM_LEAD | Team reports | Assigned tasks | ✅ Approved (Team Scope) |
| PROJECT_MANAGER | All reports | All tasks | ✅ Approved (Global) |
| ADMIN | All reports | All tasks | ✅ Full Root |

### 3. Code Inspection Notes
- SQL Injection mitigation: All Hibernate queries utilize parameterized entity mappings.
- No plain-text secrets discovered in repository or environment files.
- Endpoints enforce Spring Security @PreAuthorize method annotations.

### 4. Recommendation
All 42 unit and integration regression suites passed with 98.4% coverage. Ready for staging deployment upon Team Lead confirmation.`
  },
  {
    name: 'AuthService_Implementation.js',
    type: 'application/javascript',
    size: 2150,
    content: `/**
 * TaskFlow Authentication & Access Layer
 * Enterprise-grade session orchestration and permission validator
 */
import { api } from '../utils/api';

export class AuthenticationOrchestrator {
  constructor(config = {}) {
    this.sessionTimeoutMs = config.timeout || 86400000; // 24 hours
    this.activeRole = null;
    this.auditTrail = [];
  }

  /**
   * Validates whether current reviewer has authority to review report
   * @param {Object} reviewer - User entity
   * @param {Object} report - TaskReport entity
   * @returns {Object} authorization result
   */
  async validateReviewAuthority(reviewer, report) {
    if (!reviewer || !reviewer.role) {
      throw new Error("InvalidSecurityContext: User is not authenticated");
    }

    // Admins and PMs enjoy global review permissions
    if (['ADMIN', 'PROJECT_MANAGER'].includes(reviewer.role)) {
      return { allowed: true, scope: 'GLOBAL_ADMIN' };
    }

    // Team Leads can review reports belonging to their own team members
    if (reviewer.role === 'TEAM_LEAD') {
      const reviewerTeamId = reviewer.team?.id;
      const devTeamId = report.developer?.team?.id;

      if (reviewerTeamId && devTeamId && reviewerTeamId === devTeamId) {
        return {
          allowed: true,
          scope: 'TEAM_BOUNDED',
          reason: \`Authorized Team Lead for Team \${reviewerTeamId}\`
        };
      }

      return {
        allowed: false,
        scope: 'DENIED',
        reason: 'Cross-team report inspection prohibited by TaskFlow policy'
      };
    }

    return { allowed: false, scope: 'DENIED', reason: 'Developer roles cannot review peer reports' };
  }

  logAudit(action, reportId, actor) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      reportId,
      actor: actor.name || actor.email
    };
    this.auditTrail.push(entry);
    console.info("[AUDIT]", entry);
  }
}`
  },
  {
    name: 'Performance_Benchmark.json',
    type: 'application/json',
    size: 890,
    content: `{
  "benchmarkSuite": "TaskFlow High-Throughput Pipeline v2.4",
  "executionDate": "2026-10-26T18:00:00Z",
  "testEnvironment": {
    "runtime": "Node v20.11.0 / Spring Boot 3.3.0",
    "database": "MySQL 8.0 InnoDB Engine",
    "concurrencyWorkers": 16,
    "networkProfile": "Local Loopback (<1ms)"
  },
  "metrics": {
    "totalTransactions": 50000,
    "successfulRequests": 49998,
    "failedRequests": 2,
    "p50LatencyMs": 14.2,
    "p95LatencyMs": 31.8,
    "p99LatencyMs": 48.5,
    "throughputRps": 2480.6,
    "cpuUtilizationPercent": 42.1,
    "heapAllocationMb": 384
  },
  "slaThreshold": {
    "targetMaxLatencyMs": 80.0,
    "targetMinThroughputRps": 1500.0,
    "complianceStatus": "PASSED (Exceeded by +38.6%)"
  }
}`
  },
  {
    name: 'AIoT_System_Architecture.pdf',
    type: 'application/pdf',
    size: 1084461,
    content: '',
    url: '/api/reports/files/AIOT S1.pdf'
  }
];

const revisionRequestPresets = [
  'Add unit test coverage for edge cases & null safety',
  'Optimize query performance and reduce latency',
  'Refactor code complexity and extract helper functions',
  'Sanitize all user inputs to prevent injection vulnerabilities',
  'Update API documentation and parameter schemas',
  'Include integration test verification results'
];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(() => getUser() || {});
  const [loading, setLoading] = useState(true);

  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [form, setForm] = useState({
    taskId: '',
    title: '',
    description: '',
    fileName: '',
    fileType: '',
    fileSize: 0,
    fileContent: '',
    fileUrl: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Review Modal State (for Team Lead & PM)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'APPROVED', reviewFeedback: '' });

  // In-App File Viewer / Inspector Modal State
  const [viewingFileReport, setViewingFileReport] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

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

  const isReportPdf = (report) => {
    if (!report) return false;
    const name = (report.fileName || report.fileUrl || '').toLowerCase();
    const type = (report.fileType || '').toLowerCase();
    const content = typeof report.fileContent === 'string' ? report.fileContent : '';
    return (
      type === 'application/pdf' ||
      name.endsWith('.pdf') ||
      content.startsWith('%PDF') ||
      content.startsWith('data:application/pdf')
    );
  };

  const pdfUrlCache = React.useRef(new Map());
  const getReportPdfUrl = (report) => {
    if (!report) return '';
    const cacheKey = `${report.id || ''}_${report.fileName || ''}_${report.fileUrl || ''}_${(report.fileContent || '').slice(0, 30)}`;
    if (pdfUrlCache.current.has(cacheKey)) {
      return pdfUrlCache.current.get(cacheKey);
    }

    let url = '';
    const name = report.fileName || (report.fileUrl ? report.fileUrl.split('/').pop() : '');
    
    // 1. If report has a valid fileUrl on the backend
    if (report.fileUrl) {
      if (report.fileUrl.startsWith('http://') || report.fileUrl.startsWith('https://')) {
        url = report.fileUrl;
      } else if (report.fileUrl.startsWith('/api/reports/files/')) {
        url = `${API_BASE}${report.fileUrl}`;
      } else if (report.fileUrl.startsWith('/uploads/')) {
        const cleanName = report.fileUrl.replace('/uploads/', '');
        url = `${API_BASE}/api/reports/files/${encodeURIComponent(cleanName)}`;
      }
    }

    // 2. If report has data URL in fileContent
    if (!url && typeof report.fileContent === 'string') {
      if (report.fileContent.startsWith('data:application/pdf')) {
        url = report.fileContent;
      } else if (report.fileContent.startsWith('%PDF')) {
        try {
          const len = report.fileContent.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = report.fileContent.charCodeAt(i) & 0xff;
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          url = URL.createObjectURL(blob);
        } catch (e) {
          console.error("Error creating PDF blob:", e);
        }
      }
    }

    // 3. Fallback to backend files endpoint if filename is known
    if (!url && name && name.toLowerCase().endsWith('.pdf')) {
      url = `${API_BASE}/api/reports/files/${encodeURIComponent(name)}`;
    }

    if (url) {
      pdfUrlCache.current.set(cacheKey, url);
    }
    return url;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    setUploadError(null);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload('/api/reports/upload', formData);
      setForm(prev => ({
        ...prev,
        fileUrl: res.fileUrl,
        fileName: res.fileName,
        fileType: res.fileType,
        fileSize: res.fileSize,
        fileContent: res.fileContent
      }));
    } catch (err) {
      // Fallback: read directly in browser via FileReader
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target.result;
          setForm(prev => ({
            ...prev,
            fileName: file.name,
            fileType: file.type || (isPdf ? 'application/pdf' : 'text/plain'),
            fileSize: file.size,
            fileContent: result,
            fileUrl: `/uploads/${file.name}`
          }));
        };
        reader.onerror = () => {
          setUploadError(`Failed to read file locally: ${err?.message || 'Read error'}`);
        };
        if (file.type.startsWith('image/') || isPdf) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      } catch (fallbackErr) {
        setUploadError(`Upload failed: ${fallbackErr?.message || err?.message || 'Error processing file'}`);
      }
    } finally {
      setUploadingFile(false);
    }
  };

  const applyPresetArtifact = (preset) => {
    setUploadError(null);
    setForm(prev => ({
      ...prev,
      fileName: preset.name,
      fileType: preset.type,
      fileSize: preset.size,
      fileContent: preset.content || '',
      fileUrl: preset.url || `/mock_artifacts/${preset.name}`
    }));
  };

  const handleSubmit = async () => {
    if (!form.taskId || !form.title) return alert("Task and Title are required");
    try {
      await api.post(`/api/reports/submit/${form.taskId}`, form);
      setShowSubmitModal(false);
      setForm({
        taskId: '',
        title: '',
        description: '',
        fileName: '',
        fileType: '',
        fileSize: 0,
        fileContent: '',
        fileUrl: ''
      });
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadFile = (report) => {
    if (isReportPdf(report)) {
      const pdfUrl = getReportPdfUrl(report);
      if (pdfUrl) {
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = report.fileName || 'document.pdf';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
    }
    const content = report.fileContent || report.description || 'No content';
    const filename = report.fileName || `${report.title.replace(/\s+/g, '_')}.txt`;
    const blob = new Blob([content], { type: report.fileType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || !user) return <div className="p-8 text-on-surface">Loading TaskFlow Reports...</div>;

  const isReviewer = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'].includes(user.role);
  const myCompletedTasks = tasks.filter(t => t.user?.id === user.id && t.completionStatus === 'COMPLETED');

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'REDO_REQUESTED') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (status === 'UNDER_REVIEW') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  };

  const getFileBadge = (report) => {
    const isPdf = isReportPdf(report);
    const name = report.fileName || (report.fileUrl ? report.fileUrl.split('/').pop() : null);
    if (!name && !report.fileContent && !isPdf) {
      return (
        <span className="text-xs text-on-surface-variant/50 italic flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">notes</span> Text Only
        </span>
      );
    }
    const lower = (name || '').toLowerCase();
    let badgeColor = 'bg-primary-container/20 text-primary border-primary/20';
    let icon = 'description';

    if (isPdf) {
      badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      icon = 'picture_as_pdf';
    } else if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.java') || lower.endsWith('.py')) {
      badgeColor = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      icon = 'code';
    } else if (lower.endsWith('.json') || lower.endsWith('.yml') || lower.endsWith('.yaml')) {
      badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      icon = 'data_object';
    } else if (lower.endsWith('.md')) {
      badgeColor = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      icon = 'article';
    } else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.svg')) {
      badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      icon = 'image';
    }

    return (
      <button
        onClick={() => setViewingFileReport(report)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium hover:scale-105 transition-all cursor-pointer shadow-sm ${badgeColor}`}
        title="Click to view file in application"
      >
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        <span className="max-w-[140px] truncate">{name || (isPdf ? 'Deliverable Document.pdf' : 'Attached Artifact')}</span>
        <span className="material-symbols-outlined text-[12px] opacity-70">visibility</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-space-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight flex items-center gap-3">
            <span>Reports & Code Review</span>
            {isReviewer && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono font-bold tracking-normal uppercase">
                {user.role.replace('_', ' ')} REVIEWER
              </span>
            )}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isReviewer 
              ? 'Inspect deliverables, review submitted code artifacts in-app, and manage approval requests' 
              : 'Submit completed task artifacts, view Team Lead review requests, and deliver revised versions'}
          </p>
        </div>
        {!isReviewer && (
          <button
            onClick={() => {
              setForm({
                taskId: '',
                title: '',
                description: '',
                fileName: '',
                fileType: '',
                fileSize: 0,
                fileContent: '',
                fileUrl: ''
              });
              setShowSubmitModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-inverse-primary transition-all shadow-[0_0_20px_rgba(77,142,255,0.4)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span className="font-semibold text-sm">Submit New Report</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REDO_REQUESTED'].map(status => {
          const count = reports.filter(r => r.status === status).length;
          const config = {
            SUBMITTED: { label: 'Pending Review', color: 'text-sky-400', icon: 'pending_actions', bg: 'bg-sky-500/10' },
            UNDER_REVIEW: { label: 'In Review', color: 'text-amber-400', icon: 'visibility', bg: 'bg-amber-500/10' },
            APPROVED: { label: 'Approved', color: 'text-emerald-400', icon: 'check_circle', bg: 'bg-emerald-500/10' },
            REDO_REQUESTED: { label: 'Revision Requests', color: 'text-rose-400', icon: 'replay', bg: 'bg-rose-500/10' }
          }[status];
          return (
            <div key={status} className="taskflow-card bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-4 flex items-center justify-between shadow-sm backdrop-blur-md">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{config.label}</span>
                <span className={`text-3xl font-extrabold ${config.color}`}>{count}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center ${config.color}`}>
                <span className="material-symbols-outlined text-[24px]">{config.icon}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports Table */}
      <div className="bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 overflow-hidden backdrop-blur-md shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high/80 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/10">
            <tr>
              <th className="px-6 py-4">Deliverable / Task</th>
              <th className="px-6 py-4">Developer</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Attached Artifact</th>
              <th className="px-6 py-4">Review Status</th>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {reports.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">folder_open</span>
                    <span className="font-medium">No reports submitted yet</span>
                    <span className="text-xs text-on-surface-variant/60">Completed task deliverables will appear here for Team Lead code review.</span>
                  </div>
                </td>
              </tr>
            )}
            {reports.map(report => (
              <tr key={report.id} className="hover:bg-surface-container/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{report.title}</span>
                    <span className="text-xs text-on-surface-variant/70 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">task_alt</span>
                      Task: {report.task?.taskName || 'Unnamed Task'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <TaskFlowAvatar user={report.developer || {name: 'Developer'}} size="small" className="w-7 h-7" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface text-xs">{report.developer?.name || 'Developer'}</span>
                      <span className="text-[10px] text-on-surface-variant/60">{report.developer?.role || 'DEVELOPER'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] font-bold text-primary border border-outline-variant/10">
                    v{report.version}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getFileBadge(report)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border w-fit ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    {report.status === 'REDO_REQUESTED' && report.reviewFeedback && (
                      <span className="text-[10px] text-rose-400 font-mono truncate max-w-[200px]" title={report.reviewFeedback}>
                        ⚠️ Requests: {report.reviewFeedback}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">
                  {report.submissionDate ? new Date(report.submissionDate).toLocaleDateString() : 'Today'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* View File Button */}
                    <button
                      onClick={() => setViewingFileReport(report)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium border border-outline-variant/10 transition-all flex items-center gap-1 cursor-pointer"
                      title="Inspect attached deliverable inside TaskFlow"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span className="hidden sm:inline">Inspect</span>
                    </button>

                    {/* Review Button for Team Lead */}
                    {isReviewer ? (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setReviewForm({
                            status: report.status === 'SUBMITTED' ? 'APPROVED' : report.status,
                            reviewFeedback: report.reviewFeedback || ''
                          });
                          setShowReviewModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-primary-container text-on-primary-container rounded-lg hover:bg-primary hover:text-white transition-all text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">rate_review</span>
                        <span>Review</span>
                      </button>
                    ) : (
                      report.status === 'REDO_REQUESTED' ? (
                        <button
                          onClick={() => {
                            setForm({
                              taskId: report.task?.id || '',
                              title: report.title,
                              description: report.description,
                              fileName: report.fileName || '',
                              fileType: report.fileType || '',
                              fileSize: report.fileSize || 0,
                              fileContent: report.fileContent || '',
                              fileUrl: report.fileUrl || ''
                            });
                            setShowSubmitModal(true);
                          }}
                          className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">replay</span>
                          <span>Revise & Resubmit</span>
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant/50">Submitted</span>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* 1. IN-APP FILE VIEWER / INSPECTOR MODAL                       */}
      {/* ============================================================== */}
      {viewingFileReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6" onClick={() => setViewingFileReport(null)}>
          <div className="bg-[#0b101b] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-outline-variant/20 overflow-hidden text-on-surface" onClick={e => e.stopPropagation()}>
            
            {/* Top Inspector Header */}
            <div className="px-6 py-4 bg-surface-container-high/90 border-b border-outline-variant/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl ${isReportPdf(viewingFileReport) ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-primary-container/20 border-primary/30 text-primary'} border flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[22px]">
                    {isReportPdf(viewingFileReport) ? 'picture_as_pdf' : viewingFileReport.fileName?.endsWith('.json') ? 'data_object' : 'code'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-on-surface truncate">
                      {viewingFileReport.fileName || (isReportPdf(viewingFileReport) ? `${viewingFileReport.title}.pdf` : `${viewingFileReport.title}.md`)}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-container text-primary border border-primary/20 shrink-0">
                      v{viewingFileReport.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant/70 mt-0.5">
                    <span>Task: <strong>{viewingFileReport.task?.taskName || 'General Deliverable'}</strong></span>
                    <span>•</span>
                    <span>Author: <strong>{viewingFileReport.developer?.name || 'Developer'}</strong></span>
                    {viewingFileReport.fileSize && (
                      <>
                        <span>•</span>
                        <span>{(viewingFileReport.fileSize / 1024).toFixed(1)} KB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Inspector Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isReportPdf(viewingFileReport) ? (
                  <>
                    <button
                      onClick={() => {
                        const url = getReportPdfUrl(viewingFileReport);
                        if (url) window.open(url, '_blank');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant/10 transition-all cursor-pointer"
                      title="Open PDF in a new tab"
                    >
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      <span>Open in New Tab</span>
                    </button>
                    <button
                      onClick={() => downloadFile(viewingFileReport)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-inverse-primary text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Download PDF</span>
                    </button>
                  </>
                ) : (
                  <>
                    {viewingFileReport.fileContent && (
                      <>
                        <button
                          onClick={() => setShowLineNumbers(!showLineNumbers)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${showLineNumbers ? 'bg-primary-container text-on-primary-container border-primary/30' : 'bg-surface-container text-on-surface-variant border-outline-variant/10'}`}
                          title="Toggle line numbers"
                        >
                          # Lines
                        </button>
                        <button
                          onClick={() => copyToClipboard(viewingFileReport.fileContent)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant/10 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">{copiedCode ? 'check' : 'content_copy'}</span>
                          <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => downloadFile(viewingFileReport)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-inverse-primary text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Download</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewingFileReport(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Document / Code Viewport */}
            <div className={`flex-1 ${isReportPdf(viewingFileReport) ? 'overflow-hidden p-2 bg-[#070b14]' : 'overflow-auto bg-[#070b14] p-4'} font-mono text-sm relative`}>
              {isReportPdf(viewingFileReport) ? (
                <div className="w-full h-full flex flex-col rounded-xl overflow-hidden bg-white border border-outline-variant/20 shadow-inner relative">
                  <iframe
                    src={getReportPdfUrl(viewingFileReport)}
                    title={viewingFileReport.fileName || "PDF Deliverable Preview"}
                    className="w-full h-full border-0 rounded-xl"
                  />
                </div>
              ) : viewingFileReport.fileContent ? (
                <div className="flex">
                  {showLineNumbers && (
                    <div className="select-none text-right pr-4 text-outline-variant/50 font-mono text-xs leading-6 border-r border-outline-variant/10 shrink-0">
                      {viewingFileReport.fileContent.split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                  )}
                  <div className="pl-4 overflow-x-auto text-cyan-200/90 font-mono text-xs leading-6 flex-1 whitespace-pre">
                    {viewingFileReport.fileContent}
                  </div>
                </div>
              ) : viewingFileReport.fileUrl && viewingFileReport.fileUrl.startsWith('http') ? (
                <iframe
                  src={viewingFileReport.fileUrl}
                  title="Deliverable File Preview"
                  className="w-full h-full rounded-xl border border-outline-variant/20 bg-white"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
                  <span className="material-symbols-outlined text-[48px] text-primary/40">description</span>
                  <div className="text-base font-bold text-on-surface">Deliverable Content</div>
                  <p className="max-w-md text-center text-xs leading-relaxed text-on-surface-variant/80">
                    {viewingFileReport.description || 'No direct text content attached. You can download the deliverable or review the summary description.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status / Reviewer bar */}
            <div className="px-6 py-3 bg-surface-container-high/90 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{isReportPdf(viewingFileReport) ? 'In-App Interactive PDF Viewer Active' : 'In-App Code Inspector Active'}</span>
                <span>•</span>
                <span className="font-mono">{viewingFileReport.fileType || (isReportPdf(viewingFileReport) ? 'application/pdf' : 'text/plain')}</span>
              </div>
              {isReviewer && (
                <button
                  onClick={() => {
                    const rep = viewingFileReport;
                    setViewingFileReport(null);
                    setSelectedReport(rep);
                    setReviewForm({
                      status: rep.status === 'SUBMITTED' ? 'APPROVED' : rep.status,
                      reviewFeedback: rep.reviewFeedback || ''
                    });
                    setShowReviewModal(true);
                  }}
                  className="px-3 py-1 bg-primary text-on-primary rounded font-bold hover:bg-inverse-primary transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">rate_review</span>
                  <span>Proceed to Review Report</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TEAM LEAD REVIEW MODAL (WITH FILE PREVIEW & REVISION CHIPS) */}
      {/* ============================================================== */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-surface-container-high rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-outline-variant/20 shadow-2xl overflow-hidden text-on-surface" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-surface-container-highest/60 border-b border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">rate_review</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Review Deliverable Report</h2>
                  <p className="text-xs text-on-surface-variant">Team Lead Review for Task: {selectedReport.task?.taskName}</p>
                </div>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Report Summary Card */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface text-base">{selectedReport.title}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-xs font-bold text-primary">
                    v{selectedReport.version}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-on-surface-variant/80">
                  <div className="flex items-center gap-1.5">
                    <TaskFlowAvatar user={selectedReport.developer || {}} size="small" className="w-5 h-5" />
                    <span>{selectedReport.developer?.name || 'Developer'}</span>
                  </div>
                  <span>•</span>
                  <span>Submitted {selectedReport.submissionDate ? new Date(selectedReport.submissionDate).toLocaleDateString() : 'Today'}</span>
                </div>
                <p className="text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10 leading-relaxed">
                  {selectedReport.description || 'No additional narrative description provided.'}
                </p>
              </div>

              {/* ATTACHED FILE INSPECTION PANEL */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      {isReportPdf(selectedReport) ? 'picture_as_pdf' : 'attach_file'}
                    </span>
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      {isReportPdf(selectedReport) ? 'Submitted PDF Deliverable' : 'Submitted Deliverable Artifact'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setViewingFileReport(selectedReport);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-inverse-primary shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_full</span>
                    <span>Open in Full Inspector</span>
                  </button>
                </div>

                {/* Inline Preview Snippet */}
                {isReportPdf(selectedReport) ? (
                  <div className="space-y-2">
                    <div className="w-full h-64 rounded-xl border border-outline-variant/20 overflow-hidden bg-white shadow-inner relative">
                      <iframe
                        src={getReportPdfUrl(selectedReport)}
                        title="PDF Inline Preview"
                        className="w-full h-full border-0"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant px-1">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Interactive PDF Deliverable Preview
                      </span>
                      <a
                        href={getReportPdfUrl(selectedReport)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                        Open in new tab
                      </a>
                    </div>
                  </div>
                ) : selectedReport.fileContent ? (
                  <div className="bg-[#070b14] rounded-lg p-3 font-mono text-xs text-cyan-200/90 max-h-40 overflow-y-auto border border-outline-variant/10 whitespace-pre">
                    {selectedReport.fileContent.slice(0, 500)}
                    {selectedReport.fileContent.length > 500 && '\n... (Click "Open in Full Inspector" to review full file)'}
                  </div>
                ) : (
                  <div className="bg-surface-container-low rounded-lg p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <span className="font-semibold text-on-surface">{selectedReport.fileName || selectedReport.fileUrl || 'Deliverable File Attached'}</span>
                    </div>
                    {selectedReport.fileUrl && (
                      <a
                        href={selectedReport.fileUrl.startsWith('http') ? selectedReport.fileUrl : `${API_BASE}${selectedReport.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span> Download
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Review Action Selector */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                  Review Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'APPROVED', label: 'Approve Report', icon: 'check_circle', color: 'hover:border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
                    { id: 'REDO_REQUESTED', label: 'Request Redo', icon: 'replay', color: 'hover:border-rose-500/40 text-rose-400 bg-rose-500/10' },
                    { id: 'UNDER_REVIEW', label: 'Mark Under Review', icon: 'visibility', color: 'hover:border-amber-500/40 text-amber-400 bg-amber-500/10' }
                  ].map(act => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, status: act.id })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                        reviewForm.status === act.id
                          ? `${act.color} ring-2 ring-primary border-transparent font-bold`
                          : 'border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                      <span className="text-xs">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* REPORT-RELATED REQUESTS & FEEDBACK SECTION */}
              {reviewForm.status === 'REDO_REQUESTED' && (
                <div className="space-y-2 p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">assignment_late</span>
                      Required Revisions & Specific Requests
                    </label>
                    <span className="text-[10px] text-rose-400/80">Click preset chips to append</span>
                  </div>

                  {/* Preset Request Chips */}
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {revisionRequestPresets.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          const existing = reviewForm.reviewFeedback ? reviewForm.reviewFeedback + '\n- ' : '- ';
                          setReviewForm({
                            ...reviewForm,
                            reviewFeedback: existing + preset
                          });
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container hover:bg-rose-500/20 text-on-surface-variant hover:text-rose-300 border border-outline-variant/10 transition-all cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewForm.reviewFeedback}
                    onChange={e => setReviewForm({ ...reviewForm, reviewFeedback: e.target.value })}
                    className="w-full mt-1 bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-rose-500/30 focus:border-rose-500 focus:outline-none text-xs font-mono h-28 leading-relaxed"
                    placeholder="Specify exact changes requested for the developer before this can be approved..."
                  />
                </div>
              )}

              {/* APPROVAL COMMENDATION NOTE (Optional) */}
              {reviewForm.status === 'APPROVED' && (
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                    Approval Commendation / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.reviewFeedback}
                    onChange={e => setReviewForm({ ...reviewForm, reviewFeedback: e.target.value })}
                    className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-outline-variant/20 focus:border-emerald-500 text-xs"
                    placeholder="e.g. Excellent code quality, thorough test coverage. Approved for production."
                  />
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-surface-container-highest/60 border-t border-outline-variant/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReview}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                  reviewForm.status === 'APPROVED'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                    : reviewForm.status === 'REDO_REQUESTED'
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {reviewForm.status === 'APPROVED' ? 'check' : reviewForm.status === 'REDO_REQUESTED' ? 'replay' : 'save'}
                </span>
                <span>
                  {reviewForm.status === 'APPROVED' ? 'Confirm Approval' : reviewForm.status === 'REDO_REQUESTED' ? 'Submit Redo Request' : 'Save Status'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DEVELOPER SUBMIT REPORT MODAL (WITH REAL UPLOAD & PRESETS) */}
      {/* ============================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => { setShowSubmitModal(false); setUploadError(null); }}>
          <div className="bg-surface-container-high rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-outline-variant/20 shadow-2xl overflow-hidden text-on-surface" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="px-6 py-4 bg-surface-container-highest/60 border-b border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Submit Deliverable Report</h2>
                  <p className="text-xs text-on-surface-variant">Attach completed work artifacts for Team Lead review</p>
                </div>
              </div>
              <button onClick={() => { setShowSubmitModal(false); setUploadError(null); }} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-semibold text-on-surface-variant block mb-1">Select Completed Task *</label>
                <select
                  value={form.taskId}
                  onChange={e => setForm({ ...form, taskId: e.target.value })}
                  className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2.5 border border-outline-variant/20 focus:border-primary text-xs"
                >
                  <option value="">-- Select Completed Task --</option>
                  {myCompletedTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.taskName} (ID: #{t.id})</option>
                  ))}
                  {tasks.length > 0 && myCompletedTasks.length === 0 && (
                    <option value={tasks[0].id}>{tasks[0].taskName} (Demo Override #{tasks[0].id})</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-on-surface-variant block mb-1">Report Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-outline-variant/20 focus:border-primary text-xs"
                  placeholder="e.g. Authentication Orchestration & Role Security Layer"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface-variant block mb-1">Description / Release Notes</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 border border-outline-variant/20 focus:border-primary h-20 text-xs"
                  placeholder="Detail the technical implementation, architectural decisions, and verification steps..."
                />
              </div>

              {/* File Attachment & Presets */}
              <div className="space-y-2 border border-outline-variant/15 p-3.5 rounded-xl bg-surface-container-low/60">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-on-surface uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">attach_file</span>
                    Deliverable File (Real Upload or Presets)
                  </label>
                  {uploadingFile && <span className="text-primary animate-pulse">Uploading file...</span>}
                </div>

                {/* Real File Input */}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-on-primary hover:file:bg-inverse-primary cursor-pointer transition-all"
                />

                {uploadError && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-[11px] bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <span className="material-symbols-outlined text-[15px]">error</span>
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[10px] text-on-surface-variant/70 block mb-1">Or choose a quick demo artifact preset:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleArtifactPresets.map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPresetArtifact(preset)}
                        className={`text-[10px] px-2.5 py-1 rounded-md border font-mono transition-all cursor-pointer ${
                          form.fileName === preset.name
                            ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-sm'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant/10'
                        }`}
                      >
                        📄 {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attached File Preview Card */}
                {form.fileName && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high border border-primary/20 text-xs mt-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                      <span className="font-mono font-bold text-on-surface truncate">{form.fileName}</span>
                      <span className="text-on-surface-variant/70">({(form.fileSize / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, fileName: '', fileType: '', fileSize: 0, fileContent: '', fileUrl: '' });
                        setUploadError(null);
                      }}
                      className="text-on-surface-variant hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-container-highest/60 border-t border-outline-variant/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  setUploadError(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-inverse-primary text-xs font-bold shadow-lg shadow-primary/30 cursor-pointer"
              >
                Submit Report for Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
