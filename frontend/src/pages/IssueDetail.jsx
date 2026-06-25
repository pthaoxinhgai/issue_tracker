import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../api/issueService';
import { userService } from '../api/userService';
import { projectService } from '../api/projectService';
import { getAttachments, uploadAttachment } from '../services/attachment.service';
import { MessageSquare, User, Clock, Check, ArrowLeft, Paperclip, Download, Upload as UploadIcon, Copy, Search, AlertTriangle, Edit3, ArrowRightCircle, RefreshCcw, XCircle, PlayCircle, CheckCircle2, ShieldCheck, Timer } from 'lucide-react';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateData, setEscalateData] = useState({ reason: '', impactLevel: 'LOW', evidence: '' });
  
  const [showMerge, setShowMerge] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [showTriage, setShowTriage] = useState(false);
  const [triageData, setTriageData] = useState({
    type: 'BUG',
    priority: 'LOW',
    severity: 'S4',
    projectId: '',
    labels: ''
  });

  const [showQA, setShowQA] = useState(false);
  const [qaData, setQaData] = useState({ result: 'PASS', note: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [issueData, commentsData, attachmentsData, usersData, activitiesData] = await Promise.all([
        issueService.getById(id),
        issueService.getComments(id),
        getAttachments(id),
        userService.getAll().catch(() => []),
        issueService.getActivities(id).catch(() => [])
      ]);
      setIssue(issueData);
      setComments(commentsData);
      setAttachments(attachmentsData);
      setUsers(usersData);
      setActivities(activitiesData);
      setProjects(await projectService.getAll());
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const added = await issueService.addComment(id, newComment, isInternalComment);
      setComments([...comments, added]);
      setNewComment('');
      setIsInternalComment(false);
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleAssign = async (e) => {
    const userId = e.target.value;
    if (!userId) return;
    try {
      const updatedIssue = await issueService.assign(id, userId);
      setIssue(updatedIssue);
    } catch (error) {
      console.error('Failed to assign issue', error);
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      const updatedIssue = await issueService.escalate(id, escalateData.reason, escalateData.impactLevel, escalateData.evidence);
      setIssue(updatedIssue);
      setShowEscalate(false);
      const commentsData = await issueService.getComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to escalate', error);
      alert(error.response?.data?.message || 'Failed to escalate issue');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const results = await issueService.search(searchQuery);
      // Filter out current issue
      setSearchResults(results.filter(r => r.id !== issue.id));
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleMerge = async () => {
    if (!selectedPrimary) return;
    try {
      const updatedIssue = await issueService.merge(id, selectedPrimary.id);
      setIssue(updatedIssue);
      setShowMerge(false);
      const commentsData = await issueService.getComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to merge', error);
      alert(error.response?.data?.message || 'Failed to merge issue');
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      const updatedIssue = await issueService.changeStatus(id, newStatus);
      setIssue(updatedIssue);
      // Refresh comments and activities
      const commentsData = await issueService.getComments(id);
      setComments(commentsData);
      const acts = await issueService.getActivities(id);
      setActivities(acts);
    } catch (error) {
      console.error('Failed to change status', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAttachment(id, file);
      const attachmentsData = await getAttachments(id);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Failed to upload', error);
      alert('Failed to upload file');
    }
  };

  const openTriage = () => {
    setTriageData({
      type: issue.type || 'BUG',
      priority: issue.priority || 'LOW',
      severity: issue.severity || 'S4',
      projectId: issue.project?.id || '',
      labels: issue.labels ? issue.labels.join(', ') : ''
    });
    setShowTriage(true);
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        type: triageData.type,
        priority: triageData.priority,
        severity: triageData.severity,
        projectId: triageData.projectId || null,
        labels: triageData.labels.split(',').map(l => l.trim()).filter(l => l)
      };
      const updatedIssue = await issueService.update(id, updatedData);
      setIssue(updatedIssue);
      setShowTriage(false);
      // Refresh comments to get the activity log if needed
      const commentsData = await issueService.getComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to triage issue', error);
      alert('Failed to save triage data');
    }
  };

  const handleQASubmit = async (e) => {
    e.preventDefault();
    if (!qaData.note.trim()) {
      alert("Test note is required.");
      return;
    }
    
    try {
      const qaPrefix = qaData.result === 'PASS' ? '[QA PASS]' : '[QA FAIL]';
      const fullNote = `${qaPrefix} ${qaData.note}`;
      
      // Post the comment first
      const addedComment = await issueService.addComment(id, fullNote);
      
      // Then change status
      const nextStatus = qaData.result === 'PASS' ? 'RESOLVED' : 'IN_PROGRESS';
      const updatedIssue = await issueService.changeStatus(id, nextStatus);
      
      setIssue(updatedIssue);
      setShowQA(false);
      setQaData({ result: 'PASS', note: '' });
      setComments([...comments, addedComment]);
    } catch (error) {
      console.error('Failed to submit QA results', error);
      alert('Failed to submit QA results');
    }
  };

  if (loading) return <div className="text-center p-8">Loading issue details...</div>;
  if (!issue) return <div className="text-center p-8 text-red-400">Issue not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-900">
                {issue.title}
                {issue.duplicateCount > 0 && (
                    <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded border border-red-200 flex items-center gap-1">
                        <Copy size={12} /> {issue.duplicateCount} Duplicates
                    </span>
                )}
            </h2>
            <div className="flex gap-4 text-sm text-gray-500 items-center">
              <span className="flex items-center gap-1"><User size={14}/> {issue.creator?.name || issue.creator?.email}</span>
              <span className="flex items-center gap-1"><Clock size={14}/> {new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
             <span className="bg-gray-100 px-3 py-1 rounded text-sm font-medium flex items-center gap-2 text-gray-800">
                 {issue.status.replace('_', ' ')}
                 {issue.status === 'CLOSED' && <Check size={14} className="text-emerald-500" />}
             </span>
             <span className="text-xs font-bold text-gray-500">
                {issue.type} | Priority: {issue.priority} | Severity: {issue.severity || 'NONE'} | Project: {issue.project?.name || 'Default'}
             </span>
             {issue.status !== 'CLOSED' && issue.status !== 'RESOLVED' && (
               <button 
                 onClick={() => setShowEscalate(!showEscalate)}
                 className="mt-2 btn-secondary text-xs px-4 py-1.5 border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse"
               >
                 <AlertTriangle size={16} /> ESCALATE ISSUE
               </button>
             )}
          </div>
        </div>
        
        <div className="prose max-w-none mb-6 text-gray-700">
          <p className="whitespace-pre-wrap">{issue.description || 'No description provided.'}</p>
        </div>

        {(issue.customerEmail || issue.attachmentLink) && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
            <h4 className="text-gray-700 font-semibold mb-2 uppercase tracking-wide text-xs">Intake Information</h4>
            <div className="space-y-2 text-gray-600">
              {issue.customerEmail && (
                <div className="flex gap-2">
                  <span className="w-32 font-medium text-gray-500">Customer Email:</span>
                  <a href={`mailto:${issue.customerEmail}`} className="text-primary hover:underline">{issue.customerEmail}</a>
                </div>
              )}
              {issue.attachmentLink && (
                <div className="flex gap-2">
                  <span className="w-32 font-medium text-gray-500">Original Attachment:</span>
                  <a href={issue.attachmentLink} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    <Paperclip size={14} /> View External Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-sm">
           <div className="text-gray-600 flex items-center gap-2">
             Assignee: 
             {users.length > 0 ? (
                 <select 
                    value={issue.assignee?.id || ''} 
                    onChange={handleAssign}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary focus:border-primary block p-1"
                 >
                    <option value="" disabled>Unassigned</option>
                    {users
                        .filter(user => user.role === 'DEVELOPER' || user.role === 'QA' || user.role === 'ENGINEERING_MANAGER')
                        .map(user => (
                       <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                 </select>
             ) : (
                 <span className="font-semibold text-gray-900">{issue.assignee?.name || 'Unassigned'}</span>
             )}
           </div>
           <div className="flex gap-2">
             <button 
               onClick={openTriage}
               className="btn-secondary text-xs px-3 py-1 border border-primary/50 text-primary hover:bg-primary/10 flex items-center gap-1"
             >
               <Edit3 size={14} /> Triage Issue
             </button>
             
             {/* Dynamic Status Transition Buttons */}
             {issue.status === 'NEW' && (
                 <button onClick={() => handleChangeStatus('TRIAGED')} className="btn-secondary text-xs px-3 py-1 border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 flex items-center gap-1">
                     <ArrowRightCircle size={14} /> Triage
                 </button>
             )}
             {issue.status === 'ASSIGNED' && (
                 <button onClick={() => handleChangeStatus('IN_PROGRESS')} className="btn-secondary text-xs px-3 py-1 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1">
                     <PlayCircle size={14} /> Start Progress
                 </button>
             )}
             {issue.status === 'IN_PROGRESS' && (
                 <button onClick={() => handleChangeStatus('READY_FOR_QA')} className="btn-secondary text-xs px-3 py-1 border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 flex items-center gap-1">
                     <ArrowRightCircle size={14} /> Ready for QA
                 </button>
             )}
             {issue.status === 'READY_FOR_QA' && (
                 <button onClick={() => setShowQA(true)} className="btn-secondary text-xs px-3 py-1 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1">
                     <ShieldCheck size={14} /> Verify QA
                 </button>
             )}
             {issue.status === 'RESOLVED' && (
                 <button onClick={() => handleChangeStatus('CLOSED')} className="btn-secondary text-xs px-3 py-1 border border-slate-500/50 text-slate-300 hover:bg-slate-500/10 flex items-center gap-1">
                     <XCircle size={14} /> Close
                 </button>
             )}
             {issue.status === 'CLOSED' && (
                 <button onClick={() => handleChangeStatus('REOPENED')} className="btn-secondary text-xs px-3 py-1 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-1">
                     <RefreshCcw size={14} /> Reopen
                 </button>
             )}
             {['NEW', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS'].includes(issue.status) && (
                 <button onClick={() => handleChangeStatus('CLOSED')} className="btn-secondary text-xs px-3 py-1 border border-gray-400 text-gray-600 hover:bg-gray-100 flex items-center gap-1" title="Close without resolving">
                     <XCircle size={14} /> Close
                 </button>
             )}


             {issue.status !== 'CLOSED' && (
               <button 
                 onClick={() => setShowMerge(true)}
                 className="btn-secondary text-xs px-3 py-1 border border-gray-400 text-gray-600 hover:bg-gray-100 flex items-center gap-1"
               >
                 <Copy size={14} /> Merge as Duplicate
               </button>
             )}
           </div>
        </div>

        {showEscalate && (
          <form onSubmit={handleEscalate} className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
            <h4 className="text-orange-600 font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={16}/> Escalation Form</h4>
            <div className="space-y-3">
              <input type="text" placeholder="Reason for escalation" required className="input-field text-sm bg-white border-gray-300 text-gray-900" value={escalateData.reason} onChange={e => setEscalateData({...escalateData, reason: e.target.value})} />
              <select className="input-field text-sm bg-white border-gray-300 text-gray-900" value={escalateData.impactLevel} onChange={e => setEscalateData({...escalateData, impactLevel: e.target.value})}>
                <option value="LOW">Low Impact</option>
                <option value="MEDIUM">Medium Impact</option>
                <option value="HIGH">High Impact</option>
                <option value="CRITICAL">Critical Impact</option>
              </select>
              <textarea placeholder="Evidence or context (logs, links, etc.)" required className="input-field text-sm bg-white border-gray-300 text-gray-900" rows="2" value={escalateData.evidence} onChange={e => setEscalateData({...escalateData, evidence: e.target.value})} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEscalate(false)} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-1.5 px-4 rounded shadow-sm">Confirm Escalation</button>
              </div>
            </div>
          </form>
        )}

        {/* Merge Modal */}
        {showMerge && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-2xl animate-in zoom-in-95">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                        <Copy size={20} className="text-primary" /> Merge Ticket
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Search for the primary ticket to merge this issue into. This issue will be closed as a duplicate.</p>
                    
                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by title or keywords..." 
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-1 focus:ring-primary focus:border-primary"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
                    </form>

                    <div className="max-h-64 overflow-y-auto space-y-2 mb-6 pr-2">
                        {searchResults.length === 0 && searchQuery && <p className="text-sm text-gray-500 text-center py-4">No related issues found.</p>}
                        {searchResults.map(res => (
                            <div 
                                key={res.id} 
                                onClick={() => setSelectedPrimary(res)}
                                className={`p-3 rounded border cursor-pointer transition-colors ${selectedPrimary?.id === res.id ? 'bg-primary/5 border-primary' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="text-sm font-bold text-gray-900">#{res.id} - {res.title}</h5>
                                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded">{res.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1">{res.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={() => setShowMerge(false)} className="btn-secondary text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                        <button 
                            onClick={handleMerge} 
                            disabled={!selectedPrimary}
                            className={`btn-primary ${!selectedPrimary ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Confirm Merge
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Triage Modal */}
        {showTriage && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-lg animate-in zoom-in-95">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                        <Edit3 size={20} className="text-primary" /> Triage Issue
                    </h2>
                    
                    <form onSubmit={handleTriageSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                            <select className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary p-2" value={triageData.type} onChange={e => setTriageData({...triageData, type: e.target.value})}>
                                <option value="BUG">BUG</option>
                                <option value="FEATURE_REQUEST">FEATURE REQUEST</option>
                                <option value="TASK">TASK</option>
                                <option value="QUESTION">QUESTION</option>
                                <option value="INCIDENT">INCIDENT</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                                <select className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary p-2" value={triageData.priority} onChange={e => setTriageData({...triageData, priority: e.target.value})}>
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="URGENT">URGENT</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                                <select className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary p-2" value={triageData.severity} onChange={e => setTriageData({...triageData, severity: e.target.value})}>
                                    <option value="S4">S4 (Lowest)</option>
                                    <option value="S3">S3</option>
                                    <option value="S2">S2</option>
                                    <option value="S1">S1 (Highest)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
                            <select className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary p-2" value={triageData.projectId} onChange={e => setTriageData({...triageData, projectId: e.target.value})}>
                                <option value="">-- No Project --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Labels (comma separated)</label>
                            <input 
                                type="text" 
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary p-2 placeholder-gray-400" 
                                placeholder="e.g. frontend, urgent, customer_report"
                                value={triageData.labels}
                                onChange={e => setTriageData({...triageData, labels: e.target.value})}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                            <button type="button" onClick={() => setShowTriage(false)} className="btn-secondary text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                            <button type="submit" className="btn-primary">Save Triage</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* QA Verification Modal */}
        {showQA && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-lg animate-in zoom-in-95">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                        <ShieldCheck size={20} className="text-emerald-500" /> QA Verification
                    </h2>
                    
                    <form onSubmit={handleQASubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Test Result</label>
                            <select 
                                className={`w-full bg-white border text-sm font-bold rounded focus:ring-1 p-2 ${qaData.result === 'PASS' ? 'text-emerald-600 border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500' : 'text-red-600 border-red-300 focus:ring-red-500 focus:border-red-500'}`}
                                value={qaData.result} 
                                onChange={e => setQaData({...qaData, result: e.target.value})}
                            >
                                <option value="PASS" className="text-emerald-600">PASS - Issue is resolved</option>
                                <option value="FAIL" className="text-red-600">FAIL - Return to Developer</option>
                            </select>
                            {qaData.result === 'FAIL' && (
                                <p className="text-xs text-red-500 mt-1">Status will be reverted to IN PROGRESS.</p>
                            )}
                            {qaData.result === 'PASS' && (
                                <p className="text-xs text-emerald-500 mt-1">Status will be advanced to RESOLVED.</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Test Note (Required)</label>
                            <textarea 
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary p-2 placeholder-gray-400" 
                                rows="4"
                                placeholder="Describe the test environment, steps taken, and observations..."
                                value={qaData.note}
                                required
                                onChange={e => setQaData({...qaData, note: e.target.value})}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                            <button type="button" onClick={() => setShowQA(false)} className="btn-secondary text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                            <button type="submit" className={`btn-primary font-bold ${qaData.result === 'PASS' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500' : 'bg-red-600 hover:bg-red-500 text-white border-red-500'}`}>
                                Confirm {qaData.result}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>

      {/* Attachments Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Paperclip size={20} /> Attachments ({attachments.length})
          </h3>
          <div>
            <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="btn-primary text-sm px-4 py-2 cursor-pointer flex items-center gap-2">
                <UploadIcon size={16} /> Attach File
            </label>
          </div>
        </div>
        
        {attachments.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No attachments yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-primary/10 p-2 rounded text-primary shrink-0">
                    <Paperclip size={20} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-gray-900 truncate" title={att.fileName}>{att.fileName}</p>
                    <p className="text-xs text-gray-500">{new Date(att.createdAt).toLocaleDateString()} by {att.uploadedBy.name}</p>
                  </div>
                </div>
                <a 
                  href={`http://localhost:8080${att.fileUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-gray-400 hover:text-primary transition-colors shrink-0"
                  title="Download/View"
                >
                  <Download size={20} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
          <MessageSquare size={20} /> Comments ({comments.length})
        </h3>
        
        <div className="space-y-4 mb-6">
          {comments.map(comment => (
            <div key={comment.id} className={`p-4 rounded-lg border ${comment.isInternal ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-start text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${comment.isInternal ? 'text-orange-600' : 'text-gray-900'}`}>{comment.user.name}</span>
                    {comment.isInternal && <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-orange-200">Internal Note</span>}
                </div>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className={`text-sm whitespace-pre-wrap ${comment.isInternal ? 'text-orange-800' : 'text-gray-700'}`}>{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
        </div>

        <form onSubmit={handleAddComment} className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={`w-full rounded-md border p-3 text-sm transition-colors mb-2 ${isInternalComment ? 'border-orange-300 bg-orange-50 text-orange-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-orange-300' : 'border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-400'}`}
            rows="3"
            placeholder={isInternalComment ? "Write an internal note (visible to staff only)... Type @email to mention someone." : "Add a public comment... Type @email to mention someone."}
            required
          />
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                <input 
                    type="checkbox" 
                    className="rounded border-gray-300 bg-white text-orange-500 focus:ring-orange-500 h-4 w-4" 
                    checked={isInternalComment}
                    onChange={e => setIsInternalComment(e.target.checked)}
                />
                <span className={isInternalComment ? 'text-orange-400 font-medium' : ''}>Mark as Internal Note</span>
            </label>
            <button type="submit" className={`font-bold py-2 px-4 rounded text-sm transition-colors shadow-lg text-white ${isInternalComment ? 'bg-orange-600 hover:bg-orange-500' : 'bg-primary hover:bg-primary-hover'}`}>
                {isInternalComment ? 'Save Note' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      {/* History / Audit Trail Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
          <Clock size={20} /> History & Audit Trail
        </h3>
        {activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No history available.</p>
        ) : (
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                {activities.map(activity => (
                    <div key={activity.id} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                        <p className="text-sm">
                            <span className="font-bold text-gray-900">{activity.user.name}</span>{' '}
                            <span className="text-gray-600">
                                {activity.action === 'STATUS_CHANGE' && `changed status from ${activity.oldValue} to ${activity.newValue}`}
                                {activity.action === 'ASSIGNEE_CHANGE' && `reassigned issue from ${activity.oldValue || 'Unassigned'} to ${activity.newValue}`}
                                {activity.action === 'ISSUE_UPDATE' && `updated issue fields`}
                                {activity.action === 'PRIORITY_CHANGE' && `changed priority from ${activity.oldValue} to ${activity.newValue}`}
                                {activity.action === 'LABEL_ADD' && `added label ${activity.newValue}`}
                                {activity.action === 'LABEL_REMOVE' && `removed label ${activity.oldValue}`}
                                {activity.action === 'ISSUE_CREATE' && `created the issue`}
                                {activity.action === 'COMMENT_ADD' && `added a comment`}
                            </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetail;
