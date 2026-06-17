import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import { BookOpen, Rocket, Copy, Tag, Pencil, Globe, ArrowRight } from 'lucide-react';

const BlogManager = () => {
  const navigate = useNavigate();
  const [stats,       setStats]       = useState({ total: 0, published: 0, draft: 0 });
  const [categories,  setCategories]  = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/posts/all'),
      axios.get('/api/posts/categories'),
    ]).then(([allRes, catRes]) => {
      const posts = allRes.data;
      setStats({
        total:     posts.length,
        published: posts.filter(p => p.status === 'published').length,
        draft:     posts.filter(p => p.status === 'draft').length,
      });
      setCategories(catRes.data);
      setRecentPosts(posts.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Header */}
        <PageHeader
          title="Blog"
          subtitle="Overview of your blog — posts, categories and activity"
          actions={<button style={s.newBtn} onClick={() => navigate('/admin/posts/new')}>＋ New Post</button>}
        />

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { icon: <BookOpen size={20} strokeWidth={1.8} />, label: 'Total Posts',  value: stats.total,     color: '#4f46e5', bg: '#eef2ff' },
            { icon: <Rocket size={20} strokeWidth={1.8} />, label: 'Published',     value: stats.published, color: '#16a34a', bg: '#dcfce7' },
            { icon: <Copy size={20} strokeWidth={1.8} />,   label: 'Drafts',        value: stats.draft,     color: '#d97706', bg: '#fef3c7' },
            { icon: <Tag size={20} strokeWidth={1.8} />,    label: 'Categories',   value: categories.length, color: '#0891b2', bg: '#e0f2fe' },
          ].map(({ icon, label, value, color, bg }) => (
            <StatCard key={label} icon={icon} value={loading ? '…' : value} label={label} color={color} bg={bg} />
          ))}
        </div>

        {/* Two columns */}
        <div style={s.cols}>

          {/* Categories */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Categories</span>
              <button style={{ ...s.viewAllBtn, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/admin/posts')}>View Posts <ArrowRight size={12} strokeWidth={2} /></button>
            </div>
            {loading ? (
              <p style={s.loadingTxt}>Loading…</p>
            ) : categories.length === 0 ? (
              <p style={s.emptyTxt}>No categories yet. Create a post to get started.</p>
            ) : (
              <div style={s.catList}>
                {categories.map(c => (
                  <div key={c._id} style={s.catRow}>
                    <span style={s.catName}>{c._id}</span>
                    <span style={s.catCount}>{c.count} {c.count === 1 ? 'post' : 'posts'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Recent Posts</span>
              <button style={{ ...s.viewAllBtn, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/admin/posts')}>All Posts <ArrowRight size={12} strokeWidth={2} /></button>
            </div>
            {loading ? (
              <p style={s.loadingTxt}>Loading…</p>
            ) : recentPosts.length === 0 ? (
              <div style={s.emptyWrap}>
                <Pencil size={40} strokeWidth={1.8} color="#94a3b8" />
                <p style={s.emptyTxt}>No posts yet.</p>
                <button style={s.newBtn} onClick={() => navigate('/admin/posts/new')}>Write First Post</button>
              </div>
            ) : (
              <div style={s.recentList}>
                {recentPosts.map(p => (
                  <div key={p._id} style={s.recentRow} onClick={() => navigate(`/admin/posts/${p._id}/edit`)}>
                    <div style={s.recentInfo}>
                      <span style={s.recentTitle}>{p.title}</span>
                      <span style={s.recentMeta}>{p.category} · {new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <span style={{ ...s.statusDot }}>
                      {p.status === 'published'
                        ? <span style={{width:6,height:6,borderRadius:'50%',background:'#16a34a',display:'inline-block'}} />
                        : <span style={{width:6,height:6,borderRadius:'50%',background:'#d97706',display:'inline-block'}} />
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Quick links */}
        <div style={s.quickLinks}>
          <span style={s.quickLabel}>Quick links:</span>
          <button style={{ ...s.quickBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/admin/posts')}><Copy size={14} strokeWidth={1.8} /> All Posts</button>
          <button style={{ ...s.quickBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/admin/posts/new')}><Pencil size={14} strokeWidth={1.8} /> Write Post</button>
          <button style={{ ...s.quickBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => window.open('/blog', '_blank')}><Globe size={14} strokeWidth={1.8} /> View Blog</button>
        </div>

      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif" },
  newBtn: {
    padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif",
  },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },

  cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' },
  card: { background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  cardTitle:  { fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' },
  viewAllBtn: { background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif" },

  loadingTxt: { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' },
  emptyTxt:   { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' },
  emptyWrap:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1.5rem 0' },

  catList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  catRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', background: '#f8fafc', borderRadius: '8px',
  },
  catName:  { fontSize: '0.85rem', fontWeight: '600', color: '#334155' },
  catCount: { fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' },

  recentList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  recentRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  recentInfo:  { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  recentTitle: { fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  recentMeta:  { fontSize: '0.72rem', color: '#94a3b8' },
  statusDot:   { fontSize: '0.85rem', flexShrink: 0, marginLeft: '8px' },

  quickLinks: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  quickLabel: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' },
  quickBtn: {
    padding: '6px 14px', background: '#fff', color: '#334155',
    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
  },
};

export default BlogManager;
