import React, { useState, useEffect } from 'react';
import api from '../api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

const EMPTY_FORM = { name: '', description: '', color: '#6366f1' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await api.get('/categories');
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => {
    setEditCat(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#6366f1' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editCat) {
        await api.put(`/categories/${editCat._id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    fetch();
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/></svg>
          <h3>No categories yet</h3>
          <p>Create categories to organize your products.</p>
          <button className="btn btn-primary" onClick={openAdd}>Add Category</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {categories.map((cat) => (
            <div key={cat._id} className="card" style={{ position: 'relative', borderTop: `3px solid ${cat.color}`, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="color-dot" style={{ background: cat.color, width: 12, height: 12 }}></span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{cat.name}</h3>
                  </div>
                  {cat.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5 }}>{cat.description}</p>
                  )}
                  <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px' }}>
                    Created {new Date(cat.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openEdit(cat)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat._id)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input value={form.name} onChange={f('name')} placeholder="e.g. Electronics" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea value={form.description} onChange={f('description')} placeholder="Optional description" rows={2} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        style={{
                          width: 28, height: 28, borderRadius: '6px', background: c, border: 'none',
                          cursor: 'pointer', outline: form.color === c ? `3px solid white` : 'none',
                          outlineOffset: '2px', transition: 'transform 0.15s',
                          transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={form.color}
                      onChange={f('color')}
                      style={{ width: 40, height: 36, padding: '2px', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Or pick a custom color</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editCat ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
