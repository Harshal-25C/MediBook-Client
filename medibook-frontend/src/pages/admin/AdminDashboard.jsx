import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AdminSidebar, Topbar, StatusBadge, Loader } from '../../components/Layout';
import { providerAPI, appointmentAPI, paymentAPI, notifAPI, getUser } from '../../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifForm, setNotifForm] = useState({ title: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      providerAPI.getAll(),
      paymentAPI.getTotalRevenue(),
    ]).then(([prov, rev]) => {
      setProviders(prov.data || []);
      setRevenue(rev.data.totalRevenue || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sendPlatformNotif = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setSending(true);
    try {
      // Send to all users (simulate with a bulk send)
      await notifAPI.send({
        recipientId: user.userId,
        type: 'BOOKING',
        title: notifForm.title,
        message: notifForm.message,
        channel: 'APP',
      });
      setNotifForm({ title: '', message: '' });
      alert('Platform notification sent!');
    } catch (e) { alert('Failed to send notification.'); }
    finally { setSending(false); }
  };

  const pendingVerification = providers.filter(p => !p.isVerified);

  const stats = [
    { icon: '👥', label: 'Total Providers', value: providers.length, cls: 'stat-icon-blue', path: '/admin/providers' },
    { icon: '⏳', label: 'Pending Verification', value: pendingVerification.length, cls: 'stat-icon-yellow', path: '/admin/providers' },
    { icon: '💰', label: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, cls: 'stat-icon-green', path: '/admin/payments' },
    { icon: '🏥', label: 'Platform Revenue', value: `₹${Math.round(revenue * 0.1).toLocaleString()}`, cls: 'stat-icon-red', path: '/admin/payments' },
  ];

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <Topbar title="Admin Dashboard" />
        <div className="page-content fade-in">
          <p className="page-title">Admin Dashboard 🛡️</p>
          <p className="page-subtitle">Platform overview and management</p>

          <div className="stats-grid">
            {stats.map(s => (
              <div key={s.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.path)}>
                <div className={`stat-icon ${s.cls}`} style={{ fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div className="stat-value">{loading ? '—' : s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* Pending Verifications */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">⏳ Pending Verifications</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/providers')}>
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div style={{ padding: 0 }}>
                {loading ? <Loader /> : pendingVerification.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <div className="empty-state-title">All providers verified</div>
                  </div>
                ) : pendingVerification.slice(0, 5).map(p => (
                  <div key={p.providerId} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {p.fullName || `User #${p.userId}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.specialization} · {p.qualification}</div>
                    </div>
                    <span className="badge badge-yellow">Pending</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick management links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Management</span></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: '👥', label: 'Manage Users', sub: 'View, suspend, or delete users', path: '/admin/users' },
                    { icon: '🏥', label: 'Verify Providers', sub: 'Review & approve providers', path: '/admin/providers' },
                    { icon: '📅', label: 'All Appointments', sub: 'Platform-wide appointments', path: '/admin/appointments' },
                    { icon: '💳', label: 'Payments & Refunds', sub: 'Transaction management', path: '/admin/payments' },
                    { icon: '⭐', label: 'Moderate Reviews', sub: 'Remove inappropriate content', path: '/admin/reviews' },
                  ].map(a => (
                    <div key={a.label} onClick={() => navigate(a.path)}
                      style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <span style={{ fontSize: 22 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.sub}</div>
                      </div>
                      <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)', alignSelf: 'center' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Notification */}
              <div className="card">
                <div className="card-header"><span className="card-title">📢 Send Platform Notification</span></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input className="form-input" placeholder="Notification title"
                    value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} />
                  <textarea className="form-textarea" placeholder="Message content..."
                    value={notifForm.message} onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))}
                    style={{ minHeight: 70 }} />
                  <button className="btn btn-primary btn-sm w-full" style={{ justifyContent: 'center' }}
                    onClick={sendPlatformNotif} disabled={sending || !notifForm.title}>
                    {sending ? <span className="spinner" /> : '📢 Send Notification'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
