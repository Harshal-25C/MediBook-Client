import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarClock,
  HeartPulse,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';
import { API_BASE_URL, authAPI, providerAPI } from '../../utils/api';
import medicalLogo from '../../assets/medical-logo.png';

const REGISTER_FEATURES = [
  { icon: Stethoscope, title: 'Patient journeys', desc: 'Book appointments faster and manage care with less friction.' },
  { icon: ShieldCheck, title: 'Trusted onboarding', desc: 'A secure, modern entry point for both patients and providers.' },
  { icon: Activity, title: 'Hospital vibes', desc: 'Clinical visuals, layered motion, and a more premium digital tone.' },
];

const REGISTER_METRICS = [
  { value: '2 min', label: 'Average signup' },
  { value: 'Multi-role', label: 'Patient and provider' },
  { value: 'Secure', label: 'Healthcare onboarding' },
];

const REGISTER_FLOATERS = [
  { icon: Stethoscope, label: 'Diagnostics', style: { top: '12%', right: '10%' } },
  { icon: Activity, label: 'Vitals', style: { top: '24%', right: '2%' } },
  { icon: HeartPulse, label: 'Cardiac', style: { top: '36%', right: '10%' } },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('Patient');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [providerForm, setProviderForm] = useState({
    specialization: '',
    qualification: '',
    experienceYears: 0,
    bio: '',
    clinicName: '',
    clinicAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleProv = (e) => setProviderForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const registerUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.register({ ...form, role });
      const newUserId = res.data.userId;
      setUserId(newUserId);
      if (role === 'Provider') setStep(2);
      else navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const registerProvider = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await providerAPI.register({
        ...providerForm,
        userId,
        experienceYears: parseInt(providerForm.experienceYears, 10),
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Provider profile creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-cinematic">
      <div className="auth-left auth-left-cinematic auth-left-register">
        <div className="auth-scene-grid" />
        <div className="auth-scene-glow auth-scene-glow-one" />
        <div className="auth-scene-glow auth-scene-glow-two" />

        {REGISTER_FLOATERS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`auth-floating-card auth-floating-card-${index + 1}`} style={item.style}>
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}

        <div className="auth-left-content">
          <div className="auth-scene-badge">
            <img src={medicalLogo} alt="" className="auth-scene-logo" />
            Provider and patient onboarding
          </div>

          <h1 className="auth-scene-title">
            Establish your account
            <br />
            <span>to orchestrate your care</span>
          </h1>

          <p className="auth-scene-copy">
            Register with a hospital-inspired interface designed to feel premium, trustworthy, and clearly structured for both care seekers and providers.
          </p>

          <div className="auth-metric-row">
            {REGISTER_METRICS.map((metric) => (
              <div key={metric.label} className="auth-metric-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>

          <div className="auth-feature-stack">
            {REGISTER_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="auth-feature-card">
                  <div className="auth-feature-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="auth-feature-title">{feature.title}</div>
                    <div className="auth-feature-desc">{feature.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="auth-clinical-board">
            <div className="auth-board-head">
              <div>
                <p className="auth-board-kicker">Onboarding track</p>
                <h3 className="auth-board-title">Hospital-grade account setup</h3>
              </div>
              <span className="auth-board-status">Ready</span>
            </div>
            <div className="auth-board-list">
              <div>
                <span className="auth-board-dot"></span>
                Choose a role and personalize your care access
              </div>
              <div>
                <span className="auth-board-dot"></span>
                Providers can complete specialization and clinic details
              </div>
              <div>
                <span className="auth-board-dot"></span>
                Accounts move into a secure long-term care workflow
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right auth-right-cinematic">
        <div className="auth-form-shell auth-form-shell-wide animate-scale">
          <div className="auth-form-shell-glow" />
          <div className="auth-box auth-box-cinematic">
            <div className="auth-brand-row" onClick={() => navigate('/')}>
              <span className="brand-emblem auth-brand-emblem">
                <img src={medicalLogo} alt="" className="medical-brand-icon" />
              </span>
              <span className="auth-brand-wordmark">
                Medi<span>Book</span>
              </span>
            </div>

            <div className="auth-headline-wrap">
              <h2 className="auth-title">{step === 1 ? 'Create your care account' : 'Complete provider profile'}</h2>
              <p className="auth-sub">
                {step === 1
                  ? 'A cleaner sign-up journey with role selection, stronger visuals, and smoother onboarding.'
                  : 'Add your practice details so patients can discover you with confidence.'}
              </p>
            </div>

            <div className="auth-mini-overview">
              <div className="auth-mini-chip">Role-based setup</div>
              <div className="auth-mini-chip">Clinical onboarding</div>
              <div className="auth-mini-chip">Modern trust signals</div>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            {step === 1 && (
              <form onSubmit={registerUser} className="auth-form-grid">
                <div className="auth-role-grid">
                  {['Patient', 'Provider'].map((itemRole) => (
                    <button
                      key={itemRole}
                      type="button"
                      className={`auth-role-card ${role === itemRole ? 'active' : ''}`}
                      onClick={() => setRole(itemRole)}
                    >
                      <span className="auth-role-icon">{itemRole === 'Patient' ? <HeartPulse size={18} /> : <Stethoscope size={18} />}</span>
                      <span className="auth-role-title">{itemRole}</span>
                      <span className="auth-role-desc">{itemRole === 'Patient' ? 'Book and manage care' : 'Manage practice and visibility'}</span>
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="auth-input-shell">
                    <User size={16} className="auth-input-icon" />
                    <input className="form-input auth-input" type="text" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handle} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="auth-input-shell">
                    <Mail size={16} className="auth-input-icon" />
                    <input className="form-input auth-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="auth-input-shell">
                    <Phone size={16} className="auth-input-icon" />
                    <input className="form-input auth-input" type="tel" name="phone" placeholder="+91 9999999999" value={form.phone} onChange={handle} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="auth-input-shell">
                    <Lock size={16} className="auth-input-icon" />
                    <input className="form-input auth-input" type="password" name="password" placeholder="Min 8 characters" value={form.password} onChange={handle} required minLength={6} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full auth-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" /> : <><ArrowRight size={16} /> {role === 'Provider' ? 'Continue' : 'Create Account'}</>}
                </button>

                <div className="auth-divider">
                  <div />
                  <span>or continue with</span>
                  <div />
                </div>

                <a href={`${API_BASE_URL}/oauth2/authorization/google`} className="auth-google-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </a>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={registerProvider} className="auth-form-grid">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <input className="form-input" name="specialization" placeholder="e.g. Cardiologist" value={providerForm.specialization} onChange={handleProv} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification *</label>
                    <input className="form-input" name="qualification" placeholder="e.g. MBBS, MD" value={providerForm.qualification} onChange={handleProv} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" name="experienceYears" min="0" value={providerForm.experienceYears} onChange={handleProv} />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinic Name *</label>
                  <input className="form-input" name="clinicName" placeholder="Apollo Hospital" value={providerForm.clinicName} onChange={handleProv} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinic Address *</label>
                  <input className="form-input" name="clinicAddress" placeholder="123 MG Road, Bangalore" value={providerForm.clinicAddress} onChange={handleProv} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio (optional)</label>
                  <textarea className="form-textarea" name="bio" placeholder="Brief description about yourself..." value={providerForm.bio} onChange={handleProv} style={{ minHeight: 84 }} />
                </div>

                <div className="auth-provider-actions">
                  <button type="button" className="btn btn-outline auth-provider-btn" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn btn-primary auth-provider-btn" disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Complete Registration'}
                  </button>
                </div>

                <div className="alert alert-info auth-provider-note">
                  Your provider profile will be reviewed before appearing in search results.
                </div>
              </form>
            )}

            <div className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-inline-link">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
