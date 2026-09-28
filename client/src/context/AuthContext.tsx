import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';
import { io, Socket } from 'socket.io-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  switchRoleQuick: (role: string) => Promise<void>;
  socket: Socket | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  // Real-time socket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time events socket');
      if (user?.organizationId?._id) {
        newSocket.emit('join_organization', user.organizationId._id);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.organizationId?._id]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Quick switch role demo helper for seamless testing of Super Admin, Org Admin, Asset Mgr, Employee, Auditor
  const switchRoleQuick = async (role: string) => {
    try {
      let email = 'superadmin@assetsphere.ai';
      if (role === 'Organization Admin') email = 'admin@abccorp.com';
      if (role === 'Asset Manager') email = 'manager@abccorp.com';
      if (role === 'Employee') email = 'elena@abccorp.com';
      if (role === 'Auditor') email = 'auditor@abccorp.com';

      const res = await api.post('/auth/login', {
        email,
        password: 'password123',
      });

      login(res.data.token, res.data.user);
    } catch (err) {
      console.error('Role switch failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRoleQuick, socket, loading }}>
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
