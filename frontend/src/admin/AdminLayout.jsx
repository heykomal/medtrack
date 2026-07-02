import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useTheme } from '../components/ThemeProvider.jsx';

const NAV = [
  { to: '/admin/overview',   icon: '📊', label: 'Overview'   },
  { to: '/admin/users',      icon: '👤', label: 'Users'      },
  { to: '/admin/data',       icon: '🗄️',  label: 'Data'       },
  { to: '/admin/analytics',  icon: '📈', label: 'Analytics'  },
  { to: '/admin/logs',       icon: '📋', label: 'Logs'       },
  { to: '/admin/settings',   icon: '⚙️',  label: 'Settings'   },
];

function SunIcon()  { return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function MoonIcon() { return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }

export default function AdminLayout({ children, onLogout }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate('/admin');
  }

  return (
    <div className="adm-layout">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <Logo height={30} light iconOnly />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>MedTrack</div>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>

        <div style={{ padding: '8px 12px', marginBottom: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#64748b',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>Navigation</span>
        </div>

        <nav className="adm-nav">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `adm-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="adm-nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-footer-btn" onClick={toggle}>
            <span>{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button className="adm-footer-btn adm-logout-btn" onClick={handleLogout}>
            <span>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Body */}
      <div className="adm-body">
        <header className="adm-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: 'linear-gradient(135deg,#1e3a5f,#1d6fa4)',
              color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px',
            }}>ADMIN</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>MedTrack Administration</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <main className="adm-main">
          <div className="adm-main-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
