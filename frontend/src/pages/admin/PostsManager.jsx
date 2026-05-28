import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const STATUS_COLORS = {
  published: { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
  draft:     { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
};

const PostsManager = () => {
  const navigate = useNavigate();
  const [posts,   setPosts]   = useState([]);
  const [filter,  setFilter]  = useState('all');   // all | published | draft
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchPosts = async (status) => {
    setLoading(true);
    try {
      const params = status !== 'all' ? { status } : {};
      const { data } = await axios.get('/api/posts/all', { params });
      setPosts(data);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(filter); }, [filter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/posts/${id}`);
      setPosts(p => p.filter(x => x._id !== id));
    } catch { alert('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await axios.put(`/api/posts/${post._id}`, { status: newStatus });
      setPosts(p => p.map(x => x._id === post._id ? { ...x, status: newStatus } : x));
    } catch { alert('Update failed'); }
  };

  const stats = {
    all:       posts.length + (filter !== 'all' ? 0 : 0),
    published: posts.filter(p => p.status === 'published').length,
    draft:     posts.filter(p => p.status === 'draft').length,
  };

  /* Re-fetch totals without filter for the stat chips */
  const [totals, setTotals] = useState({ all: 0, published: 0, draft: 0 });
  useEffect(() => {
    axios.get('/api/posts/all').then(({ data }) => {
      setTotals({
        all:       data.length,
        published: data.filter(p => p.status === 'published').length,
        draft:     data.filter(p => p.status === 'draft').length,
      });
    }).catch(() => {});
  }, [posts]);

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Posts</h1>
            <p style={s.sub}>Write and manage your blog posts</p>
          </div>
          <button style={s.newBtn} onClick={() => navigate('/admin/posts/new')}>
            ＋ New Post
          </button>
        </div>

        {/* ── Filter tabs ── */}
        <div style={s.tabs}>
          {[['all','All'], ['published','Published'], ['draft','Drafts']].map(([key, label]) => (
            <button
              key={key}
              style={{ ...s.tab, ...(filter === key ? s.tabActive : {}) }}
              onClick={() => setFilter(key)}
            >
              {label}
              <span style={{ ...s.tabBadge, ...(filter === key ? s.tabBadgeActive : {}) }}>
                {totals[key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Posts list ── */}
        {loading ? (
          <div style={s.emptyBox}>
            <span style={s.emptyIcon}>⏳</span>
            <p style={s.emptyTxt}>Loading posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={s.emptyBox}>
            <span style={s.emptyIcon}>✏️</span>
            <p style={s.emptyLabel}>No posts yet</p>
            <p style={s.emptyTxt}>Click "＋ New Post" to write your first blog post.</p>
            <button style={s.newBtn} onClick={() => navigate('/admin/posts/new')}>＋ New Post</button>
          </div>
        ) : (
          <div style={s.list}>
            {posts.map(post => {
              const sc = STATUS_COLORS[post.status] || STATUS_COLORS.draft;
              return (
                <div key={post._id} style={s.card}>

                  {/* Thumbnail */}
                  {post.featuredImage
                    ? <img src={post.featuredImage} alt="" style={s.thumb} />
                    : <div style={s.thumbPlaceholder}>📄</div>
                  }

                  {/* Info */}
                  <div style={s.info}>
                    <div style={s.cardTop}>
                      <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {post.status === 'published' ? '● Published' : '○ Draft'}
                      </span>
                      <span style={s.category}>{post.category}</span>
                      {post.tags?.length > 0 && (
                        <span style={s.tags}>{post.tags.slice(0, 3).join(', ')}</span>
                      )}
                    </div>
                    <h3 style={s.postTitle}>{post.title}</h3>
                    {post.excerpt && <p style={s.excerpt}>{post.excerpt}</p>}
                    <div style={s.meta}>
                      <span>By {post.author?.name || 'Admin'}</span>
                      <span>·</span>
                      <span>{new Date(post.updatedAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={s.actions}>
                    <button style={s.editBtn}
                      onClick={() => navigate(`/admin/posts/${post._id}/edit`)}>
                      ✏️ Edit
                    </button>
                    <button
                      style={{ ...s.statusBtn, color: post.status === 'published' ? '#d97706' : '#16a34a' }}
                      onClick={() => handleToggleStatus(post)}
                    >
                      {post.status === 'published' ? '⬇ Unpublish' : '🚀 Publish'}
                    </button>
                    <button
                      style={{ ...s.deleteBtn, opacity: deleting === post._id ? 0.5 : 1 }}
                      disabled={deleting === post._id}
                      onClick={() => handleDelete(post._id, post.title)}
                    >
                      🗑
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

/* ── Styles ──────────────────────────────────────────────── */
const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub:   { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  newBtn: {
    padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif",
    whiteSpace: 'nowrap',
  },

  /* Tabs */
  tabs: { display: 'flex', gap: '4px', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0' },
  tab: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', background: 'transparent', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: '500', color: '#64748b',
    fontFamily: "'Poppins', sans-serif", marginBottom: '-1px', transition: 'all 0.15s',
  },
  tabActive: { color: '#4f46e5', borderBottomColor: '#4f46e5', fontWeight: '700' },
  tabBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '20px', height: '20px', padding: '0 6px',
    background: '#f1f5f9', color: '#64748b', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600',
  },
  tabBadgeActive: { background: '#eef2ff', color: '#4f46e5' },

  /* Empty */
  emptyBox: {
    background: '#fff', border: '2px dashed #e2e8f0', borderRadius: '16px',
    padding: '5rem 2rem', textAlign: 'center', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
  },
  emptyIcon:  { fontSize: '3rem', display: 'block' },
  emptyLabel: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  emptyTxt:   { color: '#94a3b8', fontSize: '0.88rem', margin: 0 },

  /* List */
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9',
    padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.15s',
  },

  thumb: { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  thumbPlaceholder: {
    width: '64px', height: '64px', background: '#f8fafc', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
    border: '1px solid #e2e8f0',
  },

  info: { flex: 1, minWidth: 0 },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' },
  statusBadge: { fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },
  category: { fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px' },
  tags: { fontSize: '0.7rem', color: '#94a3b8' },

  postTitle: { fontSize: '0.98rem', fontWeight: '700', color: '#1e293b', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  excerpt:   { fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta:      { fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '6px' },

  actions:   { display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' },
  editBtn: {
    padding: '6px 12px', background: '#f8fafc', color: '#4f46e5',
    border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
  },
  statusBtn: {
    padding: '6px 10px', background: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer',
    fontSize: '0.75rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
  },
  deleteBtn: {
    padding: '6px 10px', background: '#fff5f5', color: '#ef4444',
    border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer',
    fontSize: '0.82rem', fontFamily: "'Poppins', sans-serif",
  },
};

export default PostsManager;
