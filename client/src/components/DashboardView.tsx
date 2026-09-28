import React, { useEffect, useState } from 'react';
import {
  Landmark,
  TrendingUp,
  Cpu,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Bus,
  Activity,
  Flame,
  Droplets,
  HardHat,
  Search,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import { DashboardStats } from '../types';

export const DashboardView: React.FC<{ onNavigateToAssets: () => void }> = ({ onNavigateToAssets }) => {
  const [data, setData] = useState<{
    stats: DashboardStats;
    categoryStats: { _id: string; count: number; totalValue: number }[];
    statusStats: { _id: string; count: number }[];
    deptStats: { name: string; count: number; totalValue: number }[];
    expiringWarranties: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading State Public Infrastructure Telemetry...</div>
      </div>
    );
  }

  const stats = data?.stats;
  const COLORS = ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6', '#6366f1', '#f43f5e'];

  // Currency Formatter in Crores / Lakhs
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner with Sovereign Government Emblem Styling */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95) 0%, rgba(13, 19, 34, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              <Landmark size={14} /> National & State Public Works Directive
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>• GFR 2017 Compliant</span>
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Public Physical Infrastructure & Machinery Command Center
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.86rem' }}>
            Centralized registry for State Electric Fleets, High-Field Hospital MRI/Radiology Units, Municipal Water Turbines, and Heavy Civil Machinery.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onNavigateToAssets}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              fontSize: '0.85rem',
            }}
          >
            <HardHat size={16} /> Inspect Public Assets Catalog
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
      }}>
        {/* Total Physical Assets */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>TOTAL REGISTERED ASSETS</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Landmark size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: '12px 0 4px 0' }}>
            {stats?.totalAssets || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> 100% Geo-tagged with QR Tag
          </div>
        </div>

        {/* State Capital Valuation */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>PUBLIC ASSET VALUATION</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: '12px 0 4px 0' }}>
            {formatINR(stats?.totalAssetValue || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Consolidated State Capital Valuation
          </div>
        </div>

        {/* Operational Deployment Rate */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>OPERATIONAL READINESS</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: '12px 0 4px 0' }}>
            {stats?.utilizationRate || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#22d3ee' }}>
            {(stats?.activeAssets || 0) + (stats?.assignedAssets || 0)} units deployed on active duty
          </div>
        </div>

        {/* Civic Breakdowns / Incidents */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>BREAKDOWN / GRIEVANCES</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: '12px 0 4px 0' }}>
            {stats?.openTicketsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fb7185' }}>
            Pending engineering restoration
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Category & Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Category Distribution Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Physical Asset Category Distribution
          </h2>
          <div style={{ height: '280px', width: '100%' }}>
            {data?.categoryStats && data.categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryStats}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.categoryStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Units`, name]}
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value: string) => (
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginRight: '8px' }}>
                        {value?.length > 20 ? `${value.slice(0, 20)}...` : value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                No category telemetry data available
              </div>
            )}
          </div>
        </div>

        {/* Directorate Asset Count Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Directorate & Division Allocation
          </h2>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.deptStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Statutory Alert: Warranty & Inspection Due Monitor */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#f59e0b" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              Statutory Warranty & CAMC Renewal Watchlist (Expiring &lt; 60 Days)
            </h2>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Mandatory Health & Public Safety Audit</span>
        </div>

        {(!data?.expiringWarranties || data.expiringWarranties.length === 0) ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
            All public assets have valid warranties and active CAMC contracts.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                  <th style={{ padding: '10px 14px' }}>Gov Asset ID</th>
                  <th style={{ padding: '10px 14px' }}>Nomenclature / Machinery</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Location / District</th>
                  <th style={{ padding: '10px 14px' }}>Sanction Order</th>
                  <th style={{ padding: '10px 14px' }}>CAMC Expiry</th>
                  <th style={{ padding: '10px 14px' }}>Condition</th>
                </tr>
              </thead>
              <tbody>
                {data.expiringWarranties.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 600 }}>
                      {item.assetId}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#fff', fontWeight: 600 }}>{item.assetName}</td>
                    <td style={{ padding: '12px 14px', color: '#9ca3af' }}>{item.category}</td>
                    <td style={{ padding: '12px 14px', color: '#d1d5db' }}>{item.location} ({item.district || 'HQ'})</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#a5b4fc', fontSize: '0.75rem' }}>
                      {item.sanctionOrderNo || 'SANCT-2024-01'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#f59e0b', fontWeight: 700 }}>
                      {new Date(item.warrantyExpiry).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-active">{item.physicalCondition || 'Operational'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
