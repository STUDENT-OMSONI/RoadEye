import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Always start with Login page as the first entrance
  const [user, setUser] = useState(() => {
    try {
      localStorage.removeItem('roadeye_auth');
      localStorage.removeItem('roadeye_profile');
      sessionStorage.removeItem('roadeye_auth');
      sessionStorage.removeItem('roadeye_profile');
    } catch (e) {
      // Fallback
    }
    return null;
  });

  const login = (userData) => {
    const profile = userData || {
      name: 'Om Soni',
      email: 'om.soni@roadeye.org',
      region: 'Municipal Road Safety Division',
      role: 'Civic Road Reporter'
    };
    setUser(profile);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

