import React, { useState, useEffect } from 'react';
import { AdminSidebar, Topbar, Loader } from '../../components/Layout';
import { authAPI, formatDate } from '../../utils/api';
import { Search, UserX, UserCheck } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.getAllUsers();
      setUsers(res.data || []);
    } catch (e) {
      setError('Failed to load users. Make sure the auth-service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || u.role === tab;
    return matchSearch && matchTab;
  });

  const deactivate = async (userId) => {
    if (!confirm('Deactivate this user account?')) return;
    setActionLoading(userId + '_d');
    try {
      await authAPI.deactivate(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, active: false } : u));
    } catch (e) { alert(e.response?.data?.message || 'Error deactivating user.'); }
    finally { setActionLoading(null); }
  };

  const reactivate = async (userId) => {
    if (!confirm('Reactivate this user account?')) return;
    setActionLoading(userId + '_r');
    try {
      await authAPI.reactivate(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, active: true } : u));
    } catch (e) { alert(e.response?.data?.message || 'Error reactivating user.'); }
    finally { setActionLoading(null); }
  };

  const changePassword = async (userId) => {
    const pwd = prompt('Enter new password for this user:');
    if (!pwd || pwd.trim().length < 6) {
      if (pwd !== null) alert('Password must be at least 6 characters.');
      return;
    }
    try {
      await authAPI.changePassword(userId, pwd.trim());
      alert('Password updated successfully!');
    } catch (e) { alert('Error updating password.'); }
  };

  // isActive field from backend is "active" (Lombok getter for boolean isActive)
  const isActive = (u) => u.active !== undefined ? u.active : u.isActive;

  const roleColor = { Admin: 'badge-red', Provider: 'badge-blue', Patient: 'badge-green' };

  const stats = [
    { label: 'Total Users', value: users.length, icon: '👥', cls: 'stat-icon-blue' },
    { label: 'Patients', value: users.filter(u => u.role === 'Patient').length, icon: '🤒', cls: 'stat-icon-green' },
    { label: 'Providers', value: users.filter(u => u.role === 'Provider').length, icon: '👨‍⚕️', cls: 'stat-icon-yellow' },
    { label: 'Inactive', value: users.filter(u => !isActive(u)).length, icon: '🔴', cls: 'stat-icon-red' },
  ];

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <Topbar title="User Management" />
        <div className="page-content fade-in">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p className="page-title">User Management</p>
              <p className="page-subtitle">{users.length} total users on the platform</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchUsers}>↻ Refresh</button>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>
          )}

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.cls}`} style={{ fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', background: 'var(--bg)', borderRadius: 8, padding: '4px' }}>
              {['all', 'Patient', 'Provider', 'Admin'].map(t => (
                <div key={t} className={`tab ${tab === t ? 'active' : ''}`}
                  style={{ borderRadius: 6 }} onClick={() => setTab(t)}>
                  {t === 'all' ? 'All' : t}s
                </div>
              ))}
            </div>
          </div>

          {loading ? <Loader /> : (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <div className="empty-state-title">No users found</div>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.map(u => (
                      <tr key={u.userId}>
                        <td>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div className="avatar" style={{ width: 36, height: 36, fontSize: 14,
                              background: isActive(u) ? 'var(--primary)' : '#aaa',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 700, borderRadius: '50%', flexShrink: 0 }}>
                              {u.fullName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {u.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 14 }}>{u.email}</td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${roleColor[u.role] || 'badge-gray'}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${isActive(u) ? 'badge-green' : 'badge-red'}`}>
                            {isActive(u) ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {u.createdAt ? formatDate(u.createdAt.split('T')[0]) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {/* Deactivate — only for active non-Admin users */}
                            {isActive(u) && u.role !== 'Admin' && (
                              <button className="btn btn-danger btn-sm"
                                onClick={() => deactivate(u.userId)}
                                disabled={actionLoading === u.userId + '_d'}
                                title="Deactivate user">
                                {actionLoading === u.userId + '_d'
                                  ? <span className="spinner" />
                                  : <UserX size={13} />}
                              </button>
                            )}
                            {/* Reactivate — only for inactive users */}
                            {!isActive(u) && u.role !== 'Admin' && (
                              <button className="btn btn-secondary btn-sm"
                                onClick={() => reactivate(u.userId)}
                                disabled={actionLoading === u.userId + '_r'}
                                title="Reactivate user">
                                {actionLoading === u.userId + '_r'
                                  ? <span className="spinner" />
                                  : <UserCheck size={13} />}
                              </button>
                            )}
                            {/* Reset password */}
                            <button className="btn btn-outline btn-sm"
                              onClick={() => changePassword(u.userId)}
                              title="Reset password">
                              🔑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
