import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { fetchAnalytics } from '../services/adminApi.js';

const BLUE   = '#2563eb';
const TEAL   = '#0d9488';
const GREEN  = '#059669';
const AMBER  = '#d97706';
const RED    = '#dc2626';
const BAR_COLORS = ['#2563eb','#0d9488','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];
const PIE_COLORS = { taken: GREEN, skipped: RED, pending: AMBER };

function SectionTitle({ children }) {
  return <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>{children}</div>;
}

function AdherenceRing({ value }) {
  const r = 52, sw = 14;
  const circ = 2 * Math.PI * r;
  const dash  = (value / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={136} height={136} viewBox="0 0 136 136">
        <circle cx={68} cy={68} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
        <circle cx={68} cy={68} r={r} fill="none" stroke={value >= 70 ? GREEN : value >= 40 ? AMBER : RED}
          strokeWidth={sw} strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x={68} y={62} textAnchor="middle" fill="var(--text)" fontSize={26} fontWeight={900}>{value}%</text>
        <text x={68} y={80} textAnchor="middle" fill="var(--muted)" fontSize={11}>adherence</text>
      </svg>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1.5px solid var(--border)',
      borderRadius: 10, padding: '8px 14px', fontSize: 13,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 2, color: 'var(--text)' }}>{label}</div>
      <div style={{ color: 'var(--muted)' }}>Count: <strong>{payload[0].value}</strong></div>
    </div>
  );
};

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="page-header"><div className="page-header-text"><h2>Analytics</h2></div></div>
      <div className="card"><div className="empty-state" style={{ padding: 40 }}>Loading analytics…</div></div>
    </div>
  );

  const pieData = data ? [
    { name: 'Taken',   value: data.doseStatus.taken   || 0, fill: GREEN },
    { name: 'Skipped', value: data.doseStatus.skipped || 0, fill: RED   },
    { name: 'Pending', value: data.doseStatus.pending || 0, fill: AMBER },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Analytics</h2>
          <p className="page-header-sub">Platform health and usage insights</p>
        </div>
      </div>

      {/* Row 1: Adherence + Dose Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
          <SectionTitle>Average Adherence</SectionTitle>
          <AdherenceRing value={data?.adherence ?? 0} />
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
            Based on taken vs. logged doses
          </p>
        </div>

        <div className="card" style={{ minHeight: 240 }}>
          <SectionTitle>Dose Status Breakdown</SectionTitle>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name]} contentStyle={{
                background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10,
              }} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Top Diseases */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle>Most Common Diseases</SectionTitle>
        {(!data?.topDiseases?.length) ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No disease data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topDiseases} layout="vertical" margin={{ left: 16, right: 24 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--border)" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12.5 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={26}>
                {data.topDiseases.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row 3: Top Medicines + Weekly Regs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <SectionTitle>Most Prescribed Medicines</SectionTitle>
          {(!data?.topMedicines?.length) ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No medicine data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topMedicines} layout="vertical" margin={{ left: 16, right: 24 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--border)" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12.5 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22} fill={TEAL} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <SectionTitle>Weekly Registrations</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.weeklyRegs || []} margin={{ left: 0, right: 16 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
