import React, { useState, useEffect } from 'react';
import { Building2, Plus, Landmark, Briefcase, X, UserPlus, Users, Key, Mail, Shield, Phone } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrgDepartmentView: React.FC = () => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const [deptSubmitting, setDeptSubmitting] = useState(false);
  const [deptError, setDeptError] = useState<string | null>(null);

  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    departmentId: '',
    organizationId: '',
    phone: '',
  });

  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    organizationId: '',
    budget: 50000000,
    location: 'Worli Central Engineering Complex',
    description: '',
  });

  const [orgForm, setOrgForm] = useState({
    name: '',
    code: '',
    domain: 'gov.in',
    contactEmail: '',
    description: '',
    subscriptionPlan: 'Enterprise',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgsRes, deptsRes, usersRes] = await Promise.all([
        api.get('/organizations'),
        api.get('/departments'),
        api.get('/auth/users'),
      ]);
      const fetchedOrgs = orgsRes.data.data;
      setOrgs(fetchedOrgs);
      setDepartments(deptsRes.data.data);
      setOfficers(usersRes.data.users || []);

      if (fetchedOrgs.length > 0 && !deptForm.organizationId) {
        setDeptForm((prev) => ({ ...prev, organizationId: fetchedOrgs[0]._id }));
      }
      if (fetchedOrgs.length > 0 && !userForm.organizationId) {
        setUserForm((prev) => ({ ...prev, organizationId: fetchedOrgs[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load org/department info', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);
    setUserSubmitting(true);
    try {
      const payload = {
        ...userForm,
        organizationId: userForm.organizationId || (orgs.length > 0 ? orgs[0]._id : undefined),
      };
      const res = await api.post('/auth/users', payload);
      setUserSuccess(res.data.message || 'Officer successfully enrolled.');
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        departmentId: '',
        organizationId: orgs[0]?._id || '',
        phone: '',
      });
      fetchData();
      setTimeout(() => {
        setShowUserModal(false);
        setUserSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Create officer failed', err);
      setUserError(err.response?.data?.message || 'Failed to enroll officer. Please check fields.');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptError(null);
    setDeptSubmitting(true);
    try {
      const payload = {
        ...deptForm,
        organizationId: deptForm.organizationId || (orgs.length > 0 ? orgs[0]._id : undefined),
      };
      await api.post('/departments', payload);
      setShowDeptModal(false);
      setDeptForm({
        name: '',
        code: '',
        organizationId: orgs[0]?._id || '',
        budget: 50000000,
        location: 'Worli Central Engineering Complex',
        description: '',
      });
      fetchData();
    } catch (err: any) {
      console.error('Create dept failed', err);
      setDeptError(err.response?.data?.message || 'Failed to constitute division. Please try again.');
    } finally {
      setDeptSubmitting(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/organizations', orgForm);
      setShowOrgModal(false);
      fetchData();
    } catch (err) {
      console.error('Create org failed', err);
    }
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${(val || 0).toLocaleString('en-IN')}`;
  };

  const isSuperAdmin = user?.role === 'Super Admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Government Authorities & Operational Directorates</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            State Municipal Corporations, Public Works Boards, Health Directorates, and allocated public infrastructure budgets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isSuperAdmin && (
            <button
              onClick={() => setShowUserModal(true)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              <UserPlus size={16} /> Enrol New Officer
            </button>
          )}
          {isSuperAdmin && (
            <button onClick={() => setShowOrgModal(true)} className="btn btn-secondary">
              <Landmark size={16} /> Constitute Authority
            </button>
          )}
          <button
            onClick={() => setShowDeptModal(true)}
            className="btn btn-secondary"
          >
            <Plus size={16} /> Create Directorate
          </button>
        </div>
      </div>

      {/* Authorities Section */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={18} color="#f59e0b" /> Constituted Public Authorities ({orgs.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {orgs.map((org) => (
            <div key={org._id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{org.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontFamily: 'monospace' }}>CODE: {org.code}</div>
                </div>
                <span className="badge badge-active">Sovereign Entity</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '10px' }}>{org.description || 'Public Sector Authority'}</p>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280' }}>
                <span>{org.contactEmail}</span>
                <span>{org.domain || 'gov.in'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Personnel & Custodian Roster Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#10b981" /> Authorized Officers & Asset Custodians ({officers.length})
          </h2>
          {isSuperAdmin && (
            <button
              onClick={() => setShowUserModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <UserPlus size={14} /> Add Official Credentials
            </button>
          )}
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#9ca3af' }}>
                  <th style={{ padding: '12px 16px' }}>Officer Name</th>
                  <th style={{ padding: '12px 16px' }}>Official Email</th>
                  <th style={{ padding: '12px 16px' }}>Designated Role</th>
                  <th style={{ padding: '12px 16px' }}>Assigned Directorate</th>
                  <th style={{ padding: '12px 16px' }}>Authority</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{officer.name}</div>
                      {officer.phone && <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{officer.phone}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#38bdf8', fontFamily: 'monospace' }}>
                      {officer.email}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor:
                          officer.role === 'Super Admin'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : officer.role === 'Organization Admin'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : officer.role === 'Asset Manager'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : officer.role === 'Auditor'
                            ? 'rgba(139, 92, 246, 0.15)'
                            : 'rgba(59, 130, 246, 0.15)',
                        color:
                          officer.role === 'Super Admin'
                            ? '#fb7185'
                            : officer.role === 'Organization Admin'
                            ? '#fbbf24'
                            : officer.role === 'Asset Manager'
                            ? '#34d399'
                            : officer.role === 'Auditor'
                            ? '#c084fc'
                            : '#60a5fa',
                      }}>
                        {officer.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#c7d2fe' }}>
                      {officer.departmentId?.name || 'Central Headquarter'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>
                      {officer.organizationId?.name || 'Sovereign Secretariat'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        color: officer.isActive ? '#34d399' : '#f87171',
                        fontWeight: 600,
                      }}>
                        {officer.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enrol Officer / Assign Role Modal */}
      {showUserModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '26px', backgroundColor: '#111827', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Enrol Government Officer</h3>
              </div>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '16px' }}>
              Assign official credentials, designation, and jurisdictional authority. The officer will log in using this email and password.
            </p>

            {userError && (
              <div style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.8rem',
                marginBottom: '14px',
              }}>
                {userError}
              </div>
            )}

            {userSuccess && (
              <div style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#34d399',
                fontSize: '0.8rem',
                marginBottom: '14px',
              }}>
                {userSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Officer Full Name & Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Er. Vikram Mehta (Assistant Engineer)"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Official Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@pwd.gov.in"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Initial Access Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Assigned System Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="Employee">Employee / Field Custodian</option>
                    <option value="Asset Manager">Asset Manager / Engineer</option>
                    <option value="Organization Admin">Organization Admin / Directorate Head</option>
                    <option value="Auditor">Auditor (CAG / Statutory Vigilance)</option>
                    {isSuperAdmin && <option value="Super Admin">Super Admin (State Level)</option>}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98XXX XXXXX"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Directorate / Division</label>
                <select
                  value={userForm.departmentId}
                  onChange={(e) => setUserForm({ ...userForm, departmentId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="">Central Headquarters / Unallocated</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userSubmitting}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    opacity: userSubmitting ? 0.7 : 1,
                    cursor: userSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {userSubmitting ? 'Enrolling Officer...' : 'Enrol Officer & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      {showDeptModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Create Operational Directorate</h3>
              <button onClick={() => setShowDeptModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {deptError && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.8rem',
                }}>
                  {deptError}
                </div>
              )}

              {orgs.length > 1 && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Parent Public Authority *</label>
                  <select
                    value={deptForm.organizationId || (orgs[0]?._id || '')}
                    onChange={(e) => setDeptForm({ ...deptForm, organizationId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  >
                    {orgs.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Directorate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urban Water Supply & Sewage Board"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Division Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WSD"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Sanctioned Budget (INR ₹)</label>
                  <input
                    type="number"
                    value={deptForm.budget}
                    onChange={(e) => setDeptForm({ ...deptForm, budget: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Command Location (HQ / Base)</label>
                <input
                  type="text"
                  placeholder="e.g. Worli Central Engineering Complex"
                  value={deptForm.location}
                  onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Operational Scope & Managed Assets Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High-Capacity Turbine Pumps, Municipal Water Reservoirs, and Chlorination Plants"
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowDeptModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deptSubmitting}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    opacity: deptSubmitting ? 0.7 : 1,
                    cursor: deptSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deptSubmitting ? 'Constituting...' : 'Constitute Division'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Org Modal */}
      {showOrgModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Constitute Public Authority</h3>
              <button onClick={() => setShowOrgModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Authority Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Highways & Infrastructure Development Corp"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Entity Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MSRDC"
                    value={orgForm.code}
                    onChange={(e) => setOrgForm({ ...orgForm, code: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Domain</label>
                  <input
                    type="text"
                    placeholder="infra.gov.in"
                    value={orgForm.domain}
                    onChange={(e) => setOrgForm({ ...orgForm, domain: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Secretariat Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="sec@pwd.gov.in"
                  value={orgForm.contactEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowOrgModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                  Gazette Authority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
