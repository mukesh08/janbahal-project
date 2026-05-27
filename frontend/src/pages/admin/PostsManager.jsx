import AdminLayout from '../../components/AdminLayout';

const PostsManager = () => (
  <AdminLayout>
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Posts</h1>
          <p style={s.sub}>Write and manage blog posts</p>
        </div>
        <button style={s.newBtn}>+ New Post</button>
      </div>
      <div style={s.comingSoon}>
        <span style={s.icon}>✏️</span>
        <p style={s.label}>No posts yet</p>
        <p style={s.hint}>Coming soon — rich text editor with AI writing assistance, categories and scheduled publishing.</p>
      </div>
    </div>
  </AdminLayout>
);

const s = {
  container: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub: { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  newBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  comingSoon: { background: '#fff', border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center' },
  icon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
  label: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' },
  hint: { color: '#94a3b8', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto' },
};

export default PostsManager;
