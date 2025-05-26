// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // We'll use the token info directly since there's no /me endpoint
          const decoded = parseJwt(token);
          setUser({
            id: decoded.id,
            role: decoded.role,
            department: decoded.department
          });
        } catch (err) {
          console.error('Invalid token', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token]);

  // Parse JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/login', { email, password });
      const { token, role } = response.data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      
      const decoded = parseJwt(token);
      setUser({
        id: decoded.id,
        role: role,
        department: decoded.department
      });
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};