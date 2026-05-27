import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const EMPTY = { label: '', url: '', target: '_self' };

const MenuManager = () => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const fetch = async () => {
    try {
      const { data } = await axios.get('/api/menu');
      setItems(data);
    } catch { setError('Failed to load menu items'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) return setError('Label and URL are required');
    setSaving(true);
    try {
      if (editId) {
        const { data } = await axios.put(`/api/menu/${editId}`, form);
        setItems(items.map(i => i._id === editId ? data : i));
      } else {
        const { data } = await axios.post('/api/menu', form);
        setItems([...items, data]);
      }
      resetForm();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ label: item.label, url: item.url, target: item.target });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await axios.delete(`/api/menu/${id}`);
      setItems(items.filter(i => i._id !== id));
    } catch { setError('Delete failed'); }
  };

  const move = async (index, dir) => {
    const next = [...items];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    const updated = next.map((item, i) => ({ ...item, order: i }));
    setItems(updated);
    await axios.put('/api/menu/reorder/bulk', {
      items: updated.map(({ _id, order }) => ({ _id, order })),
    });
  };

  return (
    <AdminLayout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Menu</h1>
            <p style={s.sub}>Manage site navigation links</p>
          </div>
        </div>

        {/* Form */}
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editId ? 'Edit Item' : 'Add Menu Item'}</h3>
          {error && <p style={s.error}>{error}</p>}
          <form onSubmit={handleSave} style={s.form}>
            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>Label *</label>
                <input style={s.input} placeholder="e.g. About Us" value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>URL *</label>
                <input style={s.input} placeholder="e.g. /about" value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })} />
              </div>
              <div style={s.fieldSm}>
                <label style={s.label}>Open in</label>
                <select style={s.input} value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}>
                  <option value="_self">Same tab</option>
                  <option value="_blank">New tab</option>
                </select>
              </div>
            </div>
            <div style={s.formActions}>
              <button style={s.btnPrimary} type="submit" disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update Item' : '+ Add Item'}
              </button>
              {editId && <button style={s.btnCancel} type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div style={s.listCard}>
          <h3 style={s.listTitle}>Navigation Items <span style={s.count}>{items.length}</span></h3>
          {loading ? <p style={s.empty}>Loading...</p>
            : items.length === 0 ? <p style={s.empty}>No menu items yet. Add one above.</p>
            : (
              <table style={s.table}>
                <thead>
                  <tr>{['Order', 'Label', 'URL', 'Target', 'Actions'].map(h =>
                    <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id} style={s.tr}>
                      <td style={s.td}>
                        <div style={s.orderBtns}>
                          <button style={s.orderBtn} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                          <button style={s.orderBtn} onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
                        </div>
                      </td>
                      <td style={{ ...s.td, fontWeight: '600', color: '#1e293b' }}>{item.label}</td>
                      <td style={{ ...s.td, color: '#64748b', fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.url}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: item.target === '_blank' ? '#eff6ff' : '#f0fdf4', color: item.target === '_blank' ? '#3b82f6' : '#16a34a' }}>
                          {item.target === '_blank' ? 'New tab' : 'Same tab'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <button style={s.editBtn} onClick={() => handleEdit(item)}>✏️ Edit</button>
                          <button style={s.deleteBtn} onClick={() => handleDelete(item._id)}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub: { color: '#64748b', fontSize: '0.9rem', margin: 0 },

  formCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 1rem' },
  form: {},
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '1rem', alignItems: 'end' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  fieldSm: { display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '130px' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#475569' },
  input: { padding: '0.6rem 0.85rem', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#f8fafc' },
  formActions: { display: 'flex', gap: '0.75rem' },
  btnPrimary: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  btnCancel: { padding: '0.6rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  error: { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', marginBottom: '1rem' },

  listCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' },
  listTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  count: { background: '#f1f5f9', color: '#64748b', borderRadius: '999px', padding: '0.1rem 0.55rem', fontSize: '0.78rem', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.65rem 0.85rem', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '0.85rem', fontSize: '0.9rem', color: '#475569', verticalAlign: 'middle' },
  badge: { padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' },
  actions: { display: 'flex', gap: '0.5rem' },
  editBtn: { padding: '0.3rem 0.7rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '0.3rem 0.7rem', background: '#fff5f5', color: '#e53e3e', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  orderBtns: { display: 'flex', flexDirection: 'column', gap: '2px' },
  orderBtn: { padding: '0.1rem 0.4rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' },
  empty: { color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' },
};

export default MenuManager;
