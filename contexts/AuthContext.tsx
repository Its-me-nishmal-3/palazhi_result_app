
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin } from '../services/mockApi'; // Path is mockApi but it's the real api client
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [authToken]);

  const login = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiLogin(password);
      if (data.token) {
        setAuthToken(data.token);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!authToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
