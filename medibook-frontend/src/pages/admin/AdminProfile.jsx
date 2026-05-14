import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Camera,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Phone,
  ServerCog,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  UserCog,
  UsersRound,
  UserRound,
} from 'lucide-react';
import { AdminSidebar, Topbar, Loader } from '../../components/Layout';
import {
  getUser,
  saveAuth,
  getToken,
  authAPI,
  getInitials,
  clearAuth,
  providerAPI,
  paymentAPI,
  notifAPI,
} from '../../utils/api';

const IMGBB_API_KEY = '843e9f5b37d7d3775ab6a236d0416e34';
const IMGBB_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

const PasswordField = ({ label, value, onChange, placeholder, visible, onToggle }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="profile-input-wrap">
      <LockKeyhole size={17} />
      <input
        type={visible ? 'text' : 'password'}
        className="form-input profile-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button type="button" className="profile-icon-btn" onClick={onToggle} aria-label={`Toggle ${label}`}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const AdminSignal = ({ icon, label, value }) => (
  <div className="admin-profile-chip">
    <span>{icon}</span>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  </div>
);

export default function AdminProfile() {
  const navigate = useNavigate();
  const user = getUser();
  const fileInputRef = useRef();

  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [signals, setSignals] = useState({
    users: [],
    providers: [],
    revenue: 0,
    notifications: [],
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authAPI.getProfile(user.userId);
        setProfile(res.data);
        setFullName(res.data.fullName || '');
        setPhone(res.data.phone || '');
        setProfilePicUrl(res.data.profilePicUrl || '');
      } catch (err) {
        alert('Failed to load profile.');
      }
    };

    const loadSignals = async () => {
      try {
        const [usersRes, providersRes, revenueRes, notifRes] = await Promise.all([
          authAPI.getAllUsers().catch(() => ({ data: [] })),
          providerAPI.getAll().catch(() => ({ data: [] })),
          paymentAPI.getTotalRevenue().catch(() => ({ data: { totalRevenue: 0 } })),
          notifAPI.getAll().catch(() => ({ data: [] })),
        ]);

        setSignals({
          users: usersRes.data || [],
          providers: providersRes.data || [],
          revenue: revenueRes.data?.totalRevenue || 0,
          notifications: notifRes.data || [],
        });
      } catch (err) {
        // Command-center signals are supportive; profile editing should stay available.
      }
    };

    if (user?.userId) {
      loadProfile();
      loadSignals();
    }
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(IMGBB_URL, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setProfilePicUrl(data.data.url);
        alert('Photo uploaded!');
      } else {
        alert('Upload failed. Try again.');
      }
    } catch (err) {
      alert('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      alert('Full Name is required.');
      return;
    }

    setSavingProfile(true);
    try {
      await authAPI.updateProfile(user.userId, {
        fullName,
        phone,
        profilePicUrl,
      });

      const token = getToken();
      saveAuth(token, { ...user, fullName });

      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile. Try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const getPasswordStrength = () => {
    const pwd = newPassword;
    if (pwd.length < 6) return { label: 'Too weak', color: 'var(--danger, #ef4444)', percent: 33 };
    if (pwd.length < 9) return { label: 'Medium', color: '#eab308', percent: 66 };
    return { label: 'Strong', color: 'var(--success, #22c55e)', percent: 100 };
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      alert('Current password is required.');
      return;
    }
    if (!newPassword.trim()) {
      alert('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await authAPI.changePassword(user.userId, newPassword);
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('Failed to update password. Try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await authAPI.deactivate(user.userId);
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      alert('Failed to deactivate account. Try again.');
      setConfirming(false);
      setDeactivating(false);
    }
  };

  if (!profile) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar />
        <div className="dashboard-main">
          <Topbar title="My Profile" />
          <Loader />
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength();
  const displayName = fullName || user?.fullName || 'Administrator';
  const pendingProviders = signals.providers.filter(p => !p.isVerified).length;
  const platformRevenue = Math.round(signals.revenue * 0.1);
  const activeUsers = signals.users.filter(u => u.isActive !== false).length;

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <Topbar title="My Profile" />
        <div className="page-content admin-profile-page fade-in">
          <section className="admin-profile-hero">
            <div className="admin-hero-grid" />
            <div className="admin-hero-beam admin-hero-beam-one" />
            <div className="admin-hero-beam admin-hero-beam-two" />

            <div className="admin-hero-copy">
              <div className="profile-kicker admin-kicker">
                <Sparkles size={16} />
                Platform command authority
              </div>
              <h1>{displayName}</h1>
              <p>
                Manage your administrator identity, secure privileged access, and keep the MediBook control plane ready for users, providers, payments, and operations.
              </p>
              <div className="profile-hero-actions">
                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <ShieldCheck size={18} />}
                  Save profile
                </button>
                <button className="btn btn-outline profile-dark-outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Camera size={18} />
                  Update portrait
                </button>
              </div>
            </div>

            <div className="admin-command-card">
              <div className="admin-card-topline">
                <span>Admin panel</span>
                <ShieldHalf size={18} />
              </div>
              <div className="profile-avatar-stage">
                <div
                  className="profile-avatar-xl admin-avatar-xl"
                  style={profilePicUrl ? { backgroundImage: `url(${profilePicUrl})` } : undefined}
                >
                  {!profilePicUrl && <span className="avatar-initial-center">{getInitials(displayName)}</span>}
                  {uploading && <span className="spinner profile-avatar-spinner" />}
                </div>
                <button className="profile-camera-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading} aria-label="Change photo">
                  <Camera size={18} />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} disabled={uploading} />
              <div className="profile-preview-name">{displayName}</div>
              <div className="admin-preview-sub">Administrator access active</div>
              <div className="admin-status-row">
                <span>{activeUsers} active users</span>
                <span>{pendingProviders} pending reviews</span>
              </div>
            </div>
          </section>

          <section className="admin-profile-strip">
            <AdminSignal icon={<UsersRound size={18} />} label="Users" value={`${signals.users.length} accounts`} />
            <AdminSignal icon={<UserCog size={18} />} label="Providers" value={`${signals.providers.length} profiles`} />
            <AdminSignal icon={<CreditCard size={18} />} label="Platform fee" value={`Rs. ${platformRevenue.toLocaleString()}`} />
            <AdminSignal icon={<Bell size={18} />} label="Notifications" value={`${signals.notifications.length} events`} />
          </section>

          <section className="profile-workspace admin-workspace">
            <div className="profile-main-column">
              <div className="profile-panel admin-panel-large">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill">Identity</span>
                    <h2>Administrator profile</h2>
                  </div>
                  <UserRound size={22} />
                </div>
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="profile-input-wrap">
                      <UserRound size={17} />
                      <input
                        type="text"
                        className="form-input profile-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="profile-input-wrap disabled">
                      <Mail size={17} />
                      <input type="email" className="form-input profile-input" value={user?.email || ''} disabled />
                    </div>
                    <p className="form-hint">Email is locked for privileged account security.</p>
                  </div>

                  <div className="form-group profile-form-wide">
                    <label className="form-label">Phone</label>
                    <div className="profile-input-wrap">
                      <Phone size={17} />
                      <input
                        type="tel"
                        className="form-input profile-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-panel">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill">Access</span>
                    <h2>Change password</h2>
                  </div>
                  <KeyRound size={22} />
                </div>

                <div className="profile-form-grid">
                  <PasswordField
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    visible={showCurrentPassword}
                    onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                  <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword(!showNewPassword)}
                  />
                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>

                {newPassword && (
                  <div className="profile-strength">
                    <div>
                      <span style={{ width: `${strength.percent}%`, background: strength.color }} />
                    </div>
                    <p>{strength.label}</p>
                  </div>
                )}

                <button className="btn btn-primary" onClick={handleChangePassword} disabled={savingPassword}>
                  {savingPassword ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <ShieldCheck size={17} />}
                  Update password
                </button>
              </div>
            </div>

            <aside className="profile-side-column">
              <div className="profile-panel admin-ops-panel">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill">Operations</span>
                    <h2>Control surface</h2>
                  </div>
                  <ServerCog size={22} />
                </div>
                <div className="admin-control-panel">
                  <span>System overview</span>
                  <strong>{pendingProviders} provider reviews waiting</strong>
                  <p>{signals.users.length} registered accounts with Rs. {signals.revenue.toLocaleString()} total processed revenue.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/providers')}>
                  <UserCog size={17} />
                  Review providers
                </button>
              </div>

              <div className="profile-panel profile-live-panel">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill">Platform</span>
                    <h2>Admin signal</h2>
                  </div>
                  <ShieldHalf size={22} />
                </div>
                <div className="profile-signal-list admin-signal-list">
                  <div>
                    <span />
                    <p>Privileged profile</p>
                    <strong>{phone ? 'Contact ready' : 'Phone needed'}</strong>
                  </div>
                  <div>
                    <span />
                    <p>Verification queue</p>
                    <strong>{pendingProviders} pending</strong>
                  </div>
                  <div>
                    <span />
                    <p>Platform access</p>
                    <strong>Administrator</strong>
                  </div>
                </div>
              </div>

              <div className="profile-panel profile-danger-panel">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill danger">Danger</span>
                    <h2>Admin access</h2>
                  </div>
                  <AlertTriangle size={22} />
                </div>
                <p>
                  Deactivating this admin account removes access to the admin panel. Data is preserved until another admin reactivates the account.
                </p>

                {!confirming ? (
                  <button className="btn btn-danger" onClick={() => setConfirming(true)}>
                    Deactivate account
                  </button>
                ) : (
                  <div className="profile-confirm-box">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>Confirm admin deactivation?</strong>
                      <div className="profile-confirm-actions">
                        <button className="btn btn-danger btn-sm" onClick={handleDeactivate} disabled={deactivating}>
                          {deactivating ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Yes, deactivate'}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setConfirming(false)} disabled={deactivating}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}
