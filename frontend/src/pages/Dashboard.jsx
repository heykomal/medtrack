import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDoseLogs, getMedicines, createDoseLog,
  getDiseases, getPrescriptions,
} from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../components/AuthProvider.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS      = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CIRC_HERO = 2 * Math.PI * 48;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toISO(d) { return d.toISOString().split('T')[0]; }
function todayISO() { return toISO(new Date()); }

function nowHHMM() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}

function timeGroup(hhmm) {
  const h = parseInt(hhmm.split(':')[0], 10);
  if (h < 12) return 'MORNING';
  if (h < 17) return 'AFTERNOON';
  return 'EVENING';
}

function getDayStatus(dateStr, logs, totalExpected, todayStr) {
  if (dateStr > todayStr) return 'future';
  if (totalExpected === 0) return 'no-meds';
  const taken   = logs.filter(l => l.status === 'taken').length;
  const skipped = logs.filter(l => l.status === 'skipped').length;
  if (taken >= totalExpected) return 'taken';
  if (taken > 0)              return 'partial';
  if (skipped > 0)            return 'missed';
  if (dateStr < todayStr)     return 'missed';
  return 'upcoming';
}

function heroStatus(pct) {
  if (pct >= 80) return { badge: 'On Track',       cls: '',      dot: '#22c55e' };
  if (pct >= 50) return { badge: 'Needs Attention', cls: 'warn',  dot: '#f59e0b' };
  return           { badge: 'At Risk',          cls: 'alert', dot: '#ef4444' };
}

function greetingPhrase() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function motivationalMsg(pct) {
  if (pct >= 80) return "You're doing great — consistency is everything.";
  if (pct >= 50) return "You're halfway there. A few more doses make all the difference.";
  if (pct > 0)   return "Let's get back on track today. Every dose counts.";
  return "Welcome! Start by setting up your medicines below.";
}

function fmtDate(d = new Date()) {
  return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
}

// ── Count-up animation component ──────────────────────────────────────────────
function CountUp({ target, duration = 800 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val}</>;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ArrowRightIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
function ChevronRight({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function QuestionIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ── Quick action card data ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    to: '/diseases', label: 'Diseases', sub: 'Track conditions',
    accent: '#a855f7', grad: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 12h8M12 8v8"/>
      </svg>
    ),
    stat: (c) => c.diseases > 0 ? `${c.diseases} condition${c.diseases !== 1 ? 's' : ''}` : 'None added yet',
  },
  {
    to: '/prescriptions', label: 'Prescriptions', sub: 'View Rx details',
    accent: '#0ea5e9', grad: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    stat: (c) => c.prescriptions > 0 ? `${c.prescriptions} prescription${c.prescriptions !== 1 ? 's' : ''}` : 'None added yet',
  },
  {
    to: '/medicines', label: 'Medicines', sub: 'Manage schedule',
    accent: '#22c55e', grad: 'linear-gradient(135deg,#22c55e,#4ade80)',
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <rect x="3" y="11" width="18" height="7" rx="3.5"/>
        <rect x="10" y="4" width="4" height="16" rx="2"/>
      </svg>
    ),
    stat: (c) => c.medicines > 0 ? `${c.medicines} medicine${c.medicines !== 1 ? 's' : ''}` : 'None added yet',
  },
  {
    to: '/dose-log', label: 'Dose Log', sub: 'See history',
    accent: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    stat: (c) => c.logs > 0 ? `${c.logs} log${c.logs !== 1 ? 's' : ''} recorded` : 'No logs yet',
  },
];

// ── Tutorial panel content ─────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { icon:'🦠', color:'#a855f7', title:'Disease',      desc:'Record your health condition' },
  { icon:'📋', color:'#0ea5e9', title:'Prescription', desc:"Link doctor's prescription"   },
  { icon:'💊', color:'#22c55e', title:'Medicine',     desc:'Set dose times and schedule'  },
  { icon:'⏰', color:'#f59e0b', title:'Reminder',     desc:'Get reminded at dose times'   },
  { icon:'✅', color:'#22c55e', title:'Dose Log',     desc:'Mark taken and track history' },
];
const TIPS = [
  'Set medicine times in 24hr format (08:00, not 8am)',
  'Add multiple medicines per prescription',
  'Check dashboard daily to see today\'s doses',
  'Green dot = all taken, Red dot = missed',
];

