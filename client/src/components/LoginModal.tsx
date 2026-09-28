import React, { useState } from 'react';
import { Landmark, Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const LoginModal: React.FC = () => {
  const { login, switchRoleQuick } = useAuth();
  const [email, setEmail] = useState('superadmin@assetsphere.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { label: 'Principal Secretary (IAS)', email: 'superadmin@assetsphere.ai', role: 'Super Admin' },
    { label: 'Municipal Commissioner', email: 'admin@abccorp.com', role: 'Organization Admin' },
    { label: 'Chief Asset Officer', email: 'manager@abccorp.com', role: 'Asset Manager' },
    { label: 'Sub-Divisional Engineer', email: 'elena@abccorp.com', role: 'Employee' },
    { label: 'Principal Auditor (CAG)', email: 'auditor@abccorp.com', role: 'Auditor' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b0f19',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.2), transparent)',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{ width: '460px', padding: '36px', backgroundColor: '#111827', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
          }}>
            <Landmark size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            PRAVI <span style={{ color: '#fbbf24' }}>GovAssets</span> Portal
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: '6px' }}>
            State & National Public Physical Infrastructure Management System
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.8rem',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Official Government Email / Parichay</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Secure Credentials / OTP</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '6px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            }}
          >
            {loading ? 'Authenticating Official Token...' : 'Access Public Asset Register'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Autofill Sample Credentials for Testing */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.70rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'center' }}>
            Sample Credentials for Government Portals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {quickLogins.slice(0, 4).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setEmail(item.email);
                  setPassword('password123');
                }}
                style={{
                  padding: '6px 8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  color: '#fef3c7',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.72rem' }}>{item.role}</div>
                <div style={{ color: '#9ca3af', fontSize: '0.65rem' }}>{item.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
