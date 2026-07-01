import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard         from './pages/Dashboard.jsx';
import DiseaseManager    from './pages/DiseaseManager.jsx';
import PrescriptionManager from './pages/PrescriptionManager.jsx';
import MedicineManager   from './pages/MedicineManager.jsx';
import DoseLogger        from './pages/DoseLogger.jsx';
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

function MedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
         strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  );
}

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <div className="sidebar-brand-icon"><MedIcon /></div>
            <h1>MedTrack</h1>
          </div>
          <p>Medicine Reminder Platform</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {NAV.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-link-icon"><Icon size={18} /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-status">
            <span className="status-dot" />
            <span>All systems operational</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/"              element={<Dashboard />}           />
          <Route path="/diseases"      element={<DiseaseManager />}      />
          <Route path="/prescriptions" element={<PrescriptionManager />} />
          <Route path="/medicines"     element={<MedicineManager />}     />
          <Route path="/dose-log"      element={<DoseLogger />}          />
        </Routes>
      </main>
    </div>
  );
}