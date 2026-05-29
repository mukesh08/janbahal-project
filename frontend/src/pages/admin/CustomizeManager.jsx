import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Save, Home, Image as ImageIcon, PenLine, FileText, Settings, FolderOpen, Link2, ExternalLink, Pencil, X } from 'lucide-react';

const DEFAULT = { homePage: '', siteThumbnail: '', siteTagline: '' };

const CustomizeManager = () => {
  const navigate  = useNavigate();
  const [form,    setForm]    = useState(DEFAULT);
  const [pages,   setPages]   = useState([]);
  const [uploads, setUploads] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    axios.get('/api/settings').then(({ data }) => {
      setForm({
        homePage:      data.homePage?._id || '',
        siteThumbnail: data.siteThumbnail || '',
        siteTagline:   data.siteTagline   || '',
      });
      if (data.homePage) setSelectedPage(data.homePage);
    }).catch(() => {});
    axios.get('/api/pages').then(({ data }) => setPages(data)).catch(() => {});
    axios.get('/api/upload').then(({ data }) => setUploads(data.filter(f => f.mimetype?.startsWith('image/')))).catch(() => {});
  }, []);

  const handlePageSelect = (e) => {
    const id = e.target.value;
    setForm(f => ({ ...f, homePage: id }));
    setSelectedPage(pages.find(p => p._id === id) || null);
  };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      await axios.put('/api/settings', {
        homePage:      form.homePage || null,
        siteThumbnail: form.siteThumbnail,
        siteTagline:   form.siteTagline,
      });
      setMsg('✅ Saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Save failed');
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Page header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>Customize</h1>
            <p style={s.sub}>Control your site's landing page, thumbnail and tagline</p>
          </div>
          <div style={s.headerRight}>
            {msg && <span style={{ ...s.msgTxt, color: msg.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{msg}</span>}
            <button style={{ ...s.saveBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : <><Save size={14} strokeWidth={1.8} /> Save Changes</>}
            </button>
          </div>
        </div>

        {/* Equal-height 3-column grid */}
        <div style={s.grid}>

          {/* ── Card 1: Landing Page ── */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ ...s.cardBadge, background: '#eef2ff', color: '#4f46e5' }}><Home size={18} strokeWidth={1.8} /></div>
              <div>
                <div style={s.cardTitle}>Landing Page</div>
                <div style={s.cardDesc}>Which page visitors see at <code style={s.code}>/</code></div>
              </div>
            </div>
            <div style={s.divider} />
            <div style={s.cardBody}>

              <label style={s.label}>Select page</label>
              <select style={s.select} value={form.homePage} onChange={handlePageSelect}>
                <option value="">— Default (built-in layout) —</option>
                {pages.map(p => (
                  <option key={p._id} value={p._id}>{p.title}{!p.published ? ' (draft)' : ''}</option>
                ))}
              </select>

              {/* Status box */}
              {selectedPage ? (
                <div style={s.statusBox}>
                  <div style={s.statusBoxLeft}>
                    <div style={s.statusIcon}><FileText size={20} strokeWidth={1.8} color="#4f46e5" /></div>
                    <div>
                      <div style={s.statusTitle}>{selectedPage.title}</div>
                      <div style={s.statusSlug}>/{selectedPage.slug}</div>
                    </div>
                  </div>
                  <span style={{ ...s.badge, ...(selectedPage.published ? s.badgeGreen : s.badgeDim) }}>
                    {selectedPage.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              ) : (
                <div style={{ ...s.statusBox, border: '1px dashed #e2e8f0' }}>
                  <div style={s.statusBoxLeft}>
                    <div style={s.statusIcon}><Settings size={20} strokeWidth={1.8} color="#94a3b8" /></div>
                    <div>
                      <div style={s.statusTitle}>Default layout</div>
                      <div style={s.statusSlug}>Built-in hero + features page</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions pinned to bottom */}
              <div style={s.cardFooter}>
                {selectedPage && (
                  <>
                    <button style={{ ...s.actionBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate(`/admin/editor/${selectedPage._id}`)}>
                      <Pencil size={13} strokeWidth={1.8} /> Edit Page
                    </button>
                    <button style={{ ...s.ghostBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => window.open(`/page/${selectedPage.slug}`, '_blank')}>
                      <ExternalLink size={13} strokeWidth={1.8} /> Preview
                    </button>
                  </>
                )}
                {!selectedPage && pages.length === 0 && (
                  <button style={s.actionBtn} onClick={() => navigate('/admin/pages')}>＋ Create a Page</button>
                )}
              </div>

            </div>
          </div>

          {/* ── Card 2: Site Thumbnail ── */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ ...s.cardBadge, background: '#fef3c7', color: '#d97706' }}><ImageIcon size={18} strokeWidth={1.8} /></div>
              <div>
                <div style={s.cardTitle}>Site Thumbnail</div>
                <div style={s.cardDesc}>Social sharing image (OG image)</div>
              </div>
            </div>
            <div style={s.divider} />
            <div style={s.cardBody}>

              {/* Thumbnail preview or placeholder */}
              <div style={s.thumbWrap}>
                {form.siteThumbnail ? (
                  <>
                    <img src={form.siteThumbnail} alt="thumbnail" style={s.thumbImg} />
                    <button style={{ ...s.removeBtn, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setForm(f => ({ ...f, siteThumbnail: '' }))}><X size={11} strokeWidth={2} /> Remove</button>
                  </>
                ) : (
                  <div style={s.thumbEmpty}>
                    <ImageIcon size={32} strokeWidth={1.8} style={{ opacity: 0.3, color: '#64748b' }} />
                    <span style={{ fontSize: '0.75rem', color: '#b0bcc8' }}>No thumbnail set</span>
                  </div>
                )}
              </div>

              <label style={s.label}>URL</label>
              <input
                style={s.input}
                placeholder="https://example.com/og-image.jpg"
                value={form.siteThumbnail}
                onChange={e => setForm(f => ({ ...f, siteThumbnail: e.target.value }))}
              />
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px' }}>
                Recommended: 1200 × 630 px
              </div>

              <div style={s.cardFooter}>
                <button style={{ ...s.actionBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowPicker(true)}>
                  <FolderOpen size={13} strokeWidth={1.8} /> {form.siteThumbnail ? 'Change from Uploads' : 'Choose from Uploads'}
                </button>
              </div>

            </div>
          </div>

          {/* ── Card 3: Site Tagline ── */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ ...s.cardBadge, background: '#f0fdf4', color: '#16a34a' }}><PenLine size={18} strokeWidth={1.8} /></div>
              <div>
                <div style={s.cardTitle}>Site Tagline</div>
                <div style={s.cardDesc}>Shown in search results and browser tabs</div>
              </div>
            </div>
            <div style={s.divider} />
            <div style={s.cardBody}>

              <label style={s.label}>Tagline</label>
              <input
                style={s.input}
                placeholder="e.g. Build beautiful pages without code"
                value={form.siteTagline}
                onChange={e => setForm(f => ({ ...f, siteTagline: e.target.value }))}
                maxLength={160}
              />
              <div style={{ fontSize: '0.7rem', color: form.siteTagline.length > 130 ? '#f59e0b' : '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                {form.siteTagline.length} / 160
              </div>

              {/* Search result preview */}
              <div style={s.metaLabel}>Search preview</div>
              <div style={s.metaBox}>
                <div style={{ ...s.metaUrl, display: 'flex', alignItems: 'center', gap: '4px' }}><Link2 size={12} strokeWidth={1.8} /> newacore.com</div>
                <div style={s.metaTitle}>NewaCore</div>
                <div style={s.metaDesc}>{form.siteTagline || 'Your site tagline will appear here…'}</div>
              </div>

              <div style={s.cardFooter} />

            </div>
          </div>

        </div>
      </div>

      {/* Image picker modal */}
      {showPicker && (
        <div style={s.overlay} onClick={() => setShowPicker(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Choose Thumbnail</span>
              <button style={s.modalClose} onClick={() => setShowPicker(false)}><X size={16} strokeWidth={2} /></button>
            </div>
            {uploads.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>No images uploaded yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Go to Upload section to add images.</p>
              </div>
            ) : (
              <div style={s.imgGrid}>
                {uploads.map(img => (
                  <div key={img._id} style={s.imgItem}
                    onClick={() => { setForm(f => ({ ...f, siteThumbnail: img.url })); setShowPicker(false); }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <img src={img.url} alt={img.originalName} style={s.imgThumb} />
                    <span style={s.imgName}>{img.originalName?.slice(0, 18)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif" },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem' },
  sub:   { color: '#64748b', fontSize: '0.88rem', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  msgTxt:  { fontSize: '0.82rem', fontWeight: '600' },
  saveBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },

  /* Grid — 3 equal columns, cards stretch to same height */
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'stretch' },

  /* Card */
  card: {
    background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex', flexDirection: 'column',
  },

  /* Card header row */
  cardHead: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '1.25rem 1.5rem',
  },
  cardBadge: {
    width: '38px', height: '38px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', flexShrink: 0,
  },
  cardTitle: { fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 },
  cardDesc:  { fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' },

  divider: { height: '1px', background: '#f1f5f9', margin: '0' },

  /* Card body grows to fill remaining height */
  cardBody: {
    flex: 1, padding: '1.25rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },

  /* Footer pinned to bottom of card */
  cardFooter: {
    display: 'flex', gap: '8px', flexWrap: 'wrap',
    marginTop: 'auto', paddingTop: '12px',
    borderTop: '1px solid #f8fafc',
  },

  label:  { fontSize: '0.75rem', fontWeight: '600', color: '#475569', margin: '4px 0 4px' },
  select: { width: '100%', padding: '9px 11px', fontSize: '0.85rem', color: '#1e293b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'Poppins', sans-serif", outline: 'none', boxSizing: 'border-box', cursor: 'pointer' },
  input:  { width: '100%', padding: '9px 11px', fontSize: '0.85rem', color: '#1e293b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'Poppins', sans-serif", outline: 'none', boxSizing: 'border-box' },
  code:   { background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85em', color: '#4f46e5' },

  /* Status box (selected page / default) */
  statusBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' },
  statusBoxLeft: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  statusIcon:  { fontSize: '1.2rem', flexShrink: 0 },
  statusTitle: { fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  statusSlug:  { fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '1px' },
  badge:      { fontSize: '0.65rem', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 },
  badgeGreen: { background: '#dcfce7', color: '#16a34a' },
  badgeDim:   { background: '#f1f5f9', color: '#94a3b8' },

  /* Thumbnail */
  thumbWrap:  { position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '140px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumbImg:   { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  removeBtn:  { position: 'absolute', top: '7px', right: '7px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: "'Poppins', sans-serif" },

  /* Action buttons */
  actionBtn: { padding: '7px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },
  ghostBtn:  { padding: '7px 14px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },

  /* Meta preview */
  metaLabel: { fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '4px' },
  metaBox:   { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' },
  metaUrl:   { fontSize: '0.7rem', color: '#16a34a', marginBottom: '3px' },
  metaTitle: { fontSize: '0.92rem', fontWeight: '700', color: '#1a0dab', marginBottom: '3px' },
  metaDesc:  { fontSize: '0.77rem', color: '#4d5156', lineHeight: 1.5 },

  /* Modal */
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:   { background: '#fff', borderRadius: '16px', width: '680px', maxWidth: '95vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  modalTitle:  { fontSize: '1rem', fontWeight: '700', color: '#1e293b' },
  modalClose:  { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#94a3b8', fontFamily: "'Poppins', sans-serif" },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '16px', overflowY: 'auto' },
  imgItem: { display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '2px solid transparent', transition: 'border-color 0.15s' },
  imgThumb: { width: '100%', aspectRatio: '1', objectFit: 'cover' },
  imgName:  { fontSize: '0.65rem', color: '#64748b', padding: '2px 4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
};

export default CustomizeManager;
