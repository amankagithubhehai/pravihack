import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AssetInventoryView } from './components/AssetInventoryView';
import { AssetAssignmentView } from './components/AssetAssignmentView';
import { MaintenanceView } from './components/MaintenanceView';
import { IncidentDeskView } from './components/IncidentDeskView';
import { ComplianceAuditView } from './components/ComplianceAuditView';
import { OrgDepartmentView } from './components/OrgDepartmentView';
import { AIAssistantView } from './components/AIAssistantView';
import { LoginModal } from './components/LoginModal';
import { NotificationItem } from './types';
import api from './services/api';

export const App: React.FC = () => {
  const { user, loading, socket } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('asset:created', () => {
      fetchNotifications();
    });

    socket.on('asset:updated', () => {
      fetchNotifications();
    });

    socket.on('ticket:created', () => {
      fetchNotifications();
    });

    socket.on('assignment:created', () => {
      fetchNotifications();
    });

    socket.on('notification:created', () => {
      fetchNotifications();
    });

    socket.on('notification:cleared', () => {
      fetchNotifications();
    });

    return () => {
      socket.off('asset:created');
      socket.off('asset:updated');
      socket.off('ticket:created');
      socket.off('assignment:created');
      socket.off('notification:created');
      socket.off('notification:cleared');
    };
  }, [socket]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19',
        color: '#818cf8',
        fontFamily: 'sans-serif',
      }}>
        Initializing AssetSphere AI Engine...
      </div>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        unreadCount={notifications.filter((n) => !n.isRead).length}
      />

      {/* Main Content Area */}
      <div style={{ marginLeft: '270px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onOpenAI={() => setCurrentTab('ai-assistant')}
        />

        <main style={{ padding: '28px', flex: 1, overflowY: 'auto' }}>
          {currentTab === 'dashboard' && <DashboardView onNavigateToAssets={() => setCurrentTab('assets')} />}
          {currentTab === 'assets' && <AssetInventoryView />}
          {currentTab === 'assignments' && <AssetAssignmentView />}
          {currentTab === 'maintenance' && <MaintenanceView />}
          {currentTab === 'incidents' && <IncidentDeskView />}
          {currentTab === 'compliance' && <ComplianceAuditView />}
          {currentTab === 'organization' && <OrgDepartmentView />}
          {currentTab === 'ai-assistant' && <AIAssistantView />}
        </main>
      </div>
    </div>
  );
};

export default App;
