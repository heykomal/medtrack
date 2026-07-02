import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDoseLogs, getMedicines, createDoseLog, getDiseases, getPrescriptions,
} from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../components/AuthProvider.jsx';
import {
  IconCheck, IconX, IconClock, IconPill, IconBell, IconVirus,
  IconClipboard, IconCheckSquare, IconActivity,
} from '../components/Icons.jsx';

const CIRC = 2 * Math.PI * 38;

function todayISO() { return new Date().toISOString().split('T')[0]; }
function nowHHMM() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}
function greetingPhrase() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
function ringColor(pct) {
  if (pct >= 80) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}
function dateLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

const QUICK = [
  { emoji: '🩺', label: 'Diseases',      desc: 'Track & manage health conditions',   to: '/diseases',      color: '#0d9488', bg: 'var(--teal-100)'    },
  { emoji: '📄', label: 'Prescriptions', desc: "Manage doctor's prescriptions",      to: '/prescriptions', color: '#2563eb', bg: 'var(--primary-100)' },
  { emoji: '💊', label: 'Medicines',     desc: 'Schedule your daily dose reminders', to: '/medicines',     color: '#7c3aed', bg: 'var(--purple-100)'  },
  { emoji: '📋', label: 'Dose Logs',     desc: 'Log and track your daily doses',     to: '/dose-log',      color: '#059669', bg: 'var(--success-100)' },
];

const ROADMAP = [
  { key: 'diseases',      num: 1, label: 'Add Disease',      desc: 'Record a health condition',  to: '/diseases'      },
  { key: 'prescriptions', num: 2, label: 'Add Prescription', desc: 'Link a doctor prescription', to: '/prescriptions' },
  { key: 'medicines',     num: 3, label: 'Add Medicines',    desc: 'Set medicines with times',   to: '/medicines'     },
  { key: 'doseLogs',      num: 4, label: 'Track Doses',      desc: 'Log your first dose today',  to: '/dose-log'      },
];