function TutorialPanel({ setup, onClose }) {
  const [tab, setTab] = useState(0);
  const tabs = ['Getting Started', 'How it Works', 'Tips'];

  const checklist = [
    { key:'diseases',      label:'Add your first disease',       sub:'Record a health condition' },
    { key:'prescriptions', label:'Create a prescription',        sub:"Link doctor's Rx"          },
    { key:'medicines',     label:'Add medicines with dose times', sub:'Set your schedule'         },
    { key:'doseLogs',      label:'Log your first dose',          sub:'Mark as taken'              },
  ];

  return (
    <div className="dash-tut-panel">
      <div className="dash-tut-panel-header">
        <div className="dash-tut-tabs">
          {tabs.map((t, i) => (
            <button key={t} className={`dash-tut-tab${tab === i ? ' active' : ''}`}
              onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
        <button className="dash-tut-panel-close" onClick={onClose} aria-label="Close">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="dash-tut-panel-body">
        {tab === 0 && (
          <div className="dash-tut-checklist">
            {checklist.map((item, i) => {
              const done = setup[item.key];
              return (
                <div key={item.key} className={`dash-tut-check-item${done ? ' done' : ''}`}>
                  <div className="dash-tut-check-box">
                    {done && <CheckIcon size={12} />}
                  </div>
                  <div>
                    <div className="dash-tut-check-label">{item.label}</div>
                    <div className="dash-tut-check-sub">{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 1 && (
          <div className="dash-tut-timeline">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="dash-tut-step">
                <div className="dash-tut-step-left">
                  <div className="dash-tut-step-icon" style={{ background: step.color + '22', color: step.color }}>
                    {step.icon}
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && <div className="dash-tut-step-line" />}
                </div>
                <div className="dash-tut-step-body">
                  <div className="dash-tut-step-title">{step.title}</div>
                  <div className="dash-tut-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div className="dash-tut-tips">
            {TIPS.map((tip, i) => (
              <div key={i} className="dash-tut-tip">
                <span className="dash-tut-tip-icon">💡</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Getting-started steps ──────────────────────────────────────────────────────
function GettingStarted({ setup }) {
  const steps = [
    { key:'diseases',      label:'Add a disease',       sub:'Track your condition' },
    { key:'prescriptions', label:'Add prescription',    sub:'Enter Rx details'     },
    { key:'medicines',     label:'Add medicines',       sub:'Set your schedule'    },
    { key:'doseLogs',      label:'Log your first dose', sub:'Mark as taken'        },
  ];
  return (
    <div className="card dash-gs-card">
      <div className="card-header" style={{ marginBottom:16 }}>
        <span className="card-title" style={{ fontSize:11, letterSpacing:'.08em', textTransform:'uppercase' }}>
          Getting Started
        </span>
        <span style={{ fontSize:12, color:'var(--muted)' }}>
          {steps.filter(s => setup[s.key]).length} of {steps.length} done
        </span>
      </div>
      <div className="dash-gs-steps">
        {steps.map((step, i) => {
          const done = setup[step.key];
          return (
            <div key={step.key} className={`dash-gs-step${done ? ' done' : ''}`}>
              <div className="dash-gs-check">
                {done ? <CheckIcon size={12} /> : <span className="dash-gs-num">{i + 1}</span>}
              </div>
              <div className="dash-gs-info">
                <div className="dash-gs-label">{step.label}</div>
                <div className="dash-gs-sub">{step.sub}</div>
              </div>
              {i < steps.length - 1 && <div className="dash-gs-arrow"><ChevronRight size={12} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [calLogs,   setCalLogs]   = useState({});
  const [setup,     setSetup]     = useState({ diseases:false, prescriptions:false, medicines:false, doseLogs:false });
  const [counts,    setCounts]    = useState({ diseases:0, prescriptions:0, medicines:0, logs:0 });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [tutOpen,   setTutOpen]   = useState(false);

  const heroRingRef = useRef(null);
  const calStripRef = useRef(null);

  const toast    = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const today    = todayISO();

  const displayName = user?.name || user?.patientName || user?.email?.split('@')[0] || 'there';

  const dates = (() => {
    const now = new Date();
    return Array.from({ length: now.getDate() }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      return toISO(d);
    });
  })();

  useEffect(() => {
    async function load() {
      try {
        const [medRes, diseaseRes, prescRes, ...logResults] = await Promise.all([
          getMedicines(),
          getDiseases(),
          getPrescriptions(),
          ...dates.map(d => getDoseLogs({ date: d })),
        ]);

        const meds = (medRes.documents || []).filter(m => m.active);
        setMedicines(meds);

        const byDate = {};
        dates.forEach((d, i) => { byDate[d] = logResults[i].documents || []; });
        setCalLogs(byDate);
        setTodayLogs(byDate[today] || []);

        const allLogs = logResults.flatMap(r => r.documents || []);
        const dCount  = (diseaseRes.documents || []).length;
        const pCount  = (prescRes.documents   || []).length;

        setSetup({
          diseases:      dCount > 0,
          prescriptions: pCount > 0,
          medicines:     meds.length > 0,
          doseLogs:      allLogs.length > 0,
        });
        setCounts({ diseases: dCount, prescriptions: pCount, medicines: meds.length, logs: allLogs.length });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate hero ring
  useEffect(() => {
    if (!loading && heroRingRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (heroRingRef.current) {
            heroRingRef.current.style.strokeDashoffset =
              String(CIRC_HERO * (1 - weekAdherence / 100));
          }
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Auto-scroll calendar
  useEffect(() => {
    if (!loading && calStripRef.current) {
      calStripRef.current.scrollLeft = calStripRef.current.scrollWidth;
    }
  }, [loading]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalExpected = medicines.reduce((s, m) => s + (m.times || []).length, 0);
  const last7         = dates.slice(-7);
  const weekTaken     = last7.reduce((s, d) => s + (calLogs[d] || []).filter(l => l.status === 'taken').length, 0);
  const weekExpected  = totalExpected * last7.length;
  const weekAdherence = weekExpected > 0 ? Math.round((weekTaken / weekExpected) * 100) : 0;

  const schedule = [];
  for (const med of medicines) {
    for (const t of (med.times || [])) {
      const log = todayLogs.find(l => l.medicineid === med.$id && l.scheduledtime === t);
      schedule.push({ med, time: t, log });
    }
  }
  schedule.sort((a, b) => a.time.localeCompare(b.time));

  const now          = nowHHMM();
  const takenToday   = schedule.filter(s => s.log?.status === 'taken').length;
  const skippedToday = schedule.filter(s => s.log?.status === 'skipped').length;
  const missedToday  = schedule.filter(s =>
    (!s.log || s.log.status === 'pending') && s.time < now
  ).length;
  const nextDoseTime = schedule
    .filter(s => (!s.log || s.log.status === 'pending') && s.time > now)
    .map(s => s.time)[0] || null;

  const groups = {};
  for (const item of schedule) {
    const g = timeGroup(item.time);
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  }
  const GROUP_ORDER = ['MORNING', 'AFTERNOON', 'EVENING'];

  const calDays = dates.map(dateStr => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      dateStr, d,
      isToday: dateStr === today,
      status:  getDayStatus(dateStr, calLogs[dateStr] || [], totalExpected, today),
    };
  });

  const { badge, cls, dot: badgeDot } = heroStatus(weekAdherence);
  const isFirstTime = !setup.diseases && !setup.prescriptions && !setup.medicines;

  // ── Actions ────────────────────────────────────────────────────────────────
  async function markDose(med, time, status) {
    try {
      const existing = todayLogs.find(l => l.medicineid === med.$id && l.scheduledtime === time);
      if (existing && existing.status === status) return;

      const log = await createDoseLog({
        medicineid: med.$id, medicinename: med.name, patientname: med.patientname,
        date: today, scheduledtime: time, status,
      });

      setTodayLogs(prev => {
        const filtered = prev.filter(l => !(l.medicineid === med.$id && l.scheduledtime === time));
        return [...filtered, log];
      });

      toast(
        status === 'taken' ? `${med.name} marked taken ✓` : `${med.name} skipped`,
        status === 'taken' ? 'success' : 'info',
      );
    } catch (e) {
      toast('Failed: ' + e.message, 'error');
    }
  }

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dash-root">
        <div className="dash-hero-v2">
          <div style={{ display:'flex', gap:32, alignItems:'center' }}>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14 }}>
              <div className="skeleton" style={{ height:12, width:'28%' }} />
              <div className="skeleton" style={{ height:36, width:'50%' }} />
              <div className="skeleton" style={{ height:14, width:'38%' }} />
              <div className="skeleton" style={{ height:14, width:'65%' }} />
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <div className="skeleton" style={{ height:34, width:150, borderRadius:999 }} />
                <div className="skeleton" style={{ height:34, width:150, borderRadius:999 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width:120, height:120, borderRadius:'50%', flexShrink:0 }} />
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:130, borderRadius:16 }} />)}
        </div>
        <div className="card">
          <div className="skeleton" style={{ height:12, width:'28%', marginBottom:16 }} />
          <div style={{ display:'flex', gap:6 }}>
            {Array.from({length:11}).map((_,i) => (
              <div key={i} className="skeleton" style={{ width:44, height:72, borderRadius:10, flexShrink:0 }} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="skeleton" style={{ height:12, width:'28%', marginBottom:16 }} />
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:62, marginBottom:8, borderRadius:12 }} />)}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dash-root">
      {error && <div className="alert alert-error">{error}</div>}

      {/* ══ HERO CARD ══ */}
      <div className="dash-hero-v2">
        <div className="dash-hero-v2-inner">
          <div className="dash-hero-v2-left">
            <div className="dash-hero-v2-greeting">{greetingPhrase().toUpperCase()}</div>
            <div className="dash-hero-v2-name">
              {displayName}
              <span className="dash-hero-v2-wave" aria-hidden="true"> 👋</span>
            </div>
            <div className="dash-hero-v2-date">{fmtDate()}</div>
            <div className="dash-hero-v2-msg">{motivationalMsg(weekAdherence)}</div>
            <div className="dash-hero-v2-pills">
              <div className="dash-hero-v2-pill">
                <span>💊</span>
                {schedule.length} medicine{schedule.length !== 1 ? 's' : ''} today
              </div>
              <div className="dash-hero-v2-pill">
                <span>⏰</span>
                Next dose: {nextDoseTime || '—'}
              </div>
            </div>
          </div>

          <div className="dash-hero-v2-right">
            <div className={`dash-hero-v2-badge${cls ? ` ${cls}` : ''}`}>
              <span className="dash-hero-v2-badge-dot" style={{ background: badgeDot }} />
              {badge}
            </div>
            <div className="dash-hero-v2-ring-wrap">
              <div className="dash-hero-v2-orb" />
              <svg viewBox="0 0 120 120" width="120" height="120"
                role="img" aria-label={`${weekAdherence}% weekly adherence`}>
                <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10"/>
                <circle
                  ref={heroRingRef}
                  cx="60" cy="60" r="48" fill="none"
                  stroke="#22c55e" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={CIRC_HERO} strokeDashoffset={CIRC_HERO}
                  transform="rotate(-90 60 60)"
                  style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter:'drop-shadow(0 0 6px rgba(34,197,94,.6))' }}
                />
              </svg>
              <div className="dash-hero-v2-ring-label">
                <span className="dash-hero-v2-ring-pct">{weekAdherence}%</span>
                <span className="dash-hero-v2-ring-sub">THIS WEEK</span>
              </div>
            </div>
            <div className="dash-hero-v2-mini-stats">
              <div className="dash-hero-v2-mini-stat">
                <span className="dash-hero-v2-mini-val" style={{ color:'#22c55e' }}>
                  <CountUp target={takenToday} />
                </span>
                <span className="dash-hero-v2-mini-lbl">Taken</span>
              </div>
              <div className="dash-hero-v2-mini-sep" />
              <div className="dash-hero-v2-mini-stat">
                <span className="dash-hero-v2-mini-val" style={{ color:'#ef4444' }}>
                  <CountUp target={missedToday} />
                </span>
                <span className="dash-hero-v2-mini-lbl">Missed</span>
              </div>
              <div className="dash-hero-v2-mini-sep" />
              <div className="dash-hero-v2-mini-stat">
                <span className="dash-hero-v2-mini-val" style={{ color:'var(--muted)' }}>
                  <CountUp target={skippedToday} />
                </span>
                <span className="dash-hero-v2-mini-lbl">Skipped</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ GETTING STARTED ══ */}
      {isFirstTime && <GettingStarted setup={setup} />}

      {/* ══ QUICK ACTIONS ══ */}
      <div>
        <div className="dash-section-label-v2">Quick Actions</div>
        <div className="dash-qa-v2-grid">
          {QUICK_ACTIONS.map(({ to, label, sub, accent, grad, icon, stat }) => (
            <button
              key={to}
              className="dash-qa-v2-card"
              style={{ '--qa-accent': accent }}
              onClick={() => navigate(to)}
            >
              <div className="dash-qa-v2-top">
                <div className="dash-qa-v2-icon" style={{ background: grad }}>{icon}</div>
                <div className="dash-qa-v2-arrow"><ArrowRightIcon size={14} /></div>
              </div>
              <div className="dash-qa-v2-bottom">
                <div className="dash-qa-v2-label">{label}</div>
                <div className="dash-qa-v2-sub">{sub}</div>
                <div className="dash-qa-v2-stat" style={{ color: accent }}>{stat(counts)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ══ MONTHLY HISTORY ══ */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ fontSize:11, letterSpacing:'.08em', textTransform:'uppercase' }}>
            {new Date().toLocaleDateString('en-US', { month:'long' })} History
          </span>
          <span style={{ fontSize:12, color:'var(--muted)' }}>
            {dates.length} {dates.length === 1 ? 'day' : 'days'} this month
          </span>
        </div>

        <div className="cal14-strip" ref={calStripRef} role="list" aria-label="Monthly dose history">
          {calDays.map(({ dateStr, d, isToday, status }) => {
            const showDot = status !== 'future' && status !== 'no-meds' && status !== 'upcoming';
            return (
              <div
                key={dateStr}
                className={`cal14-day ${status}${isToday ? ' today' : ''}`}
                role="listitem"
                aria-label={`${DAYS[d.getDay()]} ${d.getDate()}: ${status}`}
              >
                <span className="cal14-dn">{DAYS[d.getDay()]}</span>
                <span className="cal14-date">{d.getDate()}</span>
                {showDot ? <span className="cal14-dot" /> : <span className="cal14-dot-empty" />}
              </div>
            );
          })}
        </div>

        {!setup.doseLogs && (
          <p className="cal14-empty-hint">Start logging doses to see your history here.</p>
        )}

        <div className="cal14-legend">
          {[
            { color:'var(--green)',  label:'All taken' },
            { color:'var(--yellow)', label:'Partial'   },
            { color:'var(--red)',    label:'Missed'     },
            { color:'var(--border)', label:'No data'   },
          ].map(({ color, label }) => (
            <div key={label} className="cal14-legend-item">
              <div className="cal14-legend-dot" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ══ TODAY'S DOSES ══ */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ fontSize:11, letterSpacing:'.08em', textTransform:'uppercase' }}>
            Today's Doses
          </span>
          <span style={{ fontSize:12, color:'var(--muted)' }}>
            {takenToday} of {schedule.length} done
          </span>
        </div>

        {schedule.length === 0 ? (
          /* ── Enhanced empty state ── */
          <div className="doses-empty-v2">
            <div className="doses-empty-pill-icon">
              <div className="doses-empty-pill-divider" />
            </div>
            <div className="doses-empty-title">Nothing scheduled for today</div>
            <div className="doses-empty-sub-text">
              Add medicines with dose times to see them here.
            </div>
            <button
              className="btn btn-success"
              style={{ marginTop:16 }}
              onClick={() => navigate(counts.diseases === 0 ? '/diseases' : counts.prescriptions === 0 ? '/prescriptions' : '/medicines')}
            >
              {counts.diseases === 0
                ? 'Get Started →'
                : counts.prescriptions === 0
                ? 'Add Prescription →'
                : 'Add Medicine →'}
            </button>
          </div>
        ) : (
          GROUP_ORDER.filter(g => groups[g]).map(group => (
            <div key={group}>
              <div className="dose-group-label">{group}</div>
              {groups[group].map(({ med, time, log }, idx) => {
                const status  = log?.status;
                const isTaken = status === 'taken';
                const isSkip  = status === 'skipped';
                const isPast  = time <= now;

                return (
                  <div
                    key={`${med.$id}-${time}`}
                    className={`dose-card-v2 dose-stagger${isTaken ? ' taken' : isSkip ? ' skipped' : ''}`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="dose-card-v2-info">
                      <div className="dose-card-v2-name">{med.name}</div>
                      <div className="dose-card-v2-meta">
                        <span>{med.dosage} {med.unit}</span>
                        <span className="dose-meta-sep" />
                        <span>{time}</span>
                        {isPast && !isTaken && !isSkip && (
                          <>
                            <span className="dose-meta-sep" />
                            <span style={{ color:'var(--red)', fontWeight:700, fontSize:11 }}>overdue</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isTaken ? (
                      <button className="dose-check-btn taken"
                        onClick={() => markDose(med, time, 'skipped')} title="Mark as skipped"
                        aria-label={`Undo taken for ${med.name}`}>
                        <CheckIcon size={14} />
                      </button>
                    ) : isSkip ? (
                      <button className="dose-check-btn"
                        onClick={() => markDose(med, time, 'taken')} title="Mark as taken"
                        aria-label={`Mark ${med.name} as taken`}>
                        <CheckIcon size={14} />
                      </button>
                    ) : (
                      <>
                        <button className="dose-skip-btn"
                          onClick={() => markDose(med, time, 'skipped')} aria-label={`Skip ${med.name}`}>
                          Skip
                        </button>
                        <button className="dose-check-btn"
                          onClick={() => markDose(med, time, 'taken')} aria-label={`Take ${med.name}`}>
                          <CheckIcon size={14} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* ══ FOOTER ══ */}
      <div className="dash-footer">
        <div className="dash-footer-sep" />
        <div className="dash-footer-row">
          <span>MedTrack v1.0</span>
          <span>Built with ❤️ for better health</span>
          <span>All systems operational 🟢</span>
        </div>
      </div>

      {/* ══ FLOATING TUTORIAL FAB ══ */}
      <div className={`dash-tut-fab-wrap${tutOpen ? ' open' : ''}`}>
        {tutOpen && (
          <TutorialPanel setup={setup} onClose={() => setTutOpen(false)} />
        )}
        <button
          className="dash-tut-fab"
          onClick={() => setTutOpen(o => !o)}
          aria-label="Help and guide"
        >
          <span className="dash-tut-fab-icon"><QuestionIcon /></span>
          <span className="dash-tut-fab-text">Help & Guide</span>
        </button>
      </div>
    </div>
  );
}
