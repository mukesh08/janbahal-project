import AdminLayout from '../../components/AdminLayout';

const BlogManager = () => (
  <AdminLayout>
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Blog</h1>
        <p style={s.sub}>Manage blog categories and settings</p>
      </div>
      <div style={s.comingSoon}>
        <span style={s.icon}>📝</span>
        <p style={s.label}>Blog Manager</p>
        <p style={s.hint}>Coming soon — manage categories, tags, featured posts and blog layout settings.</p>
      </div>
    </div>
  </AdminLayout>
);

const s = {
  container: { padding: '2rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub: { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  comingSoon: { background: '#fff', border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center' },
  icon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
  label: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' },
  hint: { color: '#94a3b8', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto' },
};

export default BlogManager;
