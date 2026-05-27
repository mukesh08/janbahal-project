import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const FooterManager = () => {
  const [footer, setFooter]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  // New column / link state
  const [newColTitle, setNewColTitle] = useState('');
  const [newLinks, setNewLinks]       = useState({});  // { colId: { label, url } }

  const fetch = async () => {
    try { const { data } = await axios.get('/api/footer'); setFooter(data); }
    catch { setMsg('Failed to load footer'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const { data } = await axios.put('/api/footer', {
        copyright: footer.copyright,
        socials: footer.socials,
      });
      setFooter(data);
      setMsg('✅ Saved!');
    } catch { setMsg('❌ Save failed'); }
    finally { setSaving(false); }
  };

  const addColumn = async () => {
    if (!newColTitle.trim()) return;
    const { data } = await axios.post('/api/footer/columns', { title: newColTitle });
    setFooter(data); setNewColTitle('');
  };

  const deleteColumn = async (colId) => {
    if (!confirm('Delete this column and all its links?')) return;
    const { data } = await axios.delete(`/api/footer/columns/${colId}`);
    setFooter(data);
  };

  const addLink = async (colId) => {
    const link = newLinks[colId] || {};
    if (!link.label?.trim() || !link.url?.trim()) return;
    const { data } = await axios.post(`/api/footer/columns/${colId}/links`, link);
    setFooter(data);
    setNewLinks({ ...newLinks, [colId]: { label: '', url: '' } });
  };

  const deleteLink = async (colId, linkId) => {
    const { data } = await axios.delete(`/api/footer/columns/${colId}/links/${linkId}`);
    setFooter(data);
  };

  const updateColTitle = (colId, title) => {
    setFooter(f => ({
      ...f,
      columns: f.columns.map(c => c._id === colId ? { ...c, title } : c),
    }));
  };

  const saveColTitle = async () => {
    await axios.put('/api/footer', { columns: footer.columns, copyright: footer.copyright, socials: footer.socials });
  };

  if (loading) return <AdminLayout><div style={{ padding: '2rem', color: '#94a3b8' }}>Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Footer</h1>
            <p style={s.sub}>Manage site footer columns, links and settings</p>
          </div>
          <button style={s.saveBtn} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
        {msg && <p style={{ ...s.msg, color: msg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{msg}</p>}

        {/* Copyright */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Copyright Text</h3>
          <input style={s.input} placeholder="© 2025 Janbahal. All rights reserved."
            value={footer.copyright || ''}
            onChange={e => setFooter({ ...footer, copyright: e.target.value })} />
        </div>

        {/* Columns */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Columns</h3>
            <div style={s.addColRow}>
              <input style={{ ...s.input, maxWidth: '220px' }} placeholder="New column title"
                value={newColTitle} onChange={e => setNewColTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addColumn()} />
              <button style={s.btnPrimary} onClick={addColumn}>+ Add Column</button>
            </div>
          </div>

          {footer.columns.length === 0
            ? <p style={s.empty}>No columns yet. Add one above.</p>
            : (
              <div style={s.columnsGrid}>
                {footer.columns.map(col => (
                  <div key={col._id} style={s.colCard}>
                    {/* Column header */}
                    <div style={s.colHeader}>
                      <input style={s.colTitleInput} value={col.title}
                        onChange={e => updateColTitle(col._id, e.target.value)}
                        onBlur={saveColTitle} />
                      <button style={s.iconBtn} onClick={() => deleteColumn(col._id)} title="Delete column">🗑</button>
                    </div>

                    {/* Links list */}
                    <div style={s.linksList}>
                      {col.links.map(link => (
                        <div key={link._id} style={s.linkRow}>
                          <span style={s.linkLabel}>{link.label}</span>
                          <span style={s.linkUrl}>{link.url}</span>
                          <button style={s.iconBtn} onClick={() => deleteLink(col._id, link._id)}>×</button>
                        </div>
                      ))}
                    </div>

                    {/* Add link */}
                    <div style={s.addLinkRow}>
                      <input style={s.smInput} placeholder="Label"
                        value={newLinks[col._id]?.label || ''}
                        onChange={e => setNewLinks({ ...newLinks, [col._id]: { ...newLinks[col._id], label: e.target.value } })} />
                      <input style={s.smInput} placeholder="/url"
                        value={newLinks[col._id]?.url || ''}
                        onChange={e => setNewLinks({ ...newLinks, [col._id]: { ...newLinks[col._id], url: e.target.value } })} />
                      <button style={s.addLinkBtn} onClick={() => addLink(col._id)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Social links */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Social Links</h3>
          <div style={s.socialGrid}>
            {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map(platform => (
              <div key={platform} style={s.socialRow}>
                <span style={s.socialPlatform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                <input style={s.input} placeholder={`https://${platform}.com/yourprofile`}
                  value={footer.socials?.find(s => s.platform === platform)?.url || ''}
                  onChange={e => {
                    const socials = [...(footer.socials || [])];
                    const idx = socials.findIndex(s => s.platform === platform);
                    if (idx >= 0) socials[idx] = { platform, url: e.target.value };
                    else socials.push({ platform, url: e.target.value });
                    setFooter({ ...footer, socials });
                  }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub: { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  saveBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  msg: { marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600' },

  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' },
  cardTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 1rem' },
  input: { padding: '0.6rem 0.85rem', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', width: '100%', background: '#f8fafc' },
  addColRow: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  btnPrimary: { padding: '0.6rem 1.1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', whiteSpace: 'nowrap' },

  columnsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  colCard: { border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#f8fafc' },
  colHeader: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' },
  colTitleInput: { flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.9rem', fontWeight: '700', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', background: '#fff' },
  linksList: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' },
  linkRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' },
  linkLabel: { fontWeight: '600', fontSize: '0.82rem', color: '#1e293b', flex: '0 0 auto', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  linkUrl: { flex: 1, fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  addLinkRow: { display: 'flex', gap: '0.4rem' },
  smInput: { flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.82rem', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', minWidth: 0 },
  addLinkBtn: { padding: '0.4rem 0.7rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem', padding: '0.1rem 0.3rem', flexShrink: 0 },

  socialGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  socialRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  socialPlatform: { width: '90px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', flexShrink: 0 },

  empty: { color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem' },
};

export default FooterManager;
