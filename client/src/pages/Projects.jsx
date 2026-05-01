import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="glass-card rounded-2xl p-6 fade-in hover:border-white/10 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
      {sub && <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">{sub}</span>}
    </div>
    <div className="font-display font-bold text-3xl text-white">{value}</div>
    <div className="text-slate-400 text-sm mt-1">{label}</div>
  </div>
);

const COLORS = ['#64748b', '#3b82f6', '#10b981', '#f43f5e'];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats ? [
    { name: 'To-Do', value: stats.todo },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Completed', value: stats.completed },
    { name: 'Overdue', value: stats.overdue },
  ].filter(d => d.value > 0) : [];

  const isOverdue = (deadline) => deadline && new Date(deadline) < new Date();

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="fade-in">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-blue-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Here's what's happening with your team today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats?.total ?? 0} icon="📋" color="bg-blue-500/10 text-blue-400" />
        <StatCard label="In Progress" value={stats?.inProgress ?? 0} icon="⚡" color="bg-cyan-500/10 text-cyan-400" />
        <StatCard label="Completed" value={stats?.completed ?? 0} icon="✅" color="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} icon="🚨" color="bg-rose-500/10 text-rose-400" sub="Action needed" />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h2 className="font-display font-bold text-white mb-1">Task Distribution</h2>
          <p className="text-slate-500 text-xs mb-4">Status overview</p>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#131c30', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {chartData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
              <span className="text-3xl mb-2">📊</span>
              No task data yet
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="glass-card rounded-2xl p-6 fade-in space-y-4">
          <h2 className="font-display font-bold text-white">Quick Stats</h2>
          {[
            { label: 'Projects', value: stats?.projectCount ?? 0, icon: '📁', link: '/projects' },
            { label: 'To-Do Tasks', value: stats?.todo ?? 0, icon: '📝', link: '/tasks' },
            { label: 'Done This Sprint', value: stats?.completed ?? 0, icon: '🏆', link: '/tasks' },
          ].map(s => (
            <Link key={s.label} to={s.link} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
              <span className="text-xl">{s.icon}</span>
              <div className="flex-1">
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{s.label}</div>
              </div>
              <div className="font-display font-bold text-white text-lg">{s.value}</div>
            </Link>
          ))}
        </div>

        {/* Progress bars */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h2 className="font-display font-bold text-white mb-4">Completion Rate</h2>
          {[
            { label: 'Completed', value: stats?.completed ?? 0, total: stats?.total ?? 0, color: 'bg-emerald-500' },
            { label: 'In Progress', value: stats?.inProgress ?? 0, total: stats?.total ?? 0, color: 'bg-blue-500' },
            { label: 'Overdue', value: stats?.overdue ?? 0, total: stats?.total ?? 0, color: 'bg-rose-500' },
          ].map(item => {
            const pct = item.total ? Math.round((item.value / item.total) * 100) : 0;
            return (
              <div key={item.label} className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{item.label}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue tasks */}
      {stats?.overdueList?.length > 0 && (
        <div className="glass-card rounded-2xl p-6 fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                <span className="text-rose-400">⚠</span> Overdue Tasks
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">These tasks need immediate attention</p>
            </div>
            <Link to="/tasks" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.overdueList.map(task => (
              <div key={task._id} className="flex items-center gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{task.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{task.projectId?.title}</div>
                </div>
                <div className="text-xs text-rose-400 shrink-0">Due {formatDate(task.deadline)}</div>
                <div className="text-xs text-slate-500 shrink-0 hidden sm:block">
                  {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}