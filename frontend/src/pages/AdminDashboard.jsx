import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  const fetchPages = async () => {
    try {
      const { data } = await axios.get('/api/pages');
      setPages(data);
    } catch (err) {
      console.error('Failed to fetch pages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const editLandingPage = async () => {
    try {
      const { data } = await axios.get('/api/pages/ensure-home');
      navigate(`/admin/editor/${data._id}`);
    } catch { alert('Failed to open landing page editor'); }
  };

  const createPage = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const { data } = await axios.post('/api/pages', { title: newTitle });
      setNewTitle('');
      setCreating(false);
      navigate(`/admin/editor/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create page');
    }
  };

  const deletePage = async (id) => {
    if (!confirm('Delete this page?')) return;
    try {
      await axios.delete(`/api/pages/${id}`);
      setPages(pages.filter((p) => p._id !== id));
    } catch {
      alert('Failed to delete page');
    }
  };

  return (
    <AdminLayout>
      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Pages</h1>
            <p style={s.sub}>Create and manage your website pages</p>
          </div>
          <button style={s.newBtn} onClick={() => setCreating(true)}>+ New Page</button>
        </div>

        {/* Landing page pinned card */}
        <div style={s.landingCard}>
          <div>
            <span style={s.landingBadge}>🏠 Landing Page</span>
            <p style={s.landingSub}>Edit the public homepage visible at <code style={s.code}>/</code></p>
          </div>
          <button style={s.landingBtn} onClick={editLandingPage}>✏️ Edit Landing Page</button>
        </div>

        {/* New page form */}
        {creating && (
          <form onSubmit={createPage} style={s.createForm}>
            <input
              style={s.input}
              type="text"
              placeholder="Enter page title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <button style={s.createBtn} type="submit">Create</button>
            <button style={s.cancelBtn} type="button" onClick={() => setCreating(false)}>Cancel</button>
          </form>
        )}

        {/* Pages list */}
        {loading ? (
          <p style={s.empty}>Loading pages...</p>
        ) : pages.length === 0 ? (
          <div style={s.emptyState}>
            <span style={s.emptyIcon}>📄</span>
            <p style={s.emptyTitle}>No pages yet</p>
            <p style={s.emptySub}>Click "+ New Page" to create your first page.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {pages.map((page) => (
              <div key={page._id} style={s.card}>
                <div style={s.cardTop}>
                  <span
                    style={{
                      ...s.badge,
                      background: page.published ? '#d1fae5' : '#fef3c7',
                      color: page.published ? '#065f46' : '#92400e',
                    }}
                  >
                    {page.published ? '● Published' : '○ Draft'}
                  </span>
                </div>
                <h3 style={s.cardTitle}>{page.title}</h3>
                <p style={s.cardSlug}>/{page.slug}</p>
                <div style={s.cardActions}>
                  <button style={s.editBtn} onClick={() => navigate(`/admin/editor/${page._id}`)}>✏️ Edit</button>
                  {page.published && (
                    <button style={s.viewBtn} onClick={() => navigate(`/page/${page.slug}`)}>👁 View</button>
                  )}
                  <button style={s.deleteBtn} onClick={() => deletePage(page._id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub: { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  newBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', flexShrink: 0 },

  createForm: { display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', alignItems: 'center' },
  input: { padding: '0.65rem 1rem', fontSize: '0.95rem', border: '1px solid #e2e8f0', borderRadius: '8px', flex: 1, outline: 'none' },
  createBtn: { padding: '0.65rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { padding: '0.65rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  cardTop: { marginBottom: '0.75rem' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '600' },
  cardTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.2rem' },
  cardSlug: { fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 1rem' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  editBtn: { padding: '0.35rem 0.75rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  viewBtn: { padding: '0.35rem 0.75rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '0.35rem 0.6rem', background: '#fff5f5', color: '#e53e3e', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', marginLeft: 'auto' },

  landingCard: { background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  landingBadge: { fontWeight: '700', color: '#3730a3', fontSize: '1rem', display: 'block', marginBottom: '0.25rem' },
  landingSub: { color: '#4f46e5', fontSize: '0.85rem', margin: 0 },
  code: { background: '#c7d2fe', padding: '0.1rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace' },
  landingBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap' },

  emptyState: { textAlign: 'center', padding: '5rem 2rem' },
  emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' },
  emptySub: { color: '#94a3b8', fontSize: '0.9rem' },
  empty: { color: '#94a3b8' },
};

export default AdminDashboard;
