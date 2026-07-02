import { useState, useEffect } from 'react';
import { fetchSystem } from '../services/adminApi.js';

function fmtUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: valueColor || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function StatusDot({ ok }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
      <span style={{ color: ok ? '#059669' : '#dc2626', fontWeight: 700 }}>{ok ? 'Connected' : 'Error'}</span>
    </span>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="card">
      <div className="card-title" style={{ marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [sys,     setSys]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetchSystem().then(setSys).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Settings</h2>
          <p className="page-header-sub">System information and environment status</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setLoading(true); fetchSystem().then(setSys).finally(() => setLoading(false)); }}>
          ↻ Refresh
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="card"><div className="empty-state" style={{ padding: 40 }}>Loading system info…</div></div>
      ) : sys && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Environment */}
          <SectionCard title="Environment">
            <InfoRow label="Environment"  value={sys.env}         valueColor={sys.env === 'production' ? '#dc2626' : '#059669'} />
            <InfoRow label="Node.js"      value={sys.nodeVersion} />
            <InfoRow label="Platform"     value={sys.platform}    />
            <InfoRow label="Port"         value={sys.port}        />
            <InfoRow label="Server Time"  value={new Date(sys.timestamp).toLocaleString('en-IN')} />
            <InfoRow label="Uptime"       value={fmtUptime(sys.uptime)} />
          </SectionCard>

          {/* Status */}
          <SectionCard title="Service Status">
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>API Server</span>
              <StatusDot ok />
            </div>
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>Appwrite Database</span>
              <StatusDot ok={sys.dbStatus === 'Connected'} />
            </div>
            <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>Admin Panel</span>
              <StatusDot ok />
            </div>
          </SectionCard>

          {/* Appwrite */}
          <SectionCard title="Appwrite Configuration">
            <InfoRow label="Endpoint"   value={sys.appwriteEndpoint} />
            <InfoRow label="Project ID" value={sys.appwriteProject}  />
            <InfoRow label="DB Status"  value={sys.dbStatus} valueColor={sys.dbStatus === 'Connected' ? '#059669' : '#dc2626'} />
            <InfoRow label="Total Users" value={sys.totalUsers} />
          </SectionCard>

          {/* Quick reference */}
          <SectionCard title="Admin Quick Reference">
            {[
              ['Admin URL',       '/admin'],
              ['API Base',        '/api/admin/*'],
              ['Auth Method',     'x-admin-token header'],
              ['Password Source', '.env → ADMIN_PASSWORD'],
              ['Session Storage', 'sessionStorage (tab only)'],
              ['User Data',       'backend/data/users.json'],
            ].map(([k, v]) => (
              <InfoRow key={k} label={k} value={v} />
            ))}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
