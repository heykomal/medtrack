import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import AdminApp from './admin/AdminApp.jsx';
import { useAuth } from './components/AuthProvider.jsx';
import { useTheme } from './components/ThemeProvider.jsx';
import Logo from './components/Logo.jsx';
import Dashboard           from './pages/Dashboard.jsx';
import DiseaseManager      from './pages/DiseaseManager.jsx';
import PrescriptionManager from './pages/PrescriptionManager.jsx';
import MedicineManager     from './pages/MedicineManager.jsx';
import DoseLogger          from './pages/DoseLogger.jsx';
import Landing             from './pages/Landing.jsx';
import Login               from './pages/Login.jsx';
import Signup              from './pages/Signup.jsx';
import ProfileSetup        from './pages/ProfileSetup.jsx';
import OnboardingTutorial  from './components/OnboardingTutorial.jsx';
import {
  IconHome, IconVirus, IconClipboard, IconPill, IconCheckSquare, IconUser,
} from './components/Icons.jsx';

const NAV = [
  { to: '/',              Icon: IconHome,        label: 'Dashboard'     },
  { to: '/diseases',      Icon: IconVirus,       label: 'Diseases'      },
  { to: '/prescriptions', Icon: IconClipboard,   label: 'Prescriptions' },
  { to: '/medicines',     Icon: IconPill,        label: 'Medicines'     },
  { to: '/dose-log',      Icon: IconCheckSquare, label: 'Dose Log'      },
];

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
function MenuIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
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

function AppShell() {
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (!localStorage.getItem('medtrack-onboarded')) setShowOnboarding(true);
  }, []);

  function dismissOnboarding() {
    localStorage.setItem('medtrack-onboarded', '1');
    setShowOnboarding(false);
  }

  function closeMobile() { setMobileOpen(false); }

  const displayName = user?.name || user?.patientName || 'User';
  const roleLabel   = user?.role === 'caretaker' ? 'Caretaker' : 'Patient';

  return (
    <div className="layout">
      <div className={`sidebar-overlay${mobileOpen ? ' show' : ''}`} onClick={closeMobile} />

      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)}>
          <MenuIcon />
        </button>
        <div className="mobile-brand">
          <Logo height={28} light />
        </div>
        <button className="theme-toggle-sidebar" onClick={toggle} title="Toggle theme" style={{ marginLeft: 'auto' }}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <Logo height={32} light iconOnly={collapsed} />
            {!collapsed && (
              <div className="sidebar-brand-text" style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Medicine Reminder Platform</p>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {NAV.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              title={label}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMobile}
            >
              <span className="nav-link-icon"><Icon size={18} /></span>
              <span className="nav-link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Theme toggle */}
          <button className="sidebar-theme-btn" onClick={toggle} title="Toggle theme">
            <span className="sidebar-theme-icon">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
            <span className="nav-link-label">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>

          {/* User info */}
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info nav-link-label">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
            <button
              className="sidebar-logout-btn nav-link-label"
              onClick={logout}
              title="Sign out"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>

          <div className="sidebar-footer-status">
            <span className="status-dot" />
            <span className="nav-link-label">All systems operational</span>
          </div>
        </div>
      </aside>

      {/* Main */}
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

      {showOnboarding && <OnboardingTutorial onClose={dismissOnboarding} />}
    </div>
  );
}

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
