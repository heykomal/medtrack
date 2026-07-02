import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin    from './AdminLogin.jsx';
import AdminLayout   from './AdminLayout.jsx';
import Overview      from './pages/Overview.jsx';
import Users         from './pages/Users.jsx';
import UserDetail    from './pages/UserDetail.jsx';
import Data          from './pages/Data.jsx';
import Analytics     from './pages/Analytics.jsx';
import Settings      from './pages/Settings.jsx';
import Logs          from './pages/Logs.jsx';

export default function AdminApp() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin-token'));

  function handleLogin(password) {
    sessionStorage.setItem('admin-token', password);
    setToken(password);
  }

  function handleLogout() {
    sessionStorage.removeItem('admin-token');
    setToken(null);
  }

  if (!token) return <AdminLogin onLogin={handleLogin} />;

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/admin"           element={<Navigate to="/admin/overview" replace />} />
        <Route path="/admin/overview"  element={<Overview />}   />
        <Route path="/admin/users"     element={<Users />}      />
        <Route path="/admin/users/:email" element={<UserDetail />} />
        <Route path="/admin/data"      element={<Data />}       />
        <Route path="/admin/analytics" element={<Analytics />}  />
        <Route path="/admin/logs"      element={<Logs />}       />
        <Route path="/admin/settings"  element={<Settings />}   />
        <Route path="*"                element={<Navigate to="/admin/overview" replace />} />
      </Routes>
    </AdminLayout>
  );
}
