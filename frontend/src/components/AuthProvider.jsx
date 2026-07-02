import { createContext, useContext, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('medtrack-user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  function login(userData) {
    const u = { ...userData };
    localStorage.setItem('medtrack-user', JSON.stringify(u));
    setUser(u);
  }

  function updateProfile(profileData) {
    const u = { ...user, ...profileData };
    localStorage.setItem('medtrack-user', JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('medtrack-user');
    localStorage.removeItem('medtrack-onboarded');
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, login, updateProfile, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
