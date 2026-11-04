import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session on page refresh
  useEffect(() => {
    const savedToken = localStorage.getItem('hospital_token');
    const savedUser = localStorage.getItem('hospital_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('hospital_token');
        localStorage.removeItem('hospital_user');
      }
    }
    setInitializing(false);
  }, []);

  // Login Handler (Works for Patient, Doctor, and Super_Admin)
  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { token: jwtToken, data: userData } = response.data;

    localStorage.setItem('hospital_token', jwtToken);
    localStorage.setItem('hospital_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);

    return userData; // Returns user so LoginView can redirect by userData.role
  };

  // Patient Self-Registration Handler
  const registerPatient = async (registrationPayload) => {
    const response = await axiosClient.post('/auth/register', registrationPayload);
    const { token: jwtToken, data: userData } = response.data;

    localStorage.setItem('hospital_token', jwtToken);
    localStorage.setItem('hospital_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);

    return userData;
  };

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        initializing,
        isAuthenticated: Boolean(token && user),
        role: user?.role || null,
        login,
        registerPatient,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming AuthContext in any View
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};