import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../src/types';

/**
 * Context and Provider for handling authentication state throughout the app.
 * Manages user data, tokens, and common auth actions like login, register, and logout.
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored authentication data on initial mount.
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Loads the authentication token and user data from persistent storage.
   */
  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Performs login and updates both state and persistent storage.
   */
  const login = async (identifier: string, password: string) => {
    const { token: newToken, user: newUser } = await api.auth.login(identifier, password);

    setToken(newToken);
    setUser(newUser);

    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  /**
   * Performs registration and automatically logs the user in.
   */
  const register = async (username: string, email: string, password: string, displayName: string) => {
    await api.auth.register({ username, email, password, displayName });
    // After registration, automatically log in
    await login(email, password);
  };

  /**
   * Logs out by clearing state and persistent storage.
   */
  const logout = async () => {
    setToken(null);
    setUser(null);

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  /**
   * Refreshes the current user's data from the backend.
   */
  const refreshUser = async () => {
    if (!token) return;

    try {
      const user = await api.challenges.me();
      setUser(user);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to easily access authentication context.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
