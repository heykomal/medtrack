import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserDetail } from '../services/adminApi.js';

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function UserDetail() {
  const { email }  = useParams();
  const navigate   = useNavigate();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetchUserDetail(decodeURIComponent(email))
      .then(setUser)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>User Detail</h2>
          <p className="page-header-sub">{decodeURIComponent(email)}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}>← Back to Users</button>
      </div>

      {loading && <div className="card"><div className="empty-state" style={{ padding: 40 }}>Loading…</div></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {user && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Account info */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Account Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { label: 'Email Address',   value: user.email },
                { label: 'Account Created', value: fmtDate(user.createdAt) },
                { label: 'Auth Method',     value: 'Email + Password' },
                { label: 'Status',          value: 'Active' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--bg)', border: '1.5px solid var(--border)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Avatar */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #0d9488, #2563eb)',
              color: '#fff', fontSize: 28, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{user.email}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Registered user</div>
              <div style={{ marginTop: 8 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0',
                }}>Active</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div style={{
            background: 'var(--primary-50, #eff6ff)', border: '1px solid var(--primary-200, #bfdbfe)',
            borderRadius: 12, padding: '14px 18px', fontSize: 13.5, color: 'var(--primary-700, #1d4ed8)',
            lineHeight: 1.6,
          }}>
            ℹ️ Medical records (diseases, prescriptions, medicines, dose logs) are stored by <strong>patient name</strong> in Appwrite.
            They are not directly linked to this account yet. Visit the <strong>Data</strong> section to browse all records.
          </div>
        </div>
      )}
    </div>
  );
}
