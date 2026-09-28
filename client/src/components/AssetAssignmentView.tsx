import React, { useState, useEffect } from 'react';
import { Layers, Plus, ArrowLeftRight, CheckCircle, Clock, X, Landmark, FileCheck } from 'lucide-react';
import api from '../services/api';
import { Assignment, Asset } from '../types';
import { useAuth } from '../context/AuthContext';

export const AssetAssignmentView: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [usersList, setUsersList] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState<Assignment | null>(null);

  const [assignForm, setAssignForm] = useState({
    assetId: '',
    userId: '',
    purpose: 'Public Transit Route & Line Deployment',
    conditionOnAssign: 'Certified Roadworthy / Operational by Executive Engineer',
  });

  const [returnForm, setReturnForm] = useState({
    conditionOnReturn: 'Good Working Condition / Sub-Depot Handover Verified',
    remarks: 'Physical inspection completed. Transferred to central holding yard.',
  });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments');
      setAssignments(res.data.data);
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [assetsRes, usersRes] = await Promise.all([
        api.get('/assets', { params: { status: 'Inventory' } }),
        api.get('/auth/users'),
      ]);
      setAvailableAssets(assetsRes.data.data);
      setUsersList(usersRes.data.users);
      if (assetsRes.data.data.length > 0) {
        setAssignForm((prev) => ({ ...prev, assetId: assetsRes.data.data[0]._id }));
      }
      if (usersRes.data.users.length > 0) {
        setAssignForm((prev) => ({ ...prev, userId: usersRes.data.users[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load aux data', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchAuxData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assignments', assignForm);
      setShowAssignModal(false);
      fetchAssignments();
      fetchAuxData();
    } catch (err) {
      console.error('Custody assignment failed', err);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReturnModal) return;
    try {
      await api.put(`/assignments/${showReturnModal._id}/return`, returnForm);
      setShowReturnModal(null);
      fetchAssignments();
      fetchAuxData();
    } catch (err) {
      console.error('Handover return failed', err);
    }
  };

  const canManage = ['Super Admin', 'Organization Admin', 'Asset Manager'].includes(user?.role || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Custody Sanction & Officer Handover</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Official delegation of public transport vehicles, medical apparatus, and municipal plant to custodian officers.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
          >
            <Plus size={16} /> Sanction Custody Handover
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#9ca3af' }}>
                <th style={{ padding: '12px 16px' }}>Public Asset</th>
                <th style={{ padding: '12px 16px' }}>Designated Custodian Officer</th>
                <th style={{ padding: '12px 16px' }}>Sanctioning Authority</th>
                <th style={{ padding: '12px 16px' }}>Handover Date</th>
                <th style={{ padding: '12px 16px' }}>Custody Status</th>
                <th style={{ padding: '12px 16px' }}>Sanction Purpose</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Loading custody ledger...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No active handover records in custody log.
                  </td>
                </tr>
              ) : (
                assignments.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{item.assetId?.assetName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontFamily: 'monospace' }}>
                        {item.assetId?.assetId}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: '#c7d2fe', fontWeight: 600 }}>{item.userId?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{item.userId?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{item.assignedBy?.name}</td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>
                      {new Date(item.assignedDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${item.status === 'Active' ? 'assigned' : 'inventory'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{item.purpose}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {item.status === 'Active' && canManage && (
                        <button
                          onClick={() => setShowReturnModal(item)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          <ArrowLeftRight size={14} /> Process Depot Return
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

      {/* Custody Sanction Modal */}
      {showAssignModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Sanction Custody Handover</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Select Available Physical Asset *</label>
                <select
                  required
                  value={assignForm.assetId}
                  onChange={(e) => setAssignForm({ ...assignForm, assetId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                >
                  {availableAssets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.assetId} - {a.assetName} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Assign Designated Officer / Custodian *</label>
                <select
                  required
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                >
                  {usersList.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Official Sanction Order / Purpose</label>
                <input
                  type="text"
                  value={assignForm.purpose}
                  onChange={(e) => setAssignForm({ ...assignForm, purpose: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                  Issue Handover Sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Depot Handover Return</h3>
              <button onClick={() => setShowReturnModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '14px' }}>
              Returning <strong>{showReturnModal.assetId?.assetName}</strong> ({showReturnModal.assetId?.assetId})
              back to central municipal depot / inventory custody.
            </p>

            <form onSubmit={handleReturn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Physical Inspection on Handover</label>
                <input
                  type="text"
                  required
                  value={returnForm.conditionOnReturn}
                  onChange={(e) => setReturnForm({ ...returnForm, conditionOnReturn: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Handover Inspection Notes</label>
                <textarea
                  rows={3}
                  value={returnForm.remarks}
                  onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowReturnModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                  Acknowledge Depot Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
