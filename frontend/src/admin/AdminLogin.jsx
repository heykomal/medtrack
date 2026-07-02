import { useState } from 'react';
import Logo from '../components/Logo.jsx';
import { useTheme } from '../components/ThemeProvider.jsx';
import { adminLogin } from './services/adminApi.js';

function SunIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function MoonIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }

function ShieldIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const { theme, toggle } = useTheme();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) { setError('Enter the admin password.'); return; }
    setError('');
    setLoading(true);
    try {
      await adminLogin(password.trim());
      onLogin(password.trim());
    } catch (err) {
      setError(err.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <button className="auth-theme-toggle" onClick={toggle} title="Toggle theme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="auth-card" style={{ maxWidth: 400 }}>
        <div className="auth-logo"><Logo height={44} /></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #1e3a5f, #1d6fa4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
          }}>
            <ShieldIcon />
          </div>
          <div>
            <h2 className="auth-heading" style={{ marginBottom: 0, textAlign: 'left', fontSize: 20 }}>Admin Panel</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Development access only</p>
          </div>
        </div>

        <div style={{
          background: 'var(--warning-50, #fffbeb)', border: '1px solid var(--warning-200, #fde68a)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          fontSize: 12.5, color: 'var(--warning-800, #92400e)', lineHeight: 1.5,
        }}>
          ⚠️ This panel is for administrators only. Do not share this URL.
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Admin Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                autoFocus
                style={{ paddingRight: 52 }}
                required
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12.5,
              }}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><span className="btn-spinner" /> Verifying…</> : 'Enter Admin Panel →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--muted)' }}>
          Password set in <code style={{ background: 'var(--surface-2, var(--border))', padding: '1px 5px', borderRadius: 4 }}>.env</code> → <code style={{ background: 'var(--surface-2, var(--border))', padding: '1px 5px', borderRadius: 4 }}>ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}
