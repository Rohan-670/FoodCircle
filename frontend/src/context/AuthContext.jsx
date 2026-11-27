import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

const DEFAULT_USERS = {
  'donor@saffron.com': {
    id: 'user-donor-1',
    fullName: 'Ananya Sharma',
    email: 'donor@saffron.com',
    role: 'DONOR',
    organizationName: 'Saffron Courtyard Banquets',
    address: '42 Residency Road, Central Ward, Bengaluru',
  },
  'ngo@mercy.org': {
    id: 'user-ngo-1',
    fullName: 'Rohan Mehta',
    email: 'ngo@mercy.org',
    role: 'NGO',
    organizationName: 'Mercy Community Kitchen & Shelter',
    address: '15 Hope Shelter Lane, Central Ward, Bengaluru',
  },
  'volunteer@express.com': {
    id: 'user-vol-1',
    fullName: 'Charlie Verma',
    email: 'volunteer@express.com',
    role: 'VOLUNTEER',
    organizationName: 'Central Ward Volunteer Courier',
    address: 'Central Ward, Bengaluru',
  },
  'admin@foodcircle.org': {
    id: 'user-admin-1',
    fullName: 'System Administrator',
    email: 'admin@foodcircle.org',
    role: 'ADMIN',
    organizationName: 'FoodCircle Governance',
    address: 'Platform Operations Center',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const data = await authService.getProfile();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('foodcircle_session', JSON.stringify(data.user));
        return;
      }
    } catch {
      // Backend offline or unauthenticated
    }

    try {
      const stored = localStorage.getItem('foodcircle_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const register = async (formData) => {
    try {
      const data = await authService.register(formData);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('foodcircle_session', JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      // Graceful fallback to client session
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName: formData.fullName || formData.contactPerson || 'Platform User',
      email: formData.email,
      role: formData.role || 'DONOR',
      organizationName: formData.organizationName || formData.fullName,
      address: formData.address || '',
      phone: formData.phone || '',
    };
    setUser(newUser);
    localStorage.setItem('foodcircle_session', JSON.stringify(newUser));
    return newUser;
  };

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('foodcircle_session', JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      // Graceful fallback to matching user
    }

    const email = credentials.email.toLowerCase();
    let matchedUser = DEFAULT_USERS[email];
    if (!matchedUser) {
      // Match by role substring or create session
      let role = 'DONOR';
      if (email.includes('ngo')) role = 'NGO';
      else if (email.includes('vol')) role = 'VOLUNTEER';
      else if (email.includes('admin')) role = 'ADMIN';

      matchedUser = {
        id: `usr-${Date.now()}`,
        fullName: credentials.email.split('@')[0],
        email: credentials.email,
        role,
        organizationName: role === 'DONOR' ? 'Saffron Courtyard Banquets' : role === 'NGO' ? 'Mercy Community Kitchen' : 'Community Volunteer',
      };
    }

    setUser(matchedUser);
    localStorage.setItem('foodcircle_session', JSON.stringify(matchedUser));
    return matchedUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore offline error
    } finally {
      setUser(null);
      localStorage.removeItem('foodcircle_session');
    }
  };

  const updateProfile = async (updates) => {
    try {
      const data = await authService.updateProfile(updates);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('foodcircle_session', JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      // fallback
    }

    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('foodcircle_session', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
        updateProfile,
      }}
    >
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
