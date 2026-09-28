import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, CheckCircle, Clock, X, Landmark, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { Ticket, Asset } from '../types';
import { useAuth } from '../context/AuthContext';

export const IncidentDeskView: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<Ticket | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    ticketType: 'Hardware Failure',
    priority: 'Medium',
    assetId: '',
  });

  const [resolveForm, setResolveForm] = useState({
    status: 'Resolved',
    resolutionNotes: 'Field engineering inspection completed and telemetry restored.',
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      setTickets(res.data.data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data.data);
      if (res.data.data.length > 0) {
        setForm((prev) => ({ ...prev, assetId: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load assets', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAssets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tickets', form);
      setShowCreateModal(false);
      fetchTickets();
    } catch (err) {
      console.error('Create ticket failed', err);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResolveModal) return;
    try {
      await api.put(`/tickets/${showResolveModal._id}`, resolveForm);
      setShowResolveModal(null);
      fetchTickets();
    } catch (err) {
      console.error('Resolve ticket failed', err);
    }
  };

  const canResolve = ['Super Admin', 'Organization Admin', 'Asset Manager'].includes(user?.role || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Public Grievance & Infrastructure Breakdown Desk</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Emergency incident reporting, hospital apparatus failure alerts, water pressure faults, and fleet repairs.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
        >
          <Plus size={16} /> File Breakdown / Grievance Notice
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#9ca3af' }}>
                <th style={{ padding: '12px 16px' }}>Incident Notice #</th>
                <th style={{ padding: '12px 16px' }}>Public Infrastructure Event & Diagnosis</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Target Asset</th>
                <th style={{ padding: '12px 16px' }}>SLA Priority</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Reporting Officer</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Loading incident reports...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Zero open breakdowns or public complaints reported.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 600 }}>
                      {t.ticketNumber}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>{t.description}</div>
                      {t.resolutionNotes && (
                        <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '4px' }}>
                          Engineering Resolution: {t.resolutionNotes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#d1d5db' }}>{t.ticketType}</td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>
                      {t.assetId ? (
                        <span style={{ color: '#c7d2fe' }}>{t.assetId.assetName}</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>General Public Works</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: t.priority === 'Critical' || t.priority === 'High' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: t.priority === 'Critical' || t.priority === 'High' ? '#fb7185' : '#fbbf24',
                      }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${t.status === 'Resolved' || t.status === 'Closed' ? 'active' : 'maintenance'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{t.reportedBy?.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {canResolve && t.status !== 'Resolved' && t.status !== 'Closed' && (
                        <button
                          onClick={() => setShowResolveModal(t)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          <CheckCircle size={14} color="#34d399" /> Resolve Notice
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass-panel" style={{ width: '500px', padding: '24px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Raise Public Breakdown Notice</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Notice Subject / Machinery Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turbine Impeller Vibration on Centrifugal Pump GOV-WTR-4004"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Detailed Engineering Observations *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail symptoms, affected public jurisdiction, pressure drops, error diagnostics..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Type</label>
                  <select
                    value={form.ticketType}
                    onChange={(e) => setForm({ ...form, ticketType: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="Hardware Failure">Machinery / Plant Failure</option>
                    <option value="Software Issue">Surveillance / Telemetry Fault</option>
                    <option value="Network Problem">Civic Grid Distribution</option>
                    <option value="Security Incident">Public Safety Risk</option>
                    <option value="General Request">Statutory Regulatory Inspection</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>SLA Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="Low">Low (Depot Standby)</option>
                    <option value="Medium">Medium (Scheduled Triage)</option>
                    <option value="High">High (Service Degradation)</option>
                    <option value="Critical">Critical (Immediate Public Impact)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Linked Public Physical Asset</label>
                <select
                  value={form.assetId}
                  onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="">None / General Municipal Works</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.assetId} - {a.assetName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                  Register Incident Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass-panel" style={{ width: '480px', padding: '24px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Clear Incident Notice {showResolveModal.ticketNumber}</h3>
              <button onClick={() => setShowResolveModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolve} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Status</label>
                <select
                  value={resolveForm.status}
                  onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="Resolved">Resolved / Field Clearance</option>
                  <option value="Closed">Closed & Archived</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Executive Clearance / Resolution Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={resolveForm.resolutionNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowResolveModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                  Sign Off Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
