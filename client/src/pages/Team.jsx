import { useEffect, useState } from 'react';
import api from '../utils/api'
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roleColors = {
  Admin: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  Member: 'bg-slate-700/50 text-slate-300 border-slate-600/20',
};

export default function Team() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    api.get('/users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'Member' : 'Admin';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    setUpdatingId(userId);
    try {
      const res = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === res.data._id ? res.data : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = filtered.filter(u => u.role === 'Admin');
  const members = filtered.filter(u => u.role === 'Member');

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const UserCard = ({ u }) => (
    <div className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-white/10 transition-all group fade-in">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-display font-bold text-lg shrink-0">
        {u.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white">{u.name}</span>
          {u._id === currentUser._id && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">You</span>
          )}
        </div>
        <div className="text-sm text-slate-500 truncate">{u.email}</div>
        <div className="text-xs text-slate-600 mt-0.5">Joined {formatDate(u.createdAt)}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs px-3 py-1 rounded-full border ${roleColors[u.role]}`}>{u.role}</span>
        {isAdmin && u._id !== currentUser._id && (
          <button
            onClick={() => handleRoleToggle(u._id, u.role)}
            disabled={updatingId === u._id}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 disabled:opacity-50"
          >
            {updatingId === u._id ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" />
            ) : `Make ${u.role === 'Admin' ? 'Member' : 'Admin'}`}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">Team</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''} in your workspace</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 fade-in">
        {[
          { label: 'Total Members', value: users.length, icon: '👥' },
          { label: 'Admins', value: users.filter(u => u.role === 'Admin').length, icon: '🔑' },
          { label: 'Members', value: users.filter(u => u.role === 'Member').length, icon: '👤' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-5 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-display font-bold text-2xl text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative fade-in">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input className="input-field pl-11" placeholder="Search by name or email..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <div className="font-display font-bold text-white">No users found</div>
        </div>
      ) : (
        <div className="space-y-6">
          {admins.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Admins ({admins.length})
              </h2>
              <div className="space-y-3">
                {admins.map(u => <UserCard key={u._id} u={u} />)}
              </div>
            </div>
          )}
          {members.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" /> Members ({members.length})
              </h2>
              <div className="space-y-3">
                {members.map(u => <UserCard key={u._id} u={u} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="glass-card rounded-xl p-4 border-blue-500/10 fade-in">
          <p className="text-xs text-slate-500 text-center">
            💡 Hover over a user card to change their role. You cannot change your own role.
          </p>
        </div>
      )}
    </div>
  );
}