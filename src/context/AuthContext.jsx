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

  // 1. Login Method
  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { token: jwtToken, data: userData } = response.data;

    localStorage.setItem('hospital_token', jwtToken);
    localStorage.setItem('hospital_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  // 2. Patient Registration Method
  const registerPatient = async (registrationPayload) => {
    const response = await axiosClient.post('/auth/register', registrationPayload);
    return response.data;
  };

  // 3. Email Verification Method
  const verifyEmail = async (verificationToken) => {
    const response = await axiosClient.get(`/auth/verify-email/${verificationToken}`);
    return response.data;
  };

  // 4. Resend Verification Email Method
  const resendVerification = async (email) => {
    const response = await axiosClient.post('/auth/resend-verification', { email });
    return response.data;
  };

  // 5. Request Forgot Password Link Method
  const forgotPassword = async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  };

  // 6. Reset Password via Token Method
  const resetPassword = async (resetToken, newPassword) => {
    const response = await axiosClient.post(`/auth/reset-password/${resetToken}`, {
      newPassword,
    });
    return response.data;
  };

  // 7. Update Password While Logged In
  const updatePassword = async (currentPassword, newPassword) => {
    const response = await axiosClient.patch('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  // 8. Permanent Account Deletion
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

  // 9. Logout Method
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