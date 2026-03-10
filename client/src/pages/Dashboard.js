import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!stats) return <div className="empty-state"><p>Failed to load dashboard data.</p></div>;

  const stockStatus = [
    { name: 'In Stock', value: stats.totalProducts - stats.lowStockProducts - stats.outOfStockProducts },
    { name: 'Low Stock', value: stats.lowStockProducts },
    { name: 'Out of Stock', value: stats.outOfStockProducts },
  ].filter(s => s.value > 0);

  const stockColors = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products?new=1')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="stat-value">₹{stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Total Value</div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon yellow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="stat-value">{stats.lowStockProducts}</div>
          <div className="stat-label">Low Stock</div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="stat-value">{stats.outOfStockProducts}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Stock Status</div>
          {stockStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stockStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {stockStatus.map((_, i) => <Cell key={i} fill={stockColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: '40px' }}>No data</div>}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {stockStatus.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: stockColors[i], display: 'inline-block' }}></span>
                {s.name}: <strong style={{ color: 'var(--text)' }}>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Products by Category</div>
          {stats.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: '40px' }}>No data</div>}
        </div>
      </div>

      {stats.lowStockItems.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px' }}>⚠️ Low Stock Alert</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/products')}>View All</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockItems.map((product) => (
                  <tr key={product._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/products')}>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td><code style={{ fontSize: '12px', color: 'var(--text2)' }}>{product.sku}</code></td>
                    <td>
                      {product.category && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="color-dot" style={{ background: product.category.color }}></span>
                          {product.category.name}
                        </span>
                      )}
                    </td>
                    <td><span className="badge badge-yellow">{product.quantity} {product.unit}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: '13px' }}>{product.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
