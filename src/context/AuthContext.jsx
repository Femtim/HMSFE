import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hospital_token');
    const storedUser = localStorage.getItem('hospital_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('hospital_token');
        localStorage.removeItem('hospital_user');
      }
    }
    setInitializing(false);
  }, []);

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { token: jwtToken, data: userData } = response.data;

    localStorage.setItem('hospital_token', jwtToken);
    localStorage.setItem('hospital_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const registerPatient = async (registrationPayload) => {
    const response = await axiosClient.post('/auth/register', registrationPayload);
    return response.data;
  };

  const verifyEmail = async (verificationToken) => {
    const response = await axiosClient.get(`/auth/verify-email/${verificationToken}`);
    return response.data;
  };

  const resendVerification = async (email) => {
    const response = await axiosClient.post('/auth/resend-verification', { email });
    return response.data;
  };

  const updateProfile = async (profilePayload) => {
    const response = await axiosClient.patch('/auth/update-profile', profilePayload);
    const updatedUser = response.data.data;

    localStorage.setItem('hospital_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (resetToken, newPassword) => {
    const response = await axiosClient.post(`/auth/reset-password/${resetToken}`, {
      newPassword,
    });
    return response.data;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const response = await axiosClient.patch('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  const deleteAccount = async (password) => {
    const response = await axiosClient.delete('/auth/delete-account', {
      data: { password },
    });
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    setToken(null);
    setUser(null);
    return response.data;
  };

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
        isAuthenticated: !!token && !!user,
        login,
        registerPatient,
        verifyEmail,
        resendVerification,
        updateProfile,
        forgotPassword,
        resetPassword,
        updatePassword,
        deleteAccount,
        logout,
      }}
    >
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