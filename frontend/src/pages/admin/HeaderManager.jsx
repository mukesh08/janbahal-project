import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const DEFAULT = {
  logoText: 'NewaCore', logoImage: '', tagline: '',
  bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#4f46e5',
  isSticky: true, showCta: false, ctaLabel: 'Get Started', ctaUrl: '/contact',
  selectedMenu: '',
};

const HeaderManager = () => {
  const navigate   = useNavigate();
  const [form,       setForm]       = useState(DEFAULT);
  const [menus,      setMenus]      = useState([]);      // all available menus
  const [previewLinks, setPreviewLinks] = useState([]);  // items of selected menu
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState('');
  const [uploads,    setUploads]    = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    axios.get('/api/header').then(({ data }) => {
      setForm({ ...DEFAULT, ...data, selectedMenu: data.selectedMenu?._id || data.selectedMenu || '' });
      setPreviewLinks(data.navItems || []);
    }).catch(() => {});
    axios.get('/api/menu').then(({ data }) => setMenus(data)).catch(() => {});
    axios.get('/api/upload').then(({ data }) => setUploads(data.filter(f => f.mimetype?.startsWith('image/')))).catch(() => {});
  }, []);

  /* When selected menu changes, fetch its items for the preview */
  useEffect(() => {
    if (!form.selectedMenu) { setPreviewLinks([]); return; }
    axios.get(`/api/menu/${form.selectedMenu}/items`).then(({ data }) => setPreviewLinks(data)).catch(() => setPreviewLinks([]));
  }, [form.selectedMenu]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
  };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      await axios.put('/api/header', { ...form, selectedMenu: form.selectedMenu || null });
      setMsg('✅ Header saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Save failed');
    } finally { setSaving(false); }
  };

  /* live preview header */
  const previewStyle = {
    background: form.bgColor, color: form.textColor,
    borderRadius: '10px', border: '1px solid #e2e8f0',
    padding: '0 1.5rem', height: '56px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontFamily: "'Poppins', sans-serif",
  };

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Page header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>Header</h1>
            <p style={s.sub}>Manage the public site header — logo, menu and appearance</p>
          </div>
          <div style={s.headerActions}>
            {msg && <span style={{ fontSize: '0.82rem', fontWeight: '600', color: msg.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{msg}</span>}
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Live Preview</div>
          <div style={previewStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {form.logoImage
                ? <img src={form.logoImage} alt="logo" style={{ height: '32px', width: '32px', objectFit: 'cover', borderRadius: '8px' }} />
                : <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: form.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.9rem' }}>
                    {(form.logoText || 'J')[0]}
                  </div>
              }
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: form.textColor }}>{form.logoText || 'Site Name'}</div>
                {form.tagline && <div style={{ fontSize: '0.62rem', color: form.textColor, opacity: 0.6 }}>{form.tagline}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {previewLinks.slice(0, 5).map((l, i) => (
                <span key={i} style={{ fontSize: '0.82rem', fontWeight: '500', color: form.textColor, opacity: 0.85 }}>{l.label}</span>
              ))}
              {previewLinks.length === 0 && <span style={{ fontSize: '0.78rem', color: form.textColor, opacity: 0.35, fontStyle: 'italic' }}>no menu selected</span>}
              {form.showCta && (
                <span style={{ padding: '5px 14px', background: form.accentColor, color: '#fff', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600' }}>
                  {form.ctaLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={s.grid}>

          {/* LEFT column */}
          <div style={s.col}>

            {/* Logo */}
            <div style={s.card}>
              <div style={s.cardTitle}>Logo</div>

              <div style={s.field}>
                <label style={s.label}>Site Name / Logo Text</label>
                <input style={s.input} value={form.logoText} onChange={set('logoText')} placeholder="NewaCore" />
              </div>

              <div style={s.field}>
                <label style={s.label}>Tagline <span style={s.hint}>(optional)</span></label>
                <input style={s.input} value={form.tagline} onChange={set('tagline')} placeholder="Build beautiful pages" />
              </div>

              <div style={s.field}>
                <label style={s.label}>Logo Image</label>
                {form.logoImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <img src={form.logoImage} alt="logo" style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button style={s.removeBtn} onClick={() => setForm(f => ({ ...f, logoImage: '' }))}>✕ Remove</button>
                  </div>
                )}
                <button style={s.chooseBtn} onClick={() => setShowPicker(true)}>
                  📁 {form.logoImage ? 'Change Image' : 'Choose from Uploads'}
                </button>
                <div style={s.orRow}><span style={s.orLine}/><span style={s.orText}>or paste URL</span><span style={s.orLine}/></div>
                <input style={s.input} value={form.logoImage} onChange={set('logoImage')} placeholder="https://example.com/logo.png" />
              </div>
            </div>

            {/* Navigation menu */}
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={s.cardTitle}>Navigation Menu</div>
                <button style={s.goMenuBtn} onClick={() => navigate('/admin/menu')}>Manage Menus →</button>
              </div>

              {menus.length === 0 ? (
                <div style={s.noMenuBox}>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 10px' }}>No menus created yet.</p>
                  <button style={s.btnPrimary} onClick={() => navigate('/admin/menu')}>＋ Create a Menu</button>
                </div>
              ) : (
                <>
                  <label style={s.label}>Select which menu to show in the header</label>
                  <select style={{ ...s.input, marginTop: '6px' }} value={form.selectedMenu} onChange={set('selectedMenu')}>
                    <option value="">— No menu —</option>
                    {menus.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                  {form.selectedMenu && (
                    <div style={s.menuPreviewBox}>
                      {previewLinks.length === 0
                        ? <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>This menu has no links yet. <button style={s.inlineLink} onClick={() => navigate('/admin/menu')}>Add links →</button></span>
                        : previewLinks.map((l, i) => (
                            <span key={i} style={s.linkChip}>{l.label}</span>
                          ))
                      }
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CTA */}
            <div style={s.card}>
              <div style={s.cardTitle}>Call-to-Action Button</div>
              <label style={s.toggleRow}>
                <input type="checkbox" checked={form.showCta} onChange={set('showCta')} style={{ width: '16px', height: '16px' }} />
                <span style={s.label}>Show CTA button in header</span>
              </label>
              {form.showCta && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <div style={{ ...s.field, flex: 1 }}>
                    <label style={s.label}>Button Label</label>
                    <input style={s.input} value={form.ctaLabel} onChange={set('ctaLabel')} placeholder="Get Started" />
                  </div>
                  <div style={{ ...s.field, flex: 1 }}>
                    <label style={s.label}>Button URL</label>
                    <input style={s.input} value={form.ctaUrl} onChange={set('ctaUrl')} placeholder="/contact" />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT column */}
          <div style={s.col}>

            {/* Colors */}
            <div style={s.card}>
              <div style={s.cardTitle}>Colors</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { field: 'bgColor',     label: 'Background' },
                  { field: 'textColor',   label: 'Text' },
                  { field: 'accentColor', label: 'Accent / Brand' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label style={s.label}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                      <input type="color" value={form[field]} onChange={set(field)} style={s.colorPicker} />
                      <input style={{ ...s.input, flex: 1 }} value={form[field]} onChange={set(field)} placeholder="#ffffff" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div style={s.card}>
              <div style={s.cardTitle}>Settings</div>
              <label style={s.toggleRow}>
                <input type="checkbox" checked={form.isSticky} onChange={set('isSticky')} style={{ width: '16px', height: '16px' }} />
                <span style={s.label}>Sticky header (stays fixed while scrolling)</span>
              </label>
            </div>

          </div>
        </div>

      </div>

      {/* Image picker modal */}
      {showPicker && (
        <div style={s.overlay} onClick={() => setShowPicker(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Choose Logo Image</span>
              <button style={s.modalClose} onClick={() => setShowPicker(false)}>✕</button>
            </div>
            {uploads.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>No images uploaded yet.</p>
              </div>
            ) : (
              <div style={s.imgGrid}>
                {uploads.map(img => (
                  <div key={img._id} style={s.imgItem} onClick={() => { setForm(f => ({ ...f, logoImage: img.url })); setShowPicker(false); }}>
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
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub:   { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  headerActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  saveBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif" },

  section: { marginBottom: '1.5rem' },
  sectionLabel: { fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
  col:  { display: 'flex', flexDirection: 'column', gap: '1.25rem' },

  card:      { background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' },

  field:  { marginBottom: '0.85rem' },
  label:  { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '5px' },
  hint:   { fontWeight: '400', color: '#94a3b8', fontSize: '0.72rem' },
  input:  { width: '100%', padding: '8px 11px', fontSize: '0.85rem', color: '#1e293b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'Poppins', sans-serif", outline: 'none', boxSizing: 'border-box' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },

  removeBtn:  { padding: '4px 10px', background: '#fff5f5', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: "'Poppins', sans-serif" },
  chooseBtn:  { width: '100%', padding: '7px', background: '#f8fafc', color: '#4f46e5', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", marginBottom: '8px' },
  orRow:  { display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' },
  orLine: { flex: 1, height: '1px', background: '#f1f5f9' },
  orText: { fontSize: '0.65rem', color: '#b0bcc8', whiteSpace: 'nowrap' },

  goMenuBtn: { background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif" },
  noMenuBox: { background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0', padding: '1rem', textAlign: 'center' },
  btnPrimary: { padding: '7px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif" },
  menuPreviewBox: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', minHeight: '36px', alignItems: 'center' },
  linkChip: { fontSize: '0.75rem', fontWeight: '600', color: '#4f46e5', background: '#eef2ff', padding: '3px 10px', borderRadius: '20px' },
  inlineLink: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", padding: 0 },

  colorPicker: { width: '38px', height: '38px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:   { background: '#fff', borderRadius: '16px', width: '680px', maxWidth: '95vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  modalTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b' },
  modalClose: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#94a3b8', fontFamily: "'Poppins', sans-serif" },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '16px', overflowY: 'auto' },
  imgItem: { display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '2px solid transparent' },
  imgThumb: { width: '100%', aspectRatio: '1', objectFit: 'cover' },
  imgName: { fontSize: '0.65rem', color: '#64748b', padding: '2px 4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
};

export default HeaderManager;
