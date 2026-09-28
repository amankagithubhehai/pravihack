import React, { useState } from 'react';
import { Bell, Sparkles, CheckCircle2, Landmark, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';

interface NavbarProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ notifications, onMarkRead, onOpenAI }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadList = notifications.filter((n) => !n.isRead);

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#0e1424',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Title / Government Node Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          fontSize: '0.78rem',
          color: '#fbbf24',
          fontWeight: 600,
        }}>
          <ShieldCheck size={14} color="#10b981" />
          State Asset Registry • GFR-2017 Verified
        </div>
        <div style={{ fontSize: '0.88rem', color: '#9ca3af' }}>
          Authority: <strong style={{ color: '#fff' }}>{user?.organizationId?.name || 'Government of Maharashtra / State Secretariat'}</strong>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        {/* Ask AI Quick Trigger */}
        <button
          onClick={onOpenAI}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fef3c7',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Sparkles size={16} color="#fbbf24" />
          <span>Ask PRAVI Intelligence</span>
        </button>

        {/* Notifications Icon & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '9px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell size={18} />
            {unreadList.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0e1424',
              }}>
                {unreadList.length}
              </span>
            )}
          </button>

          {/* Notifications Modal */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '380px',
              maxHeight: '420px',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Statutory Alerts & Inspection Orders</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{unreadList.length} unread</span>
              </div>

              <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                    No pending statutory notices
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: item.isRead ? 'transparent' : 'rgba(245, 158, 11, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: item.isRead ? '#9ca3af' : '#fff' }}>
                          {item.title}
                        </div>
                        {!item.isRead && (
                          <button
                            onClick={() => onMarkRead(item._id)}
                            style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: 0 }}
                            title="Acknowledge"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '6px 14px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}>
            {user?.name?.charAt(0) || 'G'}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>{user?.name || 'Shri Aman Virani, IAS'}</span>
        </div>
      </div>
    </header>
  );
};
