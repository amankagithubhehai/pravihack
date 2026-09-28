import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  QrCode,
  Edit,
  Trash2,
  Download,
  X,
  Landmark,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  Camera,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { Asset, LifecycleStatus, AssetCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { QRScannerModal } from './QRScannerModal';

export const AssetInventoryView: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<Asset | null>(null);
  const [showLifecycleModal, setShowLifecycleModal] = useState<Asset | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);
  const [newStatus, setNewStatus] = useState<LifecycleStatus>('Active');
  const [editWarrantyExpiry, setEditWarrantyExpiry] = useState('');
  const [editNextInspection, setEditNextInspection] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    assetId: '',
    assetName: '',
    category: 'Fleet & Public Transport Vehicles' as AssetCategory,
    assetType: 'Electric City Bus',
    serialNumber: '',
    location: 'Worli Depot 4, Bay 12',
    district: 'Mumbai South',
    gpsCoordinates: '19.0178° N, 72.8478° E',
    cost: 18500000,
    vendor: 'Tata Motors Commercial Vehicles',
    amcVendor: 'Tata Fleet Care Services',
    sanctionOrderNo: 'GO-TRANS/2026/89',
    custodianOfficer: 'Executive Engineer - R. K. Shinde',
    physicalCondition: 'Operational / Excellent',
    status: 'Active',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextInspectionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets', {
        params: {
          search: searchTerm,
          status: statusFilter,
          category: categoryFilter,
        },
      });
      setAssets(res.data.data);
    } catch (err) {
      console.error('Failed to fetch public assets', err);
    } finally {
      setLoading(false);
    }
  };

  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await api.post('/assets', formData);
      setShowCreateModal(false);
      // Reset form to defaults
      setFormData({
        assetId: '',
        assetName: '',
        category: 'Fleet & Public Transport Vehicles' as AssetCategory,
        assetType: 'Electric City Bus',
        serialNumber: '',
        location: 'Worli Depot 4, Bay 12',
        district: 'Mumbai South',
        gpsCoordinates: '19.0178° N, 72.8478° E',
        cost: 18500000,
        vendor: 'Tata Motors Commercial Vehicles',
        amcVendor: 'Tata Fleet Care Services',
        sanctionOrderNo: 'GO-TRANS/2026/89',
        custodianOfficer: 'Executive Engineer - R. K. Shinde',
        physicalCondition: 'Operational / Excellent',
        status: 'Active',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextInspectionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchAssets();
    } catch (err: any) {
      console.error('Failed to register government physical asset', err);
      const msg = err.response?.data?.message || err.message || 'Failed to register public asset';
      setCreateError(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!showLifecycleModal) return;
    try {
      const payload: any = { status: newStatus };
      if (editWarrantyExpiry) {
        payload.warrantyExpiry = editWarrantyExpiry;
      }
      if (editNextInspection) {
        payload.nextInspectionDate = editNextInspection;
      }
      await api.put(`/assets/${showLifecycleModal._id}`, payload);
      setShowLifecycleModal(null);
      fetchAssets();
    } catch (err) {
      console.error('Failed to transition lifecycle status and renew warranty', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to decommission/remove this public asset? GFR verification required.')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err) {
      console.error('Decommission failed', err);
    }
  };

  const exportCSV = () => {
    const headers = ['GovAssetID', 'Nomenclature', 'Category', 'Type', 'Status', 'Condition', 'Location', 'District', 'Valuation_INR', 'SanctionOrder', 'Vendor'];
    const rows = assets.map((a) => [
      a.assetId,
      `"${a.assetName.replace(/"/g, '""')}"`,
      `"${a.category}"`,
      `"${a.assetType}"`,
      a.status,
      `"${a.physicalCondition || 'Operational'}"`,
      `"${a.location}"`,
      `"${a.district || ''}"`,
      a.cost,
      `"${a.sanctionOrderNo || ''}"`,
      `"${a.vendor || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRAVI_Gov_Physical_Assets_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const govCategories: AssetCategory[] = [
    'Government Buildings & Infrastructure',
    'Fleet & Public Transport Vehicles',
    'Public Health & Hospital Equipment',
    'Civic & Municipal Machinery',
    'Emergency & Defense Equipment',
    'IT & Surveillance Infrastructure',
    'Land & Real Estate',
    'Other Public Asset',
  ];

  const lifecycleStages: LifecycleStatus[] = [
    'Procurement',
    'Received',
    'Inventory',
    'Assigned',
    'Active',
    'Maintenance',
    'Retired',
    'Disposed',
  ];

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${(val || 0).toLocaleString('en-IN')}`;
  };

  const canManage = ['Super Admin', 'Organization Admin', 'Asset Manager'].includes(user?.role || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Public Physical Assets Master Registry</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            State infrastructure catalog, municipal machinery, hospital equipment, and physical geo-tagged assets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowScannerModal(true)}
            className="btn btn-secondary"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              background: 'rgba(245, 158, 11, 0.08)',
            }}
          >
            <Camera size={16} /> Scan QR Tag
          </button>
          <button onClick={exportCSV} className="btn btn-secondary">
            <Download size={16} /> Export GFR-24 Ledger
          </button>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              }}
            >
              <Plus size={16} /> Register Public Asset
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Asset ID, Nomenclature, Vehicle/Serial No, Location, Sanction..."
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

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
              maxWidth: '220px',
            }}
          >
            <option value="">All Public Categories</option>
            {govCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="">All Lifecycle Stages</option>
            {lifecycleStages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#9ca3af' }}>
                <th style={{ padding: '12px 16px' }}>Gov ID & QR</th>
                <th style={{ padding: '12px 16px' }}>Asset Nomenclature</th>
                <th style={{ padding: '12px 16px' }}>Public Category</th>
                <th style={{ padding: '12px 16px' }}>Lifecycle Status</th>
                <th style={{ padding: '12px 16px' }}>Physical Condition</th>
                <th style={{ padding: '12px 16px' }}>Location / District</th>
                <th style={{ padding: '12px 16px' }}>Valuation</th>
                <th style={{ padding: '12px 16px' }}>Custodian Officer</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Loading public assets ledger...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No matching public assets found in registry.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fbbf24' }}>
                          {asset.assetId}
                        </span>
                        {asset.qrCodeUrl && (
                          <button
                            onClick={() => setShowQRModal(asset)}
                            title="View Physical QR Barcode Tag"
                            style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: 0 }}
                          >
                            <QrCode size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{asset.assetName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>Type: {asset.assetType}</span>
                        {asset.serialNumber && <span style={{ fontFamily: 'monospace' }}>Reg/SN: {asset.serialNumber}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#d1d5db', fontSize: '0.8rem' }}>{asset.category}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        className={`badge badge-${asset.status.toLowerCase()}`}
                        style={{ cursor: canManage ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (canManage) {
                            setShowLifecycleModal(asset);
                            setNewStatus(asset.status);
                          }
                        }}
                        title={canManage ? 'Click to change official lifecycle stage' : undefined}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: asset.physicalCondition?.includes('Critical') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: asset.physicalCondition?.includes('Critical') ? '#fb7185' : '#34d399',
                      }}>
                        {asset.physicalCondition || 'Operational'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>
                      <div>{asset.location}</div>
                      {asset.district && <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{asset.district}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#34d399', fontWeight: 700 }}>
                      {formatINR(asset.cost)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#c7d2fe', fontSize: '0.8rem' }}>
                      {asset.assignedTo?.name || asset.custodianOfficer || 'Unallocated Depot'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedAssetDetail(asset)}
                          title="View Full Technical Specs & Warranty Card"
                          style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px' }}
                        >
                          <Eye size={16} />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setShowLifecycleModal(asset);
                                setNewStatus(asset.status);
                                setEditWarrantyExpiry(asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '');
                                setEditNextInspection(asset.nextInspectionDate ? new Date(asset.nextInspectionDate).toISOString().split('T')[0] : '');
                              }}
                              title="Update Status / Renew Warranty"
                              style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '4px' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(asset._id)}
                              title="Decommission & Scrap Protocol"
                              style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live QR Camera Scanner Modal */}
      {showScannerModal && (
        <QRScannerModal
          onClose={() => setShowScannerModal(false)}
          assets={assets}
          onAssetFound={(foundAsset) => {
            setShowScannerModal(false);
            setSelectedAssetDetail(foundAsset);
          }}
        />
      )}

      {/* Asset Full Inspection Profile Modal (from QR Scan) */}
      {selectedAssetDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', backgroundColor: '#111827', borderRadius: '16px', padding: '24px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={20} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>Public Infrastructure Asset Record</h3>
              </div>
              <button onClick={() => setSelectedAssetDetail(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              {selectedAssetDetail.qrCodeUrl ? (
                <img src={selectedAssetDetail.qrCodeUrl} alt="QR" style={{ width: '110px', height: '110px', borderRadius: '8px', background: '#fff', padding: '6px' }} />
              ) : (
                <div style={{ width: '110px', height: '110px', borderRadius: '8px', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={40} color="#9ca3af" />
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'monospace', color: '#fbbf24', fontSize: '1.15rem', fontWeight: 800 }}>
                  {selectedAssetDetail.assetId}
                </div>
                <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700, marginTop: '2px' }}>
                  {selectedAssetDetail.assetName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                  Category: <span style={{ color: '#e5e7eb' }}>{selectedAssetDetail.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                    Status: {selectedAssetDetail.status}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                    {selectedAssetDetail.physicalCondition || 'Operational'}
                  </span>
                </div>
              </div>
            </div>

            {/* Spec Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>Location / Facility</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{selectedAssetDetail.location} ({selectedAssetDetail.district || 'General'})</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>GPS Coordinates</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{selectedAssetDetail.gpsCoordinates || 'Geo-tagged'}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>Capital Valuation</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>{formatINR(selectedAssetDetail.cost)}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>Sanction Order</span>
                <span style={{ color: '#818cf8', fontFamily: 'monospace' }}>{selectedAssetDetail.sanctionOrderNo || 'N/A'}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>Authorized Custodian</span>
                <span style={{ color: '#fff' }}>{selectedAssetDetail.assignedTo?.name || selectedAssetDetail.custodianOfficer || 'Unallocated Depot'}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>AMC / OEM Vendor</span>
                <span style={{ color: '#fff' }}>{selectedAssetDetail.amcVendor || selectedAssetDetail.vendor || 'State PWD Services'}</span>
              </div>
              <div style={{ padding: '10px 12px', background: selectedAssetDetail.warrantyExpiry && new Date(selectedAssetDetail.warrantyExpiry) < new Date(Date.now() + 60 * 86400000) ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: selectedAssetDetail.warrantyExpiry && new Date(selectedAssetDetail.warrantyExpiry) < new Date(Date.now() + 60 * 86400000) ? '1px solid rgba(244, 63, 94, 0.3)' : 'none' }}>
                <span style={{ color: '#fb7185', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>🛡️ Warranty / CAMC Expiry</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>
                  {selectedAssetDetail.warrantyExpiry ? new Date(selectedAssetDetail.warrantyExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Lifetime / Standard'}
                </span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>Next Scheduled Inspection</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                  {selectedAssetDetail.nextInspectionDate ? new Date(selectedAssetDetail.nextInspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Periodic Annual'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {canManage && (
                <button
                  onClick={() => {
                    setShowLifecycleModal(selectedAssetDetail);
                    setNewStatus(selectedAssetDetail.status);
                    setEditWarrantyExpiry(selectedAssetDetail.warrantyExpiry ? new Date(selectedAssetDetail.warrantyExpiry).toISOString().split('T')[0] : '');
                    setEditNextInspection(selectedAssetDetail.nextInspectionDate ? new Date(selectedAssetDetail.nextInspectionDate).toISOString().split('T')[0] : '');
                    setSelectedAssetDetail(null);
                  }}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
                >
                  <Edit size={15} /> Update GFR Lifecycle
                </button>
              )}
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="btn btn-secondary"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Barcode Modal */}
      {showQRModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '24px', textAlign: 'center', backgroundColor: '#111827', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Landmark size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Official Public Asset Tag</h3>
              </div>
              <button onClick={() => setShowQRModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <img src={showQRModal.qrCodeUrl} alt="QR Code" style={{ width: '190px', height: '190px', margin: '0 auto', borderRadius: '12px', background: '#fff', padding: '10px' }} />
            <div style={{ marginTop: '16px', fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem', fontFamily: 'monospace' }}>
              {showQRModal.assetId}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '4px', fontWeight: 600 }}>{showQRModal.assetName}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Location: {showQRModal.location}</div>
            {showQRModal.sanctionOrderNo && (
              <div style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: '4px', fontFamily: 'monospace' }}>
                Sanction Order: {showQRModal.sanctionOrderNo}
              </div>
            )}
            <button onClick={() => setShowQRModal(null)} className="btn btn-secondary" style={{ marginTop: '20px', width: '100%' }}>
              Close QR Tag
            </button>
          </div>
        </div>
      )}

      {/* Lifecycle Transition Modal */}
      {showLifecycleModal && (
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
          <div className="glass-panel" style={{ width: '460px', padding: '24px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>GFR Lifecycle State Transition</h3>
              <button onClick={() => setShowLifecycleModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px' }}>
              Transitioning <strong>{showLifecycleModal.assetName}</strong> (<span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{showLifecycleModal.assetId}</span>).
              Generates an immutable CAG compliance audit log entry.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase' }}>
                Select Lifecycle State
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LifecycleStatus)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              >
                {lifecycleStages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* Warranty & AMC Renewal Section */}
            <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> Warranty / CAMC Renewal
              </div>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '10px' }}>
                Updating this date to a future period certifies the renewal and automatically clears pending statutory alerts.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#fca5a5', display: 'block', marginBottom: '4px' }}>
                    New Warranty Expiry
                  </label>
                  <input
                    type="date"
                    value={editWarrantyExpiry}
                    onChange={(e) => setEditWarrantyExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1f2937',
                      border: '1px solid rgba(248,113,113,0.3)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#93c5fd', display: 'block', marginBottom: '4px' }}>
                    Next Inspection Date
                  </label>
                  <input
                    type="date"
                    value={editNextInspection}
                    onChange={(e) => setEditNextInspection(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1f2937',
                      border: '1px solid rgba(147,197,253,0.3)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLifecycleModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateStatus} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                Record Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Public Asset Modal */}
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
          <div className="glass-panel" style={{ width: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Register New Government Physical Asset</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div style={{
                padding: '10px 14px',
                marginBottom: '14px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.85rem'
              }}>
                ⚠️ {createError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Asset Nomenclature / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Ultra 9m Electric AC City Bus"
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Asset ID (Auto if empty)</label>
                  <input
                    type="text"
                    placeholder="Auto: AST-XXXX"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fbbf24', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Public Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  >
                    {govCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Machinery / Asset Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric City Bus, MRI Scanner, Fire Engine"
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Chassis / Serial / Reg No</label>
                  <input
                    type="text"
                    placeholder="MH-01-EV-4421"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Valuation (INR ₹)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Physical Location / Facility</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>District / Division</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Sanction Order Number</label>
                  <input
                    type="text"
                    value={formData.sanctionOrderNo}
                    onChange={(e) => setFormData({ ...formData, sanctionOrderNo: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Supplier / OEM Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Statutory Dates & Warranty */}
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px dashed rgba(245, 158, 11, 0.25)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Statutory Compliance & Maintenance Schedule
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Procurement / Commissioning Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#f87171', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                      Warranty / CAMC Expiry Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1f2937', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Next Scheduled Statutory Inspection Date</label>
                  <input
                    type="date"
                    value={formData.nextInspectionDate}
                    onChange={(e) => setFormData({ ...formData, nextInspectionDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="btn btn-primary"
                  style={{
                    background: createSubmitting ? '#4b5563' : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    cursor: createSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {createSubmitting ? 'Registering Asset...' : 'Register Asset & Generate QR Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
