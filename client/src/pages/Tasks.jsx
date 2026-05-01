import { useEffect, useState } from 'react';
import api from '../utils/api'
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const statusBadge = { 'To-Do': 'badge-todo', 'In Progress': 'badge-inprogress', 'Completed': 'badge-completed' };
const priorityBadge = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };

const isOverdue = (task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Completed';

function TaskForm({ initial, projects, members, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', projectId: '', assignedTo: '',
    deadline: '', status: 'To-Do', priority: 'Medium'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
        <input className="input-field" placeholder="Task title" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
        <textarea className="input-field resize-none" rows={3} placeholder="What needs to be done?"
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Project *</label>
          <select className="input-field" value={form.projectId}
            onChange={e => setForm({ ...form, projectId: e.target.value })} required>
            <option value="">Select project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Assign To</label>
          <select className="input-field" value={form.assignedTo}
            onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
          <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['To-Do', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
          <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
          <input type="date" className="input-field" value={form.deadline ? form.deadline.split('T')[0] : ''}
            onChange={e => setForm({ ...form, deadline: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : initial ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function StatusUpdateModal({ task, onSave, onCancel }) {
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(status); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Update status for: <span className="text-white font-medium">{task.title}</span></p>
      <div className="space-y-2">
        {['To-Do', 'In Progress', 'Completed'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${status === s ? 'border-blue-500/50 bg-blue-600/10 text-blue-300' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Status'}
        </button>
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/tasks'),
      api.get('/projects'),
      isAdmin ? api.get('/users/members') : Promise.resolve({ data: [] })
    ]).then(([t, p, m]) => {
      setTasks(t.data);
      setProjects(p.data);
      setMembers(m.data);
    }).catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    try {
      const res = await api.post('/tasks', form);
      setTasks(prev => [res.data, ...prev]);
      toast.success('Task created!');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleEdit = async (form) => {
    try {
      const res = await api.put(`/tasks/${modal.task._id}`, form);
      setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
      toast.success('Task updated!');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      const res = await api.put(`/tasks/${modal.task._id}`, { status });
      setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
      toast.success('Status updated!');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const filtered = tasks.filter(t => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal('create')} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 fade-in">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input className="input-field pl-10" placeholder="Search tasks..." value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })} />
        </div>
        <select className="input-field w-auto" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          {['To-Do', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field w-auto" value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}>
          <option value="">All Priority</option>
          {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filter.status || filter.priority || filter.search) && (
          <button onClick={() => setFilter({ status: '', priority: '', search: '' })} className="btn-secondary text-xs">
            Clear filters
          </button>
        )}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center fade-in">
          <div className="text-5xl mb-4">✅</div>
          <div className="font-display font-bold text-white text-lg">No tasks found</div>
          <p className="text-slate-400 text-sm mt-2">
            {isAdmin ? 'Create your first task to get started.' : 'No tasks assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task, i) => (
            <div key={task._id}
              className={`glass-card rounded-xl px-5 py-4 flex items-center gap-4 hover:border-white/10 transition-all fade-in group ${isOverdue(task) ? 'border-rose-500/20' : ''}`}
              style={{ animationDelay: `${i * 0.03}s` }}>

              {/* Priority dot */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'High' ? 'bg-rose-400' : task.priority === 'Medium' ? 'bg-amber-400' : 'bg-slate-500'}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm truncate">{task.title}</span>
                  {isOverdue(task) && <span className="badge-overdue">Overdue</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500">{task.projectId?.title || 'No project'}</span>
                  {task.assignedTo && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs">{task.assignedTo.name.charAt(0)}</span>
                      {task.assignedTo.name}
                    </span>
                  )}
                  {task.deadline && (
                    <span className={`text-xs ${isOverdue(task) ? 'text-rose-400' : 'text-slate-500'}`}>
                      📅 {formatDate(task.deadline)}
                    </span>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={priorityBadge[task.priority] || 'badge-low'}>{task.priority}</span>
                <span className={statusBadge[task.status] || 'badge-todo'}>{task.status}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!isAdmin && (
                  <button onClick={() => setModal({ type: 'status', task })}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition-colors border border-blue-500/20">
                    Update
                  </button>
                )}
                {isAdmin && (
                  <>
                    <button onClick={() => setModal({ type: 'edit', task })}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="btn-danger text-xs py-1.5">
                      Del
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="New Task" size="lg">
        <TaskForm projects={projects} members={members} onSave={handleCreate} onCancel={() => setModal(null)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Task" size="lg">
        {modal?.task && (
          <TaskForm
            initial={{
              title: modal.task.title,
              description: modal.task.description || '',
              projectId: modal.task.projectId?._id || '',
              assignedTo: modal.task.assignedTo?._id || '',
              deadline: modal.task.deadline || '',
              status: modal.task.status,
              priority: modal.task.priority
            }}
            projects={projects}
            members={members}
            onSave={handleEdit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      {/* Status Update Modal (Member) */}
      <Modal isOpen={modal?.type === 'status'} onClose={() => setModal(null)} title="Update Task Status" size="sm">
        {modal?.task && (
          <StatusUpdateModal task={modal.task} onSave={handleStatusUpdate} onCancel={() => setModal(null)} />
        )}
      </Modal>
    </div>
  );
}