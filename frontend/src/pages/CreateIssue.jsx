import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../api/issueService';

const CreateIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await issueService.create(formData);
      navigate('/');
    } catch (error) {
      console.error('Failed to create issue', error);
      alert('Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Create New Issue</h2>
      
      <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g. Fix login bug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="input-field resize-none"
              placeholder="Describe the issue..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;
