import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useTheme } from '../components/ThemeProvider.jsx';

function SunIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
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
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

const FEATURES = [
  {
    icon: '🩺',
    title: 'Disease Tracking',
    desc: 'Monitor health conditions, track progress, and manage medical history all in one place.',
    color: '#14b8a6',
  },
  {
    icon: '📄',
    title: 'Smart Prescriptions',
    desc: 'Attach doctor prescriptions directly to your medicines and organise everything neatly.',
    color: '#3b82f6',
  },
  {
    icon: '💊',
    title: 'Medicine Reminders',
    desc: 'Set multiple daily reminder times per medicine and never miss a dose again.',
    color: '#8b5cf6',
  },
  {
    icon: '📊',
    title: 'Adherence Analytics',
    desc: 'Visual heatmaps and daily adherence scores keep you and your caretaker informed.',
    color: '#10b981',
  },
];

const STATS = [
  { value: '100%', label: 'Free to use' },
  { value: '4',    label: 'Core modules' },
  { value: '24/7', label: 'Access anywhere' },
  { value: '0',    label: 'Missed doses' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  return (
    <div className="landing-page">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-logo">
            <Logo height={38} />
          </div>
          <div className="landing-nav-actions">
            <button className="theme-toggle-btn" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-brand btn-sm" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        {/* Ambient glow blobs */}
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="landing-hero-inner">
          {/* Logo — large, centred */}
          <div className="hero-logo-block">
            <Logo height={72} />
          </div>

          {/* Badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Your personal health companion
          </div>

          {/* Headline */}
          <h1 className="hero-headline">
            Never Miss a Dose.<br />
            <span className="hero-headline-grad">Live with Confidence.</span>
          </h1>

          <p className="hero-subline">
            MedTrack helps patients and caretakers manage medicines, track diseases,
            and build healthy habits — all in one beautifully simple app.
          </p>

          {/* CTA buttons */}
          <div className="hero-cta">
            <button className="btn btn-brand btn-lg hero-cta-primary"
              onClick={() => navigate('/signup')}>
              Start for free — it&apos;s free →
            </button>
            <button className="btn btn-outline-light btn-lg" onClick={() => navigate('/login')}>
              Sign in to existing account
            </button>
          </div>

          {/* Trust line */}
          <p className="hero-trust">
            No credit card · No ads · Built for healthcare
          </p>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {STATS.map(s => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <div className="landing-section-eyebrow">What you get</div>
        <h2 className="landing-section-title">
          Everything you need to stay healthy
        </h2>
        <p className="landing-section-sub">
          Four powerful modules. One seamless experience. Designed for daily use.
        </p>
        <div className="feature-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon-wrap" style={{ background: `${f.color}18`, color: f.color }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-how">
        <div className="landing-how-inner">
          <div className="landing-section-eyebrow" style={{ textAlign: 'center' }}>How it works</div>
          <h2 className="landing-section-title" style={{ textAlign: 'center' }}>
            Up and running in minutes
          </h2>
          <div className="how-steps">
            {[
              { num: '01', title: 'Create your account', desc: 'Sign up with email in under 30 seconds. No lengthy forms.' },
              { num: '02', title: 'Set up your profile', desc: 'Choose your role — Patient or Caretaker — and add your details.' },
              { num: '03', title: 'Add your medicines', desc: 'Record diseases, prescriptions, and medicines with reminder times.' },
              { num: '04', title: 'Track daily doses', desc: 'Log doses with a tap. See your adherence score every day.' },
            ].map((step, i) => (
              <div key={step.num} className="how-step">
                <div className="how-step-num">{step.num}</div>
                {i < 3 && <div className="how-step-connector" />}
                <div className="how-step-title">{step.title}</div>
                <div className="how-step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <div className="landing-cta-logo">
            <Logo height={48} light />
          </div>
          <h2 className="landing-cta-headline">
            Your health deserves better care.
          </h2>
          <p className="landing-cta-sub">
            Join MedTrack today and build the habit of consistent, worry-free medicine management.
          </p>
          <div className="landing-cta-btns">
            <button className="btn btn-white btn-lg" onClick={() => navigate('/signup')}>
              Create free account →
            </button>
            <button className="btn btn-outline-white btn-lg" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-left">
            <Logo height={32} light />
            <p className="landing-footer-copy">
              Built with care for better health outcomes.
            </p>
          </div>
          <div className="landing-footer-right">
            <p className="landing-footer-copy">
              © {new Date().getFullYear()} MedTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
