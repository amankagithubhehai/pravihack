import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, X, Landmark, FileText } from 'lucide-react';
import api from '../services/api';
import { Maintenance, Asset } from '../types';
import { useAuth } from '../context/AuthContext';

export const MaintenanceView: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState<Maintenance | null>(null);

  const [form, setForm] = useState({
    assetId: '',
    title: '',
    description: '',
    maintenanceType: 'Preventive',
    scheduledDate: new Date().toISOString().slice(0, 10),
    cost: 150000,
    vendor: 'State PWD Mechanical Division',
    technicianName: '',
  });

  const [completeForm, setCompleteForm] = useState({
    serviceReport: 'Statutory physical inspection and calibration completed. Fit for public service.',
    cost: 175000,
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/maintenance');
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to load maintenance records', err);
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
    fetchRecords();
    fetchAssets();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', form);
      setShowScheduleModal(false);
      fetchRecords();
    } catch (err) {
      console.error('Schedule failed', err);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCompleteModal) return;
    try {
      await api.put(`/maintenance/${showCompleteModal._id}`, {
        status: 'Completed',
        serviceReport: completeForm.serviceReport,
        cost: completeForm.cost,
      });
      setShowCompleteModal(null);
      fetchRecords();
    } catch (err) {
      console.error('Complete maintenance failed', err);
    }
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${(val || 0).toLocaleString('en-IN')}`;
  };

  const canManage = ['Super Admin', 'Organization Admin', 'Asset Manager'].includes(user?.role || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Statutory AMC & Engineering Maintenance</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Preventive service schedules for public transit buses, hospital MRI systems, fire platforms, and municipal pumps.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
          >
            <Plus size={16} /> Schedule Maintenance Work Order
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#9ca3af' }}>
                <th style={{ padding: '12px 16px' }}>Gov Asset ID</th>
                <th style={{ padding: '12px 16px' }}>Service Work Order & Diagnostics</th>
                <th style={{ padding: '12px 16px' }}>Contract Type</th>
                <th style={{ padding: '12px 16px' }}>Inspection Date</th>
                <th style={{ padding: '12px 16px' }}>Vendor / Lead Specialist</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Estimated Cost</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Loading public maintenance logbook...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No active maintenance orders.
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 600 }}>
                      {item.assetId?.assetId}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{item.title}</div>
                      {item.serviceReport && (
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                          Report: {item.serviceReport}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#22d3ee' }}>{item.maintenanceType}</td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>
                      {new Date(item.scheduledDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#d1d5db' }}>
                      {item.vendor || 'State PWD Workshop'} {item.technicianName ? `(${item.technicianName})` : ''}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${item.status === 'Completed' ? 'active' : 'maintenance'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#34d399', fontWeight: 700 }}>
                      {formatINR(item.cost)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {item.status !== 'Completed' && canManage && (
                        <button
                          onClick={() => {
                            setShowCompleteModal(item);
                            setCompleteForm({ serviceReport: '', cost: item.cost || 0 });
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          <CheckCircle2 size={14} color="#34d399" /> Certify Fit
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

      {/* Schedule Maintenance Modal */}
      {showScheduleModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Issue Statutory Maintenance Work Order</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Target Public Asset *</label>
                <select
                  required
                  value={form.assetId}
                  onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                >
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.assetId} - {a.assetName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Work Order Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quarterly Cryogen Helium Refill & Superconducting Magnet Calibration"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Contract Type</label>
                  <select
                    value={form.maintenanceType}
                    onChange={(e) => setForm({ ...form, maintenanceType: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="AMC">Comprehensive AMC (CAMC)</option>
                    <option value="Corrective">Corrective</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Routine">Routine Inspection</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Scheduled Date</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Estimated Cost (INR ₹)</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Authorized Service Partner / OEM</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Maintenance Modal */}
      {showCompleteModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Certify Work Order & Sign-off</h3>
              <button onClick={() => setShowCompleteModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Executive Engineer Fitness Certificate & Diagnostics</label>
                <textarea
                  rows={3}
                  required
                  value={completeForm.serviceReport}
                  onChange={(e) => setCompleteForm({ ...completeForm, serviceReport: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Invoiced Repair & Parts Cost (INR ₹)</label>
                <input
                  type="number"
                  value={completeForm.cost}
                  onChange={(e) => setCompleteForm({ ...completeForm, cost: Number(e.target.value) })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCompleteModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                  Certify Operational Fitness
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
