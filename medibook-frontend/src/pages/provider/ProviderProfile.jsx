import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  Clock3,
  Eye,
  EyeOff,
  GraduationCap,
  IndianRupee,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Wallet,
} from 'lucide-react';
import { ProviderSidebar, Topbar, Loader } from '../../components/Layout';
import { getUser, saveAuth, getToken, authAPI, getInitials, clearAuth, providerAPI } from '../../utils/api';

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

const DetailChip = ({ icon, label, value }) => (
  <div className="provider-profile-chip">
    <span>{icon}</span>
    <div>
      <small>{label}</small>
      <strong>{value || 'Not added yet'}</strong>
    </div>
  </div>
);

export default function ProviderProfile() {
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

  const [providerProfile, setProviderProfile] = useState(null);
  const [consultationFee, setConsultationFee] = useState('');
  const [savingFee, setSavingFee] = useState(false);

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

    const loadProviderProfile = async () => {
      try {
        const res = await providerAPI.getByUserId(user.userId);
        setProviderProfile(res.data);
        setConsultationFee(res.data.consultationFee ?? 500);
      } catch (err) {
        // Provider profile may not exist yet.
      }
    };

    if (user?.userId) {
      loadProfile();
      loadProviderProfile();
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

  const handleSaveFee = async () => {
    const feeNum = parseFloat(consultationFee);
    if (isNaN(feeNum) || feeNum < 0) {
      alert('Please enter a valid fee amount (0 or more).');
      return;
    }
    if (!providerProfile) {
      alert('Provider profile not found.');
      return;
    }

    setSavingFee(true);
    try {
      await providerAPI.updateFee(providerProfile.providerId, feeNum);
      setProviderProfile(prev => ({ ...prev, consultationFee: feeNum }));
      alert('Consultation fee updated successfully!');
    } catch (err) {
      alert('Failed to update fee. Please try again.');
    } finally {
      setSavingFee(false);
    }
  };

  if (!profile) {
    return (
      <div className="dashboard-layout">
        <ProviderSidebar />
        <div className="dashboard-main">
          <Topbar title="My Profile" />
          <Loader />
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength();
  const feeValue = providerProfile?.consultationFee ?? 500;
  const displayName = fullName || user?.fullName || 'Provider';
  const verificationLabel = providerProfile?.isVerified ? 'Verified provider' : 'Verification pending';
  const availabilityLabel = providerProfile?.isAvailable === false ? 'Offline' : 'Accepting patients';

  return (
    <div className="dashboard-layout">
      <ProviderSidebar />
      <div className="dashboard-main">
        <Topbar title="My Profile" />
        <div className="page-content provider-profile-page fade-in">
          <section className="provider-profile-hero">
            <div className="profile-hero-grid" />
            <div className="profile-hero-glow profile-hero-glow-one" />
            <div className="profile-hero-glow profile-hero-glow-two" />

            <div className="profile-hero-copy">
              <div className="profile-kicker">
                <Sparkles size={16} />
                Clinical identity console
              </div>
              <h1>Dr. {displayName}</h1>
              <p>
                Keep your public profile, pricing, account access, and practice details polished for every patient who finds you on MediBook.
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

            <div className="profile-cinematic-card">
              <div className="profile-card-topline">
                <span>{availabilityLabel}</span>
                <BadgeCheck size={18} />
              </div>
              <div className="profile-avatar-stage">
                <div
                  className="profile-avatar-xl"
                  style={profilePicUrl ? { backgroundImage: `url(${profilePicUrl})` } : undefined}
                >
                  {!profilePicUrl && getInitials(displayName)}
                  {uploading && <span className="spinner profile-avatar-spinner" />}
                </div>
                <button className="profile-camera-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading} aria-label="Change photo">
                  <Camera size={18} />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} disabled={uploading} />
              <div className="profile-preview-name">Dr. {displayName}</div>
              <div className="profile-preview-spec">{providerProfile?.specialization || 'Specialization not added'}</div>
              <div className="profile-status-row">
                <span>{verificationLabel}</span>
                <span>{providerProfile?.experienceYears || 0}+ yrs exp</span>
              </div>
            </div>
          </section>

          {providerProfile && (
            <section className="provider-profile-strip">
              <DetailChip icon={<Stethoscope size={18} />} label="Specialization" value={providerProfile.specialization} />
              <DetailChip icon={<GraduationCap size={18} />} label="Qualification" value={providerProfile.qualification} />
              <DetailChip icon={<MapPin size={18} />} label="Clinic" value={providerProfile.clinicName || providerProfile.clinicAddress} />
              <DetailChip icon={<Wallet size={18} />} label="Consultation" value={`Rs. ${feeValue}`} />
            </section>
          )}

          <section className="profile-workspace">
            <div className="profile-main-column">
              <div className="profile-panel profile-panel-large">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill">Identity</span>
                    <h2>Profile information</h2>
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
                    <p className="form-hint">Email is locked for account security.</p>
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
                    <span className="profile-section-pill">Security</span>
                    <h2>Change password</h2>
                  </div>
                  <LockKeyhole size={22} />
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
              {providerProfile && (
                <div className="profile-panel profile-fee-panel">
                  <div className="profile-panel-header">
                    <div>
                      <span className="profile-section-pill">Billing</span>
                      <h2>Consultation fee</h2>
                    </div>
                    <IndianRupee size={22} />
                  </div>
                  <div className="profile-fee-orbit">
                    <span>Rs.</span>
                    <strong>{feeValue}</strong>
                    <small>current patient fee</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Update fee</label>
                    <input
                      type="number"
                      className="form-input"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      placeholder="e.g. 500"
                      min="0"
                      step="50"
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleSaveFee} disabled={savingFee}>
                    {savingFee ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Wallet size={17} />}
                    Update fee
                  </button>
                </div>
              )}

              <div className="profile-panel profile-live-panel">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill">Presence</span>
                    <h2>Practice signal</h2>
                  </div>
                  <Clock3 size={22} />
                </div>
                <div className="profile-signal-list">
                  <div>
                    <span />
                    <p>Search visibility</p>
                    <strong>{providerProfile?.isVerified ? 'Ready' : 'Pending'}</strong>
                  </div>
                  <div>
                    <span />
                    <p>Booking status</p>
                    <strong>{availabilityLabel}</strong>
                  </div>
                  <div>
                    <span />
                    <p>Clinic location</p>
                    <strong>{providerProfile?.clinicAddress || 'Not added yet'}</strong>
                  </div>
                </div>
              </div>

              <div className="profile-panel profile-danger-panel">
                <div className="profile-panel-header">
                  <div>
                    <span className="profile-section-pill danger">Danger</span>
                    <h2>Account access</h2>
                  </div>
                  <AlertTriangle size={22} />
                </div>
                <p>
                  Deactivating your account disables login. Your data remains preserved until an admin reactivates access.
                </p>

                {!confirming ? (
                  <button className="btn btn-danger" onClick={() => setConfirming(true)}>
                    Deactivate account
                  </button>
                ) : (
                  <div className="profile-confirm-box">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>Confirm deactivation?</strong>
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
