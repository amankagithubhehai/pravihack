import React from 'react';
import {
  LayoutDashboard,
  Box,
  Layers,
  Wrench,
  AlertCircle,
  FileCheck2,
  Sparkles,
  Building2,
  LogOut,
  Landmark,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout, switchRoleQuick } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Organization Admin', 'Asset Manager', 'Auditor'] },
    { id: 'assets', label: 'Public Assets Registry', icon: Box, roles: ['Super Admin', 'Organization Admin', 'Asset Manager', 'Auditor', 'Employee'] },
    { id: 'assignments', label: 'Custody & Sanction Handover', icon: Layers, roles: ['Super Admin', 'Organization Admin', 'Asset Manager', 'Employee'] },
    { id: 'maintenance', label: 'AMC & Preventive Inspection', icon: Wrench, roles: ['Super Admin', 'Organization Admin', 'Asset Manager', 'Auditor'] },
    { id: 'incidents', label: 'Public Grievance & Breakdowns', icon: AlertCircle, roles: ['Super Admin', 'Organization Admin', 'Asset Manager', 'Employee'] },
    { id: 'compliance', label: 'GFR & CAG Audit Ledger', icon: FileCheck2, roles: ['Super Admin', 'Organization Admin', 'Auditor'] },
    { id: 'organization', label: 'Directorates & Municipal Zones', icon: Building2, roles: ['Super Admin', 'Organization Admin'] },
    { id: 'ai-assistant', label: 'PRAVI Gov Intelligence', icon: Sparkles, roles: ['Super Admin', 'Organization Admin', 'Asset Manager', 'Auditor', 'Employee'] },
  ];

  const allowedNav = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const roleOptions: UserRole[] = [
    'Super Admin',
    'Organization Admin',
    'Asset Manager',
    'Employee',
    'Auditor',
  ];

  return (
    <aside style={{
      width: '270px',
      backgroundColor: '#0d1322',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '22px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
        }}>
          <Landmark size={24} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            PRAVI <span style={{ color: '#f59e0b' }}>GovAssets</span>
          </div>
          <div style={{ fontSize: '0.70rem', color: '#9ca3af', fontWeight: 500 }}>
            State & National Physical Assets Platform
          </div>
        </div>
      </div>

      {/* Authenticated Official Identity Card */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={14} color="#10b981" /> Authenticated Officer
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
              {user?.name || 'Aman Virani'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
              {user?.role || 'Super Admin'}
            </div>
          </div>
          <span style={{
            fontSize: '0.65rem',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            fontWeight: 700,
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            Active
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {allowedNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.04) 100%)' : 'transparent',
                color: isActive ? '#fbbf24' : '#9ca3af',
                borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#fbbf24' : '#9ca3af'} />
                <span>{item.label}</span>
              </div>
              {item.id === 'ai-assistant' && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.25)',
                  color: '#fef3c7',
                  fontWeight: 700,
                }}>
                  GFR-AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Aman Virani'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
              {user?.role || 'Super Admin'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>
              {user?.organizationId?.code || 'GOV-SECRETARIAT'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
