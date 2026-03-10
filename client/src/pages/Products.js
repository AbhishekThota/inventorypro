import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

const StockBadge = ({ product }) => {
  if (product.quantity === 0) return <span className="badge badge-red">Out of Stock</span>;
  if (product.quantity <= product.lowStockThreshold) return <span className="badge badge-yellow">Low Stock</span>;
  return <span className="badge badge-green">In Stock</span>;
};

const EMPTY_FORM = {
  name: '', sku: '', description: '', category: '',
  price: '', costPrice: '', quantity: '', lowStockThreshold: 10,
  unit: 'pcs', supplier: '', location: '', status: 'active',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(null);
  const [qtyForm, setQtyForm] = useState({ adjustment: '', type: 'add' });

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { search, category: filterCategory, status: filterStatus, page, limit: 15 }
      });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
    if (searchParams.get('new')) openAddModal();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category?._id || '',
      price: product.price,
      costPrice: product.costPrice || '',
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      unit: product.unit || 'pcs',
      supplier: product.supplier || '',
      location: product.location || '',
      status: product.status,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, form);
      } else {
        await api.post('/products', form);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const handleQtyUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/products/${showQtyModal._id}/quantity`, qtyForm);
      setShowQtyModal(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{total} product{total !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Search by name, SKU, or supplier..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select style={{ width: 'auto', minWidth: 160 }} value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select style={{ width: 'auto', minWidth: 140 }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <h3>No products found</h3>
              <p>Add your first product to get started.</p>
              <button className="btn btn-primary" onClick={openAddModal}>Add Product</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{product.name}</div>
                      {product.supplier && <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{product.supplier}</div>}
                    </td>
                    <td><code style={{ fontSize: '12px', color: 'var(--text2)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: '4px' }}>{product.sku}</code></td>
                    <td>
                      {product.category ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="color-dot" style={{ background: product.category.color }}></span>
                          {product.category.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(product.price).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{product.quantity}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{product.unit}</span>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => { setShowQtyModal(product); setQtyForm({ adjustment: '', type: 'add' }); }}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >±</button>
                      </div>
                    </td>
                    <td><StockBadge product={product} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(product)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="pagination" style={{ padding: '16px 20px' }}>
            <span>Showing {products.length} of {total}</span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'current' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input value={form.name} onChange={f('name')} placeholder="e.g. MacBook Pro" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input value={form.sku} onChange={f('sku')} placeholder="e.g. MBP-001" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select value={form.category} onChange={f('category')} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea value={form.description} onChange={f('description')} placeholder="Optional product description" rows={2} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹) *</label>
                    <input type="number" step="0.01" min="0" value={form.price} onChange={f('price')} placeholder="0.00" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price (₹)</label>
                    <input type="number" step="0.01" min="0" value={form.costPrice} onChange={f('costPrice')} placeholder="0.00" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input type="number" min="0" value={form.quantity} onChange={f('quantity')} placeholder="0" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low Stock Threshold</label>
                    <input type="number" min="0" value={form.lowStockThreshold} onChange={f('lowStockThreshold')} placeholder="10" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input value={form.unit} onChange={f('unit')} placeholder="pcs, kg, m..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select value={form.status} onChange={f('status')}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <input value={form.supplier} onChange={f('supplier')} placeholder="Supplier name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input value={form.location} onChange={f('location')} placeholder="Shelf, aisle, warehouse..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quantity Modal */}
      {showQtyModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowQtyModal(null)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Update Quantity</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowQtyModal(null)}>✕</button>
            </div>
            <form onSubmit={handleQtyUpdate}>
              <div className="modal-body">
                <p style={{ color: 'var(--text2)', marginBottom: '16px', fontSize: '14px' }}>
                  <strong style={{ color: 'var(--text)' }}>{showQtyModal.name}</strong> — Current: {showQtyModal.quantity} {showQtyModal.unit}
                </p>
                <div className="form-group">
                  <label className="form-label">Operation</label>
                  <select value={qtyForm.type} onChange={(e) => setQtyForm({ ...qtyForm, type: e.target.value })}>
                    <option value="add">Add Stock</option>
                    <option value="subtract">Remove Stock</option>
                    <option value="set">Set Exact Quantity</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={qtyForm.adjustment}
                    onChange={(e) => setQtyForm({ ...qtyForm, adjustment: e.target.value })}
                    placeholder="Enter quantity"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQtyModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
