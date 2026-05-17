import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarClock,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { API_BASE_URL, authAPI, saveAuth } from '../../utils/api';
import medicalLogo from '../../assets/medical-logo.png';

const LOGIN_FEATURES = [
  { icon: HeartPulse, title: 'Care Continuity', desc: 'Revisit appointments, reports, and follow-ups from one secure place.' },
  { icon: CalendarClock, title: 'Fast Scheduling', desc: 'Move from login to booking with a cleaner patient-first flow.' },
  { icon: ShieldCheck, title: 'Protected Access', desc: 'Sensitive health actions stay inside a calm, trusted interface.' },
];

const LOGIN_METRICS = [
  { value: '24/7', label: 'Digital support' },
  { value: '500+', label: 'Verified doctors' },
  { value: '4.8', label: 'Care rating' },
];

const LOGIN_FLOATERS = [
  { icon: Stethoscope, label: 'Diagnostics', style: { top: '12%', right: '10%' } },
  { icon: Activity, label: 'Vitals', style: { top: '24%', right: '2%' } },
  { icon: HeartPulse, label: 'Cardiac', style: { top: '36%', right: '10%' } },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (params.get('reset') === 'success') {
      setResetSuccess(true);
      const timer = setTimeout(() => setResetSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.login({ email, password });

      if (res.data.requiresPhone === true) {
        const encodedEmail = encodeURIComponent(form.email);
        navigate(`/add-phone?email=${encodedEmail}`, { replace: true });
        return;
      }

      if (res.data.otpSent === true) {
        const encodedEmail = encodeURIComponent(form.email);
        navigate(`/otp?email=${encodedEmail}&source=normal`, { replace: true });
        return;
      }

      const { token, userId, fullName, role, email: responseEmail } = res.data;

      if (!token) {
        setError('Login failed: No token received.');
        setLoading(false);
        return;
      }

      if (!role || !userId) {
        setError('Login failed: Incomplete user data.');
        setLoading(false);
        return;
      }

      const user = {
        userId,
        email: responseEmail || form.email,
        fullName,
        role,
      };

      saveAuth(token, user);

      if (user.role === 'Patient') navigate('/patient', { replace: true });
      else if (user.role === 'Provider') navigate('/provider', { replace: true });
      else if (user.role === 'Admin') navigate('/admin', { replace: true });
      else setError(`Unknown user role: ${user.role}`);
    } catch (err) {
      if (err.response?.data?.requiresPhone === true) {
        const encodedEmail = encodeURIComponent(email);
        navigate(`/add-phone?email=${encodedEmail}`, { replace: true });
        return;
      }
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-cinematic">
      <div className="auth-left auth-left-cinematic">
        <div className="auth-scene-grid" />
        <div className="auth-scene-glow auth-scene-glow-one" />
        <div className="auth-scene-glow auth-scene-glow-two" />

        {LOGIN_FLOATERS.map((item, index) => {
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
            Hospital-grade digital experience
          </div>

          <h1 className="auth-scene-title">
            Step back into your
            <br />
            <span>MediBook care space</span>
          </h1>

          <p className="auth-scene-copy">
            A cinematic healthcare login experience inspired by hospital precision, calmer navigation, and premium digital trust.
          </p>

          <div className="auth-metric-row">
            {LOGIN_METRICS.map((metric) => (
              <div key={metric.label} className="auth-metric-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>

          <div className="auth-feature-stack">
            {LOGIN_FEATURES.map((feature) => {
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
                <p className="auth-board-kicker">Today&apos;s hospital flow</p>
                <h3 className="auth-board-title">Patient operations snapshot</h3>
              </div>
              <span className="auth-board-status">Live</span>
            </div>
            <div className="auth-board-list">
              <div>
                <span className="auth-board-dot"></span>
                08:30 AM consultation slots opening
              </div>
              <div>
                <span className="auth-board-dot"></span>
                Lab reports synced to patient record center
              </div>
              <div>
                <span className="auth-board-dot"></span>
                Teleconsultation rooms ready for providers
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right auth-right-cinematic">
        <div className="auth-form-shell animate-scale">
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
              <h2 className="auth-title">Sign in to continue care</h2>
              <p className="auth-sub">Access appointments, reports, and bookings with a more elevated hospital-style interface.</p>
            </div>

            <div className="auth-mini-overview">
              <div className="auth-mini-chip">Secure patient portal</div>
              <div className="auth-mini-chip">Instant doctor search</div>
              <div className="auth-mini-chip">Records and follow-ups</div>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}
            {resetSuccess && <div className="alert alert-success mb-4">Password reset successful! Please log in with your new password.</div>}

            <form onSubmit={submit} className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="auth-input-shell">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    className="form-input auth-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handle}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="auth-row-between">
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" className="auth-inline-link">
                    Forgot Password?
                  </Link>
                </div>
                <div className="auth-input-shell">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    className="form-input auth-input auth-input-password"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="Your password"
                    value={form.password}
                    onChange={handle}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="auth-input-action">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full auth-submit-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : <><ArrowRight size={16} /> Sign In</>}
              </button>
            </form>

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

            <div className="auth-footer-text">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-inline-link">
                Create Account
              </Link>
            </div>

            <div className="auth-demo-card">
              <p className="auth-demo-label">Demo credentials</p>
              {[
                { role: 'Patient', email: 'patient@demo.com' },
                { role: 'Provider', email: 'doctor@demo.com' },
                { role: 'Admin', email: 'admin@demo.com' },
              ].map((demo) => (
                <div key={demo.role} className="auth-demo-row">
                  <strong>{demo.role}:</strong> {demo.email} / password123
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
