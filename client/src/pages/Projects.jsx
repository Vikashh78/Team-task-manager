// client/src/pages/Projects.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api'
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const statusColors = {
  Active: 'badge-inprogress',
  Completed: 'badge-completed',
  'On Hold': 'badge-todo',
};

function ProjectForm({ initial, onSave, onCancel, allUsers }) {
  const [form, setForm] = useState(
    initial || { title: '', description: '', status: 'Active', members: [] }
  );
  const [saving, setSaving] = useState(false);

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Project Title *</label>
        <input className="input-field" placeholder="e.g. Website Redesign" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
        <textarea className="input-field resize-none" rows={3} placeholder="What is this project about?"
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
        <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          {['Active', 'Completed', 'On Hold'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {allUsers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Add Members</label>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {allUsers.map(u => (
              <label key={u._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <input type="checkbox" className="accent-blue-500 w-4 h-4"
                  checked={form.members.includes(u._id)}
                  onChange={() => toggleMember(u._id)} />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-white">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : initial ? 'Update Project' : 'Create Project'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/projects'),
      isAdmin ? api.get('/users') : Promise.resolve({ data: [] })
    ]).then(([p, u]) => {
      setProjects(p.data);
      setAllUsers(u.data);
    }).catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    try {
      const res = await api.post('/projects', form);
      setProjects(prev => [res.data, ...prev]);
      toast.success('Project created!');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleEdit = async (form) => {
    try {
      const res = await api.put(`/projects/${modal.project._id}`, form);
      setProjects(prev => prev.map(p => p._id === res.data._id ? res.data : p));
      toast.success('Project updated!');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal('create')} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Project
          </button>
        )}
      </div>

      <div className="relative fade-in">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input className="input-field pl-11" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center fade-in">
          <div className="text-5xl mb-4">📁</div>
          <div className="font-display font-bold text-white text-lg">No projects yet</div>
          <p className="text-slate-400 text-sm mt-2">
            {isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project, i) => (
            <div key={project._id} className="glass-card rounded-2xl p-6 hover:border-white/10 transition-all fade-in group"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-display font-bold text-sm">
                  {project.title.charAt(0)}
                </div>
                <span className={statusColors[project.status] || 'badge-todo'}>{project.status}</span>
              </div>
              <h3 className="font-display font-bold text-white text-lg leading-tight mb-1">{project.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 4).map(m => (
                    <div key={m._id} title={m.name}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-semibold">
                      {m.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-slate-500">{project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="text-xs text-slate-600 mb-4">
                Created by {project.createdBy?.name} · {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ type: 'edit', project })} className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center">Edit</button>
                  <button onClick={() => handleDelete(project._id)} className="btn-danger text-xs py-1.5 flex-1 justify-center">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="New Project" size="md">
        <ProjectForm allUsers={allUsers.filter(u => u.role === 'Member')} onSave={handleCreate} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Project" size="md">
        {modal?.project && (
          <ProjectForm
            initial={{ title: modal.project.title, description: modal.project.description || '', status: modal.project.status, members: modal.project.members?.map(m => m._id) || [] }}
            allUsers={allUsers.filter(u => u.role === 'Member')}
            onSave={handleEdit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}