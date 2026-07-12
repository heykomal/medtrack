import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import AdminApp from './admin/AdminApp.jsx';
import { useAuth } from './components/AuthProvider.jsx';
import { useTheme } from './components/ThemeProvider.jsx';
import Tutorial from './components/Tutorial.jsx';
import Dashboard           from './pages/Dashboard.jsx';
import DiseaseManager      from './pages/DiseaseManager.jsx';
import PrescriptionManager from './pages/PrescriptionManager.jsx';
import MedicineManager     from './pages/MedicineManager.jsx';
import DoseLogger          from './pages/DoseLogger.jsx';
import Landing             from './pages/Landing.jsx';
import Login               from './pages/Login.jsx';
import Signup              from './pages/Signup.jsx';
import ProfileSetup        from './pages/ProfileSetup.jsx';
import {
  IconHome, IconVirus, IconClipboard, IconPill, IconCheckSquare,
} from './components/Icons.jsx';

const NAV = [
  { to: '/',              Icon: IconHome,        label: 'Dashboard'     },
  { to: '/diseases',      Icon: IconVirus,       label: 'Diseases'      },
  { to: '/prescriptions', Icon: IconClipboard,   label: 'Prescriptions' },
  { to: '/medicines',     Icon: IconPill,        label: 'Medicines'     },
  { to: '/dose-log',      Icon: IconCheckSquare, label: 'Dose Log'      },
];

/* ── SVG icons ───────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
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
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function BrandMark({ size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: 'var(--green)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="7" rx="3.5" fill="white" opacity=".9"/>
        <rect x="10" y="4" width="4" height="16" rx="2" fill="white" opacity=".9"/>
      </svg>
    </div>
  );
}

/* ── AppShell ──────────────────────────────────────────────────── */
function AppShell() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  // Close mobile sidebar on route change
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  function closeMobile() { setMobileOpen(false); }

  const displayName  = user?.name || user?.patientName || user?.email?.split('@')[0] || 'User';
  const roleLabel    = user?.role === 'caretaker' ? 'Caretaker' : 'Patient';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="layout">
      {/* ── Hamburger (mobile only) ── */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
      </button>

      {/* ── Mobile backdrop ── */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' show' : ''}`}
        onClick={closeMobile}
      />

      {/* ── Sidebar ── */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <BrandMark size={32} />
            {!collapsed && (
              <div className="sidebar-brand-text">
                <span style={{ fontSize: 15, fontWeight: 800, color: '#f0f6fc', letterSpacing: '-.3px' }}>
                  MedTrack
                </span>
                <p>Medicine Reminder Platform</p>
              </div>
            )}
          </div>
          {/* Collapse toggle (desktop only) */}
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {NAV.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              title={label}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-link-icon"><Icon size={18} /></span>
              <span className="nav-link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-theme-btn" onClick={toggle} title="Toggle theme">
            <span className="sidebar-theme-icon">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
            <span className="nav-link-label">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{avatarLetter}</div>
            <div className="sidebar-user-info nav-link-label">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
            <button
              className="sidebar-logout-btn nav-link-label"
              onClick={logout}
              title="Sign out"
            >
              <LogoutIcon />
            </button>
          </div>

          <div className="sidebar-footer-status">
            <span className="status-dot" />
            <span className="nav-link-label">All systems operational</span>
          </div>

          <div className="nav-link-label sidebar-version">MedTrack v1.0</div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <div className="main-inner">
          <Routes>
            <Route path="/"              element={<Dashboard />}           />
            <Route path="/diseases"      element={<DiseaseManager />}      />
            <Route path="/prescriptions" element={<PrescriptionManager />} />
            <Route path="/medicines"     element={<MedicineManager />}     />
            <Route path="/dose-log"      element={<DoseLogger />}          />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Tutorial />
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────────── */
export default function App() {
  const location = useLocation();
  const { user } = useAuth();

  if (location.pathname.startsWith('/admin')) return <AdminApp />;

  if (!user) {
    return (
      <Routes>
        <Route path="/"       element={<Landing />} />
        <Route path="/login"  element={<Login />}   />
        <Route path="/signup" element={<Signup />}  />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (!user.role) {
    return (
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="*"              element={<Navigate to="/profile-setup" replace />} />
      </Routes>
    );
  }

  return <AppShell />;
}
