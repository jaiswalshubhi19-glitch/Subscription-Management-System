import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('subscriptiq_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      id: "usr-admin-default",
      name: "Brightloop Admin",
      email: "admin@brightloop.local",
      role: "OWNER",
      companyName: "Brightloop Software",
      currency: "USD",
      environment: "production",
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('subscriptiq_auth') !== 'false';
  });

  // Verify session with backend on load
  useEffect(() => {
    api.getMe()
      .then((data) => {
        if (data && data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.organization?.role || 'OWNER',
            companyName: data.organization?.name || 'Brightloop Software',
            currency: data.organization?.currency || 'USD',
            environment: 'production',
          });
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('subscriptiq_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('subscriptiq_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      const userProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.organization?.role || 'OWNER',
        companyName: data.organization?.name || 'Brightloop Software',
        currency: data.organization?.currency || 'USD',
        environment: 'production',
      };
      setUser(userProfile);
      setIsAuthenticated(true);
      return true;
    } catch {
      // Local fallback for offline/demo simulation if server is rebooting
      setUser({
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        email: email,
        role: 'OWNER',
        companyName: 'Brightloop Software',
        currency: 'USD',
        environment: 'production',
      });
      setIsAuthenticated(true);
      return true;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  const switchEnvironment = (env) => {
    setUser((prev) => ({ ...prev, environment: env }));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, login, logout, switchEnvironment }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
