import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { user, logout } = useAuth();
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

  useEffect(() => {
    fetchPages();
  }, []);

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
    } catch (err) {
      alert('Failed to delete page');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>Janbahal</h1>
        <div style={styles.headerRight}>
          <span style={styles.username}>👤 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.sectionTitle}>My Pages</h2>
          <button style={styles.newBtn} onClick={() => setCreating(true)}>+ New Page</button>
        </div>

        {/* New page form */}
        {creating && (
          <form onSubmit={createPage} style={styles.createForm}>
            <input
              style={styles.input}
              type="text"
              placeholder="Page title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <button style={styles.createBtn} type="submit">Create</button>
            <button style={styles.cancelBtn} type="button" onClick={() => setCreating(false)}>Cancel</button>
          </form>
        )}

        {/* Pages grid */}
        {loading ? (
          <p style={styles.empty}>Loading pages...</p>
        ) : pages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No pages yet. Create your first page!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {pages.map((page) => (
              <div key={page._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span
                    style={{
                      ...styles.badge,
                      background: page.published ? '#d1fae5' : '#fef3c7',
                      color: page.published ? '#065f46' : '#92400e',
                    }}
                  >
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{page.title}</h3>
                <p style={styles.cardSlug}>/{page.slug}</p>
                <div style={styles.cardActions}>
                  <button
                    style={styles.editBtn}
                    onClick={() => navigate(`/admin/editor/${page._id}`)}
                  >
                    ✏️ Edit
                  </button>
                  {page.published && (
                    <button
                      style={styles.viewBtn}
                      onClick={() => navigate(`/page/${page.slug}`)}
                    >
                      👁 View
                    </button>
                  )}
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deletePage(page._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' },
  header: {
    background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: { color: '#4f46e5', fontSize: '1.5rem', fontWeight: '800', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  username: { color: '#555', fontSize: '0.95rem' },
  logoutBtn: {
    padding: '0.4rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
  },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  newBtn: {
    padding: '0.6rem 1.2rem', background: '#4f46e5', color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
  },
  createForm: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' },
  input: {
    padding: '0.65rem 1rem', fontSize: '1rem', border: '1px solid #ddd',
    borderRadius: '8px', flex: 1, outline: 'none',
  },
  createBtn: {
    padding: '0.65rem 1.2rem', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  cancelBtn: {
    padding: '0.65rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: '8px', cursor: 'pointer',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' },
  card: {
    background: '#fff', borderRadius: '12px', padding: '1.25rem',
    boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0',
  },
  cardHeader: { marginBottom: '0.75rem' },
  badge: { padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' },
  cardSlug: { fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' },
  cardActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  editBtn: {
    padding: '0.4rem 0.8rem', background: '#eff6ff', color: '#3b82f6',
    border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
  viewBtn: {
    padding: '0.4rem 0.8rem', background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
  deleteBtn: {
    padding: '0.4rem 0.8rem', background: '#fff5f5', color: '#e53e3e',
    border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
  emptyState: { textAlign: 'center', padding: '4rem 2rem' },
  emptyText: { color: '#94a3b8', fontSize: '1.1rem' },
  empty: { color: '#94a3b8' },
};

export default AdminDashboard;
