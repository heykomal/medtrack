import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider.jsx';
import { useTheme } from '../components/ThemeProvider.jsx';
import { useToast } from '../components/Toast.jsx';
import { authLogin } from '../services/api.js';

function SunIcon()  {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);

  const { login }         = useAuth();
  const { theme, toggle } = useTheme();
  const navigate          = useNavigate();
  const toast             = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const trimEmail = email.trim();
    if (!trimEmail || !/\S+@\S+\.\S+/.test(trimEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authLogin(trimEmail, password);
      login({ email: trimEmail });
      toast('Signed in successfully!', 'success');
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Theme toggle */}
      <button className="auth-theme-toggle" onClick={toggle}
        title="Toggle theme" aria-label="Toggle colour scheme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="auth-card">
        {/* Brand */}
        <div className="auth-logo">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:40, height:40, borderRadius:10, background:'var(--green)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="7" rx="3.5" fill="white" opacity=".9"/>
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white" opacity=".9"/>
              </svg>
            </div>
            <span style={{ fontSize:20, fontWeight:800, letterSpacing:'-.4px', color:'var(--text)' }}>
              MedTrack
            </span>
          </div>
        </div>

        <h2 className="auth-heading">Welcome back</h2>
        <p className="auth-subheading">Sign in to your MedTrack account</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom:14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group" style={{ marginBottom:14 }}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              autoFocus
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom:4 }}>
            <label htmlFor="login-password">Password</label>
            <div style={{ position:'relative' }}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                style={{ paddingRight:44 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--muted)', fontSize:12, fontWeight:600, padding:0,
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            className="btn btn-success btn-full btn-lg"
            disabled={loading}
            style={{ marginTop:18 }}
          >
            {loading ? (
              <><span className="btn-spinner" /> Signing in…</>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop:20 }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