export default function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [setup, setSetup]         = useState({ diseases: false, prescriptions: false, medicines: false, doseLogs: false });

  const toast    = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const today    = todayISO();

  useEffect(() => {
    async function load() {
      try {
        const [medRes, logRes, dRes, pRes] = await Promise.all([
          getMedicines(),
          getDoseLogs({ date: today }),
          getDiseases(),
          getPrescriptions(),
        ]);
        const meds      = (medRes.documents || []).filter(m => m.active);
        const todayLogs = logRes.documents || [];
        setMedicines(meds);
        setLogs(todayLogs);
        setSetup({
          diseases:      (dRes.documents || []).length > 0,
          prescriptions: (pRes.documents || []).length > 0,
          medicines:     meds.length > 0,
          doseLogs:      todayLogs.some(l => l.status !== 'pending'),
        });
      } catch (e) { setError(e.message); }
      finally     { setLoading(false); }
    }
    load();
  }, []);

  const schedule = [];
  for (const med of medicines) {
    for (const t of (med.times || [])) {
      const log = logs.find(l => l.medicineid === med.$id && l.scheduledtime === t);
      schedule.push({ med, time: t, log });
    }
  }
  schedule.sort((a, b) => a.time.localeCompare(b.time));

  const taken    = schedule.filter(s => s.log?.status === 'taken').length;
  const skipped  = schedule.filter(s => s.log?.status === 'skipped').length;
  const pending  = schedule.filter(s => !s.log || s.log.status === 'pending').length;
  const total    = schedule.length;
  const adherence  = total > 0 ? Math.round((taken / total) * 100) : 0;
  const dashOffset = CIRC - (adherence / 100) * CIRC;

  const displayName = user?.name?.split(' ')[0]
    || user?.patientName?.split(' ')[0]
    || medicines[0]?.patientname?.split(' ')[0]
    || 'there';
  const isCaretaker = user?.role === 'caretaker';
  const allDone     = Object.values(setup).every(Boolean);
  const doneCount   = Object.values(setup).filter(Boolean).length;

  async function markDose(med, time, status) {
    try {
      const log = await createDoseLog({
        medicineid:    med.$id,
        medicinename:  med.name,
        patientname:   med.patientname,
        date:          today,
        scheduledtime: time,
        status,
      });
      setLogs(prev => {
        const f = prev.filter(l => !(l.medicineid === med.$id && l.scheduledtime === time));
        return [...f, log];
      });
      toast(
        status === 'taken' ? `${med.name} marked taken ✓` : `${med.name} skipped`,
        status === 'taken' ? 'success' : 'info',
      );
    } catch (e) { toast('Failed: ' + e.message, 'error'); }
  }

  if (loading) {
    return (
      <div className="dash-root">
        <div className="skeleton" style={{ height: 120, borderRadius: 24, marginBottom: 0 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 20 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div className="skeleton" style={{ height: 160, borderRadius: 18 }} />
          <div className="skeleton" style={{ height: 160, borderRadius: 18 }} />
        </div>
        <div className="skeleton" style={{ height: 240, borderRadius: 18 }} />
      </div>
    );
  }

  return (
    <div className="dash-root">

      {error && (
        <div className="alert alert-error">
          <IconBell size={15} /> {error}
        </div>
      )}

      {/* ══ 1. HERO GREETING ══ */}
      <div className="dash-greeting">
        <div className="dash-greeting-blob dash-greeting-blob-1" />
        <div className="dash-greeting-blob dash-greeting-blob-2" />
        <div className="dash-greeting-content">
          <div className="dash-greeting-phrase">{greetingPhrase()}</div>
          <h2 className="dash-greeting-name">{displayName} 👋</h2>
          <p className="dash-greeting-date">{dateLabel()}</p>
          <p className="dash-greeting-msg">
            {isCaretaker
              ? '❤️ They need love along with their medicines. Thank you for being there.'
              : "❤️ We hope you'll feel better soon. Take care of yourself."}
          </p>
        </div>
      </div>

      {/* ══ 2. GETTING STARTED ══ */}
      {!allDone && (
        <div className="card dash-gs-card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <span className="card-title" style={{ fontSize: 13.5, fontWeight: 700 }}>
              🚀 Getting Started
            </span>
            <span className="badge badge-blue">{doneCount} / 4 done</span>
          </div>
          <div className="dash-gs-horizontal">
            {ROADMAP.map((step, i, arr) => {
              const done = setup[step.key];
              return (
                <div key={step.key} className="dash-gs-h-row">
                  <div
                    className={`dash-gs-h-step${done ? ' dash-gs-h-done' : ''}`}
                    onClick={() => !done && navigate(step.to)}
                    style={{ cursor: done ? 'default' : 'pointer' }}
                    role={done ? undefined : 'button'}
                    tabIndex={done ? -1 : 0}
                    onKeyDown={e => e.key === 'Enter' && !done && navigate(step.to)}
                  >
                    <div className="dash-gs-h-num">
                      {done ? <IconCheck size={13} /> : step.num}
                    </div>
                    <div className="dash-gs-h-info">
                      <div className="dash-gs-h-label">{step.label}</div>
                      <div className="dash-gs-h-desc">{step.desc}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`dash-gs-h-arrow${done ? ' done' : ''}`}>→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ 3. QUICK ACTIONS — ProChamps module style ══ */}
      <div>
        <div className="dash-section-label">Quick Actions</div>
        <div className="qa-modules">
          {QUICK.map(a => (
            <button key={a.to} className="qa-mod" onClick={() => navigate(a.to)}>
              <div className="qa-mod-top">
                <div className="qa-mod-icon" style={{ background: a.bg, color: a.color }}>
                  <span style={{ fontSize: 24 }}>{a.emoji}</span>
                </div>
                <div className="qa-mod-arrow-btn" style={{ color: a.color }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
              <div className="qa-mod-bottom">
                <div className="qa-mod-title">{a.label}</div>
                <div className="qa-mod-desc">{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ══ 4 + 5. SUMMARY STATS  +  ADHERENCE ══ */}
      <div className="dash-two-col">

        {/* Left: premium stat cards */}
        <div>
          <div className="dash-section-label">Today&apos;s Summary</div>
          <div className="stat-v2-grid">
            {[
              { label: 'Doses Today', value: total,   color: '#2563eb', bg: 'var(--primary-50)', icon: <IconPill size={17}/>  },
              { label: 'Taken',       value: taken,   color: '#059669', bg: 'var(--success-50)', icon: <IconCheck size={17}/> },
              { label: 'Skipped',     value: skipped, color: '#dc2626', bg: 'var(--danger-50)',  icon: <IconX size={17}/>     },
              { label: 'Pending',     value: pending, color: '#d97706', bg: 'var(--warning-50)', icon: <IconClock size={17}/> },
            ].map(({ label, value, color, bg, icon }) => (
              <div
                key={label}
                className="stat-v2-card"
                style={{ '--stat-color': color, '--stat-bg': bg }}
              >
                <div className="stat-v2-icon" style={{ background: bg, color }}>{icon}</div>
                <div className="stat-v2-val">{value}</div>
                <div className="stat-v2-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: adherence ring */}
        <div className="card dash-adh-compact">
          <div className="dash-adh-compact-top">
            <div className="dash-adh-ring-wrap" style={{ width: 100, height: 100 }}>
              <svg viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="38" fill="none"
                  stroke="var(--gray-100)" strokeWidth="10" />
                <circle cx="50" cy="50" r="38" fill="none"
                  stroke={ringColor(adherence)} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="239"
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
                />
              </svg>
              <div className="dash-adh-ring-label">
                <span className="dash-adh-pct">{adherence}%</span>
                <span className="dash-adh-sub">done</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>
                Today&apos;s Adherence
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                {total > 0 ? `${taken} of ${total} doses taken` : 'No schedule yet'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Taken',   count: taken,   color: '#10b981' },
                  { label: 'Skipped', count: skipped, color: '#ef4444' },
                  { label: 'Pending', count: pending, color: 'var(--gray-300)' },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--muted)', flex: 1 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', minWidth: 18, textAlign: 'right' }}>{count}</span>
                    <div style={{ width: 60, height: 4, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: color, width: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%', transition: 'width 1s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 6. TODAY'S SCHEDULE ══ */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <IconActivity size={14} style={{ verticalAlign: 'middle' }} />
            {' '}Today&apos;s Schedule
          </span>
          <span className="badge badge-blue">
            {schedule.length} dose{schedule.length !== 1 ? 's' : ''}
          </span>
        </div>

        {schedule.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconPill size={26} /></div>
            <h3>No medicines scheduled</h3>
            <p>Add medicines with reminder times to see your daily schedule here.</p>
          </div>
        ) : (
          <div className="sch-list">
            {schedule.map(({ med, time, log }) => {
              const status  = log?.status;
              const isPast  = time <= nowHHMM();
              const isTaken = status === 'taken';
              const isSkip  = status === 'skipped';
              const isPend  = !status || status === 'pending';
              return (
                <div
                  key={`${med.$id}-${time}`}
                  className={`sch-card ${isTaken ? 'sch-taken' : isSkip ? 'sch-skipped' : isPast ? 'sch-past' : 'sch-upcoming'}`}
                >
                  <div className="sch-stripe" />
                  <div className="sch-time-col">
                    <div className="sch-time-badge">
                      <IconClock size={9} style={{ display: 'inline', marginRight: 2, verticalAlign: 'middle' }} />
                      {time}
                    </div>
                    {isPast && isPend && <div className="sch-overdue">overdue</div>}
                  </div>
                  <div className="sch-pill-icon">💊</div>
                  <div className="sch-info">
                    <div className="sch-name">{med.name}</div>
                    <div className="sch-meta">
                      <span className="sch-dosage">{med.dosage} {med.unit}</span>
                      {med.patientname && <span className="sch-patient"> · {med.patientname}</span>}
                      {med.instructions && <span className="sch-instruct"> · {med.instructions}</span>}
                    </div>
                  </div>
                  <div className="sch-actions">
                    {isTaken && (
                      <>
                        <span className="badge badge-green"><IconCheck size={10} /> Taken</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => markDose(med, time, 'skipped')}>Undo</button>
                      </>
                    )}
                    {isSkip && (
                      <>
                        <span className="badge badge-red"><IconX size={10} /> Skipped</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => markDose(med, time, 'taken')}>Undo</button>
                      </>
                    )}
                    {isPend && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => markDose(med, time, 'taken')}>
                          <IconCheck size={12} /> Take
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => markDose(med, time, 'skipped')}>
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
