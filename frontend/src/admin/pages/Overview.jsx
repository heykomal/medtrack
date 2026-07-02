import { useState, useEffect } from 'react';
import { fetchStats, fetchLogs } from '../services/adminApi.js';

const STAT_CARDS = [
  { key: 'users',         label: 'Total Users',         icon: '👤', color: '#2563eb', bg: '#eff6ff' },
  { key: 'diseases',      label: 'Total Diseases',       icon: '🩺', color: '#0d9488', bg: '#f0fdfa' },
  { key: 'prescriptions', label: 'Total Prescriptions',  icon: '📄', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'medicines',     label: 'Total Medicines',      icon: '💊', color: '#059669', bg: '#f0fdf4' },
  { key: 'doseLogs',      label: 'Total Dose Logs',      icon: '📋', color: '#d97706', bg: '#fffbeb' },
  { key: 'newToday',      label: 'New Today',            icon: '🆕', color: '#dc2626', bg: '#fef2f2' },
];

const TYPE_COLOR = {
  Disease: '#0d9488', Prescription: '#7c3aed', Medicine: '#059669', 'Dose Log': '#d97706',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function StatCard({ icon, label, value, color, bg, loading }) {
  return (
    <div className="stat-v2-card" style={{ '--stat-color': color, '--stat-bg': bg }}>
      <div className="stat-v2-icon" style={{ background: bg, color }}>{icon}</div>
      <div className="stat-v2-val">{loading ? '—' : (value ?? 0)}</div>
      <div className="stat-v2-label">{label}</div>
    </div>
  );
}

export default function Overview() {
  const [stats,   setStats]   = useState(null);
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchLogs()])
      .then(([s, l]) => { setStats(s); setLogs(l.slice(0, 12)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Overview</h2>
          <p className="page-header-sub">Platform-wide statistics at a glance</p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 32 }}>
        {STAT_CARDS.map(({ key, label, icon, color, bg }) => (
          <StatCard key={key} icon={icon} label={label} color={color} bg={bg}
            value={stats?.[key]} loading={loading} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Recent Activity</div>
        {loading ? (
          <div className="empty-state" style={{ padding: 24 }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>No recent activity</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '11px 4px',
                borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 9px',
                  borderRadius: 20, whiteSpace: 'nowrap',
                  background: (TYPE_COLOR[log.type] || '#64748b') + '18',
                  color: TYPE_COLOR[log.type] || '#64748b',
                }}>{log.type}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {log.patient}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(log.at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
