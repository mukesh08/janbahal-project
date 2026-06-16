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
  /* Named sliders */
  const [sliders,      setSliders]      = useState([]);
  const [activeSlider, setActiveSlider] = useState(null);
  const [loadingSliders, setLoadingSliders] = useState(true);
  const [newName,      setNewName]      = useState('');
  const [creating,     setCreating]     = useState(false);
  const [sliderErr,    setSliderErr]    = useState('');
  const [renamingId,   setRenamingId]   = useState(null);
  const [renameVal,    setRenameVal]    = useState('');

  /* Slides of the active slider */
  const [slides,       setSlides]       = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [form,         setForm]         = useState(EMPTY);
  const [editId,       setEditId]       = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [slideErr,     setSlideErr]     = useState('');

  /* Image picker */
  const [showPicker,   setShowPicker]   = useState(false);
  const [uploads,      setUploads]      = useState([]);

  /* ── load sliders + uploads ── */
  useEffect(() => {
    axios.get('/api/slides/sliders')
      .then(({ data }) => { setSliders(data); if (data.length) setActiveSlider(data[0]); })
      .catch(() => setSliders([]))
      .finally(() => setLoadingSliders(false));
    axios.get('/api/upload')
      .then(({ data }) => setUploads(data.filter(f => f.mimetype?.startsWith('image/'))))
      .catch(() => {});
  }, []);

  /* ── load slides whenever active slider changes ── */
  useEffect(() => {
    if (!activeSlider) { setSlides([]); return; }
    setLoadingSlides(true);
    axios.get(`/api/slides/sliders/${activeSlider._id}/slides`)
      .then(({ data }) => setSlides(data))
      .catch(() => setSlides([]))
      .finally(() => setLoadingSlides(false));
    resetForm();
  }, [activeSlider]);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setSlideErr(''); };
  const bumpCount = (id, delta) => setSliders(ss => ss.map(s => s._id === id ? { ...s, slideCount: (s.slideCount || 0) + delta } : s));

  /* ── slider CRUD ── */
  const handleCreateSlider = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true); setSliderErr('');
    try {
      const { data } = await axios.post('/api/slides/sliders', { name: newName.trim() });
      setSliders(s => [...s, data]);
      setActiveSlider(data);
      setNewName('');
    } catch (err) { setSliderErr(err.response?.data?.message || 'Failed to create slider'); }
    finally { setCreating(false); }
  };

  const handleRename = async (slider) => {
    if (!renameVal.trim() || renameVal === slider.name) { setRenamingId(null); return; }
    try {
      const { data } = await axios.put(`/api/slides/sliders/${slider._id}`, { name: renameVal.trim() });
      setSliders(s => s.map(x => x._id === slider._id ? { ...x, ...data } : x));
      if (activeSlider?._id === slider._id) setActiveSlider(a => ({ ...a, ...data }));
    } catch { /* keep old name */ }
    setRenamingId(null);
  };

  const handleDeleteSlider = async (slider) => {
    if (!confirm(`Delete "${slider.name}" and all its slides? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/slides/sliders/${slider._id}`);
      const next = sliders.filter(s => s._id !== slider._id);
      setSliders(next);
      if (activeSlider?._id === slider._id) setActiveSlider(next[0] || null);
    } catch { alert('Delete failed'); }
  };

  const updateSetting = async (field, value) => {
    setActiveSlider(a => ({ ...a, [field]: value }));
    setSliders(ss => ss.map(s => s._id === activeSlider._id ? { ...s, [field]: value } : s));
    try { await axios.put(`/api/slides/sliders/${activeSlider._id}`, { [field]: value }); } catch { /* best-effort */ }
  };

  /* ── slide CRUD ── */
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (!form.image && !form.heading.trim()) return setSlideErr('Add an image or a heading for the slide.');
    setSaving(true); setSlideErr('');
    try {
      if (editId) {
        const { data } = await axios.put(`/api/slides/slide/${editId}`, form);
        setSlides(s => s.map(x => x._id === editId ? data : x));
      } else {
        const { data } = await axios.post(`/api/slides/sliders/${activeSlider._id}/slides`, form);
        setSlides(s => [...s, data]);
        bumpCount(activeSlider._id, 1);
      }
      resetForm();
    } catch (err) { setSlideErr(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const startEdit = (slide) => {
    setForm({
      image: slide.image || '', heading: slide.heading || '', subtext: slide.subtext || '',
      buttonLabel: slide.buttonLabel || '', buttonUrl: slide.buttonUrl || '',
      buttonTarget: slide.buttonTarget || '_self', active: slide.active,
    });
    setEditId(slide._id);
    setSlideErr('');
  };

  const handleDeleteSlide = async (slide) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await axios.delete(`/api/slides/slide/${slide._id}`);
      setSlides(s => s.filter(x => x._id !== slide._id));
      bumpCount(activeSlider._id, -1);
      if (editId === slide._id) resetForm();
    } catch { alert('Delete failed'); }
  };

  const toggleActive = async (slide) => {
    try {
      const { data } = await axios.put(`/api/slides/slide/${slide._id}`, { active: !slide.active });
      setSlides(s => s.map(x => x._id === slide._id ? data : x));
    } catch { alert('Update failed'); }
  };

  const move = async (index, dir) => {
    const next = [...slides];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    const updated = next.map((sl, i) => ({ ...sl, order: i }));
    setSlides(updated);
    try {
      await axios.put(`/api/slides/sliders/${activeSlider._id}/slides/reorder`, {
        items: updated.map(({ _id, order }) => ({ _id, order })),
      });
    } catch { /* optimistic */ }
  };

  return (
    <AdminLayout>
      <div style={s.container}>

        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>Sliders</h1>
            <p style={s.sub}>Create named sliders, add slides, then drop them into pages from the editor</p>
          </div>
        </div>

        <div style={s.layout}>

          {/* ── LEFT: named sliders ── */}
          <div style={s.sidebar}>
            <div style={s.sideTitle}>Your Sliders</div>
            {loadingSliders ? (
              <p style={s.dimTxt}>Loading…</p>
            ) : sliders.length === 0 ? (
              <p style={s.dimTxt}>No sliders yet.</p>
            ) : (
              <div style={s.sliderList}>
                {sliders.map(sl => (
                  <div key={sl._id} style={{ ...s.sliderTab, ...(activeSlider?._id === sl._id ? s.sliderTabActive : {}) }}>
                    {renamingId === sl._id ? (
                      <input autoFocus style={s.renameInput} value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={() => handleRename(sl)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRename(sl); if (e.key === 'Escape') setRenamingId(null); }} />
                    ) : (
                      <span style={s.sliderTabName} onClick={() => setActiveSlider(sl)}>
                        {sl.name}
                        <span style={s.countChip}>{sl.slideCount || 0}</span>
                      </span>
                    )}
                    <div style={s.tabActions}>
                      <button style={s.iconBtnSm} title="Rename" onClick={() => { setRenamingId(sl._id); setRenameVal(sl.name); }}><Pencil size={13} strokeWidth={1.8} /></button>
                      <button style={{ ...s.iconBtnSm, color: '#ef4444' }} title="Delete" onClick={() => handleDeleteSlider(sl)}><Trash2 size={13} strokeWidth={1.8} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateSlider} style={s.createForm}>
              <div style={s.sideTitle}>New Slider</div>
              {sliderErr && <p style={s.error}>{sliderErr}</p>}
              <input style={s.input} placeholder="e.g. Homepage Hero" value={newName} onChange={e => setNewName(e.target.value)} />
              <button style={s.createBtn} type="submit" disabled={creating || !newName.trim()}>
                {creating ? 'Creating…' : '＋ Create Slider'}
              </button>
            </form>
          </div>

          {/* ── RIGHT: slides of active slider ── */}
          <div style={s.main}>
            {!activeSlider ? (
              <div style={s.emptyState}>
                <GalleryHorizontal size={48} strokeWidth={1.6} color="#94a3b8" />
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Select or create a slider to add slides.</p>
              </div>
            ) : (
              <>
                {/* Slider header + settings */}
                <div style={s.sliderHeader}>
                  <div>
                    <div style={s.sliderName}>{activeSlider.name}</div>
                    <div style={s.sliderSlug}>data-slider: {activeSlider._id}</div>
                  </div>
                  <div style={s.settings}>
                    <label style={s.settingChk}>
                      <input type="checkbox" checked={activeSlider.autoplay !== false} onChange={e => updateSetting('autoplay', e.target.checked)} />
                      Autoplay
                    </label>
                    <label style={s.settingNum}>
                      Interval
                      <input type="number" min="1000" step="500" style={s.numInput}
                        value={activeSlider.interval || 6000}
                        onChange={e => updateSetting('interval', Number(e.target.value) || 6000)} /> ms
                    </label>
                  </div>
                </div>

                <div style={s.workspace}>
                  {/* Add / edit slide form */}
                  <div style={s.card}>
                    <div style={s.cardTitle}>{editId ? 'Edit Slide' : 'Add Slide'}</div>
                    {slideErr && <p style={s.error}>{slideErr}</p>}
                    <form onSubmit={handleSaveSlide}>
                      <label style={s.label}>Image</label>
                      {form.image ? (
                        <div style={s.imgPreviewWrap}>
                          <img src={form.image} alt="" style={s.imgPreview} />
                          <button type="button" style={s.removeImgBtn} onClick={() => setForm(f => ({ ...f, image: '' }))}><X size={11} strokeWidth={2} /> Remove</button>
                        </div>
                      ) : (
                        <div style={s.imgEmpty} onClick={() => setShowPicker(true)}>
                          <ImageIcon size={28} strokeWidth={1.8} color="#94a3b8" />
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click to choose an image</span>
                        </div>
                      )}
                      <button type="button" style={s.chooseBtn} onClick={() => setShowPicker(true)}><FolderOpen size={13} strokeWidth={1.8} /> Choose from Uploads</button>
                      <div style={s.orRow}><span style={s.orLine}/><span style={s.orText}>or paste URL</span><span style={s.orLine}/></div>
                      <input style={s.input} placeholder="https://example.com/banner.jpg" value={form.image} onChange={set('image')} />

                      <label style={{ ...s.label, marginTop: '1rem' }}>Heading</label>
                      <input style={s.input} placeholder="e.g. Welcome" value={form.heading} onChange={set('heading')} />

                      <label style={{ ...s.label, marginTop: '1rem' }}>Subtext</label>
                      <textarea style={{ ...s.input, resize: 'vertical', minHeight: '60px' }} placeholder="Supporting line…" value={form.subtext} onChange={set('subtext')} />

                      <div style={s.row2}>
                        <div style={s.field}><label style={s.label}>Button label</label><input style={s.input} placeholder="Learn More" value={form.buttonLabel} onChange={set('buttonLabel')} /></div>
                        <div style={s.field}><label style={s.label}>Button URL</label><input style={s.input} placeholder="/about" value={form.buttonUrl} onChange={set('buttonUrl')} /></div>
                      </div>
                      <div style={s.row2}>
                        <div style={s.field}>
                          <label style={s.label}>Open button in</label>
                          <select style={s.input} value={form.buttonTarget} onChange={set('buttonTarget')}>
                            <option value="_self">Same tab</option><option value="_blank">New tab</option>
                          </select>
                        </div>
                        <div style={{ ...s.field, justifyContent: 'flex-end' }}>
                          <label style={s.checkRow}><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /><span>Active</span></label>
                        </div>
                      </div>
                      <div style={s.formActions}>
                        <button style={s.btnPrimary} type="submit" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update Slide' : '＋ Add Slide'}</button>
                        {editId && <button style={s.btnCancel} type="button" onClick={resetForm}>Cancel</button>}
                      </div>
                    </form>
                  </div>

                  {/* Slides list */}
                  <div style={s.card}>
                    <div style={s.cardTitle}>Slides in “{activeSlider.name}”</div>
                    {loadingSlides ? (
                      <p style={s.dimTxt}>Loading…</p>
                    ) : slides.length === 0 ? (
                      <div style={s.emptyBox}><GalleryHorizontal size={32} strokeWidth={1.6} color="#94a3b8" /><p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No slides yet. Add one above.</p></div>
                    ) : (
                      <div style={s.list}>
                        {slides.map((slide, i) => (
                          <div key={slide._id} style={{ ...s.slideRow, opacity: slide.active ? 1 : 0.55 }}>
                            <div style={s.orderBtns}>
                              <button style={s.orderBtn} onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp size={12} strokeWidth={2} /></button>
                              <button style={s.orderBtn} onClick={() => move(i, 1)} disabled={i === slides.length - 1}><ChevronDown size={12} strokeWidth={2} /></button>
                            </div>
                            {slide.image ? <img src={slide.image} alt="" style={s.thumb} /> : <div style={s.thumbPlaceholder}><ImageIcon size={18} color="#94a3b8" /></div>}
                            <div style={s.slideInfo}>
                              <span style={s.slideHeading}>{slide.heading || <em style={{ color: '#94a3b8' }}>No heading</em>}</span>
                              {slide.subtext && <span style={s.slideSub}>{slide.subtext}</span>}
                            </div>
                            <div style={s.slideActions}>
                              <button style={s.iconBtn} title={slide.active ? 'Hide' : 'Show'} onClick={() => toggleActive(slide)}>{slide.active ? <Eye size={15} strokeWidth={1.8} /> : <EyeOff size={15} strokeWidth={1.8} />}</button>
                              <button style={s.iconBtn} title="Edit" onClick={() => startEdit(slide)}><Pencil size={15} strokeWidth={1.8} /></button>
                              <button style={{ ...s.iconBtn, color: '#ef4444' }} title="Delete" onClick={() => handleDeleteSlide(slide)}><Trash2 size={15} strokeWidth={1.8} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Image picker modal */}
        {showPicker && (
          <div style={s.modalOverlay} onClick={() => setShowPicker(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalHeader}><span style={s.modalTitle}>Choose an image</span><button style={s.iconBtn} onClick={() => setShowPicker(false)}><X size={18} /></button></div>
              {uploads.length === 0 ? (
                <p style={s.dimTxt}>No uploaded images. Upload some from the Upload page first.</p>
              ) : (
                <div style={s.imgGrid}>
                  {uploads.map(img => (
                    <div key={img._id} style={s.imgGridItem} onClick={() => { setForm(f => ({ ...f, image: img.url })); setShowPicker(false); }}>
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
  pageHeader: { marginBottom: '1.75rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub:   { color: '#64748b', fontSize: '0.9rem', margin: 0 },

  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' },

  sidebar: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  sideTitle: { fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px', marginTop: '4px' },
  sliderList: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' },
  sliderTab: { display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', transition: 'background 0.15s', border: '1px solid transparent' },
  sliderTabActive: { background: '#eef2ff', border: '1px solid #c7d2fe' },
  sliderTabName: { flex: 1, fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  countChip: { fontSize: '0.65rem', fontWeight: '700', color: '#64748b', background: '#f1f5f9', borderRadius: '20px', padding: '1px 7px' },
  tabActions: { display: 'flex', gap: '2px', opacity: 0.6 },
  iconBtnSm: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', color: '#64748b', display: 'flex', alignItems: 'center' },
  renameInput: { flex: 1, fontSize: '0.85rem', fontWeight: '600', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '2px 6px', fontFamily: "'Poppins', sans-serif", outline: 'none', background: '#f8fafc' },
  createForm: { display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' },
  createBtn: { padding: '7px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif" },

  dimTxt: { color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' },

  main: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flexWrap: 'wrap', gap: '12px' },
  sliderName: { fontSize: '1rem', fontWeight: '800', color: '#0f172a' },
  sliderSlug: { fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' },
  settings: { display: 'flex', alignItems: 'center', gap: '16px' },
  settingChk: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' },
  settingNum: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569' },
  numInput: { width: '76px', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '7px', fontFamily: "'Poppins', sans-serif", outline: 'none', background: '#f8fafc', fontSize: '0.8rem' },

  workspace: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.25rem', alignItems: 'start' },
  card: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' },

  label: { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginBottom: '4px' },
  input: { padding: '8px 11px', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#f8fafc', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', width: '100%' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' },
  formActions: { display: 'flex', gap: '8px', marginTop: '1.25rem' },
  btnPrimary: { padding: '9px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif" },
  btnCancel: { padding: '9px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif" },
  error: { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 0.85rem', fontSize: '0.82rem', marginBottom: '0.75rem' },

  imgPreviewWrap: { position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '8px' },
  imgPreview: { width: '100%', height: '130px', objectFit: 'cover', display: 'block' },
  removeImgBtn: { position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  imgEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '130px', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' },
  chooseBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif" },
  orRow: { display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' },
  orLine: { flex: 1, height: '1px', background: '#e2e8f0' },
  orText: { fontSize: '0.72rem', color: '#94a3b8' },

  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  slideRow: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', border: '1px solid #f1f5f9', transition: 'opacity 0.15s' },
  orderBtns: { display: 'flex', flexDirection: 'column', gap: '2px' },
  orderBtn: { padding: '1px 5px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: '72px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, border: '1px solid #e2e8f0' },
  thumbPlaceholder: { width: '72px', height: '48px', background: '#eef2f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e2e8f0' },
  slideInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  slideHeading: { fontSize: '0.88rem', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  slideSub: { fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  slideActions: { display: 'flex', gap: '4px', flexShrink: 0 },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '6px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' },
  modal: { background: '#fff', borderRadius: '14px', padding: '1.25rem', width: '100%', maxWidth: '640px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  modalTitle: { fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' },
  imgGridItem: { borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', aspectRatio: '4 / 3' },
  imgGridImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
};

export default SliderManager;
