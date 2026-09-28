import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, Search, Landmark } from 'lucide-react';
import api from '../services/api';
import { AuditLog } from '../types';

export const ComplianceAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', {
        params: { category: categoryFilter },
      });
      setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [categoryFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      (log.assetId && log.assetId.toLowerCase().includes(term))
    );
  });

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Officer', 'Designation', 'Category', 'Action_Details', 'GovAssetID', 'IPAddress'];
    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp).toISOString(),
      `"${l.userName}"`,
      l.userRole,
      l.category,
      `"${l.action.replace(/"/g, '""')}"`,
      l.assetId || '',
      l.ipAddress,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRAVI_CAG_Statutory_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Statutory GFR & CAG Compliance Ledger</h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}>
              <Landmark size={14} /> GFR-2017 Rule 217 Mandate
            </span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Every custody sanction, state asset transfer, condemnation order, and physical inspection logged for Comptroller & Auditor General (CAG) compliance.
          </p>
        </div>

        <button onClick={exportAuditCSV} className="btn btn-secondary">
          <Download size={16} /> Export CAG Audit Dossier
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search audit actions, designated officer, public asset ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        >
          <option value="">All Audit Categories</option>
          <option value="ASSET">Physical Asset Mutations</option>
          <option value="ASSIGNMENT">Custody & Sanctions</option>
          <option value="MAINTENANCE">AMC & Inspections</option>
          <option value="INCIDENT">Grievances & Breakdowns</option>
          <option value="AUTH">Official Authorizations</option>
          <option value="SYSTEM">Secretariat Directives</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#9ca3af' }}>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Designated Officer</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Sanction Action & GFR Details</th>
                <th style={{ padding: '12px 16px' }}>Gov Asset ID</th>
                <th style={{ padding: '12px 16px' }}>Origin Node IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Loading CAG compliance ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No statutory audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', color: '#9ca3af', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{log.userName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>{log.userRole}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        color: '#fbbf24',
                      }}>
                        {log.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>
                      {log.action}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'monospace', marginTop: '2px' }}>
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 600 }}>
                      {log.assetId || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
