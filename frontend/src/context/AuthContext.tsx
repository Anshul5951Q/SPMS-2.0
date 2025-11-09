import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  changePassword: async () => {},
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved token in localStorage
    const savedToken = localStorage.getItem('parkingAppToken');
    const savedUser = localStorage.getItem('parkingAppUser');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await authApi.signup(name, email, password);
      
      setUser(data.user);
      setToken(data.token);
      
      // Save to localStorage
      localStorage.setItem('parkingAppToken', data.token);
      localStorage.setItem('parkingAppUser', JSON.stringify(data.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await authApi.login(email, password);
      
      setUser(data.user);
      setToken(data.token);
      
      // Save to localStorage
      localStorage.setItem('parkingAppToken', data.token);
      localStorage.setItem('parkingAppUser', JSON.stringify(data.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('parkingAppToken');
    localStorage.removeItem('parkingAppUser');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.changePassword(currentPassword, newPassword);
      
      // Clear all auth data from localStorage
      localStorage.removeItem('parkingAppToken');
      localStorage.removeItem('parkingAppUser');
      
      // Clear state
      setUser(null);
      setToken(null);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while changing password';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        signup,
        logout,
        changePassword,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);