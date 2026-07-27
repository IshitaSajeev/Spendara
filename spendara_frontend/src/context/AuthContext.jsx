import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
  );
  const [username, setUsername] = useState(
    localStorage.getItem('username') || ''
  );

  const login = async (uname, password) => {
    const { data } = await api.post('/api/token/', {
      username: uname,
      password,
    });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('username', uname);
    setUsername(uname);
    setIsAuthenticated(true);
  };

  const register = async (uname, email, password) => {
    await api.post('/api/auth/register/', {
      username: uname,
      email,
      password,
    });
    // Auto-login right after registering
    await login(uname, password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
