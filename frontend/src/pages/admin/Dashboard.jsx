import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import { FileText, Globe, Pencil, Newspaper, Plus, Palette, AlignJustify, Monitor, Upload, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPages: 0, publishedPages: 0,
    totalPosts: 0, publishedPosts: 0,
  });
  const [recentPages, setRecentPages] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pagesRes, postsRes] = await Promise.all([
          axios.get('/api/pages'),
          axios.get('/api/posts/all').catch(() => ({ data: { posts: [] } })),
        ]);

        const pages = pagesRes.data || [];
        const posts = postsRes.data?.posts || [];

        setStats({
          totalPages:     pages.length,
          publishedPages: pages.filter(p => p.published).length,
          totalPosts:     posts.length,
          publishedPosts: posts.filter(p => p.status === 'published').length,
        });
        setRecentPages(pages.slice(0, 5));
        setRecentPosts(posts.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const STAT_CARDS = [
    {
      label: 'Total Pages', value: stats.totalPages,
      sub: `${stats.publishedPages} published`,
      icon: <FileText size={20} strokeWidth={1.8} />, color: '#4f46e5', bg: '#eef2ff', href: '/admin/pages',
    },
    {
      label: 'Published Pages', value: stats.publishedPages,
      sub: `${stats.totalPages - stats.publishedPages} drafts`,
      icon: <Globe size={20} strokeWidth={1.8} />, color: '#0891b2', bg: '#ecfeff', href: '/admin/pages',
    },
    {
      label: 'Total Posts', value: stats.totalPosts,
      sub: `${stats.publishedPosts} published`,
      icon: <Pencil size={20} strokeWidth={1.8} />, color: '#7c3aed', bg: '#f5f3ff', href: '/admin/posts',
    },
    {
      label: 'Published Posts', value: stats.publishedPosts,
      sub: `${stats.totalPosts - stats.publishedPosts} drafts`,
      icon: <Newspaper size={20} strokeWidth={1.8} />, color: '#059669', bg: '#f0fdf4', href: '/admin/posts',
    },
  ];

  const QUICK_ACTIONS = [
    { label: '+ New Page',    icon: <FileText size={14} strokeWidth={1.8} />, onClick: () => navigate('/admin/pages'),         color: '#4f46e5' },
    { label: '+ New Post',    icon: <Pencil size={14} strokeWidth={1.8} />,   onClick: () => navigate('/admin/posts/new'),     color: '#7c3aed' },
    { label: 'Customize',     icon: <Palette size={14} strokeWidth={1.8} />,  onClick: () => navigate('/admin/customize'),     color: '#d97706' },
    { label: 'Manage Menu',   icon: <AlignJustify size={14} strokeWidth={1.8} />, onClick: () => navigate('/admin/menu'),     color: '#0891b2' },
    { label: 'Edit Header',   icon: <Monitor size={14} strokeWidth={1.8} />,  onClick: () => navigate('/admin/header'),        color: '#059669' },
    { label: 'Upload Media',  icon: <Upload size={14} strokeWidth={1.8} />,   onClick: () => navigate('/admin/upload'),        color: '#dc2626' },
  ];

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Page header */}
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back — here's what's happening on your site"
          actions={
            <button style={{ ...s.newPageBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/admin/pages')}>
              <Plus size={14} strokeWidth={2} /> New Page
            </button>
          }
        />

        {/* Stat cards */}
        <div style={s.statsGrid}>
          {STAT_CARDS.map(card => (
            <StatCard
              key={card.label}
              icon={card.icon}
              value={loading ? '—' : card.value}
              label={card.label}
              sub={loading ? '' : card.sub}
              color={card.color}
              bg={card.bg}
              onClick={() => navigate(card.href)}
            />
          ))}
        </div>

        {/* Quick actions */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Quick Actions</div>
          <div style={s.actionsRow}>
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} style={{ ...s.actionBtn, '--c': a.color }} onClick={a.onClick}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.color = a.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent pages + posts */}
        <div style={s.recentGrid}>

          {/* Recent Pages */}
          <div style={s.recentCard}>
            <div style={s.recentHeader}>
              <span style={s.recentTitle}>Recent Pages</span>
              <button style={{ ...s.recentLink, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/admin/pages')}>View all <ArrowRight size={12} strokeWidth={2} /></button>
            </div>
            {loading ? (
              <div style={s.recentEmpty}>Loading…</div>
            ) : recentPages.length === 0 ? (
              <div style={s.recentEmpty}>No pages yet</div>
            ) : (
              <div style={s.recentList}>
                {recentPages.map(p => (
                  <div key={p._id} style={s.recentRow}
                    onClick={() => navigate(`/admin/editor/${p._id}`)}
                  >
                    <div style={s.recentRowLeft}>
                      <span style={s.recentRowIcon}><FileText size={16} strokeWidth={1.8} /></span>
                      <div>
                        <div style={s.recentRowTitle}>{p.title}</div>
                        <div style={s.recentRowSlug}>/{p.slug}</div>
                      </div>
                    </div>
                    <StatusBadge published={p.published} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div style={s.recentCard}>
            <div style={s.recentHeader}>
              <span style={s.recentTitle}>Recent Posts</span>
              <button style={{ ...s.recentLink, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/admin/posts')}>View all <ArrowRight size={12} strokeWidth={2} /></button>
            </div>
            {loading ? (
              <div style={s.recentEmpty}>Loading…</div>
            ) : recentPosts.length === 0 ? (
              <div style={s.recentEmpty}>No posts yet</div>
            ) : (
              <div style={s.recentList}>
                {recentPosts.map(p => (
                  <div key={p._id} style={s.recentRow}
                    onClick={() => navigate(`/admin/posts/${p._id}/edit`)}
                  >
                    <div style={s.recentRowLeft}>
                      <span style={s.recentRowIcon}><Pencil size={16} strokeWidth={1.8} /></span>
                      <div>
                        <div style={s.recentRowTitle}>{p.title}</div>
                        <div style={s.recentRowSlug}>/blog/{p.slug}</div>
                      </div>
                    </div>
                    <StatusBadge published={p.status === 'published'} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif" },

  newPageBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif" },

  /* Stat cards */
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },

  /* Quick actions */
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' },
  actionsRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '0.55rem 1rem', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600',
    color: '#475569', fontFamily: "'Poppins', sans-serif",
    transition: 'border-color 0.15s, color 0.15s',
  },

  /* Recent panels */
  recentGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
  recentCard: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' },
  recentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' },
  recentTitle: { fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' },
  recentLink: { background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  recentList: { display: 'flex', flexDirection: 'column' },
  recentRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc',
    cursor: 'pointer', transition: 'background 0.12s',
  },
  recentRowLeft: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  recentRowIcon: { fontSize: '1rem', flexShrink: 0 },
  recentRowTitle: { fontSize: '0.83rem', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  recentRowSlug:  { fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '1px' },
  recentEmpty: { padding: '2rem', textAlign: 'center', color: '#b0bcc8', fontSize: '0.85rem' },

};

export default Dashboard;
