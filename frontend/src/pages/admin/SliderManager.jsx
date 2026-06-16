import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import {
  Image as ImageIcon, Pencil, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, X, FolderOpen, GalleryHorizontal,
} from 'lucide-react';

const EMPTY = {
  image: '', heading: '', subtext: '',
  buttonLabel: '', buttonUrl: '', buttonTarget: '_self', active: true,
};

const SliderManager = () => {
  const [slides,   setSlides]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  /* Image picker */
  const [showPicker, setShowPicker] = useState(false);
  const [uploads,    setUploads]    = useState([]);

  /* ── load slides ── */
  useEffect(() => {
    axios.get('/api/slides/all')
      .then(({ data }) => setSlides(data))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
    axios.get('/api/upload')
      .then(({ data }) => setUploads(data.filter(f => f.mimetype?.startsWith('image/'))))
      .catch(() => {});
  }, []);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setError(''); };

  /* ── save (create / update) ── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image && !form.heading.trim()) {
      return setError('Add an image or a heading for the slide.');
    }
    setSaving(true); setError('');
    try {
      if (editId) {
        const { data } = await axios.put(`/api/slides/${editId}`, form);
        setSlides(s => s.map(x => x._id === editId ? data : x));
      } else {
        const { data } = await axios.post('/api/slides', form);
        setSlides(s => [...s, data]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  /* ── edit ── */
  const startEdit = (slide) => {
    setForm({
      image: slide.image || '', heading: slide.heading || '', subtext: slide.subtext || '',
      buttonLabel: slide.buttonLabel || '', buttonUrl: slide.buttonUrl || '',
      buttonTarget: slide.buttonTarget || '_self', active: slide.active,
    });
    setEditId(slide._id);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── delete ── */
  const handleDelete = async (slide) => {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/slides/${slide._id}`);
      setSlides(s => s.filter(x => x._id !== slide._id));
      if (editId === slide._id) resetForm();
    } catch { alert('Delete failed'); }
  };

  /* ── toggle active ── */
  const toggleActive = async (slide) => {
    try {
      const { data } = await axios.put(`/api/slides/${slide._id}`, { active: !slide.active });
      setSlides(s => s.map(x => x._id === slide._id ? data : x));
    } catch { alert('Update failed'); }
  };

  /* ── reorder ── */
  const move = async (index, dir) => {
    const next = [...slides];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    const updated = next.map((sl, i) => ({ ...sl, order: i }));
    setSlides(updated);
    try {
      await axios.put('/api/slides/reorder', {
        items: updated.map(({ _id, order }) => ({ _id, order })),
      });
    } catch { /* optimistic — order re-syncs on next load */ }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>Slider</h1>
            <p style={s.sub}>Manage the slides shown in the homepage hero slider</p>
          </div>
          <span style={s.countPill}>{slides.length} slide{slides.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={s.layout}>

          {/* ── LEFT: form ── */}
          <div style={s.card}>
            <div style={s.cardTitle}>{editId ? 'Edit Slide' : 'Add Slide'}</div>
            {error && <p style={s.error}>{error}</p>}

            <form onSubmit={handleSave}>
              {/* Image */}
              <label style={s.label}>Image</label>
              {form.image ? (
                <div style={s.imgPreviewWrap}>
                  <img src={form.image} alt="" style={s.imgPreview} />
                  <button type="button" style={s.removeImgBtn} onClick={() => setForm(f => ({ ...f, image: '' }))}>
                    <X size={11} strokeWidth={2} /> Remove
                  </button>
                </div>
              ) : (
                <div style={s.imgEmpty} onClick={() => setShowPicker(true)}>
                  <ImageIcon size={30} strokeWidth={1.8} color="#94a3b8" />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click to choose an image</span>
                </div>
              )}
              <button type="button" style={s.chooseBtn} onClick={() => setShowPicker(true)}>
                <FolderOpen size={13} strokeWidth={1.8} /> Choose from Uploads
              </button>
              <div style={s.orRow}><span style={s.orLine}/><span style={s.orText}>or paste URL</span><span style={s.orLine}/></div>
              <input style={s.input} placeholder="https://example.com/banner.jpg" value={form.image} onChange={set('image')} />

              {/* Heading */}
              <label style={{ ...s.label, marginTop: '1rem' }}>Heading</label>
              <input style={s.input} placeholder="e.g. Welcome to NewaCore" value={form.heading} onChange={set('heading')} />

              {/* Subtext */}
              <label style={{ ...s.label, marginTop: '1rem' }}>Subtext</label>
              <textarea style={{ ...s.input, resize: 'vertical', minHeight: '64px' }} placeholder="A short supporting line…" value={form.subtext} onChange={set('subtext')} />

              {/* Button */}
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Button label</label>
                  <input style={s.input} placeholder="e.g. Learn More" value={form.buttonLabel} onChange={set('buttonLabel')} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Button URL</label>
                  <input style={s.input} placeholder="/about or https://…" value={form.buttonUrl} onChange={set('buttonUrl')} />
                </div>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Open button in</label>
                  <select style={s.input} value={form.buttonTarget} onChange={set('buttonTarget')}>
                    <option value="_self">Same tab</option>
                    <option value="_blank">New tab</option>
                  </select>
                </div>
                <div style={{ ...s.field, justifyContent: 'flex-end' }}>
                  <label style={s.checkRow}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    <span>Active (visible on site)</span>
                  </label>
                </div>
              </div>

              <div style={s.formActions}>
                <button style={s.btnPrimary} type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Update Slide' : '＋ Add Slide'}
                </button>
                {editId && <button style={s.btnCancel} type="button" onClick={resetForm}>Cancel</button>}
              </div>
            </form>
          </div>

          {/* ── RIGHT: slides list ── */}
          <div style={s.card}>
            <div style={s.cardTitle}>Slides</div>
            {loading ? (
              <p style={s.dimTxt}>Loading…</p>
            ) : slides.length === 0 ? (
              <div style={s.emptyBox}>
                <GalleryHorizontal size={36} strokeWidth={1.6} color="#94a3b8" />
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No slides yet. Add one on the left.</p>
              </div>
            ) : (
              <div style={s.list}>
                {slides.map((slide, i) => (
                  <div key={slide._id} style={{ ...s.slideRow, opacity: slide.active ? 1 : 0.55 }}>
                    <div style={s.orderBtns}>
                      <button style={s.orderBtn} onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp size={12} strokeWidth={2} /></button>
                      <button style={s.orderBtn} onClick={() => move(i, 1)} disabled={i === slides.length - 1}><ChevronDown size={12} strokeWidth={2} /></button>
                    </div>
                    {slide.image
                      ? <img src={slide.image} alt="" style={s.thumb} />
                      : <div style={s.thumbPlaceholder}><ImageIcon size={18} color="#94a3b8" /></div>}
                    <div style={s.slideInfo}>
                      <span style={s.slideHeading}>{slide.heading || <em style={{ color: '#94a3b8' }}>No heading</em>}</span>
                      {slide.subtext && <span style={s.slideSub}>{slide.subtext}</span>}
                      {slide.buttonLabel && <span style={s.slideBtn}>▸ {slide.buttonLabel} → {slide.buttonUrl || '—'}</span>}
                    </div>
                    <div style={s.slideActions}>
                      <button style={s.iconBtn} title={slide.active ? 'Hide' : 'Show'} onClick={() => toggleActive(slide)}>
                        {slide.active ? <Eye size={15} strokeWidth={1.8} /> : <EyeOff size={15} strokeWidth={1.8} />}
                      </button>
                      <button style={s.iconBtn} title="Edit" onClick={() => startEdit(slide)}><Pencil size={15} strokeWidth={1.8} /></button>
                      <button style={{ ...s.iconBtn, color: '#ef4444' }} title="Delete" onClick={() => handleDelete(slide)}><Trash2 size={15} strokeWidth={1.8} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Image picker modal ── */}
        {showPicker && (
          <div style={s.modalOverlay} onClick={() => setShowPicker(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <span style={s.modalTitle}>Choose an image</span>
                <button style={s.iconBtn} onClick={() => setShowPicker(false)}><X size={18} /></button>
              </div>
              {uploads.length === 0 ? (
                <p style={s.dimTxt}>No uploaded images. Upload some from the Upload page first.</p>
              ) : (
                <div style={s.imgGrid}>
                  {uploads.map(img => (
                    <div key={img._id} style={s.imgGridItem}
                      onClick={() => { setForm(f => ({ ...f, image: img.url })); setShowPicker(false); }}>
                      <img src={img.url} alt={img.originalName} style={s.imgGridImg} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif" },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub:   { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  countPill: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' },

  layout: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' },

  card: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' },

  label: { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginBottom: '4px' },
  input: { padding: '8px 11px', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#f8fafc', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', width: '100%' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' },

  formActions: { display: 'flex', gap: '8px', marginTop: '1.25rem' },
  btnPrimary: { padding: '9px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif" },
  btnCancel:  { padding: '9px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif" },
  error: { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 0.85rem', fontSize: '0.82rem', marginBottom: '0.75rem' },

  /* Image input */
  imgPreviewWrap: { position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '8px' },
  imgPreview: { width: '100%', height: '140px', objectFit: 'cover', display: 'block' },
  removeImgBtn: { position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  imgEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '140px', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' },
  chooseBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif" },
  orRow: { display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' },
  orLine: { flex: 1, height: '1px', background: '#e2e8f0' },
  orText: { fontSize: '0.72rem', color: '#94a3b8' },

  dimTxt: { color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' },
  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' },

  /* Slides list */
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  slideRow: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', border: '1px solid #f1f5f9', transition: 'opacity 0.15s' },
  orderBtns: { display: 'flex', flexDirection: 'column', gap: '2px' },
  orderBtn: { padding: '1px 5px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: '72px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, border: '1px solid #e2e8f0' },
  thumbPlaceholder: { width: '72px', height: '48px', background: '#eef2f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e2e8f0' },
  slideInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  slideHeading: { fontSize: '0.88rem', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  slideSub: { fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  slideBtn: { fontSize: '0.7rem', color: '#4f46e5', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  slideActions: { display: 'flex', gap: '4px', flexShrink: 0 },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '6px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  /* Modal */
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' },
  modal: { background: '#fff', borderRadius: '14px', padding: '1.25rem', width: '100%', maxWidth: '640px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  modalTitle: { fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' },
  imgGridItem: { borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', aspectRatio: '4 / 3' },
  imgGridImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
};

export default SliderManager;
